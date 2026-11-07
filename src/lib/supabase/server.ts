import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { assertSupabaseConfig, getSupabaseConfig } from './config';
import type { Database } from './types';

/**
 * Creates a typed Supabase client for Server Components, Route Handlers,
 * and Server Actions with cookie-based session management.
 *
 * In Next.js 15+, cookies() is an asynchronous function.
 */
export async function createClient() {
  const { url, publishableKey } = assertSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // In Next.js, Server Components cannot set cookies directly.
          // This can be safely ignored when middleware handles refreshing sessions.
        }
      },
    },
  });
}

/**
 * Returns a typed server client if configured, or null if configuration is missing.
 * Allows pages and layouts to degrade gracefully when Supabase is not yet configured.
 */
export async function createOptionalClient() {
  const { url, publishableKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored in Server Components
        }
      },
    },
  });
}

