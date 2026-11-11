import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buildWatchUrl } from '@/lib/youtube/parseVideoId';

/**
 * DEV-ONLY: Index page listing all draft tutorial preview candidates.
 * Hard-gated: returns 404 in production.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

const VIDEO_CANDIDATES = [
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
        ⚠ Development preview — unreviewed draft candidates. Permanently disabled in production.
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
          / Dev: Tutorial Previews (Video &amp; Written)
        </span>
      </header>

      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-12">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Draft Tutorial Previews
          </h1>
          <p className="text-sm text-gray-600">
            All records below are in draft status (<code className="bg-black/5 px-1 rounded">review_status = &apos;draft&apos;</code>).
            Public routes strictly 404. These preview pages use isolated local fixtures to test player playback and written instructions components.
          </p>
        </div>

        {/* ── Section 1: Written Instructions Candidate (Day 9 Focus) ─── */}
        <section aria-labelledby="written-drafts-heading">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(124, 154, 107, 0.2)', color: 'var(--color-sage-dark)' }}
            >
              Day 9 Feature
            </span>
            <h2
              id="written-drafts-heading"
              className="text-lg font-bold"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Written Instructions Draft Candidate
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-600/20 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    5 Written Steps
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    5 Materials
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    US Terminology
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Beginner Practice Square: Mastering Single Crochet Swatches
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Project: Beginner Practice Square &bull; Fixture mirrors <code className="bg-gray-100 px-1 rounded">02_beginner_square_tutorial.sql</code>.
                  Tests materials list, stitch glossary, stitch count badges, and tip callouts.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href="/dev/tutorial-preview/beginner-practice-square?view=written"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:brightness-105"
                  style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
                >
                  Test Written Steps &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Video Tutorial Candidates (Day 8 Feature) ─────── */}
        <section aria-labelledby="video-drafts-heading">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', color: 'var(--color-charcoal-soft)' }}
            >
              Day 8 Feature
            </span>
            <h2
              id="video-drafts-heading"
              className="text-lg font-bold"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Video Tutorial Candidates (4 Videos)
            </h2>
          </div>

          <ul className="space-y-4">
            {VIDEO_CANDIDATES.map((c) => (
              <li key={c.videoId}>
                <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider mb-0.5" style={{ color: 'var(--color-sage)' }}>
                      {c.projectTitle} &bull; {c.tutorialKey}
                    </p>
                    <p className="text-sm font-semibold truncate text-gray-900">
                      {c.oEmbedTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by {c.creatorName} &bull; <span className="font-mono">{c.videoId}</span>
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
                      href={`/dev/tutorial-preview/${c.videoId}?view=video`}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold border border-black/10 transition-all hover:bg-black/5"
                    >
                      Video
                    </Link>
                    <Link
                      href={`/dev/tutorial-preview/${c.videoId}?view=written`}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-105"
                      style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
                      title="Test empty written instructions state (Coming Soon)"
                    >
                      Written
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Isolation Note */}
        <div
          className="p-5 rounded-2xl border text-xs"
          style={{
            backgroundColor: 'rgba(245, 216, 126, 0.12)',
            borderColor: 'var(--color-butter)',
            color: '#78350F',
          }}
        >
          <p className="font-semibold mb-1">Public Draft Isolation &amp; Production Guard</p>
          <p>
            Visiting <code className="bg-amber-100 px-1 rounded">/projects/beginner-practice-square/tutorials/main</code> or any other draft tutorial route in public returns <strong>404</strong> (enforced by RLS + route publication check).
            Furthermore, all <code className="bg-amber-100 px-1 rounded">/dev/*</code> routes return <strong>404</strong> on production builds.
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
