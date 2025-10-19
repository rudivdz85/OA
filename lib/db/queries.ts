import { neon } from '@neondatabase/serverless';
import {
  Conversation,
  ConversationWithMessages,
  Message,
  CreateConversationInput,
  UpdateConversationInput,
  CreateMessageInput,
} from '@/types';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

// ==========================================
// Conversation Queries
// ==========================================

/**
 * Get all conversations for a user, ordered by most recent
 */
export async function getUserConversations(
  userId: string
): Promise<Conversation[]> {
  const rows = await sql`
    SELECT
      id,
      user_id as "userId",
      title,
      last_message_at as "lastMessageAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM conversations
    WHERE user_id = ${userId}
    ORDER BY
      COALESCE(last_message_at, created_at) DESC
  `;

  return rows as Conversation[];
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  const rows = await sql`
    SELECT
      id,
      user_id as "userId",
      title,
      last_message_at as "lastMessageAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM conversations
    WHERE id = ${conversationId}
      AND user_id = ${userId}
  `;

  return rows.length > 0 ? (rows[0] as Conversation) : null;
}

/**
 * Get a conversation with all its messages
 */
export async function getConversationWithMessages(
  conversationId: string,
  userId: string
): Promise<ConversationWithMessages | null> {
  const conversation = await getConversation(conversationId, userId);

  if (!conversation) {
    return null;
  }

  const messages = await getConversationMessages(conversationId);

  return {
    ...conversation,
    messages,
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  input: CreateConversationInput = {}
): Promise<Conversation> {
  const rows = await sql`
    INSERT INTO conversations (user_id, title)
    VALUES (${userId}, ${input.title || null})
    RETURNING
      id,
      user_id as "userId",
      title,
      last_message_at as "lastMessageAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  return rows[0] as Conversation;
}

/**
 * Update a conversation
 */
export async function updateConversation(
  conversationId: string,
  userId: string,
  input: UpdateConversationInput
): Promise<Conversation | null> {
  if (input.title === undefined) {
    return getConversation(conversationId, userId);
  }

  const rows = await sql`
    UPDATE conversations
    SET title = ${input.title}
    WHERE id = ${conversationId}
      AND user_id = ${userId}
    RETURNING
      id,
      user_id as "userId",
      title,
      last_message_at as "lastMessageAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  return rows.length > 0 ? (rows[0] as Conversation) : null;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const result = await sql`
    DELETE FROM conversations
    WHERE id = ${conversationId}
      AND user_id = ${userId}
  `;

  return result.count > 0;
}

/**
 * Update conversation's last_message_at timestamp
 */
export async function updateConversationTimestamp(
  conversationId: string
): Promise<void> {
  await sql`
    UPDATE conversations
    SET last_message_at = CURRENT_TIMESTAMP
    WHERE id = ${conversationId}
  `;
}

// ==========================================
// Message Queries
// ==========================================

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const rows = await sql`
    SELECT
      id,
      conversation_id as "conversationId",
      role,
      content,
      metadata,
      created_at as "createdAt"
    FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
  `;

  return rows as Message[];
}

/**
 * Get a single message by ID
 */
export async function getMessage(
  messageId: string
): Promise<Message | null> {
  const rows = await sql`
    SELECT
      id,
      conversation_id as "conversationId",
      role,
      content,
      metadata,
      created_at as "createdAt"
    FROM messages
    WHERE id = ${messageId}
  `;

  return rows.length > 0 ? (rows[0] as Message) : null;
}

/**
 * Create a new message
 */
export async function createMessage(
  input: CreateMessageInput
): Promise<Message> {
  const rows = await sql`
    INSERT INTO messages (conversation_id, role, content, metadata)
    VALUES (
      ${input.conversationId},
      ${input.role},
      ${input.content},
      ${JSON.stringify(input.metadata || {})}
    )
    RETURNING
      id,
      conversation_id as "conversationId",
      role,
      content,
      metadata,
      created_at as "createdAt"
  `;

  // Update conversation timestamp
  await updateConversationTimestamp(input.conversationId);

  return rows[0] as Message;
}

/**
 * Create multiple messages in a transaction
 */
export async function createMessages(
  inputs: CreateMessageInput[]
): Promise<Message[]> {
  if (inputs.length === 0) {
    return [];
  }

  const messages: Message[] = [];

  for (const input of inputs) {
    const message = await createMessage(input);
    messages.push(message);
  }

  return messages;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM messages
    WHERE id = ${messageId}
  `;

  return result.count > 0;
}

/**
 * Get the count of messages in a conversation
 */
export async function getConversationMessageCount(
  conversationId: string
): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) as count
    FROM messages
    WHERE conversation_id = ${conversationId}
  `;

  return parseInt(rows[0].count as string, 10);
}
