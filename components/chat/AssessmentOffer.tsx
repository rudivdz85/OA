'use client';

import { useState, useEffect } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';

interface AssessmentOfferProps {
  assessmentCode: string;
  onAccept: () => void;
  onDecline: () => void;
}

interface AssessmentTypeInfo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  totalQuestions: number;
}

export const AssessmentOffer = ({ assessmentCode, onAccept, onDecline }: AssessmentOfferProps) => {
  const [isDeclined, setIsDeclined] = useState(false);
  const [assessmentInfo, setAssessmentInfo] = useState<AssessmentTypeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssessmentInfo() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/assessments/types/${assessmentCode}`);

        if (!response.ok) {
          throw new Error('Failed to fetch assessment details');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setAssessmentInfo(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching assessment info:', err);
        setError('Unable to load assessment details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssessmentInfo();
  }, [assessmentCode]);

  if (isDeclined) {
    return null;
  }

  const handleDecline = () => {
    setIsDeclined(true);
    onDecline();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="my-4 border-2 border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-5 shadow-md">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          <span className="text-purple-900 font-medium">Loading assessment details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !assessmentInfo) {
    return (
      <div className="my-4 border-2 border-red-200 rounded-lg bg-red-50 p-5 shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-red-800 font-medium">
              {error || 'Assessment not available'}
            </p>
            <p className="text-sm text-red-600 mt-1">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
          <button
            onClick={handleDecline}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors ml-2"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Estimate duration based on number of questions
  const estimatedMinutes = Math.ceil(assessmentInfo.totalQuestions / 3);
  const duration = `${estimatedMinutes}-${estimatedMinutes + 1} minutes`;

  return (
    <div className="my-4 border-2 border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-5 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-purple-900 mb-1">
              Take the {assessmentInfo.name}
            </h3>

            {assessmentInfo.description && (
              <p className="text-sm text-purple-800 mb-3 leading-relaxed">
                {assessmentInfo.description}
              </p>
            )}

            {assessmentInfo.category && (
              <div className="inline-block px-2 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded mb-3">
                {assessmentInfo.category.charAt(0).toUpperCase() + assessmentInfo.category.slice(1)}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-purple-700 mb-4 mt-2">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {duration}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {assessmentInfo.totalQuestions} questions
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Clinically validated
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onAccept}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Start Assessment
              </button>
              <button
                onClick={handleDecline}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-purple-700 font-medium rounded-lg border border-purple-300 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleDecline}
          className="flex-shrink-0 text-purple-400 hover:text-purple-600 transition-colors ml-2"
          aria-label="Decline assessment"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
