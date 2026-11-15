'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export interface TutorialViewSwitcherProps {
  activeView: 'video' | 'written' | 'guided';
  videoHref: string;
  writtenHref: string;
  guidedHref: string;
  hasVideo?: boolean;
  hasSteps?: boolean;
  stepsCount?: number;
  className?: string;
}

export default function TutorialViewSwitcher({
  activeView,
  videoHref,
  writtenHref,
  guidedHref,
  className = '',
}: TutorialViewSwitcherProps) {
  const searchParams = useSearchParams();
  const step = searchParams?.get('step');

  const isVideo = activeView === 'video';
  const isWritten = activeView === 'written';
  const isGuided = activeView === 'guided';

  // Preserve ?step= when switching into guided mode if already present
  const effectiveGuidedHref =
    step && !guidedHref.includes('step=')
      ? `${guidedHref}${guidedHref.includes('?') ? '&' : '?'}step=${step}`
      : guidedHref;

  // Preserve ?step= when switching to other modes so back navigation keeps the step
  const effectiveVideoHref =
    step && !videoHref.includes('step=')
      ? `${videoHref}${videoHref.includes('?') ? '&' : '?'}step=${step}`
      : videoHref;

  const effectiveWrittenHref =
    step && !writtenHref.includes('step=')
      ? `${writtenHref}${writtenHref.includes('?') ? '&' : '?'}step=${step}`
      : writtenHref;

  return (
    <div
      role="tablist"
      aria-label="Tutorial learning modes"
      className={`inline-flex items-center p-1 rounded-full bg-white border border-ink/10 shadow-xs gap-1 ${className}`}
    >
      {/* Video Mode Tab */}
      <Link
        href={effectiveVideoHref}
        role="tab"
        id="tab-video"
        aria-controls="panel-video"
        aria-selected={isVideo}
        tabIndex={isVideo ? 0 : -1}
        scroll={false}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
          isVideo
            ? 'bg-sage text-ink shadow-xs'
            : 'text-ink/75 hover:text-ink hover:bg-cream/60'
        }`}
      >
        Video
      </Link>

      {/* Guided Steps Mode Tab */}
      <Link
        href={effectiveGuidedHref}
        role="tab"
        id="tab-guided"
        aria-controls="panel-guided"
        aria-selected={isGuided}
        tabIndex={isGuided ? 0 : -1}
        scroll={false}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
          isGuided
            ? 'bg-sage text-ink shadow-xs'
            : 'text-ink/75 hover:text-ink hover:bg-cream/60'
        }`}
      >
        Guided
      </Link>

      {/* Written Instructions Mode Tab */}
      <Link
        href={effectiveWrittenHref}
        role="tab"
        id="tab-written"
        aria-controls="panel-written"
        aria-selected={isWritten}
        tabIndex={isWritten ? 0 : -1}
        scroll={false}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
          isWritten
            ? 'bg-sage text-ink shadow-xs'
            : 'text-ink/75 hover:text-ink hover:bg-cream/60'
        }`}
      >
        Written
      </Link>
    </div>
  );
}
