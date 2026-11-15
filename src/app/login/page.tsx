'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { signInAction, type AuthActionResult } from '@/app/auth/actions';

/* ── Shared input style helpers ──────────────────────────────── */
const inputBase =
  'w-full px-4 py-3 text-sm font-body text-ink bg-cream border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink placeholder:text-ink/40';
const inputRadius = 'rounded-2xl'; // 16px
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
      if (redirectTarget) formData.set('redirect', redirectTarget);

      const result: AuthActionResult = await signInAction(formData);

      if (!result.success) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        if (result.error) setFormError(result.error);
        setIsSubmitting(false);
        return;
      }

      router.push(redirectTarget || '/dashboard');
      router.refresh();
    } catch {
      setFormError('Unable to connect to the login service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* ── Split layout wrapper ─────────────────────────── */
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* LEFT: sage-light panel */}
      <div className="flex flex-col items-start justify-center bg-sage-light px-10 py-14 lg:w-[45%] lg:min-h-screen">
        <Link href="/" aria-label="loop Home" className="mb-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-lg">
          <Logo size="lg" />
        </Link>

        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] text-ink max-w-xs">
          Welcome back to your loops.
        </h1>

        <p className="font-body text-ink/70 text-base mt-4 max-w-xs leading-relaxed">
          Pick up where you left off.
        </p>

        <YarnLine />
      </div>

      {/* RIGHT: white form card */}
      <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(46,42,54,0.08)] border border-ink/5">

          <h2 className="font-display font-bold text-2xl text-ink mb-1">Log in</h2>
          <p className="font-body text-ink/60 text-sm mb-7">
            Continue your crochet learning journey.
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                }}
                placeholder="Enter your password"
                className={`${inputBase} ${inputRadius} ${inputBorder(Boolean(fieldErrors.password))}`}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600 font-medium font-body">
                  {fieldErrors.password}
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
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </button>
            </div>
          </form>

          {/* Switch to Sign up */}
          <p className="mt-7 text-center text-sm font-body text-ink/60">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-ink hover:text-sage-dark underline underline-offset-2 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center text-sm text-ink/60">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
