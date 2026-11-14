import Link from 'next/link';
import { connection } from 'next/server';
import { createOptionalClient } from '@/lib/supabase/server';
import PillButton from '@/components/ui/PillButton';

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
          className="text-sm font-semibold px-3 py-1.5 rounded-full transition-colors hover:text-ink/70 hidden md:inline text-ink"
        >
          My projects
        </Link>
        <PillButton
          variant="primary"
          size="sm"
          href="/dashboard"
        >
          Dashboard
        </PillButton>
        <form action="/auth/signout" method="POST" className="inline-flex">
          <PillButton
            variant="outline"
            size="sm"
            type="submit"
          >
            Log out
          </PillButton>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="text-sm font-semibold rounded-full px-3.5 py-1.5 transition-colors hover:text-ink/70 text-ink"
      >
        Log in
      </Link>
      <PillButton
        variant="primary"
        size="sm"
        href="/signup"
      >
        Create free account
      </PillButton>
    </div>
  );
}
