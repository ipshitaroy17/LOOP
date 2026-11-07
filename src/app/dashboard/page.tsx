import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Allow blocking route for runtime cookies authentication
export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Validate authenticated identity on the server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect('/login');
  }

  // Fetch the user's profile under their authenticated RLS policy
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Crochet Learner';

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* ── Dashboard Navigation Bar ────────────────────────────────────────── */}
      <header
        className="w-full px-6 py-5 flex items-center justify-between border-b border-black/5"
        style={{ backgroundColor: 'var(--color-cream)' }}
      >
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-charcoal)' }}
          aria-label="LOOP Home"
        >
          LOOP
        </Link>

        <nav aria-label="Dashboard navigation" className="flex items-center gap-4">
          <span
            className="text-sm font-medium hidden sm:inline"
            style={{ color: 'var(--color-charcoal-soft)' }}
          >
            {user.email}
          </span>

          {/* Logout Form: State-changing POST request */}
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm font-medium px-4 py-2 rounded-full border border-black/10 transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Log out
            </button>
          </form>
        </nav>
      </header>

      {/* ── Main Dashboard Content ──────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        {/* Welcome Section */}
        <section aria-labelledby="welcome-heading" className="mb-10">
          <p className="text-sm font-semibold tracking-wide uppercase mb-2" style={{ color: 'var(--color-sage)' }}>
            My Workspace
          </p>
          <h1
            id="welcome-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Welcome, {displayName}!
          </h1>
          <p className="text-base" style={{ color: 'var(--color-charcoal-soft)' }}>
            Your LOOP account is active and connected to Supabase.
          </p>
        </section>

        {/* Minimal Account Card */}
        <section
          aria-label="Account status"
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-black/5"
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>
            Account Details
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
              <dt className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-charcoal-soft)' }}>
                Email
              </dt>
              <dd className="font-semibold break-all" style={{ color: 'var(--color-charcoal)' }}>
                {user.email}
              </dd>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
              <dt className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-charcoal-soft)' }}>
                Display Name
              </dt>
              <dd className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                {displayName}
              </dd>
            </div>

            {memberSince && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
                <dt className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-charcoal-soft)' }}>
                  Member Since
                </dt>
                <dd className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                  {memberSince}
                </dd>
              </div>
            )}

            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
              <dt className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-charcoal-soft)' }}>
                Status
              </dt>
              <dd className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-sage)' }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--color-sage)' }} />
                Authenticated
              </dd>
            </div>
          </dl>

          <div className="mt-6 pt-6 border-t border-black/5 text-sm" style={{ color: 'var(--color-charcoal-soft)' }}>
            <p>
              Project patterns, guided steps, and video learning will be added in upcoming milestones.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
