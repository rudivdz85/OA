import { db } from './client';
import { conversations, messages } from './schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import type {
  Conversation,
  ConversationWithMessages,
  Message,
  CreateConversationInput,
  UpdateConversationInput,
  CreateMessageInput,
} from '@/types';

// ==========================================
// Conversation Queries
// ==========================================

/** Get all conversations for a user, ordered by most recent */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(sql`COALESCE(${conversations.lastMessageAt}, ${conversations.createdAt})`));
};

/** Get a single conversation by ID */
export const getConversation = async (
  conversationId: string,
  userId: string
): Promise<Conversation | null> => {
  const [result] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .limit(1);

  return result ?? null;
};

/** Get a conversation with all its messages */
export const getConversationWithMessages = async (
  conversationId: string,
  userId: string
): Promise<ConversationWithMessages | null> => {
  const [conversation, conversationMessages] = await Promise.all([
    getConversation(conversationId, userId),
    getConversationMessages(conversationId),
  ]);

  return conversation ? { ...conversation, messages: conversationMessages } : null;
};

/** Create a new conversation */
export const createConversation = async (
  userId: string,
  input: CreateConversationInput = {}
): Promise<Conversation> => {
  const [result] = await db
    .insert(conversations)
    .values({ userId, title: input.title ?? null })
    .returning();

  return result;
};

/** Update a conversation */
export const updateConversation = async (
  conversationId: string,
  userId: string,
  input: UpdateConversationInput
): Promise<Conversation | null> => {
  if (!input.title) return getConversation(conversationId, userId);

  const [result] = await db
    .update(conversations)
    .set({ title: input.title })
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .returning();

  return result ?? null;
};

/** Delete a conversation */
export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  const result = await db
    .delete(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));

  return (result.rowCount ?? 0) > 0;
};

/** Update conversation's last_message_at timestamp */
const updateConversationTimestamp = async (conversationId: string): Promise<void> => {
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));
};

// ==========================================
// Message Queries
// ==========================================

/** Get all messages for a conversation */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt) as Message[];
};

/** Get a single message by ID */
export const getMessage = async (messageId: string): Promise<Message | null> => {
  const [result] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  return (result ?? null) as Message | null;
};

/** Create a new message */
export const createMessage = async (input: CreateMessageInput): Promise<Message> => {
  const [result] = await db
    .insert(messages)
    .values({
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      metadata: input.metadata ?? {},
    })
    .returning();

  // Update conversation timestamp in parallel (don't await)
  updateConversationTimestamp(input.conversationId);

  return result as Message;
};

/** Create multiple messages in a transaction */
export const createMessages = async (inputs: CreateMessageInput[]): Promise<Message[]> => {
  if (!inputs.length) return [];

  return Promise.all(inputs.map(createMessage));
};

/** Delete a message */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  const result = await db.delete(messages).where(eq(messages.id, messageId));
  return (result.rowCount ?? 0) > 0;
};

/** Get the count of messages in a conversation */
export const getConversationMessageCount = async (conversationId: string): Promise<number> => {
  const [result] = await db
    .select({ count: count() })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  return result?.count ?? 0;
};
