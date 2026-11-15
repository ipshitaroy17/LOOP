'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) {
    return null;
  }

  const navigateToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    startTransition(() => {
      router.push(`/explore?${params.toString()}`);
    });
  };

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  return (
    <nav
      aria-label="Catalogue pagination"
      className="w-full mt-12 pt-8 border-t border-ink/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body"
    >
      <p className="text-ink/75">
        Showing <span className="font-semibold text-ink">{startIdx}</span> to{' '}
        <span className="font-semibold text-ink">{endIdx}</span> of{' '}
        <span className="font-semibold text-ink">{totalCount}</span> projects
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage <= 1 || isPending}
          className="px-4 py-2 rounded-full font-semibold border border-ink/15 text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
          aria-label="Previous page"
        >
          &larr; Previous
        </button>

        <span className="px-3 py-2 font-medium text-ink/70">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= totalPages || isPending}
          className="px-4 py-2 rounded-full font-semibold border border-ink/15 text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
          aria-label="Next page"
        >
          Next &rarr;
        </button>
      </div>
    </nav>
  );
}
