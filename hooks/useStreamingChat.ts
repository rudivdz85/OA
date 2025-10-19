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
      recentAssessmentId?: string
    ): Promise<{ userMessage: MessageType; assistantMessage: MessageType } | null> => {
      console.log('[Streaming] Starting stream for message:', content);
      console.log('[Streaming] Recent assessment ID:', recentAssessmentId);
      setIsStreaming(true);
      setStreamingText('');

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const requestBody = {
          content,
          stream: true,
          recentAssessmentId,
        };
        console.log('[Streaming] Request body:', requestBody);

        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });

        console.log('[Streaming] Response received, status:', response.status);

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

        console.log('[Streaming] Starting to read stream chunks...');

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
          console.log('[Streaming] Received chunk:', chunk);

          if (chunk.type === 'text') {
            // Append text to accumulated buffer
            if (chunk.content) {
              accumulatedTextRef.current += chunk.content;
              scheduleUpdate(); // Schedule debounced UI update
              console.log('[Streaming] Accumulated text length:', accumulatedTextRef.current.length);
            }

            // Check for user message ID in first chunk
            if (chunk.componentData?.userMessageId) {
              userMessageId = chunk.componentData.userMessageId;
              console.log('[Streaming] User message ID:', userMessageId);
            }
          } else if (chunk.type === 'component') {
            // Handle component injection
            console.log('[Streaming] Component detected:', chunk.componentType);
            if (chunk.componentType === 'MILESTONE' && chunk.componentData) {
              onMilestone?.(chunk.componentData as MilestoneData);
            }
          } else if (chunk.type === 'done') {
            // Stream completed
            console.log('[Streaming] Stream done');
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

        console.log('[Streaming] Stream completed, final text length:', accumulatedTextRef.current.length);

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
            content,
            metadata: {},
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
        if (error.name === 'AbortError') {
          console.log('Stream aborted');
        } else {
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
