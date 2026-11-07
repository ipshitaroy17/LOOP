import Link from 'next/link';
import { connection } from 'next/server';
import { createOptionalClient } from '@/lib/supabase/server';

export default async function AuthNav() {
  // connection() marks this component as request-time, preventing Next.js 16
  // from flagging the cookie read (via createOptionalClient) as an unstable
  // prerender value on the otherwise-static landing page.
  await connection();
  const supabase = await createOptionalClient();
  let user = null;

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/my-projects"
          className="text-sm font-medium rounded-full px-3.5 py-2 transition-colors hover:bg-black/5 hidden xs:inline"
          style={{ color: 'var(--color-charcoal)' }}
        >
          My Projects
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium rounded-full px-4 py-2 transition-colors hover:brightness-105"
          style={{
            backgroundColor: 'var(--color-sage)',
            color: '#1F1F1F',
          }}
        >
          Dashboard
        </Link>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm font-medium px-3 py-1.5 rounded-full border border-black/10 transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Log out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="text-sm font-medium rounded-md px-3 py-2 transition-colors hover:text-black"
        style={{ color: 'var(--color-charcoal)' }}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="text-sm font-semibold rounded-full px-4 py-2 transition-colors hover:brightness-105"
        style={{
          backgroundColor: 'var(--color-sage)',
          color: '#1F1F1F',
        }}
      >
        Sign up
      </Link>
    </div>
  );
}

