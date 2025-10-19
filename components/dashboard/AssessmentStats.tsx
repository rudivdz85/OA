'use client';

import { TrendingDown, TrendingUp, Minus, Activity, Calendar, BarChart3 } from 'lucide-react';

interface AssessmentStats {
  totalAssessments: number;
  averageScore: number | null;
  latestScore: number | null;
  latestSeverity: string | null;
  latestDate: Date | null;
  firstScore: number | null;
  improvement: number | null;
  trend: 'improving' | 'stable' | 'worsening' | 'none';
}

interface AssessmentStatsProps {
  stats: AssessmentStats;
}

const severityColors = {
  minimal: 'text-green-600 bg-green-100',
  mild: 'text-yellow-600 bg-yellow-100',
  moderate: 'text-orange-600 bg-orange-100',
  moderately_severe: 'text-red-600 bg-red-100',
  severe: 'text-red-700 bg-red-100',
};

const getSeverityStyle = (severity: string | null): string => {
  if (!severity) return 'text-gray-600 bg-gray-100';
  return severityColors[severity as keyof typeof severityColors] || 'text-gray-600 bg-gray-100';
};

const formatDate = (date: Date | null): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const AssessmentStats = ({ stats }: AssessmentStatsProps) => {
  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'improving':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'worsening':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-yellow-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendText = () => {
    if (stats.trend === 'none') return 'No trend data yet';
    if (stats.improvement === null) return 'N/A';

    const absImprovement = Math.abs(stats.improvement);
    if (stats.trend === 'improving') {
      return `${absImprovement}% improvement`;
    } else if (stats.trend === 'worsening') {
      return `${absImprovement}% increase`;
    } else {
      return 'Stable scores';
    }
  };

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'worsening':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'stable':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Assessments */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Assessments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalAssessments}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Latest Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Latest Score</p>
            {stats.latestScore !== null ? (
              <>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.latestScore}
                </p>
                {stats.latestSeverity && (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getSeverityStyle(
                      stats.latestSeverity
                    )}`}
                  >
                    {stats.latestSeverity.replace('_', ' ').charAt(0).toUpperCase() +
                      stats.latestSeverity.replace('_', ' ').slice(1)}
                  </span>
                )}
              </>
            ) : (
              <p className="text-3xl font-bold text-gray-400 mt-2">-</p>
            )}
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {stats.latestDate && (
          <p className="text-xs text-gray-500 mt-2">{formatDate(stats.latestDate)}</p>
        )}
      </div>

      {/* Average Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.averageScore !== null ? stats.averageScore : '-'}
            </p>
            {stats.totalAssessments > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Across {stats.totalAssessments} assessment{stats.totalAssessments !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className={`border rounded-lg p-5 shadow-sm ${getTrendColor()}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Progress Trend</p>
            <p className="text-2xl font-bold mt-2">{getTrendText()}</p>
            {stats.totalAssessments >= 2 && stats.trend !== 'none' && (
              <p className="text-xs opacity-70 mt-2">
                Since first assessment
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
            {getTrendIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
