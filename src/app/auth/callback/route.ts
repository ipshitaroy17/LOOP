import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Validates that a redirect target is an internal relative path.
 * Protects against Open Redirect attacks.
 */
function getSafeRedirectTarget(target: string | null): string {
  if (!target) return '/dashboard';

  // Ensure it starts with a single slash, not a double slash or backslash
  if (target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')) {
    return target;
  }

  return '/dashboard';
}

/**
 * Handles the OAuth / Email confirmation callback from Supabase.
 * Exchanges the auth code for a user session and sets session cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  const safeTarget = getSafeRedirectTarget(next);

  // If Supabase returned an explicit error in query params (e.g. expired link)
  if (error) {
    const errorRedirectUrl = new URL('/login', requestUrl.origin);
    errorRedirectUrl.searchParams.set(
      'error',
      errorDescription || 'The confirmation link is invalid or has expired.'
    );
    return NextResponse.redirect(errorRedirectUrl);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        const errorRedirectUrl = new URL('/login', requestUrl.origin);
        errorRedirectUrl.searchParams.set(
          'error',
          'Failed to verify confirmation link. It may have expired or already been used.'
        );
        return NextResponse.redirect(errorRedirectUrl);
      }

      // Successfully confirmed and authenticated: redirect to destination
      const destinationUrl = new URL(safeTarget, requestUrl.origin);
      return NextResponse.redirect(destinationUrl);
    } catch {
      const errorRedirectUrl = new URL('/login', requestUrl.origin);
      errorRedirectUrl.searchParams.set(
        'error',
        'Authentication service is temporarily unavailable. Please try again.'
      );
      return NextResponse.redirect(errorRedirectUrl);
    }
  }

  // No code provided: redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
