import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { getUserAssessmentStats, getUserAssessmentHistory } from '@/lib/db/queries';
import { AssessmentStats } from '@/components/dashboard/AssessmentStats';
import { AssessmentChart } from '@/components/dashboard/AssessmentChart';
import { ScoringGuide } from '@/components/dashboard/ScoringGuide';
import ConversationList from '@/components/dashboard/ConversationList';
import Link from 'next/link';
import { MessageCircle, FileText, ArrowRight, TrendingUp } from 'lucide-react';
import StartConversationButton from '@/components/dashboard/StartConversationButton';
import TakeAssessmentSection from '@/components/dashboard/TakeAssessmentSection';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function DashboardContent() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch assessment data in parallel
  const [stats, assessmentHistory] = await Promise.all([
    getUserAssessmentStats(session.user.id),
    getUserAssessmentHistory(session.user.id),
  ]);

  // Get recent assessments (last 5)
  const recentAssessments = assessmentHistory.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-purple-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!
            </h2>
            <p className="text-primary-100 mt-1">How are you feeling today?</p>
          </div>
        </div>
        <p className="text-white/90 max-w-2xl">
          Start a conversation with your AI coach or take an assessment to track your well-being.
          Your journey to better mental health starts here.
        </p>
      </div>

      {/* Statistics Cards */}
      {stats.totalAssessments > 0 && (
        <div>
          <h3 className="text-xl font-bold text-neutral-900 mb-4">Your Progress</h3>
          <AssessmentStats stats={stats} />
        </div>
      )}

      {/* Scoring Guide */}
      <ScoringGuide />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Conversation Card */}
        <div className="group bg-white rounded-2xl p-6 border-2 border-primary-200 hover:border-primary-400 hover:shadow-purple-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center shadow-purple-md group-hover:scale-110 transition-transform duration-200">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Start a Conversation</h3>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            Talk to your AI coach about anything on your mind. Get supportive, empathetic guidance
            tailored to your needs.
          </p>
          <StartConversationButton />
        </div>

        {/* Take Assessment Card */}
        <TakeAssessmentSection />
      </div>

      {/* Assessment Progress Chart */}
      {assessmentHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-secondary-600" />
                Progress Over Time
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Tracking your mental health journey
              </p>
            </div>
            <Link
              href="/dashboard/assessments"
              className="text-secondary-600 hover:text-secondary-700 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <AssessmentChart assessments={assessmentHistory} />
        </div>
      )}

      {/* Recent Conversations */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-primary-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-neutral-900">Your Conversations</h3>
          <p className="text-neutral-600 text-sm mt-1">
            Continue where you left off or start a new chat
          </p>
        </div>
        <ConversationList />
      </div>

      {/* Recent Assessment History */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Recent Assessments</h3>
            <p className="text-neutral-600 text-sm mt-1">
              {stats.totalAssessments > 0
                ? `${stats.totalAssessments} assessment${stats.totalAssessments !== 1 ? 's' : ''} completed`
                : 'Track your mental health over time'}
            </p>
          </div>
          {stats.totalAssessments > 0 && (
            <Link
              href="/dashboard/assessments"
              className="text-secondary-600 hover:text-secondary-700 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {recentAssessments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-secondary-500" />
            </div>
            <p className="text-neutral-900 font-semibold mb-1">No assessments completed</p>
            <p className="text-neutral-600 text-sm mb-4">
              Take your first assessment to track your well-being over time
            </p>
            <p className="text-neutral-600 text-sm">
              Start a conversation with the AI coach and it will recommend assessments based on your needs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAssessments.map(assessment => (
              <Link
                key={assessment.id}
                href={`/dashboard/assessments/${assessment.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-secondary-300 hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {assessment.assessmentTypeName}
                        </h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {assessment.assessmentTypeCode}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {assessment.completedAt
                          ? new Date(assessment.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Date unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {assessment.score}
                      </div>
                      {assessment.severityLevel && (
                        <div className="text-xs text-gray-600 capitalize">
                          {assessment.severityLevel.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
