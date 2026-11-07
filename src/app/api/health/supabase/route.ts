import { NextResponse } from 'next/server';
import { checkSupabaseConnection } from '@/lib/supabase/check-connection';

/**
 * Development-only connection health check endpoint.
 *
 * Calls checkSupabaseConnection() to query the projects table using the public publishable key.
 * Never exposes credentials, database passwords, or raw internal errors.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint only available in development environment' },
      { status: 403 }
    );
  }

  const result = await checkSupabaseConnection();

  const httpStatus =
    result.status === 'missing_config'
      ? 503
      : result.status === 'connection_error'
      ? 502
      : 200;

  return NextResponse.json(result, { status: httpStatus });
}

