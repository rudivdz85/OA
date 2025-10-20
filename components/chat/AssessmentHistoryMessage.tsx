'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, History } from 'lucide-react';

interface AssessmentHistoryMessageProps {
  historyText: string;
}

export const AssessmentHistoryMessage = ({ historyText }: AssessmentHistoryMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors text-purple-700 text-sm font-medium"
      >
        <History className="w-4 h-4" />
        <span>History Sent</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 ml-auto" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-auto" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-sm text-gray-700 whitespace-pre-line font-mono">
            {historyText}
          </div>
        </div>
      )}
    </div>
  );
};
