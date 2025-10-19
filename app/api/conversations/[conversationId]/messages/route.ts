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
  generateConversationTitle,
} from '@/lib/ai/gemini';
import { CreateMessageInput } from '@/types';

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
 * Send a new message and get AI response
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
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
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
