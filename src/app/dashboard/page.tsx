import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import Link from 'next/link';
import type { OnboardingPreferences, MultipleAnswer, SingleAnswer } from '@/lib/onboarding/types';

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
    redirect('/login?redirect=/dashboard');
  }

  // Fetch the user's profile under their authenticated RLS policy
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // If user has not completed onboarding, redirect to onboarding flow
  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  const displayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Crochet Learner';

  // connection() tells Next.js 16 this value is intentionally request-time,
  // preventing the "unstable Date.now()" prerender error.
  await connection();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Extract saved preferences for the summary card
  const preferences = (profile?.onboarding_preferences as unknown as OnboardingPreferences) || null;
  const answers = preferences?.answers || {};

  // 1. Experience Level
  let experienceLabel = 'Not specified';
  if (profile?.experience_level === 'beginner') experienceLabel = 'Complete beginner';
  else if (profile?.experience_level === 'intermediate') experienceLabel = 'Intermediate';
  else if (profile?.experience_level === 'advanced') experienceLabel = 'Experienced';
  else if (answers.experience_level && !('skipped' in answers.experience_level)) {
    experienceLabel = (answers.experience_level as SingleAnswer).label;
  }

  // 2. Interests
  let interestsLabel = 'Not specified';
  if (answers.interests) {
    if ('skipped' in answers.interests) {
      interestsLabel = 'Skipped for now';
    } else {
      const multi = answers.interests as MultipleAnswer;
      interestsLabel = multi.labels && multi.labels.length > 0 ? multi.labels.join(', ') : 'None selected';
    }
  }

  // 3. Preferred Learning Mode
  let learningModeLabel = 'Not specified';
  if (answers.learning_style) {
    if ('skipped' in answers.learning_style) {
      learningModeLabel = 'Skipped for now';
    } else {
      learningModeLabel = (answers.learning_style as SingleAnswer).label || 'Not specified';
    }
  }

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
            Your learning profile is set up and saved to Supabase.
          </p>
        </section>

        {/* Learning Preferences Summary Card */}
        <section
          aria-labelledby="preferences-heading"
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-black/5 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-black/5">
            <div>
              <h2 id="preferences-heading" className="text-lg font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                Your Learning Preferences
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Saved preferences guide your future crochet recommendations.
              </p>
            </div>
            <Link
              href="/onboarding?edit=true"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold border border-black/10 transition-colors hover:bg-black/5 self-start sm:self-auto"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Edit learning preferences
            </Link>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
              <dt className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-charcoal-soft)' }}>
                Skill Level
              </dt>
              <dd className="font-semibold text-base" style={{ color: 'var(--color-charcoal)' }}>
                {experienceLabel}
              </dd>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
              <dt className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-charcoal-soft)' }}>
                Preferred Learning Style
              </dt>
              <dd className="font-semibold text-base" style={{ color: 'var(--color-charcoal)' }}>
                {learningModeLabel}
              </dd>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-cream)' }}>
              <dt className="font-medium text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-charcoal-soft)' }}>
                Interested in Making
              </dt>
              <dd className="font-semibold text-base" style={{ color: 'var(--color-charcoal)' }}>
                {interestsLabel}
              </dd>
            </div>
          </dl>
        </section>

        {/* Account Details Card */}
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
                Onboarding Completed
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
