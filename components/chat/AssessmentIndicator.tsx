'use client';

import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AssessmentResult } from './AssessmentResult';
import { getSeverityColor, formatSeverityLevel } from '@/lib/assessments/scoring';

interface AssessmentIndicatorProps {
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
  defaultExpanded?: boolean;
}

export const AssessmentIndicator = ({
  assessment,
  interpretation,
  recommendation,
  defaultExpanded = false,
}: AssessmentIndicatorProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const colors = getSeverityColor(assessment.severityLevel);

  return (
    <div className="my-4">
      {/* Compact Indicator */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 ${colors.border} ${colors.bg} hover:shadow-md transition-all group`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
            <FileText className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">
              {assessment.assessmentType.name}
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Score: {assessment.score}/{assessment.assessmentType.maxScore}</span>
              <span className="text-gray-400">•</span>
              <span className={`font-medium ${colors.text}`}>
                {formatSeverityLevel(assessment.severityLevel)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
            {isExpanded ? 'Hide details' : 'View details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2">
          <AssessmentResult
            assessment={assessment}
            interpretation={interpretation}
            recommendation={recommendation}
          />
        </div>
      )}
    </div>
  );
};
