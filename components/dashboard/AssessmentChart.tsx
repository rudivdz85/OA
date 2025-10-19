'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { format } from 'date-fns';

interface AssessmentData {
  id: string;
  score: number | null;
  severityLevel: string | null;
  completedAt: Date | null;
  assessmentTypeName: string;
  assessmentTypeCode: string;
  minScore: number;
  maxScore: number;
}

interface AssessmentChartProps {
  assessments: AssessmentData[];
  assessmentType?: string; // Filter by type (e.g., 'GAD-7')
}

const severityColors = {
  minimal: '#10b981', // green
  mild: '#fbbf24', // yellow
  moderate: '#f97316', // orange
  moderately_severe: '#ef4444', // red
  severe: '#dc2626', // dark red
};

const getSeverityColor = (severity: string | null): string => {
  if (!severity) return '#9ca3af';
  return severityColors[severity as keyof typeof severityColors] || '#9ca3af';
};

export const AssessmentChart = ({ assessments, assessmentType }: AssessmentChartProps) => {
  const chartData = useMemo(() => {
    let filtered = assessments
      .filter(a => a.score !== null && a.completedAt !== null);

    // Filter by assessment type if specified
    if (assessmentType) {
      filtered = filtered.filter(a => a.assessmentTypeCode === assessmentType);
    }

    // Sort by date
    const sorted = filtered.sort(
      (a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()
    );

    return sorted.map(assessment => ({
      date: format(new Date(assessment.completedAt!), 'MMM d, yyyy'),
      score: assessment.score,
      severity: assessment.severityLevel,
      fullDate: assessment.completedAt,
      assessmentName: assessment.assessmentTypeName,
      minScore: assessment.minScore,
      maxScore: assessment.maxScore,
    }));
  }, [assessments, assessmentType]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No assessment data to display</p>
      </div>
    );
  }

  // Get score range from first assessment (assuming all same type if filtered)
  const minScore = chartData[0]?.minScore ?? 0;
  const maxScore = chartData[0]?.maxScore ?? 21;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.assessmentName}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          <p className="text-lg font-bold mt-1" style={{ color: getSeverityColor(data.severity) }}>
            Score: {data.score}
          </p>
          {data.severity && (
            <p className="text-xs text-gray-500 capitalize mt-1">
              {data.severity.replace('_', ' ')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Gradient for severity zones */}
            <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.1} />
              <stop offset="30%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="50%" stopColor="#f97316" stopOpacity={0.1} />
              <stop offset="70%" stopColor="#fbbf24" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#d1d5db' }}
          />

          <YAxis
            domain={[minScore, maxScore]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#d1d5db' }}
            label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />

          {/* Reference lines for severity zones (example for GAD-7 scale 0-21) */}
          {maxScore === 21 && (
            <>
              <ReferenceLine y={5} stroke="#fbbf24" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={10} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
            </>
          )}

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#9333ea"
            strokeWidth={3}
            dot={{ fill: '#9333ea', r: 5 }}
            activeDot={{ r: 7, fill: '#7e22ce' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend for severity zones */}
      {maxScore === 21 && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Minimal (0-4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-gray-600">Mild (5-9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600">Moderate (10-14)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Severe (15-21)</span>
          </div>
        </div>
      )}
    </div>
  );
};
