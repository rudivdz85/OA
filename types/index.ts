// User types
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation types
export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// Message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface CreateMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
}

// Assessment types
export type AssessmentStatus = 'in_progress' | 'completed' | 'abandoned';

export interface AssessmentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  totalQuestions: number;
  minScore: number;
  maxScore: number;
  version: string;
  scoringRules: ScoringRules;
  questions: AssessmentQuestions;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoringRules {
  thresholds: SeverityThreshold[];
  scoring_note?: string;
}

export interface SeverityThreshold {
  min: number;
  max: number;
  severity: string;
  description: string;
  recommendation: string;
}

export interface AssessmentQuestions {
  instructions: string;
  options: AssessmentOption[];
  items: AssessmentItem[];
}

export interface AssessmentOption {
  value: number;
  label: string;
}

export interface AssessmentItem {
  id: number;
  text: string;
  domain: string;
}

export interface Assessment {
  id: string;
  userId: string;
  conversationId: string | null;
  assessmentTypeId: string;
  score: number | null;
  severityLevel: string | null;
  status: AssessmentStatus;
  currentQuestionIndex: number;
  assessmentVersion: string;
  answers: AssessmentAnswer[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentAnswer {
  questionId: number;
  answer: number;
  timestamp: string;
}

export interface AssessmentWithType extends Assessment {
  assessmentType: AssessmentType;
}

// Create/Update types
export interface CreateConversationInput {
  title?: string;
}

export interface UpdateConversationInput {
  title?: string;
}

export interface CreateAssessmentInput {
  assessmentTypeId: string;
  conversationId?: string;
}

export interface UpdateAssessmentInput {
  currentQuestionIndex?: number;
  answers?: AssessmentAnswer[];
  score?: number;
  severityLevel?: string;
  status?: AssessmentStatus;
  completedAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Chat types
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface StreamingResponse {
  done: boolean;
  content: string;
  messageId?: string;
}
