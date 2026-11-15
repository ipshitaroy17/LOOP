import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import AuthNav from '@/components/AuthNav';
import Logo from '@/components/Logo';
import ExploreFilters from '@/components/catalogue/ExploreFilters';
import ProjectGrid from '@/components/catalogue/ProjectGrid';
import Pagination from '@/components/catalogue/Pagination';
import { getPublishedProjects } from '@/lib/catalogue/queries';
import { sanitizeCategoryFilter, sanitizeDifficultyFilter } from '@/lib/catalogue/categories';
import { getUserSavedProjectIds } from '@/lib/catalogue/saved-projects';

// Allow blocking route for request-time searchParams in Next.js 16
export const instant = false;

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function NavFallback() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="text-sm font-semibold rounded-full px-4 py-2 border border-ink/15 text-ink hover:bg-black/5 transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="text-sm font-semibold rounded-full px-5 py-2 bg-sage hover:bg-sage-dark text-ink hover:text-white transition-colors"
      >
        Sign up
      </Link>
    </div>
  );
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  await connection();
  const resolvedParams = await searchParams;

  const rawSearch = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const rawCategory = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const rawDifficulty = typeof resolvedParams.difficulty === 'string' ? resolvedParams.difficulty : undefined;
  const rawPage = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const category = sanitizeCategoryFilter(rawCategory);
  const difficulty = sanitizeDifficultyFilter(rawDifficulty);

  const hasActiveFilters = Boolean(
    (rawSearch && rawSearch.trim().length > 0) ||
    category ||
    difficulty
  );

  // Construct search query string for card links so Back navigation preserves filters
  const currentParams = new URLSearchParams();
  if (rawSearch && rawSearch.trim()) currentParams.set('q', rawSearch.trim());
  if (category) currentParams.set('category', category);
  if (difficulty) currentParams.set('difficulty', difficulty);
  if (page > 1) currentParams.set('page', page.toString());
  const searchQueryString = currentParams.toString();

  const [queryResult, savedProjectIdsSet] = await Promise.all([
    getPublishedProjects({
      search: rawSearch,
      category,
      difficulty,
      page,
      pageSize: 12,
    }),
    getUserSavedProjectIds(),
  ]);

  const savedProjectIds = Array.from(savedProjectIdsSet);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-ink/5 bg-cream">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/"
            className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-lg"
            aria-label="loop Home"
          >
            <Logo size="md" />
          </Link>

          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/explore"
              className="px-4 py-1.5 rounded-full bg-sage-light text-sage-dark"
              aria-current="page"
            >
              Explore
            </Link>
            <Link
              href="/#how-it-works"
              className="px-4 py-1.5 rounded-full text-ink/75 hover:bg-ink/5 transition-colors"
            >
              How loop works
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Suspense fallback={<NavFallback />}>
            <AuthNav />
          </Suspense>
        </div>
      </header>

      {/* ── Main Explore Content ──────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-14">
        {/* Page Title & Context Header */}
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-sage-dark mb-2">
            Project Catalogue
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-tight leading-[1.08] text-ink mb-4">
            Explore crochet projects
          </h1>
          <p className="font-body text-ink/75 text-base sm:text-lg leading-relaxed">
            Discover starter projects, practice swatches, and mindful crochet motifs. Filter by skill level or category to preview your next make.
          </p>
        </div>

        {/* Filter Controls (Single rounded card holding search, category, and difficulty) */}
        <Suspense fallback={<div className="h-28 bg-white rounded-[28px] animate-pulse mb-10 border border-ink/5" />}>
          <ExploreFilters totalCount={queryResult.totalCount} />
        </Suspense>

        {/* Project Grid / Empty / Error State */}
        <ProjectGrid
          projects={queryResult.projects}
          error={queryResult.error}
          hasActiveFilters={hasActiveFilters}
          savedProjectIds={savedProjectIds}
          searchQueryString={searchQueryString}
        />

        {/* Database-backed Pagination */}
        <Pagination
          currentPage={queryResult.page}
          totalPages={queryResult.totalPages}
          totalCount={queryResult.totalCount}
          pageSize={queryResult.pageSize}
        />
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
