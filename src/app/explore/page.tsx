import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import AuthNav from '@/components/AuthNav';
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

          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/explore"
              className="px-3 py-1.5 rounded-full font-semibold"
              style={{
                backgroundColor: 'rgba(124, 154, 107, 0.15)',
                color: 'var(--color-sage)',
              }}
              aria-current="page"
            >
              Explore
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-full transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              How it works
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
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--color-sage)' }}
          >
            Project Catalogue
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Explore Crochet Projects
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-charcoal-soft)' }}>
            Discover starter projects, practice swatches, and mindful crochet motifs. Filter by skill level or category to preview your next make.
          </p>
        </div>

        {/* Filter Controls (Client component connected to URL search params) */}
        <Suspense fallback={<div className="h-32 bg-white rounded-2xl animate-pulse mb-8" />}>
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
      <footer
        className="w-full px-6 py-8 border-t border-black/5 text-center text-xs"
        style={{
          backgroundColor: 'var(--color-cream)',
          color: 'var(--color-charcoal-soft)',
        }}
      >
        <p>
          LOOP Project Catalogue &bull; Starter previews. Step-by-step video and written lessons are in development.
        </p>
      </footer>
    </div>
  );
}

