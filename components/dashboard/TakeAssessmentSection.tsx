'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssessmentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  totalQuestions: number;
}

export default function TakeAssessmentSection() {
  const router = useRouter();
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState<string | null>(null);
  const [showAssessments, setShowAssessments] = useState(false);

  useEffect(() => {
    async function fetchAssessmentTypes() {
      try {
        const response = await fetch('/api/assessments/types');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAssessmentTypes(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching assessment types:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (showAssessments) {
      fetchAssessmentTypes();
    }
  }, [showAssessments]);

  const handleStartAssessment = async (assessmentTypeId: string) => {
    setIsStarting(assessmentTypeId);

    try {
      // Find the assessment type details
      const selectedAssessment = assessmentTypes.find(a => a.id === assessmentTypeId);
      if (!selectedAssessment) {
        throw new Error('Assessment type not found');
      }

      // Create a new conversation for the assessment
      const convResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!convResponse.ok) {
        throw new Error('Failed to create conversation');
      }

      const convData = await convResponse.json();
      const conversationId = convData.data.id;

      // Send initial message to trigger assessment offer
      const messageText = selectedAssessment.code === 'GAD-7'
        ? "I'd like to take the GAD-7 assessment to check my anxiety levels."
        : selectedAssessment.code === 'PHQ-9'
        ? "I'd like to take the PHQ-9 assessment to check my depression levels."
        : `I'd like to take the ${selectedAssessment.name} assessment.`;

      const messageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          stream: false, // Don't stream from dashboard, just create the message
        }),
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }

      // Navigate to the chat (the AI will respond with the assessment offer)
      router.push(`/dashboard/chat/${conversationId}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Failed to start assessment. Please try again.');
      setIsStarting(null);
    }
  };

  if (!showAssessments) {
    return (
      <div className="group bg-white rounded-2xl p-6 border-2 border-secondary-200 hover:border-secondary-400 hover:shadow-purple-lg transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <FileText className="w-7 h-7 text-white" />
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
          onClick={() => setShowAssessments(true)}
          className="w-full bg-gradient-secondary hover:shadow-lg text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
        >
          <CheckCircle className="w-5 h-5" />
          Start Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl p-6 border-2 border-secondary-200 hover:border-secondary-400 hover:shadow-purple-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <button
          onClick={() => setShowAssessments(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
      <h3 className="text-2xl font-bold text-neutral-900 mb-2">Choose an Assessment</h3>
      <p className="text-neutral-600 mb-4 text-sm leading-relaxed">
        Select a validated assessment to get started
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-secondary-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {assessmentTypes.map(assessment => (
            <button
              key={assessment.id}
              onClick={() => handleStartAssessment(assessment.id)}
              disabled={isStarting !== null}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-secondary-300 hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{assessment.name}</h4>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {assessment.code}
                    </span>
                  </div>
                  {assessment.description && (
                    <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {assessment.category && (
                      <span className="capitalize">{assessment.category}</span>
                    )}
                    <span>{assessment.totalQuestions} questions</span>
                  </div>
                </div>
                {isStarting === assessment.id && (
                  <Loader2 className="w-5 h-5 text-secondary-600 animate-spin flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
