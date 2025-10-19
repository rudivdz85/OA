import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserAssessmentStats } from '@/lib/db/queries';

/**
 * GET /api/assessments/stats
 * Calculate and return assessment statistics for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await getUserAssessmentStats(session.user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment statistics' },
      { status: 500 }
    );
  }
}
