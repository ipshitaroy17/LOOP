import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Handles user sign out as a state-changing POST request.
 * Clears the session cookies and redirects to the home page.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Gracefully handle signout even if Supabase is temporarily unreachable
  }

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL('/', origin), {
    status: 303, // See Other: forces a GET request on the destination
  });
}

