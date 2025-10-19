import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserAssessmentHistory } from '@/lib/db/queries';

/**
 * GET /api/assessments/history
 * Fetch all assessments for the authenticated user with full details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessments = await getUserAssessmentHistory(session.user.id);

    return NextResponse.json({
      success: true,
      data: assessments,
      count: assessments.length,
    });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment history' },
      { status: 500 }
    );
  }
}
