'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleSaveProjectAction } from '@/app/projects/actions';

interface SaveButtonProps {
  projectId: string;
  initialIsSaved?: boolean;
  variant?: 'card' | 'detail';
  projectTitle?: string;
  onToggle?: (isSaved: boolean) => void;
}

export default function SaveButton({
  projectId,
  initialIsSaved = false,
  variant = 'card',
  projectTitle,
  onToggle,
}: SaveButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if initialIsSaved prop changes
  const [prevInitial, setPrevInitial] = useState(initialIsSaved);
  if (prevInitial !== initialIsSaved) {
    setPrevInitial(initialIsSaved);
    setIsSaved(initialIsSaved);
  }

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // CRITICAL: Stop event from bubbling to parent <Link> or card containers
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;
    setErrorMessage(null);

    const nextSavedState = !isSaved;
    // Optimistic UI update
    setIsSaved(nextSavedState);

    startTransition(async () => {
      const result = await toggleSaveProjectAction(projectId, isSaved);

      if (result.requiresAuth) {
        // Rollback optimistic state
        setIsSaved(isSaved);
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (!result.success) {
        // Rollback on failure
        setIsSaved(isSaved);
        setErrorMessage(result.error || 'Failed to update saved status.');
      } else {
        const confirmedSaved = result.isSaved ?? nextSavedState;
        setIsSaved(confirmedSaved);
        if (onToggle) {
          onToggle(confirmedSaved);
        }
      }
    });
  };

  const bookmarkIcon = (
    <svg
      className={variant === 'card' ? 'w-4 h-4' : 'w-4 h-4'}
      viewBox="0 0 24 24"
      fill={isSaved ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={isSaved ? '1.5' : '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );

  const accessibleLabel = isSaved
    ? `Remove ${projectTitle || 'project'} from saved projects`
    : `Save ${projectTitle || 'project'} to My Projects`;

  if (variant === 'detail') {
    return (
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={accessibleLabel}
          aria-pressed={isSaved}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer ${
            isSaved
              ? 'bg-[#E8F3E5] text-[#2C5A24] border border-[#7C9A6B]/30 hover:bg-[#DDECD9]'
              : 'bg-white text-[#2D2D2D] border border-black/10 hover:bg-black/5'
          }`}
        >
          {bookmarkIcon}
          <span>{isPending ? 'Updating...' : isSaved ? 'Saved to My Projects' : 'Save project'}</span>
        </button>
        {errorMessage && (
          <p className="text-xs text-red-600 font-medium mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  // Card variant: compact, unobtrusive floating button
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={accessibleLabel}
        aria-pressed={isSaved}
        title={isSaved ? 'Saved to My Projects' : 'Save to My Projects'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer ${
          isSaved
            ? 'bg-[#E8F3E5]/95 text-[#2C5A24] border border-[#7C9A6B]/40 hover:bg-[#DDECD9]'
            : 'bg-white/95 text-[#2D2D2D] border border-black/10 hover:bg-white hover:text-black'
        }`}
      >
        {bookmarkIcon}
        <span className="hidden xs:inline sm:inline text-[11px] font-semibold">
          {isPending ? '...' : isSaved ? 'Saved' : 'Save'}
        </span>
      </button>

      {errorMessage && (
        <span
          role="alert"
          className="absolute top-full left-0 mt-1 whitespace-nowrap z-30 px-2 py-1 bg-red-800 text-white text-[10px] rounded shadow-md"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}

