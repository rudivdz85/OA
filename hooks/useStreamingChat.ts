/**
 * Hook for handling streaming chat responses
 */

import { useState, useCallback, useRef } from 'react';
import { Message as MessageType } from '@/types';
import { parseSSEStream, StreamChunk } from '@/lib/utils/stream';
import { MilestoneData } from '@/lib/assessments/achievements';

interface UseStreamingChatOptions {
  conversationId: string;
  onMilestone?: (milestone: MilestoneData) => void;
}

export function useStreamingChat({ conversationId, onMilestone }: UseStreamingChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);
  const accumulatedTextRef = useRef('');
  const pendingUpdateRef = useRef(false);

  const sendStreamingMessage = useCallback(
    async (
      content: string,
      recentAssessmentId?: string,
      assessmentHistory?: string,
      displayContent?: string
    ): Promise<{ userMessage: MessageType; assistantMessage: MessageType } | null> => {
      setIsStreaming(true);
      setStreamingText('');

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            stream: true,
            recentAssessmentId,
            assessmentHistory,
            displayContent,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        let userMessageId = '';
        let assistantMessageId = '';
        let assessmentOffer: any = null;
        accumulatedTextRef.current = '';

        // Use requestAnimationFrame for smooth, 60fps updates
        const scheduleUpdate = () => {
          if (pendingUpdateRef.current) return; // Already scheduled

          pendingUpdateRef.current = true;
          rafRef.current = requestAnimationFrame(() => {
            setStreamingText(accumulatedTextRef.current);
            pendingUpdateRef.current = false;
          });
        };

        // Process the stream
        for await (const chunk of parseSSEStream(reader)) {
          if (chunk.type === 'text') {
            // Append text to accumulated buffer
            if (chunk.content) {
              accumulatedTextRef.current += chunk.content;
              scheduleUpdate(); // Schedule debounced UI update
            }

            // Check for user message ID in first chunk
            if (chunk.componentData?.userMessageId) {
              userMessageId = chunk.componentData.userMessageId;
            }
          } else if (chunk.type === 'component') {
            // Handle component injection
            if (chunk.componentType === 'MILESTONE' && chunk.componentData) {
              onMilestone?.(chunk.componentData as MilestoneData);
            }
          } else if (chunk.type === 'done') {
            // Stream completed
            if (chunk.componentData) {
              assistantMessageId = chunk.componentData.assistantMessageId;
              assessmentOffer = chunk.componentData.assessmentOffer;
            }
          } else if (chunk.type === 'error') {
            console.error('[Streaming] Stream error:', chunk.error);
            throw new Error(chunk.error || 'Streaming error');
          }
        }

        // Clear any pending updates and show final text
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        pendingUpdateRef.current = false;
        setStreamingText(accumulatedTextRef.current);

        // Return message data
        const finalText = accumulatedTextRef.current;
        setStreamingText('');
        setIsStreaming(false);

        // Create message objects (these will be saved on server, we're just returning refs)
        return {
          userMessage: {
            id: userMessageId,
            conversationId,
            role: 'user',
            content: displayContent || content,
            metadata: recentAssessmentId
              ? { assessmentId: recentAssessmentId, assessmentHistory }
              : {},
            createdAt: new Date(),
          } as MessageType,
          assistantMessage: {
            id: assistantMessageId,
            conversationId,
            role: 'assistant',
            content: finalText,
            metadata: { assessmentOffer },
            createdAt: new Date(),
          } as MessageType,
        };
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error in streaming chat:', error);
          throw error;
        }

        // Clean up
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        pendingUpdateRef.current = false;
        setIsStreaming(false);
        setStreamingText('');
        accumulatedTextRef.current = '';
        return null;
      }
    },
    [conversationId, onMilestone]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    pendingUpdateRef.current = false;
    setIsStreaming(false);
    setStreamingText('');
    accumulatedTextRef.current = '';
  }, []);

  return {
    isStreaming,
    streamingText,
    sendStreamingMessage,
    cancelStream,
  };
}
