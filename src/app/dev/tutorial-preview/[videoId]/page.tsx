import { notFound } from 'next/navigation';
import Link from 'next/link';
import YouTubePlayer from '@/components/tutorial/YouTubePlayer';
import WrittenInstructions from '@/components/tutorial/WrittenInstructions';
import GuidedSteps from '@/components/tutorial/GuidedSteps';
import TutorialViewSwitcher from '@/components/tutorial/TutorialViewSwitcher';
import Logo from '@/components/Logo';
import PillButton from '@/components/ui/PillButton';
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
 */

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
    oEmbedTitle: 'Beginner Practice Square',
    videoId: null,
    terminology: 'US',
  },
};

interface PreviewPageProps {
  params: Promise<{ videoId: string }>;
  searchParams?: Promise<{ view?: string; step?: string }>;
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
  const steps = isWrittenFixture ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.steps || [] : [];
  const materialsDetails = isWrittenFixture
    ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.materialsDetails
    : [];
  const abbreviations = isWrittenFixture
    ? BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE.abbreviations
    : {};
  const hasSteps = steps.length > 0;

  // View state from query params (?view=video | ?view=written | ?view=guided)
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

  const stepQuery = resolvedSearchParams.step ? `&step=${resolvedSearchParams.step}` : '';
  const videoHref = `/dev/tutorial-preview/${videoId}?view=video${stepQuery}`;
  const writtenHref = `/dev/tutorial-preview/${videoId}?view=written${stepQuery}`;
  const guidedHref = `/dev/tutorial-preview/${videoId}?view=guided${stepQuery}`;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      {/* ── Dev Warning Banner ────────────────────────────────────────── */}
      <div
        className="w-full px-6 py-2.5 text-center text-xs font-semibold bg-butter-light text-ink/80 border-b border-butter/30"
        role="alert"
      >
        ⚠ Development preview — unreviewed draft candidate. This page is{' '}
        <strong>disabled in production</strong>.
      </div>

      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-ink/5 bg-cream">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/"
            className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-lg"
            aria-label="loop Home"
          >
            <Logo size="md" />
          </Link>
        </div>

        <nav aria-label="Tutorial navigation" className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/my-projects"
            className="text-sm font-semibold text-ink/75 hover:text-ink transition-colors px-2 py-1"
          >
            My projects
          </Link>
          <Link
            href="/explore"
            className="text-sm font-semibold text-ink/75 hover:text-ink transition-colors px-2 py-1"
          >
            Explore
          </Link>

          {/* Avatar initial */}
          <div
            className="w-9 h-9 rounded-full bg-blush-light text-ink border border-ink/10 flex items-center justify-center font-bold text-sm select-none shadow-xs"
            aria-hidden="true"
          >
            I
          </div>

          <form action="/auth/signout" method="POST" className="inline-flex">
            <PillButton
              variant="outline"
              size="sm"
              type="submit"
            >
              Log out
            </PillButton>
          </form>
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 sm:py-12">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/dev/tutorial-preview"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
          >
            <span>&larr; Back to project</span>
          </Link>
        </div>

        {/* Title in Fraunces */}
        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight mb-6">
          {meta.projectTitle}
        </h1>

        {/* ── View Switcher: Video / Guided / Written ────────────────────── */}
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

        {/* ── View Panels (kept mounted to preserve step state) ──────────── */}

        {/* Panel 1: Video View */}
        <div
          id="panel-video"
          role="tabpanel"
          aria-labelledby="tab-video"
          className={`space-y-6 ${activeView === 'video' ? 'block' : 'hidden'}`}
        >
          {hasVideo && meta.videoId ? (
            <section aria-label="Video preview">
              <YouTubePlayer videoId={meta.videoId} title={`Preview: ${meta.oEmbedTitle}`} />
              <div className="mt-3 flex items-center justify-between text-xs text-ink/70 px-1 font-body">
                <span>
                  Video by{' '}
                  {meta.creatorUrl ? (
                    <a
                      href={meta.creatorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sage-dark hover:underline"
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
                    className="hover:underline text-sage-dark font-medium"
                  >
                    Open on YouTube &rarr;
                  </a>
                )}
              </div>
            </section>
          ) : (
            <section className="p-8 sm:p-10 rounded-[28px] bg-white border border-ink/5 shadow-[0_4px_24px_rgba(46,42,54,0.06)]" aria-label="No video notice">
              <h2 className="font-display text-xl font-bold text-ink mb-2">
                No video recorded for this draft lesson
              </h2>
              <p className="font-body text-sm text-ink/75 mb-6 leading-relaxed">
                The Beginner Practice Square is drafted with structured written and guided steps.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={guidedHref}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-sage text-ink hover:bg-sage-dark hover:text-white transition-all shadow-xs"
                >
                  Open Guided Steps &rarr;
                </Link>
                <Link
                  href={writtenHref}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold border border-ink/20 text-ink hover:bg-black/5 transition-all"
                >
                  View Written Instructions
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* Panel 2: Guided Steps View */}
        <div
          id="panel-guided"
          role="tabpanel"
          aria-labelledby="tab-guided"
          className={activeView === 'guided' ? 'block' : 'hidden'}
        >
          <GuidedSteps
            steps={steps}
            terminology={meta.terminology}
            abbreviations={abbreviations}
            materialsDetails={materialsDetails}
          />
        </div>

        {/* Panel 3: Written View */}
        <div
          id="panel-written"
          role="tabpanel"
          aria-labelledby="tab-written"
          className={activeView === 'written' ? 'block' : 'hidden'}
        >
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
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="w-full px-6 py-8 border-t border-ink/5 text-center text-xs text-ink/60 font-body bg-cream">
        <p>loop &bull; Development preview — not publicly accessible.</p>
      </footer>
    </div>
  );
}
