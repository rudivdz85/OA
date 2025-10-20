import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect, notFound } from 'next/navigation';
import { getAssessmentDetails } from '@/lib/db/queries';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, BarChart3 } from 'lucide-react';

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

interface AssessmentDetailContentProps {
  assessmentId: string;
}

async function AssessmentDetailContent({ assessmentId }: AssessmentDetailContentProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const result = await getAssessmentDetails(assessmentId, session.user.id);

  if (!result) {
    notFound();
  }

  const { assessment, assessmentType } = result;

  // Parse questions from assessment type
  const questionsData = assessmentType?.questions as {
    instructions: string;
    options: Array<{ value: number; label: string }>;
    items: Array<{ id: number; text: string; domain: string }>;
  } | null;

  const questions = questionsData?.items || [];
  const options = questionsData?.options || [];

  // Get answers
  const answers = assessment.answers as Array<{
    questionId: number;
    answer: number;
    timestamp: string;
  }> || [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {assessmentType?.name || 'Assessment'}
            </h1>
            {assessmentType?.description && (
              <p className="text-gray-600">{assessmentType.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(assessment.completedAt)}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                {assessmentType?.code}
              </span>
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Your Score</p>
            <p className="text-4xl font-bold text-gray-900">
              {assessment.score}
              <span className="text-xl text-gray-500 font-normal ml-2">
                / {assessmentType?.maxScore}
              </span>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Severity Level</p>
            {assessment.severityLevel && (
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getSeverityStyle(
                  assessment.severityLevel
                )}`}
              >
                {assessment.severityLevel.replace('_', ' ').charAt(0).toUpperCase() +
                  assessment.severityLevel.replace('_', ' ').slice(1)}
              </span>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Questions Answered</p>
            <p className="text-4xl font-bold text-gray-900">{answers.length}</p>
          </div>
        </div>
      </div>

      {/* Answers Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Responses
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {questions.map((question, index) => {
            const answer = answers.find(a => a.questionId === question.id);

            return (
              <div key={question.id} className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-3">{question.text}</p>

                    <div className="space-y-2">
                      {options.map(option => {
                        const isSelected = option.value === answer?.answer;
                        return (
                          <div
                            key={option.value}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm ${
                                  isSelected
                                    ? 'font-semibold text-purple-900'
                                    : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                              </span>
                              {isSelected && (
                                <span className="text-xs font-semibold text-purple-600 bg-purple-200 px-2 py-1 rounded">
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!answer && (
                      <p className="text-sm text-gray-500 italic mt-2">
                        No answer recorded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <Link
          href="/dashboard/assessments"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessment History
        </Link>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { assessmentId } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Suspense
        fallback={
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        }
      >
        <AssessmentDetailContent assessmentId={assessmentId} />
      </Suspense>
    </div>
  );
}
