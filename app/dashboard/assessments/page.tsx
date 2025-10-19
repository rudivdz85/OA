import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { getUserAssessmentHistory } from '@/lib/db/queries';
import { AssessmentChart } from '@/components/dashboard/AssessmentChart';
import Link from 'next/link';
import { FileText, Calendar, ChevronRight } from 'lucide-react';

const severityColors = {
  minimal: 'text-green-700 bg-green-100 border-green-300',
  mild: 'text-yellow-700 bg-yellow-100 border-yellow-300',
  moderate: 'text-orange-700 bg-orange-100 border-orange-300',
  moderately_severe: 'text-red-700 bg-red-100 border-red-300',
  severe: 'text-red-800 bg-red-100 border-red-400',
};

const getSeverityStyle = (severity: string | null): string => {
  if (!severity) return 'text-gray-700 bg-gray-100 border-gray-300';
  return severityColors[severity as keyof typeof severityColors] || 'text-gray-700 bg-gray-100 border-gray-300';
};

const formatDate = (date: Date | null): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

async function AssessmentHistoryContent() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const assessments = await getUserAssessmentHistory(session.user.id);

  if (assessments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Assessments Yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You haven't completed any assessments yet. Start a conversation with our AI to receive
          personalized assessment recommendations.
        </p>
        <Link
          href="/chat"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Start Chatting
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h2>
        <AssessmentChart assessments={assessments} />
      </div>

      {/* Assessment List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Assessment History</h2>
          <p className="text-sm text-gray-600 mt-1">
            View all your completed assessments ({assessments.length} total)
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/dashboard/assessments/${assessment.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {assessment.assessmentTypeName}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {assessment.assessmentTypeCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(assessment.completedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {assessment.score}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          / {assessment.maxScore}
                        </span>
                      </div>

                      {assessment.severityLevel && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityStyle(
                            assessment.severityLevel
                          )}`}
                        >
                          {assessment.severityLevel.replace('_', ' ').charAt(0).toUpperCase() +
                            assessment.severityLevel.replace('_', ' ').slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment History</h1>
        <p className="text-gray-600">
          Track your mental health journey with detailed assessment records and progress visualization.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        }
      >
        <AssessmentHistoryContent />
      </Suspense>
    </div>
  );
}
