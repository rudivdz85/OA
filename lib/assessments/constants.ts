/**
 * Assessment-related constants and enums
 * All values should be dynamic and fetched from database where possible
 */

/**
 * Assessment status enum
 */
export enum AssessmentStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

/**
 * Assessment category enum (common categories for filtering/organization)
 */
export enum AssessmentCategory {
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  STRESS = 'stress',
  WELLBEING = 'wellbeing',
  OTHER = 'other',
}

/**
 * Common severity level names
 * Note: Actual severity levels come from database scoring rules
 */
export enum SeverityLevel {
  MINIMAL = 'minimal',
  MILD = 'mild',
  MODERATE = 'moderate',
  MODERATELY_SEVERE = 'moderately_severe',
  SEVERE = 'severe',
}

/**
 * Assessment marker pattern for AI responses
 * Format: [ASSESSMENT_OFFER:CODE]
 */
export const ASSESSMENT_OFFER_PATTERN = /\[ASSESSMENT_OFFER:([^\]]+)\]/g;

/**
 * Create assessment offer marker for AI responses
 */
export const createAssessmentOfferMarker = (code: string): string => {
  return `[ASSESSMENT_OFFER:${code}]`;
};

/**
 * Parse assessment offer marker from AI response
 */
export const parseAssessmentOfferMarker = (content: string): {
  cleanContent: string;
  assessmentCode?: string;
} => {
  const match = ASSESSMENT_OFFER_PATTERN.exec(content);

  if (match) {
    const code = match[1];
    const cleanContent = content.replace(ASSESSMENT_OFFER_PATTERN, '').trim();

    return {
      cleanContent,
      assessmentCode: code,
    };
  }

  return { cleanContent: content };
};

/**
 * Default assessment metadata
 */
export const DEFAULT_ASSESSMENT_METADATA = {
  estimatedDuration: '2-3 minutes',
  isClinicallyValidated: true,
};
