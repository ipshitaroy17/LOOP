/**
 * Supabase configuration helper for LOOP.
 *
 * Provides safe access to public Supabase environment variables without
 * throwing during module import or Next.js build time.
 */

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
  isConfigured: boolean;
}

/**
 * Returns current Supabase client configuration.
 *
 * Checks for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY for backward compatibility.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  // Validate that the values are real and not placeholder strings
  const isPlaceholder =
    url.includes('your-project') ||
    publishableKey.includes('your-publishable') ||
    publishableKey.includes('your-anon');

  const isConfigured = Boolean(
    url &&
    publishableKey &&
    !isPlaceholder &&
    url.startsWith('http')
  );

  return {
    url,
    publishableKey,
    isConfigured,
  };
}

/**
 * Asserts that Supabase configuration is present.
 * Throws a human-friendly error if variables are missing or unconfigured.
 */
export function assertSupabaseConfig(): { url: string; publishableKey: string } {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    throw new Error(
      'Supabase environment variables are missing or not configured. ' +
      'Please create a .env.local file with valid NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY values. See .env.example for details.'
    );
  }

  return {
    url: config.url,
    publishableKey: config.publishableKey,
  };
}

