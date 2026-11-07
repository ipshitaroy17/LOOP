'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAction, type AuthActionResult } from '@/app/auth/actions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const redirectTarget = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(urlError);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateClient = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (redirectTarget) {
        formData.set('redirect', redirectTarget);
      }

      const result: AuthActionResult = await signInAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        if (result.error) {
          setFormError(result.error);
        }
        setIsSubmitting(false);
        return;
      }

      // If signInAction completed without an exception-redirect:
      router.push(redirectTarget || '/dashboard');
      router.refresh();
    } catch {
      // In Next.js, redirect() throws an error to initiate navigation.
      // If an actual network failure happened, show friendly message.
      setFormError('Unable to connect to the login service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-black/5">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight inline-block mb-2"
          style={{ color: 'var(--color-charcoal)' }}
        >
          LOOP
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>
          Welcome back
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-charcoal-soft)' }}>
          Log in to continue your crochet learning
        </p>
      </div>

      {/* Global Error Alert */}
      {formError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl text-sm leading-relaxed"
          style={{ backgroundColor: '#FDF2F2', color: '#991B1B', border: '1px solid #F87171' }}
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: '' }));
              }
            }}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:ring-2 focus:outline-none"
            style={{
              borderColor: fieldErrors.email ? '#DC2626' : '#D1D5DB',
              color: 'var(--color-charcoal)',
              backgroundColor: '#FAF7F0',
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600 font-medium">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs font-medium underline-offset-2 hover:underline focus:outline-none"
              style={{ color: 'var(--color-charcoal-soft)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: '' }));
              }
            }}
            placeholder="Enter your password"
            className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:ring-2 focus:outline-none"
            style={{
              borderColor: fieldErrors.password ? '#DC2626' : '#D1D5DB',
              color: 'var(--color-charcoal)',
              backgroundColor: '#FAF7F0',
            }}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600 font-medium">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-full font-semibold text-sm transition-all hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-sage)',
              color: '#1F1F1F',
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </div>
      </form>

      {/* Link to Sign up */}
      <div className="mt-8 text-center text-sm" style={{ color: 'var(--color-charcoal-soft)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold underline underline-offset-2 hover:text-black"
          style={{ color: 'var(--color-charcoal)' }}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

