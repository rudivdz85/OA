'use client';

import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export const SubmitButton = ({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className = '',
  disabled,
  ...props
}: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {isLoading ? loadingText : children}
    </button>
  );
};
