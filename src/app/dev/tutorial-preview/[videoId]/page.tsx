import { notFound } from 'next/navigation';
import Link from 'next/link';
import YouTubePlayer from '@/components/tutorial/YouTubePlayer';
import { buildWatchUrl } from '@/lib/youtube/parseVideoId';

/**
 * DEV-ONLY Tutorial Video Preview
 * ================================
 * This route is permanently disabled in production.
 * It allows local testing of the YouTubePlayer component against the
 * four known draft video candidates WITHOUT fetching private draft
 * database records or bypassing RLS.
 *
 * Access: http://localhost:3000/dev/tutorial-preview/<videoId>
 *
 * Allowlisted video IDs (the four draft candidates seeded in 04_video_candidates_draft.sql):
 *   GALGQdP_POw  — Bella Coco: Classic Granny Square
 *   RwnArj7HdXo  — Hooked by Robin: Classic Granny Square
 *   AXJpyGLFleM  — Hooked by Robin: Solid Granny Square (seamless)
 *   T7LxrBtpAXM  — Hooked by Robin: Sunburst Granny Square
 *
 * Public draft tutorial routes continue to return 404 (enforced by RLS + route gate).
 * No database queries are made here — this route contains only static allowlist data.
 */

// ── Production guard ──────────────────────────────────────────────────────────
export const instant = false;

// notFound() converts to a 404 in production, making this route completely
// inaccessible outside of local development.
const IS_DEV = process.env.NODE_ENV !== 'production';

// ── Allowlist — ONLY these four specific video IDs ───────────────────────────
// Add a video ID here ONLY after oEmbed confirms it exists (HTTP 200).
// This is not a general YouTube proxy; do not widen this allowlist.
const ALLOWED_PREVIEW_VIDEOS: Record<
  string,
  {
    projectSlug: string;
    projectTitle: string;
    tutorialKey: string;
    creatorName: string;
    creatorUrl: string;
    oEmbedTitle: string;
  }
> = {
  GALGQdP_POw: {
    projectSlug: 'classic-granny-square',
    projectTitle: 'Classic Granny Square',
    tutorialKey: 'bella-coco-video',
    creatorName: 'Bella Coco',
    creatorUrl: 'https://www.youtube.com/@bellacococrochet',
    oEmbedTitle:
      'CROCHET: How to Crochet a Granny Square | Absolute Beginners | Bella Coco',
  },
  RwnArj7HdXo: {
    projectSlug: 'classic-granny-square',
    projectTitle: 'Classic Granny Square',
    tutorialKey: 'hooked-by-robin-granny-video',
    creatorName: 'Hooked by Robin',
    creatorUrl: 'https://www.youtube.com/@HookedbyRobin',
    oEmbedTitle: 'How to Crochet a Granny Square for ABSOLUTE BEGINNERS',
  },
  AXJpyGLFleM: {
    projectSlug: 'solid-granny-square',
    projectTitle: 'Solid Granny Square',
    tutorialKey: 'hooked-by-robin-video',
    creatorName: 'Hooked by Robin',
    creatorUrl: 'https://www.youtube.com/@HookedbyRobin',
    oEmbedTitle: 'How to Crochet a SEAMLESS Solid Square WITHOUT Turning! 🧶',
  },
  T7LxrBtpAXM: {
    projectSlug: 'sunburst-granny-square',
    projectTitle: 'Sunburst Granny Square',
    tutorialKey: 'hooked-by-robin-video',
    creatorName: 'Hooked by Robin',
    creatorUrl: 'https://www.youtube.com/@HookedbyRobin',
    oEmbedTitle: 'Crochet Sunburst Sunflower Granny Square Tutorial 🌻',
  },
};

interface PreviewPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function TutorialPreviewPage({ params }: PreviewPageProps) {
  // Hard gate: 404 in production
  if (!IS_DEV) {
    notFound();
  }

  const { videoId } = await params;
  const meta = ALLOWED_PREVIEW_VIDEOS[videoId];

  // 404 for any video ID not in the allowlist
  if (!meta) {
    notFound();
  }

  const watchUrl = buildWatchUrl(videoId);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* ── Dev Warning Banner ────────────────────────────────────────── */}
      <div
        className="w-full px-6 py-3 text-center text-xs font-semibold"
        style={{ backgroundColor: '#FEF3C7', color: '#78350F' }}
        role="alert"
      >
        ⚠ Development preview — unreviewed video candidate. This page is{' '}
        <strong>disabled in production</strong> and does not expose database draft records.
      </div>

      {/* ── Header ───────────────────────────────────────────────────── */}
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
          <nav aria-label="Breadcrumb navigation" className="hidden sm:flex items-center gap-2 text-sm">
            <Link
              href="/dev/tutorial-preview"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: 'var(--color-sage)' }}
            >
              Dev Preview
            </Link>
            <span className="text-gray-400" aria-hidden="true">&rsaquo;</span>
            <span className="text-xs font-medium truncate max-w-[200px]" style={{ color: 'var(--color-charcoal-soft)' }}>
              {meta.oEmbedTitle}
            </span>
          </nav>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 sm:py-12">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/dev/tutorial-preview"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:underline"
            style={{ color: 'var(--color-sage)' }}
          >
            <span aria-hidden="true">&larr;</span>
            <span>All preview candidates</span>
          </Link>
        </div>

        {/* Draft notice */}
        <div
          className="mb-6 p-4 rounded-2xl border flex items-start gap-3"
          style={{ backgroundColor: 'rgba(245, 216, 126, 0.15)', borderColor: 'var(--color-butter)' }}
          role="note"
          aria-label="Draft status notice"
        >
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold mb-0.5">Unreviewed draft candidate</p>
            <p>
              This video has <strong>not</strong> been reviewed for project match, terminology,
              or creator permission. It is stored as{' '}
              <code className="bg-amber-100 px-1 rounded">review_status = &apos;draft&apos;</code>{' '}
              and is invisible to all public users. Do not publish until all review gates are
              cleared.
            </p>
          </div>
        </div>

        {/* Title card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(245, 216, 126, 0.3)', color: '#78350F' }}
            >
              Draft Preview
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--color-charcoal-soft)' }}
            >
              by{' '}
              <a
                href={meta.creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-sage-dark)' }}
              >
                {meta.creatorName}
              </a>
            </span>
          </div>

          <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--color-sage)' }}>
            Project: {meta.projectTitle}
          </p>
          <h1
            className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2"
            style={{ color: 'var(--color-charcoal)' }}
          >
            {meta.oEmbedTitle}
          </h1>
          <p className="text-xs text-gray-500 font-mono mb-4">
            tutorial_key: {meta.tutorialKey} &bull; video_id: {videoId}
          </p>

          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold border transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-charcoal)', borderColor: 'rgba(0,0,0,0.12)' }}
          >
            <svg className="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            Open on YouTube
          </a>
        </div>

        {/* Player */}
        <section aria-label="Video preview">
          <YouTubePlayer
            videoId={videoId}
            title={`Preview: ${meta.oEmbedTitle}`}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-gray-600 px-1">
            <span>
              Video by{' '}
              <a
                href={meta.creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-sage-dark)' }}
              >
                {meta.creatorName}
              </a>
              {' '}on YouTube
            </span>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--color-sage-dark)' }}
            >
              Open on YouTube ↗
            </a>
          </div>
        </section>

        {/* Review checklist */}
        <section className="mt-10 bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <h2
            className="text-base font-bold mb-4"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Browser review checklist
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {[
              {
                label: 'Playback',
                detail: 'Video loads and plays fully without buffering errors.',
              },
              {
                label: 'Project match',
                detail: `Finished object in the video matches "${meta.projectTitle}". Technique taught matches the project description.`,
              },
              {
                label: 'Terminology',
                detail:
                  'Confirm US vs UK stitch names (sc/dc distinction). Update the terminology field in the database if UK.',
              },
              {
                label: 'Creator attribution',
                detail: `Channel display name is "${meta.creatorName}" and channel URL matches what is stored. Verify by visiting the channel directly.`,
              },
              {
                label: 'Embedding',
                detail:
                  'Video renders in the player above. If a "Watch on YouTube" fallback shows instead, embedding has been disabled by the creator — update video_embed_allowed = false.',
              },
              {
                label: 'Permission status',
                detail:
                  'pattern_source_type is "pending_permission". Do NOT create pattern_steps from this video without written permission from the creator.',
              },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full border-2 shrink-0 mt-0.5"
                  style={{ borderColor: 'var(--color-sage)' }}
                  aria-hidden="true"
                />
                <div>
                  <span className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                    {item.label}:
                  </span>{' '}
                  {item.detail}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="w-full px-6 py-8 border-t border-black/5 text-center text-xs"
        style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-charcoal-soft)' }}
      >
        <p>LOOP &bull; Development preview — not publicly accessible.</p>
      </footer>
    </div>
  );
}

