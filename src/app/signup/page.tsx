'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpAction, type AuthActionResult } from '@/app/auth/actions';

export default function SignUpPage() {
  const router = useRouter();

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  // Client-side quick check
  const validateClient = () => {
    const errors: Record<string, string> = {};
    if (!displayName.trim()) {
      errors.displayName = 'Please enter your display name.';
    } else if (displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter a password.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one letter and one number.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      const result: AuthActionResult = await signUpAction(formData);

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

      if (result.confirmationRequired) {
        setConfirmationEmail(result.email || email);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Confirmation Required Screen ──────────────────────────────────────────
  if (confirmationEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-black/5 text-center">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
            aria-hidden="true"
          >
            ✓
          </div>

          <h1 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: 'var(--color-charcoal)' }}>
            Check your email
          </h1>

          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-charcoal-soft)' }}>
            We have sent a verification link to{' '}
            <strong className="font-semibold text-black">{confirmationEmail}</strong>.
          </p>

          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-charcoal-soft)' }}>
            Please click the link in your email to activate your account. Once verified, you will be able to log in to your LOOP dashboard.
          </p>

          <div className="pt-4 border-t border-black/5">
            <Link
              href="/login"
              className="inline-block w-full py-3 px-6 rounded-full font-semibold text-center text-sm transition-colors hover:brightness-105"
              style={{
                backgroundColor: 'var(--color-sage)',
                color: '#1F1F1F',
              }}
            >
              Go to log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Sign Up Form ───────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-black/5">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight inline-block mb-2"
            style={{ color: 'var(--color-charcoal)' }}
          >
            LOOP
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>
            Create your account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-charcoal-soft)' }}>
            Begin your crochet learning journey
          </p>
        </div>

        {/* Global form error message */}
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
          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (fieldErrors.displayName) {
                  setFieldErrors((prev) => ({ ...prev, displayName: '' }));
                }
              }}
              placeholder="e.g. Sarah"
              className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:ring-2 focus:outline-none"
              style={{
                borderColor: fieldErrors.displayName ? '#DC2626' : '#D1D5DB',
                color: 'var(--color-charcoal)',
                backgroundColor: '#FAF7F0',
              }}
              aria-invalid={Boolean(fieldErrors.displayName)}
              aria-describedby={fieldErrors.displayName ? 'displayName-error' : undefined}
            />
            {fieldErrors.displayName && (
              <p id="displayName-error" className="mt-1 text-xs text-red-600 font-medium">
                {fieldErrors.displayName}
              </p>
            )}
          </div>

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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:ring-2 focus:outline-none"
              style={{
                borderColor: fieldErrors.password ? '#DC2626' : '#D1D5DB',
                color: 'var(--color-charcoal)',
                backgroundColor: '#FAF7F0',
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby="password-requirements"
            />
            <p id="password-requirements" className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters, with letters and numbers.
            </p>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium"
                style={{ color: 'var(--color-charcoal)' }}
              >
                Confirm password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-xs font-medium underline-offset-2 hover:underline focus:outline-none"
                style={{ color: 'var(--color-charcoal-soft)' }}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }
              }}
              placeholder="Repeat your password"
              className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:ring-2 focus:outline-none"
              style={{
                borderColor: fieldErrors.confirmPassword ? '#DC2626' : '#D1D5DB',
                color: 'var(--color-charcoal)',
                backgroundColor: '#FAF7F0',
              }}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
            />
            {fieldErrors.confirmPassword && (
              <p id="confirm-error" className="mt-1 text-xs text-red-600 font-medium">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit CTA */}
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
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        {/* Link to Login */}
        <div className="mt-8 text-center text-sm" style={{ color: 'var(--color-charcoal-soft)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold underline underline-offset-2 hover:text-black"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}

