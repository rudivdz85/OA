'use client';

import { useState, useRef, useEffect } from 'react';
import { Message as MessageType } from '@/types';
import Message from './Message';
import { AssessmentOffer } from './AssessmentOffer';
import { AssessmentQuiz } from './AssessmentQuiz';
import { AssessmentResult } from './AssessmentResult';
import { AssessmentIndicator } from './AssessmentIndicator';
import { MilestoneAchievement } from './MilestoneAchievement';
import { Send, Loader2 } from 'lucide-react';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { MilestoneData } from '@/lib/assessments/achievements';
import { determineSeverityLevel } from '@/lib/assessments/scoring';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  conversationId: string;
  initialMessages: MessageType[];
}

export default function ChatInterface({
  conversationId,
  initialMessages,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [completedAssessmentResult, setCompletedAssessmentResult] = useState<any>(null);
  const [completedAssessments, setCompletedAssessments] = useState<Map<string, any>>(new Map());
  const [milestone, setMilestone] = useState<MilestoneData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Streaming chat hook
  const { isStreaming, streamingText, sendStreamingMessage } = useStreamingChat({
    conversationId,
    onMilestone: (milestoneData) => {
      setMilestone(milestoneData);
    },
  });

  // Load assessment details for messages with assessmentId
  useEffect(() => {
    const loadAssessments = async () => {
      for (const message of messages) {
        if (message.metadata?.assessmentId && !completedAssessments.has(message.metadata.assessmentId)) {
          try {
            const response = await fetch(`/api/assessments/${message.metadata.assessmentId}`);
            if (response.ok) {
              const data = await response.json();

              // Fetch assessment type details
              const typeResponse = await fetch(`/api/assessments/types/${data.data.assessmentTypeId}`);
              if (typeResponse.ok) {
                const typeData = await typeResponse.json();

                // Calculate interpretation and recommendation
                const result = determineSeverityLevel(data.data.score, typeData.data);

                const assessmentResult = {
                  assessment: {
                    ...data.data,
                    assessmentType: typeData.data,
                  },
                  interpretation: result.interpretation,
                  recommendation: result.recommendation,
                };

                setCompletedAssessments(prev => {
                  const newMap = new Map(prev);
                  newMap.set(message.metadata.assessmentId, assessmentResult);
                  return newMap;
                });
              }
            }
          } catch (error) {
            console.error('Error loading assessment:', error);
          }
        }
      }
    };

    loadAssessments();
  }, [messages, completedAssessments]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, completedAssessmentResult, streamingText, milestone]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleStartAssessment = async (assessmentCode: string) => {
    try {
      // Get assessment type by code
      const typeResponse = await fetch(`/api/assessments/types/${assessmentCode}`);
      if (!typeResponse.ok) {
        throw new Error('Failed to fetch assessment type');
      }
      const typeData = await typeResponse.json();

      // Create new assessment
      const createResponse = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentTypeId: typeData.data.id,
          conversationId,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create assessment');
      }

      const createData = await createResponse.json();

      // Set active assessment with type info
      setActiveAssessment({
        ...createData.data,
        assessmentType: typeData.data,
      });
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Failed to start assessment. Please try again.');
    }
  };

  const handleCompleteAssessment = async (answers: Array<{ questionId: number; answer: number; timestamp: string }>) => {
    if (!activeAssessment) return;

    try {
      const response = await fetch(`/api/assessments/${activeAssessment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          complete: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete assessment');
      }

      const data = await response.json();

      const assessmentResult = {
        assessment: {
          ...data.data,
          assessmentType: activeAssessment.assessmentType,
        },
        interpretation: data.result.interpretation,
        recommendation: data.result.recommendation,
      };

      // Store result for display
      setCompletedAssessmentResult(assessmentResult);

      // Store in permanent map for later access
      setCompletedAssessments(prev => {
        const newMap = new Map(prev);
        newMap.set(data.data.id, assessmentResult);
        return newMap;
      });

      // Clear active assessment
      setActiveAssessment(null);

      // Fetch user's assessment history for context
      let assessmentHistory = [];
      try {
        const historyResponse = await fetch('/api/assessments/history');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          assessmentHistory = historyData.data || [];
        }
      } catch (error) {
        console.error('Error fetching assessment history:', error);
      }

      // Build context messages - one for display, one for AI
      const displayMessage = `I just completed the ${activeAssessment.assessmentType.name}. My score was ${data.result.score} out of ${activeAssessment.assessmentType.maxScore}, which indicates ${data.result.severityLevel} severity.`;

      let fullContextMessage = displayMessage;
      let historyText = '';

      if (assessmentHistory.length > 1) {
        // More than 1 means there are previous assessments (current one is included)
        historyText = 'My assessment history:';

        // Sort by date, most recent first
        const sortedHistory = [...assessmentHistory].sort((a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );

        sortedHistory.forEach((assessment, index) => {
          const date = new Date(assessment.completedAt).toLocaleDateString();
          const isCurrent = assessment.id === data.data.id;
          // API returns flat structure with assessmentTypeName and maxScore
          historyText += `\n${index + 1}. ${assessment.assessmentTypeName} - Score: ${assessment.score}/${assessment.maxScore} (${assessment.severityLevel})${isCurrent ? ' [Just completed]' : ` on ${date}`}`;
        });

        fullContextMessage = `${displayMessage}\n\n${historyText}`;
      }

      await sendMessage(displayMessage, data.data.id, fullContextMessage, historyText);
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  const handleCancelAssessment = () => {
    setActiveAssessment(null);
  };

  const sendMessage = async (
    content: string,
    assessmentId?: string,
    fullContextForAI?: string,
    assessmentHistory?: string
  ) => {
    // Use fullContextForAI for the API call if provided, otherwise use content
    const messageForAI = fullContextForAI || content;

    // Immediately add user message to UI (using display content, not full context)
    const optimisticUserMessage: MessageType = {
      id: `temp-${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      metadata: assessmentId
        ? { assessmentId, assessmentHistory }
        : {},
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);

    setIsLoading(true);

    try {
      // Use streaming for message sending (send full context to AI, but display short content)
      const result = await sendStreamingMessage(
        messageForAI,
        assessmentId || undefined,
        assessmentHistory,
        content // displayContent - what to show in UI
      );

      if (result) {
        // Replace temp user message with real one, add assistant message
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== optimisticUserMessage.id);
          return [...filtered, result.userMessage, result.assistantMessage];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const userContent = input.trim();
    setInput('');

    // Clear completed assessment result when user sends a new message
    if (completedAssessmentResult) {
      setCompletedAssessmentResult(null);
    }

    await sendMessage(userContent);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-full p-6 mb-4">
              <svg
                className="w-12 h-12 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start a Conversation
            </h3>
            <p className="text-gray-600 max-w-md">
              Share what's on your mind. I'm here to listen and support you.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id}>
                <Message message={message} />

                {/* Render assessment offer if present in metadata */}
                {message.role === 'assistant' &&
                  message.metadata?.assessmentOffer && (
                    <AssessmentOffer
                      assessmentCode={message.metadata.assessmentOffer.code}
                      onAccept={() =>
                        handleStartAssessment(message.metadata.assessmentOffer.code)
                      }
                      onDecline={() => {
                        // Just a visual dismissal - no backend action needed
                      }}
                    />
                  )}

                {/* Render assessment indicator if this message has a completed assessment */}
                {message.role === 'user' &&
                  message.metadata?.assessmentId &&
                  (() => {
                    // Check if this is the message for the currently completed assessment
                    const isCurrentlyCompleted = completedAssessmentResult &&
                      completedAssessmentResult.assessment.id === message.metadata.assessmentId;

                    // If it's currently completed, show the completedAssessmentResult
                    if (isCurrentlyCompleted) {
                      return (
                        <AssessmentIndicator
                          assessment={completedAssessmentResult.assessment}
                          interpretation={completedAssessmentResult.interpretation}
                          recommendation={completedAssessmentResult.recommendation}
                          defaultExpanded={true}
                        />
                      );
                    }

                    // Otherwise, check if it's in the Map and show from history
                    if (completedAssessments.has(message.metadata.assessmentId)) {
                      const assessmentData = completedAssessments.get(message.metadata.assessmentId);
                      if (!assessmentData) return null;

                      // Find the most recent assessment message to expand it by default
                      const assessmentMessages = messages.filter(m =>
                        m.role === 'user' && m.metadata?.assessmentId
                      );
                      const isLatestAssessment = assessmentMessages.length > 0 &&
                        assessmentMessages[assessmentMessages.length - 1].id === message.id;

                      return (
                        <AssessmentIndicator
                          assessment={assessmentData.assessment}
                          interpretation={assessmentData.interpretation}
                          recommendation={assessmentData.recommendation}
                          defaultExpanded={isLatestAssessment}
                        />
                      );
                    }

                    return null;
                  })()}
              </div>
            ))}

            {/* Active assessment quiz */}
            {activeAssessment && (
              <AssessmentQuiz
                assessment={activeAssessment}
                onComplete={handleCompleteAssessment}
                onCancel={handleCancelAssessment}
              />
            )}

            {/* Streaming message display */}
            {isStreaming && (
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 items-start flex-1">
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-tl-md shadow-sm max-w-3xl">
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="text-gray-900">{children}</p>,
                          strong: ({ children }) => <strong className="text-gray-900 font-bold">{children}</strong>,
                          em: ({ children }) => <em className="text-gray-900 italic">{children}</em>,
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-1 text-gray-900">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside space-y-1 text-gray-900">{children}</ol>
                          ),
                          li: ({ children }) => <li className="text-gray-900">{children}</li>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-900">
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-gray-100 text-gray-900 p-3 rounded text-xs font-mono overflow-x-auto">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {streamingText || ' '}
                      </ReactMarkdown>
                      <span className="inline-block w-1 h-4 bg-purple-600 ml-0.5 animate-pulse align-middle" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator when waiting for stream to start */}
            {isLoading && !isStreaming && (
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300">
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-tl-md shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Milestone celebration */}
            {milestone && (
              <div className="mb-6">
                <MilestoneAchievement
                  milestone={milestone}
                  onDismiss={() => setMilestone(null)}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed to bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
