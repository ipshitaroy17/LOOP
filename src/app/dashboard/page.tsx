import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import Link from 'next/link';
import Logo from '@/components/Logo';
import PillButton from '@/components/ui/PillButton';
import type { OnboardingPreferences, MultipleAnswer, SingleAnswer } from '@/lib/onboarding/types';
import SuggestedProjects from '@/components/catalogue/SuggestedProjects';
import { getPublishedProjects } from '@/lib/catalogue/queries';
import { getUserSavedProjectIds } from '@/lib/catalogue/saved-projects';

// Allow blocking route for runtime cookies authentication
export const instant = false;

export default async function DashboardPage() {
  // connection() signals to Next.js 16 that this route renders at request time,
  // preventing prerender errors from Supabase auth's internal Date.now() token checks
  // and Date formatting.
  await connection();

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

  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Extract saved preferences for the summary card
  const preferences = (profile?.onboarding_preferences as unknown as OnboardingPreferences) || null;
  const answers = preferences?.answers || {};

  // Fetch published catalogue projects for discovery suggestions
  // and user's saved project IDs to accurately reflect saved state
  const [catalogueResult, savedProjectIdsSet] = await Promise.all([
    getPublishedProjects({}, 20),
    getUserSavedProjectIds(),
  ]);
  const savedProjectIds = Array.from(savedProjectIdsSet);

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
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      {/* ── Dashboard Navigation Bar ────────────────────────────────────────── */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-ink/5 bg-cream">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/"
            className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-lg"
            aria-label="loop Home"
          >
            <Logo size="md" />
          </Link>
        </div>

        <nav aria-label="Dashboard navigation" className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/my-projects"
            className="text-sm font-semibold text-ink/75 hover:text-ink transition-colors px-2 py-1"
          >
            My projects
          </Link>
          <Link
            href="/explore"
            className="text-sm font-semibold text-ink/75 hover:text-ink transition-colors px-2 py-1"
          >
            Explore
          </Link>

          {/* Round avatar with first letter of display name */}
          <div
            className="w-9 h-9 rounded-full bg-blush-light text-ink border border-ink/10 flex items-center justify-center font-bold text-sm select-none shadow-xs"
            aria-label={`User avatar for ${displayName}`}
            title={displayName}
          >
            {avatarInitial}
          </div>

          {/* Logout Form: outline pill button */}
          <form action="/auth/signout" method="POST" className="inline-flex">
            <PillButton
              variant="outline"
              size="sm"
              type="submit"
            >
              Log out
            </PillButton>
          </form>
        </nav>
      </header>

      {/* ── Main Dashboard Content ──────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-14">
        {/* Butter Welcome Banner */}
        <section
          aria-labelledby="welcome-heading"
          className="w-full bg-butter rounded-[28px] p-8 sm:p-10 mb-10 shadow-[0_4px_24px_rgba(46,42,54,0.06)] border border-ink/5"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
            MY WORKSPACE
          </p>
          <h1
            id="welcome-heading"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight mb-2"
          >
            Welcome, {displayName}!
          </h1>
          <p className="font-body text-ink/80 text-sm sm:text-base">
            Your learning profile is saved. Pick up where you left off.
          </p>
        </section>

        {/* Suggested for You with Personalised chip */}
        <SuggestedProjects
          allProjects={catalogueResult.projects}
          preferences={preferences}
          experienceLevel={profile?.experience_level}
          savedProjectIds={savedProjectIds}
        />

        {/* Your Learning Preferences Card */}
        <section
          aria-labelledby="preferences-heading"
          className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(46,42,54,0.06)] border border-ink/5 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2
              id="preferences-heading"
              className="font-display font-bold text-xl sm:text-2xl text-ink"
            >
              Your learning preferences
            </h2>

            <Link
              href="/onboarding?edit=true"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold border border-ink/30 text-ink hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink self-start sm:self-auto cursor-pointer"
            >
              Edit preferences
            </Link>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tile 1: Skill Level */}
            <div className="bg-sage-light rounded-[20px] p-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-sage-dark mb-1.5">
                SKILL LEVEL
              </dt>
              <dd className="font-body font-bold text-base sm:text-lg text-ink">
                {experienceLabel}
              </dd>
            </div>

            {/* Tile 2: Learning Style */}
            <div className="bg-blush-light rounded-[20px] p-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                LEARNING STYLE
              </dt>
              <dd className="font-body font-bold text-base sm:text-lg text-ink">
                {learningModeLabel}
              </dd>
            </div>

            {/* Tile 3: Interested in Making */}
            <div className="bg-lilac-light rounded-[20px] p-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                INTERESTED IN MAKING
              </dt>
              <dd className="font-body font-bold text-base sm:text-lg text-ink">
                {interestsLabel}
              </dd>
            </div>
          </dl>
        </section>

        {/* Account Details Card */}
        <section
          aria-labelledby="account-details-heading"
          className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(46,42,54,0.06)] border border-ink/5 mb-10"
        >
          <h2
            id="account-details-heading"
            className="font-display font-bold text-xl sm:text-2xl text-ink mb-6"
          >
            Account details
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Display Name Tile */}
            <div className="bg-cream/60 rounded-[20px] p-5 border border-ink/5">
              <dt className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                DISPLAY NAME
              </dt>
              <dd className="font-body font-bold text-base text-ink">
                {displayName}
              </dd>
            </div>

            {/* Member Since Tile */}
            <div className="bg-cream/60 rounded-[20px] p-5 border border-ink/5">
              <dt className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                MEMBER SINCE
              </dt>
              <dd className="font-body font-bold text-base text-ink">
                {memberSince || 'November 2026'}
              </dd>
            </div>

            {/* Status Tile */}
            <div className="bg-cream/60 rounded-[20px] p-5 border border-ink/5">
              <dt className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                STATUS
              </dt>
              <dd className="font-body font-bold text-base text-ink">
                {profile?.onboarding_completed ? 'Onboarding completed' : 'In progress'}
              </dd>
            </div>
          </dl>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="w-full px-6 py-8 border-t border-ink/5 text-center text-xs text-ink/60 font-body bg-cream">
        <p>
          loop Project Catalogue &bull; Starter previews. Step-by-step video and written lessons are in development.
        </p>
      </footer>
    </div>
  );
}
