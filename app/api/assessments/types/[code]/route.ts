import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getAssessmentTypeByCode } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
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
    const code = params.code;
    const assessmentType = await getAssessmentTypeByCode(code);

    if (!assessmentType) {
      return NextResponse.json(
        { success: false, error: 'Assessment type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assessmentType,
    });
  } catch (error) {
    console.error('Error fetching assessment type:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment type' },
      { status: 500 }
    );
  }
}
