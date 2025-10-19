'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">AI Coach</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-neutral-700 hover:text-primary-600 font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-primary hover:shadow-purple-lg text-white font-medium px-6 py-2 rounded-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block mb-4">
            <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full">
              🌟 AI-Powered Mental Wellness
            </span>
          </div>

          <h2 className="text-5xl font-extrabold text-neutral-900 sm:text-6xl md:text-7xl mb-6">
            Your Personal
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
              AI Wellness Coach
            </span>
          </h2>

          <p className="mt-6 text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Get personalized mental health support powered by advanced AI. Track your well-being,
            take validated assessments, and receive compassionate guidance whenever you need it.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-primary hover:shadow-purple-xl rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <span>Get Started Free</span>
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white hover:bg-primary-50 border-2 border-primary-300 hover:border-primary-400 rounded-xl transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-4 text-sm text-neutral-500">
            No credit card required • Private & secure • 24/7 available
          </p>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-purple-lg transition-all duration-200 border border-primary-100 hover:border-primary-300">
            <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              AI-Powered Conversations
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Chat with an empathetic AI coach trained to provide supportive, evidence-based guidance
              for your mental health journey.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-purple-lg transition-all duration-200 border border-secondary-100 hover:border-secondary-300">
            <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Validated Assessments
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Take clinically validated assessments like GAD-7 and PHQ-9 to track your anxiety and
              depression symptoms over time.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-purple-lg transition-all duration-200 border border-accent-100 hover:border-accent-300">
            <div className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Private & Secure
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Your conversations and data are encrypted and stored securely. Your privacy and
              confidentiality are our top priorities.
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-24 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-primary-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-neutral-900">Built with Care for Your Wellbeing</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <p className="text-neutral-600">Available Anytime</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
              <p className="text-neutral-600">Private & Confidential</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">∞</div>
              <p className="text-neutral-600">Unlimited Support</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-20 bg-warning-50 border-2 border-warning-200 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-warning-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm text-warning-900 font-medium mb-1">Important Notice</p>
              <p className="text-sm text-warning-800">
                This AI coaching platform is designed to provide supportive guidance and is not a substitute
                for professional mental health care. If you are experiencing a mental health crisis, please
                contact emergency services or a mental health professional immediately.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md mt-20 border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} AI Coaching Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
