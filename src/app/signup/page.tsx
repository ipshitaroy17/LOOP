'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { signUpAction, type AuthActionResult } from '@/app/auth/actions';

/* ── Shared input style helpers ──────────────────────────────── */
const inputBase =
  'w-full px-4 py-3 text-sm font-body text-ink bg-cream border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink placeholder:text-ink/40';
const inputRadius = 'rounded-2xl';
const inputBorder = (hasError: boolean) =>
  hasError ? 'border-red-500 border-[1.5px]' : 'border-[#8C8494] border-[1.5px]';

/* ── Dotted yarn SVG line ───────────────────────────────────── */
function YarnLine() {
  return (
    <svg
      aria-hidden="true"
      className="w-full max-w-[200px] mt-8 opacity-40"
      viewBox="0 0 200 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 10 Q 20 2, 36 10 T 68 10 T 100 10 T 132 10 T 164 10 T 196 10"
        stroke="#4F6B4C"
        strokeWidth="2.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

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
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        if (result.error) setFormError(result.error);
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

  /* ── Confirmation Required Screen ──────────────────────────── */
  if (confirmationEmail) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(46,42,54,0.08)] border border-ink/5 text-center">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold bg-sage text-ink"
            aria-hidden="true"
          >
            ✓
          </div>
          <h1 className="font-display font-bold text-2xl text-ink mb-3">Check your email</h1>
          <p className="font-body text-sm text-ink/70 mb-4 leading-relaxed">
            We sent a verification link to{' '}
            <strong className="font-semibold text-ink">{confirmationEmail}</strong>.
          </p>
          <p className="font-body text-sm text-ink/70 mb-8 leading-relaxed">
            Click the link in your email to activate your account. Once verified, you can log in to your loop dashboard.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 px-6 rounded-full font-semibold text-center text-sm bg-sage text-ink hover:bg-sage-dark hover:text-white transition-all"
          >
            Go to log in
          </Link>
        </div>
      </main>
    );
  }

  /* ── Sign Up Form ──────────────────────────────────────────── */
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* LEFT: sage-light panel */}
      <div className="flex flex-col items-start justify-center bg-sage-light px-10 py-14 lg:w-[45%] lg:min-h-screen">
        <Link href="/" aria-label="loop Home" className="mb-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-lg">
          <Logo size="lg" />
        </Link>

        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] text-ink max-w-xs">
          Start your first loop.
        </h1>

        <p className="font-body text-ink/70 text-base mt-4 max-w-xs leading-relaxed">
          Create your free account and begin your crochet journey today.
        </p>

        <YarnLine />
      </div>

      {/* RIGHT: white form card */}
      <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(46,42,54,0.08)] border border-ink/5">

          <h2 className="font-display font-bold text-2xl text-ink mb-1">Create account</h2>
          <p className="font-body text-ink/60 text-sm mb-7">
            Let&apos;s get you set up.
          </p>

          {/* Global error */}
          {formError && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-2xl text-sm font-body leading-relaxed bg-red-50 text-red-800 border border-red-200"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
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
                  if (fieldErrors.displayName) setFieldErrors((p) => ({ ...p, displayName: '' }));
                }}
                placeholder="e.g. Sarah"
                className={`${inputBase} ${inputRadius} ${inputBorder(Boolean(fieldErrors.displayName))}`}
                aria-invalid={Boolean(fieldErrors.displayName)}
                aria-describedby={fieldErrors.displayName ? 'displayName-error' : undefined}
              />
              {fieldErrors.displayName && (
                <p id="displayName-error" className="mt-1.5 text-xs text-red-600 font-medium font-body">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
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
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder="you@example.com"
                className={`${inputBase} ${inputRadius} ${inputBorder(Boolean(fieldErrors.email))}`}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-600 font-medium font-body">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-semibold text-sage-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
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
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                }}
                placeholder="At least 8 characters"
                className={`${inputBase} ${inputRadius} ${inputBorder(Boolean(fieldErrors.password))}`}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby="password-requirements"
              />
              <p id="password-requirements" className="mt-1.5 text-xs text-ink/50 font-body">
                Must be at least 8 characters, with letters and numbers.
              </p>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium font-body">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Confirm password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-xs font-semibold text-sage-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
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
                  if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                placeholder="Repeat your password"
                className={`${inputBase} ${inputRadius} ${inputBorder(Boolean(fieldErrors.confirmPassword))}`}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
              />
              {fieldErrors.confirmPassword && (
                <p id="confirm-error" className="mt-1.5 text-xs text-red-600 font-medium font-body">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-full font-semibold text-sm bg-sage text-ink hover:bg-sage-dark hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <p className="mt-7 text-center text-sm font-body text-ink/60">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-ink hover:text-sage-dark underline underline-offset-2 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
