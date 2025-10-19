/**
 * Achievement detection logic for milestone celebrations
 */

import { db } from '@/lib/db/client';
import { assessments, assessmentTypes } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Assessment } from '@/lib/db/schema';

export interface MilestoneData {
  type: 'score_improvement' | 'category_improvement' | 'first_assessment' | 'consistency';
  title: string;
  message: string;
  scoreChange?: number;
  previousScore?: number;
  currentScore?: number;
  previousSeverity?: string;
  currentSeverity?: string;
  assessmentCode?: string;
}

const severityOrder = ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe'];

/**
 * Get severity rank (lower is better)
 */
function getSeverityRank(severity: string | null): number {
  if (!severity) return 999;
  return severityOrder.indexOf(severity);
}

/**
 * Check if user achieved a milestone with this assessment
 */
export async function checkForMilestone(
  userId: string,
  currentAssessmentId: string
): Promise<MilestoneData | null> {
  try {
    // Get the current assessment
    const [currentAssessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, currentAssessmentId))
      .limit(1);

    if (!currentAssessment || !currentAssessment.score) {
      return null;
    }

    // Get assessment type info
    const [assessmentType] = await db
      .select()
      .from(assessmentTypes)
      .where(eq(assessmentTypes.id, currentAssessment.assessmentTypeId))
      .limit(1);

    const assessmentCode = assessmentType?.code || 'Assessment';

    // Get all completed assessments for this user of the same type
    const allAssessments = await db
      .select()
      .from(assessments)
      .where(
        and(
          eq(assessments.userId, userId),
          eq(assessments.status, 'completed'),
          eq(assessments.assessmentTypeId, currentAssessment.assessmentTypeId)
        )
      )
      .orderBy(desc(assessments.completedAt));

    // Filter out current assessment and ensure scores exist
    const previousAssessments = allAssessments
      .filter((a: Assessment) => a.id !== currentAssessmentId && a.score !== null)
      .sort((a: Assessment, b: Assessment) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });

    // Check for first assessment
    if (previousAssessments.length === 0) {
      return {
        type: 'first_assessment',
        title: '🎉 First Assessment Complete!',
        message: `You've completed your first ${assessmentCode} assessment. This is an important step in tracking your mental health journey!`,
        currentScore: currentAssessment.score,
        assessmentCode,
      };
    }

    const previousAssessment = previousAssessments[0];
    const currentScore = currentAssessment.score;
    const previousScore = previousAssessment.score!;
    const scoreChange = previousScore - currentScore; // Positive means improvement (lower is better)

    // Check for significant score improvement (5+ points better)
    if (scoreChange >= 5) {
      return {
        type: 'score_improvement',
        title: '🌟 Amazing Progress!',
        message: `Your ${assessmentCode} score improved by ${scoreChange} points! You're making great strides in managing your mental health.`,
        scoreChange,
        previousScore,
        currentScore,
        assessmentCode,
      };
    }

    // Check for category improvement
    const currentSeverity = currentAssessment.severityLevel;
    const previousSeverity = previousAssessment.severityLevel;

    if (currentSeverity && previousSeverity) {
      const currentRank = getSeverityRank(currentSeverity);
      const previousRank = getSeverityRank(previousSeverity);

      // If current rank is lower (better)
      if (currentRank < previousRank) {
        return {
          type: 'category_improvement',
          title: '🎊 You Leveled Up!',
          message: `You've moved from ${previousSeverity.replace('_', ' ')} to ${currentSeverity.replace('_', ' ')} ${assessmentCode === 'GAD-7' ? 'anxiety' : assessmentCode === 'PHQ-9' ? 'depression' : 'symptoms'}. Keep up the excellent work!`,
          previousSeverity,
          currentSeverity,
          previousScore,
          currentScore,
          assessmentCode,
        };
      }
    }

    // Check for consistency milestone (3+ assessments in minimal/mild zone)
    const recentSafeAssessments = allAssessments
      .slice(0, 3)
      .filter((a: Assessment) => {
        const severity = a.severityLevel;
        return severity === 'minimal' || severity === 'mild';
      });

    if (recentSafeAssessments.length >= 3) {
      // Only show this once
      const consistencyShown = await checkIfConsistencyMilestoneShown(userId, currentAssessment.assessmentTypeId);
      if (!consistencyShown) {
        await markConsistencyMilestoneShown(userId, currentAssessment.assessmentTypeId);
        return {
          type: 'consistency',
          title: '💪 Consistency Champion!',
          message: `You've maintained ${currentSeverity} symptoms for your last 3 assessments. Your consistency is inspiring!`,
          currentScore,
          currentSeverity: currentSeverity || undefined,
          assessmentCode,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking for milestone:', error);
    return null;
  }
}

// Simple in-memory cache to track shown consistency milestones
// In production, you might want to store this in the database
const consistencyMilestonesShown = new Set<string>();

function checkIfConsistencyMilestoneShown(userId: string, assessmentTypeId: string): boolean {
  return consistencyMilestonesShown.has(`${userId}:${assessmentTypeId}`);
}

function markConsistencyMilestoneShown(userId: string, assessmentTypeId: string): void {
  consistencyMilestonesShown.add(`${userId}:${assessmentTypeId}`);
}
