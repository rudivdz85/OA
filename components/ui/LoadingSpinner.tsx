/**
 * LoadingSpinner Component
 * Reusable loading spinner with multiple size variants
 * Uses purple theme to match the app's color scheme
 */

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-purple-600 animate-spin`} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * FullPageLoader Component
 * For full-page loading states
 */
export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

/**
 * InlineLoader Component
 * For inline loading states (buttons, cards, etc.)
 */
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}
