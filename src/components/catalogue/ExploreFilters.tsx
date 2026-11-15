'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CATALOGUE_CATEGORIES, CATALOGUE_DIFFICULTIES } from '@/lib/catalogue/categories';

interface ExploreFiltersProps {
  totalCount: number;
}

export default function ExploreFilters({ totalCount }: ExploreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentDifficulty = searchParams.get('difficulty') || 'all';

  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync local search input if URL changes (e.g. browser Back/Forward)
  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  const hasActiveFilters = Boolean(
    currentSearch ||
    (currentCategory && currentCategory !== 'all') ||
    (currentDifficulty && currentDifficulty !== 'all')
  );

  const updateFilters = (newParams: { q?: string; category?: string; difficulty?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 whenever any filter or search term changes
    params.delete('page');

    if (newParams.q !== undefined) {
      if (newParams.q.trim()) {
        params.set('q', newParams.q.trim());
      } else {
        params.delete('q');
      }
    }

    if (newParams.category !== undefined) {
      if (newParams.category && newParams.category !== 'all') {
        params.set('category', newParams.category);
      } else {
        params.delete('category');
      }
    }

    if (newParams.difficulty !== undefined) {
      if (newParams.difficulty && newParams.difficulty !== 'all') {
        params.set('difficulty', newParams.difficulty);
      } else {
        params.delete('difficulty');
      }
    }

    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `/explore?${queryString}` : '/explore');
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateFilters({ q: searchInput });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ q: '' });
  };

  const handleClearAll = () => {
    setSearchInput('');
    startTransition(() => {
      router.push('/explore');
    });
  };

  return (
    <div className="w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(46,42,54,0.06)] border border-ink/5 mb-10">
      {/* Filter Row: Search box, Category select, Difficulty select in a single row on desktop */}
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Input */}
          <div className="md:col-span-5">
            <label
              htmlFor="catalogue-search"
              className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-2"
            >
              Search projects
            </label>
            <div className="relative flex items-center">
              <input
                id="catalogue-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, technique, or description..."
                className="w-full px-4 py-2.5 pl-10 pr-20 rounded-full border border-ink/15 bg-cream/40 text-ink text-sm transition-all focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              />
              {/* Search Icon */}
              <div className="absolute left-3.5 text-ink/40 pointer-events-none" aria-hidden="true">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="absolute right-2 flex items-center gap-1.5">
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-2 py-1 text-xs text-ink/50 hover:text-ink font-medium rounded-md cursor-pointer"
                    aria-label="Clear search input"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-sage text-ink hover:bg-sage-dark hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-60 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Category Select */}
          <div className="md:col-span-3">
            <label
              htmlFor="category-select"
              className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-2"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={currentCategory}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-full border border-ink/15 bg-cream/40 text-ink text-sm transition-all focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer appearance-none pr-9"
              >
                {CATALOGUE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-ink/50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Difficulty Select */}
          <div className="md:col-span-4">
            <label
              htmlFor="difficulty-select"
              className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-2"
            >
              Difficulty
            </label>
            <div className="relative">
              <select
                id="difficulty-select"
                value={currentDifficulty}
                onChange={(e) => updateFilters({ difficulty: e.target.value })}
                className="w-full px-4 py-2.5 rounded-full border border-ink/15 bg-cream/40 text-ink text-sm transition-all focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer appearance-none pr-9"
              >
                {CATALOGUE_DIFFICULTIES.map((diff) => (
                  <option key={diff.id} value={diff.id}>
                    {diff.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-ink/50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Showing N projects status line */}
      <div className="mt-6 pt-4 border-t border-ink/5 flex items-center justify-between text-sm">
        <span
          className="font-body text-ink/75"
          aria-live="polite"
        >
          {isPending ? (
            'Updating projects...'
          ) : (
            <>
              Showing <span className="font-bold text-ink">{totalCount}</span>{' '}
              {totalCount === 1 ? 'project' : 'projects'}
              {hasActiveFilters && ' matching your filters'}
            </>
          )}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-sage-dark hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
