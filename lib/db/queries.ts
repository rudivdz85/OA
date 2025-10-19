import { db } from './client';
import { conversations, messages, assessmentTypes, assessments } from './schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import type {
  Conversation,
  ConversationWithMessages,
  Message,
  CreateConversationInput,
  UpdateConversationInput,
  CreateMessageInput,
  Assessment,
  AssessmentWithType,
  CreateAssessmentInput,
  UpdateAssessmentInput,
} from '@/types';
import type { AssessmentType } from './schema';

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

// ==========================================
// Assessment Type Queries
// ==========================================

/** Get all active assessment types */
export const getActiveAssessmentTypes = async (): Promise<AssessmentType[]> => {
  return await db
    .select()
    .from(assessmentTypes)
    .where(eq(assessmentTypes.isActive, true))
    .orderBy(assessmentTypes.name);
};

/** Get assessment type by code (e.g., 'GAD7') */
export const getAssessmentTypeByCode = async (code: string): Promise<AssessmentType | null> => {
  const [result] = await db
    .select()
    .from(assessmentTypes)
    .where(and(eq(assessmentTypes.code, code), eq(assessmentTypes.isActive, true)))
    .limit(1);

  return result ?? null;
};

/** Get assessment type by ID */
export const getAssessmentTypeById = async (id: string): Promise<AssessmentType | null> => {
  const [result] = await db
    .select()
    .from(assessmentTypes)
    .where(eq(assessmentTypes.id, id))
    .limit(1);

  return result ?? null;
};

// ==========================================
// Assessment Queries
// ==========================================

/** Create a new assessment */
export const createAssessment = async (
  userId: string,
  assessmentTypeId: string,
  conversationId?: string
): Promise<Assessment> => {
  const assessmentType = await getAssessmentTypeById(assessmentTypeId);
  if (!assessmentType) {
    throw new Error('Assessment type not found');
  }

  const [result] = await db
    .insert(assessments)
    .values({
      userId,
      assessmentTypeId,
      conversationId: conversationId ?? null,
      assessmentVersion: assessmentType.version,
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: [],
    })
    .returning();

  return result as Assessment;
};

/** Get assessment by ID */
export const getAssessment = async (
  assessmentId: string,
  userId: string
): Promise<Assessment | null> => {
  const [result] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
    .limit(1);

  return (result ?? null) as Assessment | null;
};

/** Get assessment with type information */
export const getAssessmentWithType = async (
  assessmentId: string,
  userId: string
): Promise<AssessmentWithType | null> => {
  const [assessment, assessmentTypeData] = await Promise.all([
    getAssessment(assessmentId, userId),
    db
      .select()
      .from(assessmentTypes)
      .innerJoin(assessments, eq(assessments.assessmentTypeId, assessmentTypes.id))
      .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
      .limit(1),
  ]);

  if (!assessment || !assessmentTypeData[0]) return null;

  return {
    ...assessment,
    assessmentType: assessmentTypeData[0].assessment_types,
  } as AssessmentWithType;
};

/** Update assessment answers */
export const updateAssessmentAnswers = async (
  assessmentId: string,
  userId: string,
  answers: Array<{ questionId: number; answer: number; timestamp: string }>,
  currentQuestionIndex?: number
): Promise<Assessment | null> => {
  const updateData: any = {
    answers,
    updatedAt: new Date(),
  };

  if (currentQuestionIndex !== undefined) {
    updateData.currentQuestionIndex = currentQuestionIndex;
  }

  const [result] = await db
    .update(assessments)
    .set(updateData)
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
    .returning();

  return (result ?? null) as Assessment | null;
};

/** Complete assessment with score and severity */
export const completeAssessment = async (
  assessmentId: string,
  userId: string,
  score: number,
  severityLevel: string
): Promise<Assessment | null> => {
  const [result] = await db
    .update(assessments)
    .set({
      score,
      severityLevel,
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
    .returning();

  return (result ?? null) as Assessment | null;
};

/** Get all assessments for a user */
export const getUserAssessments = async (userId: string): Promise<Assessment[]> => {
  return await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, userId))
    .orderBy(desc(assessments.createdAt)) as Assessment[];
};

/** Get assessments for a specific conversation */
export const getConversationAssessments = async (
  conversationId: string
): Promise<Assessment[]> => {
  return await db
    .select()
    .from(assessments)
    .where(eq(assessments.conversationId, conversationId))
    .orderBy(desc(assessments.createdAt)) as Assessment[];
};

/** Mark assessment as abandoned */
export const abandonAssessment = async (
  assessmentId: string,
  userId: string
): Promise<Assessment | null> => {
  const [result] = await db
    .update(assessments)
    .set({
      status: 'abandoned',
      updatedAt: new Date(),
    })
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
    .returning();

  return (result ?? null) as Assessment | null;
};

// ==========================================
// Dashboard & History Queries
// ==========================================

/** Get full assessment history with type information for dashboard */
export const getUserAssessmentHistory = async (userId: string) => {
  const results = await db
    .select({
      id: assessments.id,
      userId: assessments.userId,
      conversationId: assessments.conversationId,
      assessmentTypeId: assessments.assessmentTypeId,
      score: assessments.score,
      severityLevel: assessments.severityLevel,
      status: assessments.status,
      completedAt: assessments.completedAt,
      createdAt: assessments.createdAt,
      assessmentTypeName: assessmentTypes.name,
      assessmentTypeCode: assessmentTypes.code,
      assessmentTypeCategory: assessmentTypes.category,
      minScore: assessmentTypes.minScore,
      maxScore: assessmentTypes.maxScore,
    })
    .from(assessments)
    .innerJoin(assessmentTypes, eq(assessments.assessmentTypeId, assessmentTypes.id))
    .where(and(eq(assessments.userId, userId), eq(assessments.status, 'completed')))
    .orderBy(desc(assessments.completedAt));

  return results;
};

/** Calculate assessment statistics for user */
export const getUserAssessmentStats = async (userId: string) => {
  // Get all completed assessments
  const completedAssessments = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.userId, userId), eq(assessments.status, 'completed')))
    .orderBy(assessments.completedAt);

  const total = completedAssessments.length;

  if (total === 0) {
    return {
      totalAssessments: 0,
      averageScore: null,
      latestScore: null,
      latestSeverity: null,
      latestDate: null,
      firstScore: null,
      improvement: null,
      trend: 'none' as const,
    };
  }

  // Calculate average score
  const scores = completedAssessments
    .map(a => a.score)
    .filter((score): score is number => score !== null);

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

  // Get latest assessment
  const latest = completedAssessments[completedAssessments.length - 1];
  const latestScore = latest?.score ?? null;
  const latestSeverity = latest?.severityLevel ?? null;
  const latestDate = latest?.completedAt ?? null;

  // Get first assessment for comparison
  const first = completedAssessments[0];
  const firstScore = first?.score ?? null;

  // Calculate improvement percentage
  let improvement: number | null = null;
  let trend: 'improving' | 'stable' | 'worsening' | 'none' = 'none';

  if (firstScore !== null && latestScore !== null && total >= 2) {
    // Lower scores are better for anxiety/depression, so improvement means score decreased
    const change = firstScore - latestScore;

    // Handle edge case: if first score is 0, calculate based on absolute change
    if (firstScore === 0) {
      // If starting from 0, any increase is worsening
      if (latestScore > 0) {
        trend = 'worsening';
        improvement = -100; // Represents worsening from baseline of 0
      } else {
        trend = 'stable';
        improvement = 0;
      }
    } else {
      // Normal calculation: percentage change from first score
      improvement = Math.round((change / firstScore) * 100);

      if (improvement > 10) {
        trend = 'improving';
      } else if (improvement < -10) {
        trend = 'worsening';
      } else {
        trend = 'stable';
      }
    }
  }

  return {
    totalAssessments: total,
    averageScore,
    latestScore,
    latestSeverity,
    latestDate,
    firstScore,
    improvement,
    trend,
  };
};

/** Get assessment by ID with full details (for detail page) */
export const getAssessmentDetails = async (
  assessmentId: string,
  userId: string
) => {
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
    .limit(1);

  if (!assessment) return null;

  // Get assessment type details
  const [assessmentType] = await db
    .select()
    .from(assessmentTypes)
    .where(eq(assessmentTypes.id, assessment.assessmentTypeId))
    .limit(1);

  return {
    assessment: assessment as Assessment,
    assessmentType,
  };
};
