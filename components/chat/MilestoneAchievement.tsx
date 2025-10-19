'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingDown, X, Star, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MilestoneData } from '@/lib/assessments/achievements';

interface MilestoneAchievementProps {
  milestone: MilestoneData;
  onDismiss?: () => void;
}

export function MilestoneAchievement({ milestone, onDismiss }: MilestoneAchievementProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Fire confetti for significant milestones
    if (milestone.type === 'score_improvement' || milestone.type === 'category_improvement') {
      fireConfetti();
    }

    // Auto-dismiss after 8 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(dismissTimer);
  }, []);

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#9333ea', '#c084fc', '#fbbf24', '#f59e0b'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#9333ea', '#c084fc', '#fbbf24', '#f59e0b'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#9333ea', '#c084fc', '#fbbf24', '#f59e0b'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#9333ea', '#c084fc', '#fbbf24', '#f59e0b'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#9333ea', '#c084fc', '#fbbf24', '#f59e0b'],
    });
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const getIcon = () => {
    switch (milestone.type) {
      case 'score_improvement':
        return <TrendingDown className="w-8 h-8 text-green-600" />;
      case 'category_improvement':
        return <Award className="w-8 h-8 text-purple-600" />;
      case 'first_assessment':
        return <Star className="w-8 h-8 text-yellow-500" />;
      case 'consistency':
        return <Trophy className="w-8 h-8 text-blue-600" />;
      default:
        return <Trophy className="w-8 h-8 text-purple-600" />;
    }
  };

  const getGradient = () => {
    switch (milestone.type) {
      case 'score_improvement':
        return 'from-green-500 to-emerald-600';
      case 'category_improvement':
        return 'from-purple-500 to-pink-600';
      case 'first_assessment':
        return 'from-yellow-400 to-orange-500';
      case 'consistency':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-purple-500 to-pink-600';
    }
  };

  return (
    <div
      className={`relative transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-4'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border-2 border-yellow-400 bg-gradient-to-br ${getGradient()} p-6 shadow-2xl`}
      >
        {/* Animated background sparkles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)] opacity-50" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{milestone.title}</h3>
            <p className="text-white/90 text-base leading-relaxed mb-3">{milestone.message}</p>

            {/* Score details */}
            {milestone.type === 'score_improvement' && milestone.scoreChange && (
              <div className="flex items-center gap-3 mt-3">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <span className="text-sm font-semibold text-white">
                    {milestone.previousScore} → {milestone.currentScore}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-green-500/30 backdrop-blur-sm rounded-lg border border-green-400/50">
                  <span className="text-sm font-bold text-white">
                    ↓ {milestone.scoreChange} points
                  </span>
                </div>
              </div>
            )}

            {/* Category details */}
            {milestone.type === 'category_improvement' && milestone.previousSeverity && milestone.currentSeverity && (
              <div className="flex items-center gap-3 mt-3">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <span className="text-sm font-semibold text-white capitalize">
                    {milestone.previousSeverity.replace('_', ' ')} → {milestone.currentSeverity.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
