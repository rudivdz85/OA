import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  getConversation,
  getConversationMessages,
  createMessage,
  getConversationMessageCount,
  updateConversation,
} from '@/lib/db/queries';
import {
  generateGeminiResponse,
  generateGeminiStreamingResponse,
  generateConversationTitle,
  parseAssessmentOffer,
} from '@/lib/ai/gemini';
import { CreateMessageInput } from '@/types';
import { formatSSE, parseStreamChunk } from '@/lib/utils/stream';
import { checkForMilestone, formatMilestoneForStream } from '@/lib/assessments/achievements';

/**
 * GET /api/conversations/[conversationId]/messages
 * Fetch all messages for a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const conversationId = params.conversationId;

    // Verify conversation belongs to user
    const conversation = await getConversation(conversationId, session.user.id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const messages = await getConversationMessages(conversationId);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[conversationId]/messages
 * Send a new message and get AI response (supports both streaming and non-streaming)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const conversationId = params.conversationId;

    // Verify conversation belongs to user
    const conversation = await getConversation(conversationId, session.user.id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, stream = true, recentAssessmentId } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Check if streaming is requested
    if (stream) {
      return handleStreamingResponse(
        conversationId,
        session.user.id,
        content.trim(),
        conversation,
        recentAssessmentId
      );
    }

    // Get existing messages for context
    const existingMessages = await getConversationMessages(conversationId);

    // Create user message
    const userMessageInput: CreateMessageInput = {
      conversationId,
      role: 'user',
      content: content.trim(),
    };

    const userMessage = await createMessage(userMessageInput);

    // Generate title for first message if conversation doesn't have one
    if (!conversation.title && existingMessages.length === 0) {
      try {
        const title = await generateConversationTitle(content.trim());
        await updateConversation(conversationId, session.user.id, { title });
      } catch (error) {
        console.error('Error generating conversation title:', error);
        // Non-critical error, continue with message creation
      }
    }

    // Generate AI response
    let assistantMessage;
    try {
      const aiResponse = await generateGeminiResponse(
        existingMessages,
        content.trim()
      );

      // Create assistant message with assessment offer metadata if present
      const assistantMessageInput: CreateMessageInput = {
        conversationId,
        role: 'assistant',
        content: aiResponse.content,
        metadata: {
          usage: aiResponse.usage,
          assessmentOffer: aiResponse.assessmentOffer,
        },
      };

      assistantMessage = await createMessage(assistantMessageInput);
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Create a fallback error message
      const errorMessageInput: CreateMessageInput = {
        conversationId,
        role: 'assistant',
        content:
          "I apologize, but I'm having trouble generating a response right now. Please try again in a moment.",
        metadata: {
          error: true,
        },
      };

      assistantMessage = await createMessage(errorMessageInput);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userMessage,
          assistantMessage,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create message',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle streaming response with milestone detection
 */
async function handleStreamingResponse(
  conversationId: string,
  userId: string,
  content: string,
  conversation: any,
  recentAssessmentId?: string
) {
  const encoder = new TextEncoder();

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Get existing messages for context
        const existingMessages = await getConversationMessages(conversationId);

        // Create user message
        const userMessageInput: CreateMessageInput = {
          conversationId,
          role: 'user',
          content,
        };

        const userMessage = await createMessage(userMessageInput);

        // Send user message ID
        controller.enqueue(
          encoder.encode(
            formatSSE({
              type: 'text',
              content: '',
              componentData: { userMessageId: userMessage.id },
            })
          )
        );

        // Generate title for first message if needed
        if (!conversation.title && existingMessages.length === 0) {
          try {
            const title = await generateConversationTitle(content);
            await updateConversation(conversationId, userId, { title });
          } catch (error) {
            console.error('Error generating conversation title:', error);
          }
        }

        // Check for milestone if recent assessment completed
        let milestoneData = null;
        if (recentAssessmentId) {
          console.log('[API] Checking milestone for assessment:', recentAssessmentId);
          milestoneData = await checkForMilestone(userId, recentAssessmentId);
          console.log('[API] Milestone result:', milestoneData);
        } else {
          console.log('[API] No recentAssessmentId provided');
        }

        // Stream AI response
        let fullResponse = '';
        try {
          for await (const chunk of generateGeminiStreamingResponse(
            existingMessages,
            content
          )) {
            fullResponse += chunk;

            // Send text chunk
            controller.enqueue(
              encoder.encode(
                formatSSE({
                  type: 'text',
                  content: chunk,
                })
              )
            );
          }

          // Parse assessment offer from full response
          const { cleanContent, assessmentOffer } = parseAssessmentOffer(fullResponse);

          // Save assistant message to database
          const assistantMessageInput: CreateMessageInput = {
            conversationId,
            role: 'assistant',
            content: cleanContent,
            metadata: {
              assessmentOffer,
            },
          };

          const assistantMessage = await createMessage(assistantMessageInput);

          // Send milestone component if detected
          if (milestoneData) {
            controller.enqueue(
              encoder.encode(
                formatSSE({
                  type: 'component',
                  componentType: 'MILESTONE',
                  componentData: milestoneData,
                })
              )
            );
          }

          // Send done signal with message IDs
          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'done',
                componentData: {
                  userMessageId: userMessage.id,
                  assistantMessageId: assistantMessage.id,
                  assessmentOffer,
                },
              })
            )
          );
        } catch (error) {
          console.error('Error generating AI response:', error);

          // Send error
          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'error',
                error: 'Failed to generate AI response',
              })
            )
          );
        }

        controller.close();
      } catch (error) {
        console.error('Error in streaming handler:', error);
        controller.enqueue(
          encoder.encode(
            formatSSE({
              type: 'error',
              error: 'Internal server error',
            })
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
