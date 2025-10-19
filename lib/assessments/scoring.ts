import type { AssessmentType } from '@/lib/db/schema';

export interface AssessmentAnswer {
  questionId: number;
  answer: number;
  timestamp: string;
}

export interface ScoringResult {
  score: number;
  severityLevel: string;
  interpretation: string;
  recommendation: string;
}

/**
 * Calculate the total score for an assessment based on answers
 */
export const calculateScore = (answers: AssessmentAnswer[]): number => {
  return answers.reduce((total, answer) => total + answer.answer, 0);
};

/**
 * Determine severity level based on score and assessment type's scoring rules
 */
export const determineSeverityLevel = (
  score: number,
  assessmentType: AssessmentType
): ScoringResult => {
  const { scoringRules } = assessmentType;

  // Find the matching threshold
  const threshold = scoringRules.thresholds.find(
    (t) => score >= t.min && score <= t.max
  );

  if (!threshold) {
    throw new Error(`No threshold found for score ${score}`);
  }

  return {
    score,
    severityLevel: threshold.severity,
    interpretation: threshold.description,
    recommendation: threshold.recommendation,
  };
};

/**
 * Validate that all required questions have been answered
 */
export const validateAnswers = (
  answers: AssessmentAnswer[],
  totalQuestions: number
): boolean => {
  // Check we have the right number of answers
  if (answers.length !== totalQuestions) {
    return false;
  }

  // Check all question IDs are unique and sequential
  const questionIds = answers.map((a) => a.questionId).sort((a, b) => a - b);
  for (let i = 0; i < totalQuestions; i++) {
    if (questionIds[i] !== i + 1) {
      return false;
    }
  }

  // Check all answers are valid numbers
  return answers.every((a) => typeof a.answer === 'number' && !isNaN(a.answer));
};

/**
 * Get assessment progress percentage
 */
export const getProgressPercentage = (
  answeredCount: number,
  totalQuestions: number
): number => {
  return Math.round((answeredCount / totalQuestions) * 100);
};

/**
 * Format severity level for display
 */
export const formatSeverityLevel = (severity: string): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

/**
 * Get color for severity level (for UI styling)
 */
export const getSeverityColor = (severity: string): {
  bg: string;
  text: string;
  border: string;
} => {
  const severityLower = severity.toLowerCase();

  switch (severityLower) {
    case 'minimal':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      };
    case 'mild':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      };
    case 'moderate':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      };
    case 'severe':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      };
  }
};
