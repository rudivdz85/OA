'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FormInput } from '@/components/auth/FormInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validationErrors) {
          setErrors({ password: data.validationErrors.join(', ') });
        } else {
          setErrors({ form: data.error || 'Registration failed' });
        }
        return;
      }

      // Show success message
      setSuccessMessage('Account created successfully! Signing you in...');

      // Automatically sign in the user
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ form: 'Registration successful but auto-login failed. Please sign in manually.' });
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join us to start your journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <AuthDivider />

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {errors.form && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.form}</p>
              </div>
            )}

            <FormInput
              id="name"
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              autoComplete="name"
            />

            <FormInput
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              placeholder="john@example.com"
              autoComplete="email"
            />

            <PasswordInput
              id="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              showStrength
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-900 mb-2">
                Password Requirements:
              </p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-600 rounded-full" />
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-600 rounded-full" />
                  Contains uppercase and lowercase letters
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-600 rounded-full" />
                  Contains at least one number
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-600 rounded-full" />
                  Special characters recommended
                </li>
              </ul>
            </div>

            <SubmitButton isLoading={isLoading} loadingText="Creating account...">
              Create Account
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
