import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createAssessment as createAssessmentDb, getUserAssessments } from '@/lib/db/queries';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessments = await getUserAssessments(session.user.id);

    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assessmentTypeId, conversationId } = body;

    if (!assessmentTypeId) {
      return NextResponse.json(
        { success: false, error: 'assessmentTypeId is required' },
        { status: 400 }
      );
    }

    const assessment = await createAssessmentDb(
      session.user.id,
      assessmentTypeId,
      conversationId
    );

    return NextResponse.json(
      {
        success: true,
        data: assessment,
        message: 'Assessment created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
