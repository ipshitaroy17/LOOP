'use client';

import Link from 'next/link';
import ProjectCard from './ProjectCard';
import type { Project } from '@/lib/catalogue/types';

interface ProjectGridProps {
  projects: Project[];
  error?: string | null;
  hasActiveFilters?: boolean;
}

export default function ProjectGrid({
  projects,
  error,
  hasActiveFilters = false,
}: ProjectGridProps) {
  // 1. Error state with retry
  if (error) {
    return (
      <div
        role="alert"
        className="w-full bg-white rounded-2xl p-8 sm:p-12 text-center border border-red-200 shadow-sm"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Catalogue</h3>
        <p className="text-sm text-red-700 max-w-md mx-auto mb-6 leading-relaxed">
          {error}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:brightness-105"
          style={{
            backgroundColor: 'var(--color-sage)',
            color: '#1F1F1F',
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  // 2. Empty states
  if (projects.length === 0) {
    // 2a. Filter/search returned no results
    if (hasActiveFilters) {
      return (
        <div className="w-full bg-white rounded-2xl p-8 sm:p-12 text-center border border-black/5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: 'var(--color-charcoal)' }}
          >
            No matching projects found
          </h3>
          <p
            className="text-sm max-w-md mx-auto mb-6 leading-relaxed"
            style={{ color: 'var(--color-charcoal-soft)' }}
          >
            We couldn&apos;t find any crochet projects matching your current search or filter combination.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold border border-black/15 transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Clear all filters
          </Link>
        </div>
      );
    }

    // 2b. Genuine empty catalogue (0 published rows in database)
    return (
      <div className="w-full bg-white rounded-2xl p-8 sm:p-12 text-center border border-black/5 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-gray-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: 'var(--color-charcoal)' }}
        >
          No projects published yet
        </h3>
        <p
          className="text-sm max-w-md mx-auto leading-relaxed"
          style={{ color: 'var(--color-charcoal-soft)' }}
        >
          The LOOP crochet project catalogue is currently getting ready. Starter projects will appear here once published.
        </p>
      </div>
    );
  }

  // 3. Grid of project cards
  return (
    <div
      role="region"
      aria-label="Crochet projects catalogue"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project, idx) => (
        <ProjectCard key={project.id} project={project} priority={idx < 3} />
      ))}
    </div>
  );
}
