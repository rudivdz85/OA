'use client';

import { useState } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import type { AssessmentType } from '@/lib/db/schema';

interface AssessmentQuizProps {
  assessment: {
    id: string;
    assessmentType: AssessmentType;
    currentQuestionIndex: number;
    answers: Array<{ questionId: number; answer: number; timestamp: string }>;
  };
  onComplete: (answers: Array<{ questionId: number; answer: number; timestamp: string }>) => void;
  onCancel: () => void;
}

export const AssessmentQuiz = ({ assessment, onComplete, onCancel }: AssessmentQuizProps) => {
  const { assessmentType } = assessment;
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    assessment.answers.forEach((a) => {
      initial[a.questionId] = a.answer;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = assessmentType.questions.items;
  const options = assessmentType.questions.options;

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const allQuestionsAnswered = questions.every((q) => answers[q.id] !== undefined);
  const progress = (Object.keys(answers).length / questions.length) * 100;

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return;

    setIsSubmitting(true);

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id],
      timestamp: new Date().toISOString(),
    }));

    onComplete(formattedAnswers);
  };

  return (
    <div className="my-4 border-2 border-purple-300 rounded-lg bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-2">
          {assessmentType.name}
        </h2>
        <p className="text-sm text-gray-600 mb-4">{assessmentType.questions.instructions}</p>

        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold inline-block text-purple-600">
              Progress
            </span>
            <span className="text-xs font-semibold inline-block text-purple-600">
              {Object.keys(answers).length} / {questions.length}
            </span>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-purple-100">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-6">
        {questions.map((question) => (
          <div
            key={question.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <p className="font-medium text-gray-900 mb-3">
              {question.id}. {question.text}
            </p>

            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    answers[question.id] === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={() => handleAnswerChange(question.id, option.value)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered || isSubmitting}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Assessment
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {!allQuestionsAnswered && (
        <p className="text-sm text-amber-600 text-center mt-3">
          Please answer all questions to submit
        </p>
      )}
    </div>
  );
};
