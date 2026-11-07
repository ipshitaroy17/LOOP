import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSavedProjects } from '@/lib/catalogue/saved-projects';
import ProjectCard from '@/components/catalogue/ProjectCard';

// Allow blocking route for runtime cookies authentication
export const instant = false;

export default async function MyProjectsPage() {
  await connection();
  const supabase = await createClient();

  // Validate server-side authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect('/login?redirect=/my-projects');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  // If user hasn't completed onboarding, redirect to onboarding flow
  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  const { savedProjects, error } = await getUserSavedProjects();
  const savedProjectIds = savedProjects.map((sp) => sp.project.id);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header
        className="w-full px-6 py-5 flex items-center justify-between border-b border-black/5"
        style={{ backgroundColor: 'var(--color-cream)' }}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-charcoal)' }}
            aria-label="LOOP Home"
          >
            LOOP
          </Link>

          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-2 sm:gap-3 text-sm font-medium">
            <Link
              href="/explore"
              className="px-3 py-1.5 rounded-full transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              Explore
            </Link>
            <Link
              href="/my-projects"
              className="px-3.5 py-1.5 rounded-full font-semibold shadow-xs"
              style={{
                backgroundColor: 'rgba(124, 154, 107, 0.15)',
                color: 'var(--color-sage)',
              }}
              aria-current="page"
            >
              My Projects
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-full transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <nav aria-label="Account navigation" className="flex items-center gap-3">
          <span
            className="text-sm font-medium hidden md:inline"
            style={{ color: 'var(--color-charcoal-soft)' }}
          >
            {user.email}
          </span>

          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-xs sm:text-sm font-medium px-4 py-2 rounded-full border border-black/10 transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Log out
            </button>
          </form>
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-14">
        {/* Page Context Header */}
        <div className="mb-8 max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--color-sage)' }}
          >
            My Workspace
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{ color: 'var(--color-charcoal)' }}
          >
            My Saved Projects
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-charcoal-soft)' }}>
            Crochet projects you have saved to practice stitches, follow tutorials, or make next.
          </p>
        </div>

        {/* ── Error State ─────────────────────────────────────────────── */}
        {error ? (
          <div
            role="alert"
            className="w-full bg-white rounded-2xl p-8 sm:p-12 text-center border border-red-200 shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-red-900 mb-2">Could Not Load Saved Projects</h2>
            <p className="text-sm text-red-700 max-w-md mx-auto mb-6 leading-relaxed">
              {error}
            </p>
            <form action="/my-projects">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:brightness-105"
                style={{
                  backgroundColor: 'var(--color-sage)',
                  color: '#1F1F1F',
                }}
              >
                Try again
              </button>
            </form>
          </div>
        ) : savedProjects.length === 0 ? (
          /* ── Empty State: “No saved projects yet” with an Explore Projects link ── */
          <div className="w-full bg-white rounded-2xl p-8 sm:p-14 text-center border border-black/5 shadow-sm max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F0] text-gray-500 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                />
              </svg>
            </div>
            <h2
              className="text-xl font-bold mb-2 tracking-tight"
              style={{ color: 'var(--color-charcoal)' }}
            >
              No saved projects yet
            </h2>
            <p
              className="text-sm max-w-md mx-auto mb-7 leading-relaxed"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              When browsing the catalogue, click the bookmark icon on any project to save it here for easy reference.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition-all hover:brightness-105"
              style={{
                backgroundColor: 'var(--color-sage)',
                color: '#1F1F1F',
              }}
            >
              <span>Explore projects</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        ) : (
          /* ── Saved Projects Grid ─────────────────────────────────────── */
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-black/5 text-xs">
              <span
                className="font-medium"
                style={{ color: 'var(--color-charcoal-soft)' }}
                aria-live="polite"
              >
                Showing <strong className="text-[#2D2D2D]">{savedProjects.length}</strong>{' '}
                {savedProjects.length === 1 ? 'saved project' : 'saved projects'}
              </span>

              <Link
                href="/explore"
                className="font-semibold transition-colors hover:underline"
                style={{ color: 'var(--color-sage)' }}
              >
                Browse more projects &rarr;
              </Link>
            </div>

            <div
              role="region"
              aria-label="My saved crochet projects"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {savedProjects.map((item, idx) => (
                <div key={item.userProjectId} className="flex flex-col">
                  <ProjectCard
                    project={item.project}
                    priority={idx < 3}
                    initialIsSaved={savedProjectIds.includes(item.project.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="w-full px-6 py-8 border-t border-black/5 text-center text-xs"
        style={{
          backgroundColor: 'var(--color-cream)',
          color: 'var(--color-charcoal-soft)',
        }}
      >
        <p>
          LOOP &bull; Your personal crochet learning space.
        </p>
      </footer>
    </div>
  );
}

