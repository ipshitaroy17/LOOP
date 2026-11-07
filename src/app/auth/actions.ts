'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export interface AuthActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  confirmationRequired?: boolean;
  email?: string;
}

/**
 * Validates email format using standard regex.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates redirect target to ensure it is an internal path.
 */
function getSafeRedirect(target: string | null | undefined): string {
  if (
    target &&
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.startsWith('/\\')
  ) {
    return target;
  }
  return '/dashboard';
}

/**
 * Server Action: Registers a new user with email and password.
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const displayName = (formData.get('displayName') as string || '').trim();
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = (formData.get('password') as string || '');
  const confirmPassword = (formData.get('confirmPassword') as string || '');

  const fieldErrors: Record<string, string> = {};

  // Validation
  if (!displayName) {
    fieldErrors.displayName = 'Please enter your display name.';
  } else if (displayName.length < 2) {
    fieldErrors.displayName = 'Display name must be at least 2 characters.';
  } else if (displayName.length > 50) {
    fieldErrors.displayName = 'Display name must be 50 characters or less.';
  }

  if (!email) {
    fieldErrors.email = 'Please enter your email address.';
  } else if (!isValidEmail(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    fieldErrors.password = 'Please enter a password.';
  } else if (password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters long.';
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    fieldErrors.password = 'Password must contain at least one letter and one number.';
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = `${protocol}://${host}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      // Map known Supabase error messages to friendly user text
      let friendlyMessage = error.message;
      if (error.message.includes('User already registered')) {
        friendlyMessage = 'An account with this email address already exists. Try logging in instead.';
      } else if (error.message.includes('Password should be')) {
        friendlyMessage = 'Password does not meet security requirements.';
      }
      return {
        success: false,
        error: friendlyMessage,
      };
    }

    // Determine if email confirmation is required:
    // If confirmation is required, session will be null and user is created.
    if (!data.session) {
      return {
        success: true,
        confirmationRequired: true,
        email,
      };
    }

    // If confirmation was disabled or session is directly provided:
    return {
      success: true,
      confirmationRequired: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to authentication service.';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Authenticates a user with email and password.
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = (formData.get('password') as string || '');
  const redirectTarget = formData.get('redirect') as string | null;

  const fieldErrors: Record<string, string> = {};

  if (!email) {
    fieldErrors.email = 'Please enter your email address.';
  } else if (!isValidEmail(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    fieldErrors.password = 'Please enter your password.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let friendlyMessage = 'The email or password you entered is incorrect. Please try again.';
      if (error.message.includes('Email not confirmed')) {
        friendlyMessage = 'Please verify your email address before logging in. Check your inbox for the confirmation link.';
      }
      return {
        success: false,
        error: friendlyMessage,
      };
    }

    let destination = '/dashboard';
    if (!redirectTarget) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (profile && !profile.onboarding_completed) {
          destination = '/onboarding';
        }
      }
    } else {
      destination = getSafeRedirect(redirectTarget);
    }

    redirect(destination);
  } catch (err: unknown) {
    // Next.js redirect() throws a special NEXT_REDIRECT error which should propagate
    if (err && typeof err === 'object' && 'digest' in err) {
      const digest = String((err as { digest?: unknown }).digest);
      if (digest.startsWith('NEXT_REDIRECT')) {
        throw err;
      }
    }

    return {
      success: false,
      error: 'Unable to connect to login service. Please check your network connection and try again.',
    };
  }
}

/**
 * Server Action: Signs out the current user and redirects to the landing page.
 */
export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout error if session already cleared
  }
  redirect('/');
}

