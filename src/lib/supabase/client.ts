import { createBrowserClient } from '@supabase/ssr';
import { assertSupabaseConfig, getSupabaseConfig } from './config';
import type { Database } from './types';

/**
 * Creates a typed Supabase client for client-side components and browser contexts.
 * Throws a descriptive error if environment variables are missing.
 */
export function createClient() {
  const { url, publishableKey } = assertSupabaseConfig();
  return createBrowserClient<Database>(url, publishableKey);
}

/**
 * Returns a typed browser client if configured, or null if configuration is missing.
 * Useful for components that gracefully handle unconfigured states.
 */
export function createOptionalClient() {
  const { url, publishableKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  return createBrowserClient<Database>(url, publishableKey);
}

