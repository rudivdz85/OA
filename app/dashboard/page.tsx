'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConversationList from '@/components/dashboard/ConversationList';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const handleStartConversation = async () => {
    setIsCreatingConversation(true);

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      if (data.success && data.data) {
        router.push(`/dashboard/chat/${data.data.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
      setIsCreatingConversation(false);
    }
  };

  const handleTakeAssessment = () => {
    // TODO: Navigate to assessment selection page
    alert('Assessment feature will be implemented next!');
  };

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
            <p className="text-primary-100 mt-1">
              How are you feeling today?
            </p>
          </div>
        </div>
        <p className="text-white/90 max-w-2xl">
          Start a conversation with your AI coach or take an assessment to track your well-being.
          Your journey to better mental health starts here.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Conversation Card */}
        <div className="group bg-white rounded-2xl p-6 border-2 border-primary-200 hover:border-primary-400 hover:shadow-purple-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center shadow-purple-md group-hover:scale-110 transition-transform duration-200">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
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
          <button
            onClick={handleStartConversation}
            disabled={isCreatingConversation}
            className="w-full bg-gradient-primary hover:shadow-purple-lg text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:scale-105"
          >
            {isCreatingConversation ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Conversation
              </>
            )}
          </button>
        </div>

        {/* Take Assessment Card */}
        <div className="group bg-white rounded-2xl p-6 border-2 border-secondary-200 hover:border-secondary-400 hover:shadow-purple-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <span className="bg-secondary-100 text-secondary-700 text-xs font-semibold px-3 py-1 rounded-full">
              Track Progress
            </span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Take an Assessment</h3>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            Complete validated assessments like GAD-7 or PHQ-9 to track your anxiety and depression
            symptoms over time.
          </p>
          <button
            onClick={handleTakeAssessment}
            className="w-full bg-gradient-secondary hover:shadow-lg text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start Assessment
          </button>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-primary-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-neutral-900">Your Conversations</h3>
          <p className="text-neutral-600 text-sm mt-1">Continue where you left off or start a new chat</p>
        </div>

        <ConversationList />
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Assessment History</h3>
            <p className="text-neutral-600 text-sm mt-1">Track your mental health over time</p>
          </div>
          <button className="text-secondary-600 hover:text-secondary-700 text-sm font-semibold hover:underline">
            View all
          </button>
        </div>

        {/* Placeholder for assessments */}
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-secondary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-neutral-900 font-semibold mb-1">No assessments completed</p>
          <p className="text-neutral-600 text-sm mb-4">
            Take your first assessment to track your well-being over time
          </p>
          <button
            onClick={handleTakeAssessment}
            className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-700 font-semibold text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Take an assessment
          </button>
        </div>
      </div>
    </div>
  );
}
