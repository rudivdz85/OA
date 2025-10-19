'use client';

import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showStrength = false, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    const calculateStrength = (password: string): number => {
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      return score;
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrength) {
        setStrength(calculateStrength(e.target.value));
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const getStrengthColor = (): string => {
      if (strength <= 2) return 'bg-red-500';
      if (strength === 3) return 'bg-yellow-500';
      if (strength === 4) return 'bg-green-500';
      return 'bg-green-600';
    };

    const getStrengthText = (): string => {
      if (strength <= 2) return 'Weak';
      if (strength === 3) return 'Medium';
      if (strength === 4) return 'Strong';
      return 'Very Strong';
    };

    return (
      <div className="space-y-1">
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            } ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
            onChange={handlePasswordChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {showStrength && props.value && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all ${
                    i < strength ? getStrengthColor() : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Password strength: <span className="font-medium">{getStrengthText()}</span>
            </p>
          </div>
        )}

        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
