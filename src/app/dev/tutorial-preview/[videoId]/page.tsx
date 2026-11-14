import { notFound } from 'next/navigation';
import Link from 'next/link';
import YouTubePlayer from '@/components/tutorial/YouTubePlayer';
import WrittenInstructions from '@/components/tutorial/WrittenInstructions';
import GuidedSteps from '@/components/tutorial/GuidedSteps';
import TutorialViewSwitcher from '@/components/tutorial/TutorialViewSwitcher';
import Brand from '@/components/Brand';
import { buildWatchUrl } from '@/lib/youtube/parseVideoId';
import {
  BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE,
} from '@/lib/tutorials/fixtures/beginner-square-fixture';

/**
 * DEV-ONLY Tutorial Video, Written & Guided Preview
 * =================================================
 * This route is permanently disabled in production.
 * It allows local testing of the YouTubePlayer, WrittenInstructions, and GuidedSteps
 * components against known draft candidates WITHOUT fetching private draft
 * database records or bypassing RLS.
 *
 * Allowlisted video IDs (the 4 draft candidates seeded in 04_video_candidates_draft.sql):
 *   GALGQdP_POw  — Bella Coco: Classic Granny Square
 *   RwnArj7HdXo  — Hooked by Robin: Classic Granny Square
 *   AXJpyGLFleM  — Hooked by Robin: Solid Granny Square (seamless)
 *   T7LxrBtpAXM  — Hooked by Robin: Sunburst Granny Square
 *
 * Allowlisted written/guided fixture (the 5 draft steps seeded in 02_beginner_square_tutorial.sql):
 *   beginner-practice-square — LOOP Foundational Single Crochet Swatch
 *
 * Public draft tutorial routes continue to return 404 (enforced by RLS + route gate).
 * No database queries are made here — this route contains only static fixture data.
 */

// ── Production guard ──────────────────────────────────────────────────────────
export const instant = false;

const IS_DEV = process.env.NODE_ENV !== 'production';

interface PreviewVideoMeta {
  type: 'video';
  projectSlug: string;
  projectTitle: string;
  tutorialKey: string;
  creatorName: string;
  creatorUrl: string;
  oEmbedTitle: string;
  videoId: string;
  terminology: string;
}

interface PreviewWrittenMeta {
  type: 'written';
  projectSlug: string;
  projectTitle: string;
  tutorialKey: string;
  creatorName: string;
  creatorUrl: string | null;
  oEmbedTitle: string;
  videoId: null;
  terminology: string;
}

type PreviewCandidate = PreviewVideoMeta | PreviewWrittenMeta;

const PREVIEW_CANDIDATES: Record<string, PreviewCandidate> = {
  GALGQdP_POw: {
    type: 'video',
    projectSlug: 'classic-granny-square',
    projectTitle: 'Classic Granny Square',
    tutorialKey: 'bella-coco-video',
    creatorName: 'Bella Coco',
    creatorUrl: 'https://www.youtube.com/@bellacococrochet',
    oEmbedTitle:
      'CROCHET: How to Crochet a Granny Square | Absolute Beginners | Bella Coco',
    videoId: 'GALGQdP_POw',
    terminology: 'US',
  },
  RwnArj7HdXo: {
    type: 'video',
    projectSlug: 'classic-granny-square',
    projectTitle: 'Classic Granny Square',
    tutorialKey: 'hooked-by-robin-granny-video',
    creatorName: 'Hooked by Robin',
    creatorUrl: 'https://www.youtube.com/@HookedbyRobin',
    oEmbedTitle: 'How to Crochet a Granny Square for ABSOLUTE BEGINNERS',
    videoId: 'RwnArj7HdXo',
    terminology: 'US',
  },
  AXJpyGLFleM: {
    type: 'video',
    projectSlug: 'solid-granny-square',
    projectTitle: 'Solid Granny Square',
    tutorialKey: 'hooked-by-robin-video',
    creatorName: 'Hooked by Robin',
    creatorUrl: 'https://www.youtube.com/@HookedbyRobin',
    oEmbedTitle: 'How to Crochet a SEAMLESS Solid Square WITHOUT Turning! 🧶',
    videoId: 'AXJpyGLFleM',
    terminology: 'US',
  },
  T7LxrBtpAXM: {
    type: 'video',
    projectSlug: 'sunburst-granny-square',
    projectTitle: 'Sunburst Granny Square',
    tutorialKey: 'hooked-by-robin-video',
    creatorName: 'Hooked by Robin',
    creatorUrl: 'https://www.youtube.com/@HookedbyRobin',
    oEmbedTitle: 'Crochet Sunburst Sunflower Granny Square Tutorial 🌻',
    videoId: 'T7LxrBtpAXM',
    terminology: 'US',
  },
  'beginner-practice-square': {
    type: 'written',
    projectSlug: 'beginner-practice-square',
    projectTitle: 'Beginner Practice Square',
    tutorialKey: 'main',
    creatorName: 'loop Curriculum Team',
    creatorUrl: null,
    oEmbedTitle: 'Beginner Practice Square: Mastering Single Crochet Swatches',
    videoId: null,
    terminology: 'US',
  },
};

interface PreviewPageProps {
  params: Promise<{ videoId: string }>;
  searchParams?: Promise<{ view?: string }>;
}

export default async function TutorialPreviewPage({ params, searchParams }: PreviewPageProps) {
  // Hard gate: 404 in production
  if (!IS_DEV) {
    notFound();
  }

  const { videoId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const meta = PREVIEW_CANDIDATES[videoId];

  // 404 for any key not in the allowlist
  if (!meta) {
    notFound();
  }

  const isWrittenFixture = meta.type === 'written';
  const hasVideo = meta.videoId !== null;
  const watchUrl = meta.videoId ? buildWatchUrl(meta.videoId) : null;

  // Pattern steps & materials from fixture for beginner-practice-square
  // For the 4 video candidates, steps are empty [] (never attach practice square to granny squares)
  const steps = isWrittenFixture ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.steps || [] : [];
  const materialsDetails = isWrittenFixture
    ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.materialsDetails
    : [];
  const abbreviations = isWrittenFixture
    ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.abbreviations
    : {};
  const hasSteps = steps.length > 0;

  // View state from query params (?view=video | ?view=written | ?view=guided)
  // Default to 'guided' for written fixture with steps; default to 'video' for video candidates.
  const rawView = resolvedSearchParams.view;
  const activeView: 'video' | 'written' | 'guided' =
    rawView === 'guided'
      ? 'guided'
      : rawView === 'written'
      ? 'written'
      : rawView === 'video'
      ? 'video'
      : isWrittenFixture
      ? 'guided'
      : 'video';

  const videoHref = `/dev/tutorial-preview/${videoId}?view=video`;
  const writtenHref = `/dev/tutorial-preview/${videoId}?view=written`;
  const guidedHref = `/dev/tutorial-preview/${videoId}?view=guided`;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* ── Dev Warning Banner ────────────────────────────────────────── */}
      <div
        className="w-full px-6 py-3 text-center text-xs font-semibold"
        style={{ backgroundColor: '#FEF3C7', color: '#78350F' }}
        role="alert"
      >
        ⚠ Development preview — unreviewed draft candidate. This page is{' '}
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
            className="inline-flex items-center"
            aria-label="loop Home"
          >
            <Brand size="nav" style={{ color: 'var(--color-charcoal)' }} />
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
            <span
              className="text-xs font-medium truncate max-w-[200px]"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold mb-0.5">Unreviewed draft candidate ({isWrittenFixture ? 'Guided / Written Steps' : 'Video'})</p>
            <p>
              This content is stored as{' '}
              <code className="bg-amber-100 px-1 rounded">review_status = &apos;draft&apos;</code>{' '}
              and is invisible to all public users. This development preview loads a safe local fixture for UI verification without touching private database records.
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
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(124, 154, 107, 0.15)', color: 'var(--color-sage)' }}
            >
              {meta.terminology} Terms
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--color-charcoal-soft)' }}
            >
              by{' '}
              {meta.creatorUrl ? (
                <a
                  href={meta.creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--color-sage-dark)' }}
                >
                  {meta.creatorName}
                </a>
              ) : (
                <span className="font-semibold">{meta.creatorName}</span>
              )}
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
            tutorial_key: {meta.tutorialKey} {meta.videoId ? `• video_id: ${meta.videoId}` : '• written_fixture: 5 steps'}
          </p>

          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold border transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-charcoal)', borderColor: 'rgba(0,0,0,0.12)' }}
            >
              <svg className="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
              Open on YouTube
            </a>
          )}
        </div>

        {/* ── View Switcher ──────────────────────────────────────────────── */}
        <div className="mb-8">
          <TutorialViewSwitcher
            activeView={activeView}
            videoHref={videoHref}
            writtenHref={writtenHref}
            guidedHref={guidedHref}
            hasVideo={hasVideo}
            hasSteps={hasSteps}
            stepsCount={steps.length}
          />
        </div>

        {/* ── View Panels ────────────────────────────────────────────────── */}

        {/* Panel 1: Video View */}
        {activeView === 'video' && (
          <div id="panel-video" role="tabpanel" aria-labelledby="tab-video" className="space-y-6">
            {hasVideo && meta.videoId ? (
              <section aria-label="Video preview">
                <YouTubePlayer videoId={meta.videoId} title={`Preview: ${meta.oEmbedTitle}`} />
                <div className="mt-3 flex items-center justify-between text-xs text-gray-600 px-1">
                  <span>
                    Video by{' '}
                    {meta.creatorUrl ? (
                      <a
                        href={meta.creatorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:underline"
                        style={{ color: 'var(--color-sage-dark)' }}
                      >
                        {meta.creatorName}
                      </a>
                    ) : (
                      meta.creatorName
                    )}{' '}
                    on YouTube
                  </span>
                  {watchUrl && (
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: 'var(--color-sage-dark)' }}
                    >
                      Open on YouTube ↗
                    </a>
                  )}
                </div>
              </section>
            ) : (
              <section className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5" aria-label="No video notice">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600 mt-0.5 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                      No video recorded for this draft lesson
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      The Beginner Practice Square is drafted with 5 structured steps. Switch to Guided Steps or Written Instructions to follow along.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={guidedHref}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all hover:brightness-105"
                        style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
                      >
                        Open Guided Steps &rarr;
                      </Link>
                      <Link
                        href={writtenHref}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border border-black/10 transition-all hover:bg-black/5"
                      >
                        View Written Instructions
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Panel 2: Guided Steps View */}
        {activeView === 'guided' && (
          <div id="panel-guided" role="tabpanel" aria-labelledby="tab-guided">
            <GuidedSteps
              steps={steps}
              terminology={meta.terminology}
              abbreviations={abbreviations}
              materialsDetails={materialsDetails}
            />
          </div>
        )}

        {/* Panel 3: Written View */}
        {activeView === 'written' && (
          <div id="panel-written" role="tabpanel" aria-labelledby="tab-written">
            {/* Reuses the exact same WrittenInstructions component used in public pages */}
            <WrittenInstructions
              terminology={meta.terminology}
              materialsDetails={materialsDetails}
              abbreviations={abbreviations}
              steps={steps}
              patternSourceTitle={
                isWrittenFixture
                  ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.patternSourceTitle
                  : null
              }
              patternSourceAuthor={
                isWrittenFixture
                  ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.patternSourceAuthor
                  : null
              }
              patternLicense={
                isWrittenFixture
                  ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.patternLicense
                  : null
              }
            />
          </div>
        )}

        {/* Review checklist */}
        <section className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold mb-4" style={{ color: 'var(--color-charcoal)' }}>
            Day 10 Guided Steps UI Checklist
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
            {[
              {
                label: 'Step Progression & Display',
                detail:
                  'Displays "Step X of Y", step title, instructions, stitch count badge, and maker tip when present.',
              },
              {
                label: 'Local Navigation Controls',
                detail:
                  'Previous button disabled on step 1. Next button advances until final step. Final step displays "Last step" status without persisting completion.',
              },
              {
                label: 'Back to First Step',
                detail:
                  'On the final step, a "Back to first step" control resets back to step 1.',
              },
              {
                label: 'Reference Access',
                detail:
                  'Collapsible Materials, Tools & Abbreviations drawer is accessible directly within Guided mode.',
              },
              {
                label: 'Learning Mode Switcher',
                detail:
                  'Three-way switcher (?view=video | ?view=guided | ?view=written) preserves parameters and survives page reloads.',
              },
              {
                label: 'Empty State (Honest Availability)',
                detail:
                  'On the 4 granny square candidates (which have no written steps), Guided Steps shows the honest "Coming soon" notice.',
              },
              {
                label: 'Production Inaccessibility',
                detail:
                  'This preview is permanently disabled in production builds (returns HTTP 404).',
              },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full border-2 shrink-0 mt-0.5"
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
        <p><Brand size="inherit" /> &bull; Development preview — not publicly accessible.</p>
      </footer>
    </div>
  );
}
