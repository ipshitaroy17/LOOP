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
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-black/5 mb-8">
      {/* Search Bar Form */}
      <form onSubmit={handleSearchSubmit} className="mb-5">
        <label
          htmlFor="catalogue-search"
          className="block text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: 'var(--color-charcoal-soft)' }}
        >
          Search Projects
        </label>
        <div className="relative flex items-center">
          <input
            id="catalogue-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, technique, or description..."
            className="w-full px-4 py-3 pl-11 pr-24 rounded-xl border text-sm transition-colors focus:ring-2 focus:ring-[#7C9A6B] focus:outline-none"
            style={{
              borderColor: '#D1D5DB',
              backgroundColor: '#FAF7F0',
              color: 'var(--color-charcoal)',
            }}
          />
          {/* Search Icon */}
          <div className="absolute left-3.5 text-gray-400 pointer-events-none" aria-hidden="true">
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
                className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700 font-medium rounded-md"
                aria-label="Clear search input"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-105 disabled:opacity-60"
              style={{
                backgroundColor: 'var(--color-sage)',
                color: '#1F1F1F',
              }}
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Filter Dropdowns / Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-black/5">
        {/* Category Filter */}
        <div>
          <label
            htmlFor="category-select"
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--color-charcoal-soft)' }}
          >
            Category
          </label>
          <select
            id="category-select"
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:ring-2 focus:ring-[#7C9A6B] focus:outline-none cursor-pointer"
            style={{
              borderColor: '#D1D5DB',
              backgroundColor: '#FAF7F0',
              color: 'var(--color-charcoal)',
            }}
          >
            {CATALOGUE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label
            htmlFor="difficulty-select"
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--color-charcoal-soft)' }}
          >
            Difficulty
          </label>
          <select
            id="difficulty-select"
            value={currentDifficulty}
            onChange={(e) => updateFilters({ difficulty: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:ring-2 focus:ring-[#7C9A6B] focus:outline-none cursor-pointer"
            style={{
              borderColor: '#D1D5DB',
              backgroundColor: '#FAF7F0',
              color: 'var(--color-charcoal)',
            }}
          >
            {CATALOGUE_DIFFICULTIES.map((diff) => (
              <option key={diff.id} value={diff.id}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status / Active Filter Actions */}
        <div className="flex flex-col justify-end">
          <div className="flex items-center justify-between sm:justify-end gap-3 h-10">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-red-700 hover:text-red-900 underline underline-offset-2 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result Count Status Bar */}
      <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
        <span
          className="font-medium"
          style={{ color: 'var(--color-charcoal-soft)' }}
          aria-live="polite"
        >
          {isPending ? (
            'Updating projects...'
          ) : (
            <>
              Showing <span className="font-bold text-[#2D2D2D]">{totalCount}</span>{' '}
              {totalCount === 1 ? 'project' : 'projects'}
              {hasActiveFilters && ' matching your filters'}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
