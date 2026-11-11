import Link from 'next/link';

export interface TutorialViewSwitcherProps {
  activeView: 'video' | 'written';
  videoHref: string;
  writtenHref: string;
  hasVideo?: boolean;
  hasSteps?: boolean;
  stepsCount?: number;
  className?: string;
}

export default function TutorialViewSwitcher({
  activeView,
  videoHref,
  writtenHref,
  hasVideo = true,
  hasSteps = false,
  stepsCount = 0,
  className = '',
}: TutorialViewSwitcherProps) {
  const isVideo = activeView === 'video';
  const isWritten = activeView === 'written';

  return (
    <div
      role="tablist"
      aria-label="Tutorial learning modes"
      className={`inline-flex items-center p-1.5 rounded-2xl border border-black/5 ${className}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
    >
      {/* Video Mode Tab */}
      <Link
        href={videoHref}
        role="tab"
        id="tab-video"
        aria-controls="panel-video"
        aria-selected={isVideo}
        tabIndex={isVideo ? 0 : -1}
        scroll={false}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] ${
          isVideo
            ? 'bg-white text-[#2D2D2D] shadow-sm'
            : 'text-[#4A4A4A] hover:text-black hover:bg-white/60'
        }`}
      >
        <svg
          className={`w-4 h-4 ${isVideo ? 'text-red-600' : 'text-gray-500'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Video Lesson</span>
        {!hasVideo && (
          <span className="hidden sm:inline text-[10px] font-normal text-gray-500">(External)</span>
        )}
      </Link>

      {/* Written Instructions Mode Tab */}
      <Link
        href={writtenHref}
        role="tab"
        id="tab-written"
        aria-controls="panel-written"
        aria-selected={isWritten}
        tabIndex={isWritten ? 0 : -1}
        scroll={false}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] ${
          isWritten
            ? 'bg-white text-[#2D2D2D] shadow-sm'
            : 'text-[#4A4A4A] hover:text-black hover:bg-white/60'
        }`}
      >
        <svg
          className={`w-4 h-4 ${isWritten ? 'text-[#5E7A50]' : 'text-gray-500'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>Written Instructions</span>
        {hasSteps && stepsCount > 0 ? (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: 'rgba(124, 154, 107, 0.15)',
              color: 'var(--color-sage-dark)',
            }}
          >
            {stepsCount} {stepsCount === 1 ? 'step' : 'steps'}
          </span>
        ) : (
          <span className="hidden sm:inline text-[10px] font-normal text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        )}
      </Link>
    </div>
  );
}

