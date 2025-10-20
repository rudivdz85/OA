import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  getAssessmentWithType,
  updateAssessmentAnswers,
  completeAssessment as completeAssessmentDb,
  getAssessmentTypeById,
} from '@/lib/db/queries';
import { calculateScore, determineSeverityLevel, validateAnswers } from '@/lib/assessments/scoring';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const assessmentId = params.assessmentId;
    const assessment = await getAssessmentWithType(assessmentId, session.user.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const assessmentId = params.assessmentId;
    const body = await request.json();
    const { answers, currentQuestionIndex, complete } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // Get the assessment with type info to validate
    const assessmentWithType = await getAssessmentWithType(
      assessmentId,
      session.user.id
    );

    if (!assessmentWithType) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (assessmentWithType.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Assessment already completed' },
        { status: 400 }
      );
    }

    // Check if we should complete the assessment
    const shouldComplete =
      complete ||
      answers.length === assessmentWithType.assessmentType.totalQuestions;

    if (shouldComplete) {
      // Validate all answers are present
      const isValid = validateAnswers(
        answers,
        assessmentWithType.assessmentType.totalQuestions
      );

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid or incomplete answers' },
          { status: 400 }
        );
      }

      // Calculate score
      const score = calculateScore(answers);

      // Determine severity level
      const result = determineSeverityLevel(score, assessmentWithType.assessmentType);

      // Update answers first
      await updateAssessmentAnswers(
        assessmentId,
        session.user.id,
        answers,
        currentQuestionIndex
      );

      // Complete the assessment
      const completedAssessment = await completeAssessmentDb(
        assessmentId,
        session.user.id,
        result.score,
        result.severityLevel
      );

      return NextResponse.json({
        success: true,
        data: completedAssessment,
        result: result,
        message: 'Assessment completed successfully',
      });
    } else {
      // Just update progress
      const updatedAssessment = await updateAssessmentAnswers(
        assessmentId,
        session.user.id,
        answers,
        currentQuestionIndex
      );

      return NextResponse.json({
        success: true,
        data: updatedAssessment,
        message: 'Progress saved',
      });
    }
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
