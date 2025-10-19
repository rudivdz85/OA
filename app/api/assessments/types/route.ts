import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getActiveAssessmentTypes } from '@/lib/db/queries';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessmentTypes = await getActiveAssessmentTypes();

    return NextResponse.json({
      success: true,
      data: assessmentTypes,
    });
  } catch (error) {
    console.error('Error fetching assessment types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment types' },
      { status: 500 }
    );
  }
}
