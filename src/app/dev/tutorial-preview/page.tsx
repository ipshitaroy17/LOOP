import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buildWatchUrl } from '@/lib/youtube/parseVideoId';

/**
 * DEV-ONLY: Index page listing all four draft video candidates.
 * Hard-gated: returns 404 in production.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

const PREVIEW_CANDIDATES = [
  {
    videoId: 'GALGQdP_POw',
    projectSlug: 'classic-granny-square',
    projectTitle: 'Classic Granny Square',
    tutorialKey: 'bella-coco-video',
    creatorName: 'Bella Coco',
    oEmbedTitle: 'CROCHET: How to Crochet a Granny Square | Absolute Beginners | Bella Coco',
  },
  {
    videoId: 'RwnArj7HdXo',
    projectSlug: 'classic-granny-square',
    projectTitle: 'Classic Granny Square',
    tutorialKey: 'hooked-by-robin-granny-video',
    creatorName: 'Hooked by Robin',
    oEmbedTitle: 'How to Crochet a Granny Square for ABSOLUTE BEGINNERS',
  },
  {
    videoId: 'AXJpyGLFleM',
    projectSlug: 'solid-granny-square',
    projectTitle: 'Solid Granny Square',
    tutorialKey: 'hooked-by-robin-video',
    creatorName: 'Hooked by Robin',
    oEmbedTitle: 'How to Crochet a SEAMLESS Solid Square WITHOUT Turning! 🧶',
  },
  {
    videoId: 'T7LxrBtpAXM',
    projectSlug: 'sunburst-granny-square',
    projectTitle: 'Sunburst Granny Square',
    tutorialKey: 'hooked-by-robin-video',
    creatorName: 'Hooked by Robin',
    oEmbedTitle: 'Crochet Sunburst Sunflower Granny Square Tutorial 🌻',
  },
] as const;

export default function TutorialPreviewIndexPage() {
  if (!IS_DEV) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Warning banner */}
      <div
        className="w-full px-6 py-3 text-center text-xs font-semibold"
        style={{ backgroundColor: '#FEF3C7', color: '#78350F' }}
        role="alert"
      >
        ⚠ Development preview — these are unreviewed draft video candidates. Disabled in production.
      </div>

      <header
        className="w-full px-6 py-5 flex items-center border-b border-black/5"
        style={{ backgroundColor: 'var(--color-cream)' }}
      >
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-charcoal)' }}
          aria-label="LOOP Home"
        >
          LOOP
        </Link>
        <span className="ml-4 text-sm font-medium" style={{ color: 'var(--color-charcoal-soft)' }}>
          / Dev: Tutorial Preview Candidates
        </span>
      </header>

      <main id="main-content" className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <h1
          className="text-2xl font-extrabold tracking-tight mb-2"
          style={{ color: 'var(--color-charcoal)' }}
        >
          Draft Video Candidates
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-charcoal-soft)' }}>
          4 candidates — all stored as{' '}
          <code className="bg-black/5 px-1 rounded">review_status = &apos;draft&apos;</code>.
          None are publicly visible. Click a card to test the player.
        </p>

        <ul className="space-y-4">
          {PREVIEW_CANDIDATES.map((c) => (
            <li key={c.videoId}>
              <div
                className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider mb-0.5" style={{ color: 'var(--color-sage)' }}>
                    {c.projectTitle} &bull; {c.tutorialKey}
                  </p>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-charcoal)' }}>
                    {c.oEmbedTitle}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-charcoal-soft)' }}>
                    by {c.creatorName} &bull;{' '}
                    <span className="font-mono">{c.videoId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={buildWatchUrl(c.videoId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors hover:bg-black/5"
                    style={{ color: 'var(--color-charcoal)', borderColor: 'rgba(0,0,0,0.12)' }}
                  >
                    YouTube ↗
                  </a>
                  <Link
                    href={`/dev/tutorial-preview/${c.videoId}`}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-105"
                    style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
                  >
                    Test player →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div
          className="mt-8 p-4 rounded-xl border text-xs"
          style={{
            backgroundColor: 'rgba(245, 216, 126, 0.12)',
            borderColor: 'var(--color-butter)',
            color: '#78350F',
          }}
        >
          <p className="font-semibold mb-1">Public draft isolation confirmed</p>
          <p>
            Visiting{' '}
            <code className="bg-amber-100 px-1 rounded">/projects/classic-granny-square/tutorials/bella-coco-video</code>{' '}
            or any other draft tutorial key returns <strong>404</strong> for all users (enforced by
            RLS + route gate). This dev route makes no database calls to draft records.
          </p>
        </div>
      </main>

      <footer
        className="w-full px-6 py-8 border-t border-black/5 text-center text-xs"
        style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-charcoal-soft)' }}
      >
        <p>LOOP &bull; Development preview — not publicly accessible.</p>
      </footer>
    </div>
  );
}

