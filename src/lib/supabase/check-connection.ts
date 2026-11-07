import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';
import type { Database } from './types';

export type ConnectionStatus =
  | 'missing_config'
  | 'connection_error'
  | 'connected_empty'
  | 'connected_with_projects';

export interface ConnectionCheckResult {
  status: ConnectionStatus;
  message: string;
  projectCount: number | null;
  timestamp: string;
}

/**
 * Verifies the Supabase connection by executing a read query on the `projects` table
 * using the public client and publishable key.
 *
 * Distinguishes:
 * - missing_config: Environment variables are not set or still have placeholders.
 * - connection_error: Query or network request failed (without leaking internal details).
 * - connected_empty: Query succeeded and 0 published projects were visible (expected for a fresh DB).
 * - connected_with_projects: Query succeeded and 1+ published projects were returned.
 */
export async function checkSupabaseConnection(): Promise<ConnectionCheckResult> {
  const config = getSupabaseConfig();
  const timestamp = new Date().toISOString();

  if (!config.isConfigured) {
    return {
      status: 'missing_config',
      message:
        'Supabase configuration is missing. Add NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env.local file.',
      projectCount: null,
      timestamp,
    };
  }

  try {
    const client = createBrowserClient<Database>(config.url, config.publishableKey);

    // Query published projects as an anonymous/public caller
    const { data, error, count } = await client
      .from('projects')
      .select('id, slug, title', { count: 'exact' })
      .limit(5);

    if (error) {
      return {
        status: 'connection_error',
        message: `Database query failed (${error.code || 'UNKNOWN'}). Verify that migrations have been applied to your Supabase project.`,
        projectCount: null,
        timestamp,
      };
    }

    const totalCount = count ?? (data ? data.length : 0);

    if (totalCount === 0) {
      return {
        status: 'connected_empty',
        message: 'Successfully connected to Supabase. The projects table is queryable and currently contains 0 published projects.',
        projectCount: 0,
        timestamp,
      };
    }

    return {
      status: 'connected_with_projects',
      message: `Successfully connected to Supabase. Found ${totalCount} published project(s).`,
      projectCount: totalCount,
      timestamp,
    };
  } catch {
    return {
      status: 'connection_error',
      message: 'Failed to establish connection to Supabase endpoint. Check network connectivity and project URL.',
      projectCount: null,
      timestamp,
    };
  }
}

