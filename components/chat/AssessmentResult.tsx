'use client';

import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { getSeverityColor, formatSeverityLevel } from '@/lib/assessments/scoring';

interface AssessmentResultProps {
  assessment: {
    id: string;
    score: number;
    severityLevel: string;
    completedAt: Date;
    assessmentType: {
      name: string;
      code: string;
      minScore: number;
      maxScore: number;
    };
  };
  interpretation: string;
  recommendation: string;
}

export const AssessmentResult = ({
  assessment,
  interpretation,
  recommendation,
}: AssessmentResultProps) => {
  const { score, severityLevel, completedAt, assessmentType } = assessment;
  const colors = getSeverityColor(severityLevel);
  const scorePercentage = (score / assessmentType.maxScore) * 100;

  const getSeverityIcon = () => {
    const severityLower = severityLevel.toLowerCase();
    const iconClass = `w-6 h-6 ${colors.text}`;

    switch (severityLower) {
      case 'minimal':
        return <CheckCircle2 className={iconClass} />;
      case 'mild':
        return <Info className={iconClass} />;
      case 'moderate':
        return <AlertTriangle className={iconClass} />;
      case 'severe':
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <div className="my-4 border-2 border-purple-200 rounded-lg bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-purple-900 mb-1">
            {assessmentType.name} Results
          </h3>
          <p className="text-sm text-gray-600">
            Completed {format(new Date(completedAt), 'MMM d, yyyy')} at{' '}
            {format(new Date(completedAt), 'h:mm a')}
          </p>
        </div>
        {getSeverityIcon()}
      </div>

      {/* Score Display */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Your Score</span>
          <span className="text-3xl font-bold text-purple-900">
            {score}
            <span className="text-lg text-gray-500">/{assessmentType.maxScore}</span>
          </span>
        </div>

        {/* Score Bar */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute h-full transition-all duration-500 ${
              severityLevel.toLowerCase() === 'minimal'
                ? 'bg-green-500'
                : severityLevel.toLowerCase() === 'mild'
                ? 'bg-yellow-500'
                : severityLevel.toLowerCase() === 'moderate'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>

      {/* Severity Level */}
      <div className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg} mb-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Severity Level:</span>
          <span className={`font-bold text-lg ${colors.text}`}>
            {formatSeverityLevel(severityLevel)}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{interpretation}</p>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Recommendation
          </h4>
          <p className="text-sm text-purple-800 leading-relaxed">{recommendation}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Note:</strong> This assessment is a screening tool and not a diagnostic
          instrument. For a comprehensive evaluation and personalized treatment plan, please
          consult with a qualified mental health professional.
        </p>
      </div>
    </div>
  );
};
