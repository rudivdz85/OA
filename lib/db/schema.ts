import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, bigint, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['user', 'assistant', 'system']);
export const assessmentStatusEnum = pgEnum('assessment_status', ['in_progress', 'completed', 'abandoned']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  passwordHash: varchar('password_hash', { length: 255 }),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));

// Accounts table (NextAuth.js)
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: bigint('expires_at', { mode: 'number' }),
  tokenType: varchar('token_type', { length: 255 }),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: varchar('session_state', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_accounts_user_id').on(table.userId),
  providerProviderAccountIdUnique: uniqueIndex('accounts_provider_provider_account_id_unique')
    .on(table.provider, table.providerAccountId),
}));

// Sessions table (NextAuth.js)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_sessions_user_id').on(table.userId),
  sessionTokenIdx: index('idx_sessions_session_token').on(table.sessionToken),
}));

// Verification tokens (NextAuth.js)
export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
}, (table) => ({
  tokenIdx: index('idx_verification_tokens_token').on(table.token),
  identifierTokenPk: uniqueIndex('verification_tokens_identifier_token_pk')
    .on(table.identifier, table.token),
}));

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_conversations_user_id').on(table.userId),
  lastMessageAtIdx: index('idx_conversations_last_message_at').on(table.lastMessageAt),
}));

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull().$type<'user' | 'assistant' | 'system'>(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index('idx_messages_conversation_id').on(table.conversationId),
  createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
}));

// Assessment types table
export const assessmentTypes = pgTable('assessment_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  totalQuestions: integer('total_questions').notNull(),
  minScore: integer('min_score').notNull(),
  maxScore: integer('max_score').notNull(),
  version: varchar('version', { length: 20 }).notNull().default('1.0'),
  scoringRules: jsonb('scoring_rules').notNull().$type<{
    thresholds: Array<{
      min: number;
      max: number;
      severity: string;
      description: string;
      recommendation: string;
    }>;
    scoring_note?: string;
  }>(),
  questions: jsonb('questions').notNull().$type<{
    instructions: string;
    options: Array<{
      value: number;
      label: string;
    }>;
    items: Array<{
      id: number;
      text: string;
      domain: string;
    }>;
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  codeIdx: index('idx_assessment_types_code').on(table.code),
  isActiveIdx: index('idx_assessment_types_is_active').on(table.isActive),
}));

// Assessments table
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  assessmentTypeId: uuid('assessment_type_id').notNull().references(() => assessmentTypes.id, { onDelete: 'restrict' }),
  score: integer('score'),
  severityLevel: varchar('severity_level', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('in_progress').$type<'in_progress' | 'completed' | 'abandoned'>(),
  currentQuestionIndex: integer('current_question_index').default(0).notNull(),
  assessmentVersion: varchar('assessment_version', { length: 20 }).notNull(),
  answers: jsonb('answers').default([]).notNull().$type<Array<{
    questionId: number;
    answer: number;
    timestamp: string;
  }>>(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_assessments_user_id').on(table.userId),
  conversationIdIdx: index('idx_assessments_conversation_id').on(table.conversationId),
  assessmentTypeIdIdx: index('idx_assessments_assessment_type_id').on(table.assessmentTypeId),
  statusIdx: index('idx_assessments_status').on(table.status),
  completedAtIdx: index('idx_assessments_completed_at').on(table.completedAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  conversations: many(conversations),
  assessments: many(assessments),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  assessments: many(assessments),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const assessmentTypesRelations = relations(assessmentTypes, ({ many }) => ({
  assessments: many(assessments),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [assessments.conversationId],
    references: [conversations.id],
  }),
  assessmentType: one(assessmentTypes, {
    fields: [assessments.assessmentTypeId],
    references: [assessmentTypes.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type AssessmentType = typeof assessmentTypes.$inferSelect;
export type NewAssessmentType = typeof assessmentTypes.$inferInsert;

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
