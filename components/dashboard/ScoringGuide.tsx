'use client';

import { Info, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export const ScoringGuide = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Understanding Your Scores
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isExpanded ? 'Click to collapse' : 'Click to learn how scoring works'}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 mt-1 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm text-gray-700">
          {/* How Scores Work */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                1
              </span>
              How Scores Work
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Assessment scores range from <strong>0 to the maximum score</strong> (varies by assessment type).
              <span className="block mt-2 font-medium text-blue-700">
                Lower scores indicate better mental health outcomes.
              </span>
            </p>
          </div>

          {/* Severity Levels */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                2
              </span>
              Severity Levels
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Minimal
                </span>
                <span className="text-gray-600">Little to no symptoms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                  Mild
                </span>
                <span className="text-gray-600">Some symptoms present</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                  Moderate
                </span>
                <span className="text-gray-600">Noticeable symptoms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                  Moderately Severe
                </span>
                <span className="text-gray-600">Significant symptoms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                  Severe
                </span>
                <span className="text-gray-600">Most severe symptoms</span>
              </div>
            </div>
          </div>

          {/* Progress Trends */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                3
              </span>
              Progress Trends
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-green-700">Improving:</span>
                  <span className="text-gray-600 ml-1">
                    Your scores are decreasing (getting better)
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-red-700">Worsening:</span>
                  <span className="text-gray-600 ml-1">
                    Your scores are increasing (needs attention)
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 border-2 border-yellow-600 rounded mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-yellow-700">Stable:</span>
                  <span className="text-gray-600 ml-1">
                    Your scores are relatively consistent
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900 leading-relaxed">
              <strong className="block mb-1">Important:</strong>
              These assessments are screening tools, not diagnostic instruments. If you're
              experiencing mental health concerns, please consult with a qualified mental health
              professional for proper evaluation and support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
