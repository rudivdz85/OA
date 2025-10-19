/**
 * ErrorMessage Component
 * User-friendly error display with retry functionality
 * Different variants for different error types
 */

import { AlertCircle, WifiOff, XCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'network' | 'auth' | 'warning';
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const errorConfig = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  network: {
    icon: WifiOff,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
  },
  auth: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
  },
};

export function ErrorMessage({
  title,
  message,
  type = 'error',
  onRetry,
  retryText = 'Try Again',
  className = '',
}: ErrorMessageProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${config.textColor}`}>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${config.textColor} bg-white border ${config.borderColor} rounded-md hover:bg-gray-50 transition-colors`}
            >
              <RefreshCw className="w-4 h-4" />
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * InlineError Component
 * Smaller inline error for form fields
 */
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * FullPageError Component
 * For full-page error states
 */
export function FullPageError({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="max-w-md w-full">
        <ErrorMessage
          title={title}
          message={message}
          type="error"
          onRetry={onRetry}
          className="shadow-lg"
        />
      </div>
    </div>
  );
}

/**
 * NetworkError Component
 * Specific component for network-related errors
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      type="network"
      onRetry={onRetry}
    />
  );
}

/**
 * AuthError Component
 * Specific component for authentication errors
 */
export function AuthError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Authentication Required"
      message="You need to be signed in to access this page. Please sign in and try again."
      type="auth"
      onRetry={onRetry}
      retryText="Sign In"
    />
  );
}
