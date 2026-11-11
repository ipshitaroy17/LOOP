import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import AuthNav from '@/components/AuthNav';
import { getProjectBySlug } from '@/lib/catalogue/queries';
import { getVerifiedTutorial, getVerifiedTutorialsByProjectId } from '@/lib/tutorials/queries';
import { isProjectSavedByUser } from '@/lib/catalogue/saved-projects';
import SaveButton from '@/components/catalogue/SaveButton';
import YouTubePlayer from '@/components/tutorial/YouTubePlayer';
import WrittenInstructions from '@/components/tutorial/WrittenInstructions';
import TutorialViewSwitcher from '@/components/tutorial/TutorialViewSwitcher';
import { parseYouTubeVideoId, buildWatchUrl } from '@/lib/youtube/parseVideoId';

export const instant = false;

interface TutorialDetailPageProps {
  params: Promise<{ slug: string; tutorialKey: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

function NavFallback() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="text-sm font-medium rounded-md px-3 py-2 transition-colors hover:text-black"
        style={{ color: 'var(--color-charcoal)' }}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="text-sm font-semibold rounded-full px-4 py-2 transition-colors hover:brightness-105"
        style={{
          backgroundColor: 'var(--color-sage)',
          color: '#1F1F1F',
        }}
      >
        Sign up
      </Link>
    </div>
  );
}

export default async function TutorialDetailPage({ params, searchParams }: TutorialDetailPageProps) {
  await connection();
  const { slug, tutorialKey } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  // Preserve filter/search query params so the back link returns to the project
  // page with its original explore context intact.
  const queryParams = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedSearchParams)) {
    if (typeof val === 'string' && val.trim() && key !== 'view') {
      queryParams.set(key, val.trim());
    }
  }

  const project = await getProjectBySlug(slug);
  if (!project || !project.published) {
    notFound();
  }
  const currentProject = project;

  const tutorial = await getVerifiedTutorial(slug, tutorialKey);
  // Strict publication gate: only verified_published tutorials are viewable
  if (!tutorial || tutorial.reviewStatus !== 'verified_published') {
    notFound();
  }
  const currentTutorial = tutorial;

  // Load sibling tutorials for the in-page switcher
  const siblingTutorials = await getVerifiedTutorialsByProjectId(currentProject.id);

  const isSaved = await isProjectSavedByUser(currentProject.id);

  // Parse and validate the stored video URL — never render arbitrary HTML
  const videoId = parseYouTubeVideoId(currentTutorial.videoUrl);
  const watchUrl = videoId ? buildWatchUrl(videoId) : null;

  // Determine availability
  const hasVideo = Boolean(videoId && currentTutorial.videoEmbedAllowed);
  const hasVideoUrlButNotAllowed =
    currentTutorial.videoUrl != null && currentTutorial.videoEmbedAllowed === false;
  const hasInvalidUrl = currentTutorial.videoUrl != null && !videoId;
  const steps = currentTutorial.steps || [];
  const hasSteps = steps.length > 0;

  // View selection from URL search params (?view=video | ?view=written)
  // Default to 'video' if video exists; otherwise default to 'written'.
  const rawView = typeof resolvedSearchParams.view === 'string' ? resolvedSearchParams.view : '';
  const activeView: 'video' | 'written' =
    rawView === 'written' ? 'written' : rawView === 'video' ? 'video' : hasVideo ? 'video' : 'written';

  // URL builders for view tabs and sibling switcher, preserving query parameters
  function buildViewHref(targetView: 'video' | 'written') {
    const p = new URLSearchParams(queryParams);
    p.set('view', targetView);
    return `/projects/${currentProject.slug}/tutorials/${currentTutorial.tutorialKey}?${p.toString()}`;
  }

  function buildSiblingHref(siblingKey: string) {
    const p = new URLSearchParams(queryParams);
    if (activeView !== 'video') {
      p.set('view', activeView);
    }
    return `/projects/${currentProject.slug}/tutorials/${siblingKey}${p.toString() ? `?${p.toString()}` : ''}`;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
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
              href="/explore"
              className="text-xs sm:text-sm font-medium transition-colors hover:underline"
              style={{ color: 'var(--color-sage)' }}
            >
              Explore
            </Link>
            <span className="text-gray-400" aria-hidden="true">&rsaquo;</span>
            <Link
              href={`/projects/${project.slug}`}
              className="text-xs sm:text-sm font-medium truncate max-w-[160px] transition-colors hover:underline"
              style={{ color: 'var(--color-sage)' }}
            >
              {project.title}
            </Link>
            <span className="text-gray-400" aria-hidden="true">&rsaquo;</span>
            <span
              className="text-xs sm:text-sm font-medium truncate max-w-[200px]"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              {tutorial.title}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Suspense fallback={<NavFallback />}>
            <AuthNav />
          </Suspense>
        </div>
      </header>

      {/* ── Main Tutorial Content ────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 sm:py-12">
        {/* Back Link to Parent Project (preserves search/filter params) */}
        <div className="mb-6">
          <Link
            href={`/projects/${project.slug}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:underline"
            style={{ color: 'var(--color-sage)' }}
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to {project.title}</span>
          </Link>
        </div>

        {/* Tutorial Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(124, 154, 107, 0.15)',
                color: 'var(--color-sage)',
              }}
            >
              {tutorial.terminology} Crochet Terms
            </span>

            {tutorial.videoCreatorName && (
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: 'var(--color-charcoal-soft)',
                }}
              >
                Lesson by{' '}
                {tutorial.videoCreatorUrl ? (
                  <a
                    href={tutorial.videoCreatorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                    style={{ color: 'var(--color-sage-dark)' }}
                  >
                    {tutorial.videoCreatorName}
                  </a>
                ) : (
                  tutorial.videoCreatorName
                )}
              </span>
            )}
          </div>

          <h1
            className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4"
            style={{ color: 'var(--color-charcoal)' }}
          >
            {tutorial.title}
          </h1>

          <p
            className="text-base sm:text-lg leading-relaxed mb-6"
            style={{ color: 'var(--color-charcoal-soft)' }}
          >
            {tutorial.learningObjective}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-black/5">
            <SaveButton
              projectId={project.id}
              initialIsSaved={isSaved}
              projectTitle={project.title}
              variant="detail"
            />

            {/* Open on YouTube link — only shown when we have a valid video ID */}
            {watchUrl && (
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold border transition-colors hover:bg-black/5"
                style={{
                  color: 'var(--color-charcoal)',
                  borderColor: 'rgba(0,0,0,0.12)',
                }}
                aria-label={`Open ${tutorial.title} on YouTube (opens in new tab)`}
              >
                <svg
                  className="w-4 h-4 text-red-600 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Open on YouTube
              </a>
            )}
          </div>
        </div>

        {/* ── Tutorial Switcher (Sibling Lessons) ─────────────────────────── */}
        {siblingTutorials.length > 1 && (
          <section className="mb-6" aria-labelledby="other-tutorials-heading">
            <h2
              id="other-tutorials-heading"
              className="text-xs font-bold uppercase tracking-wider mb-2.5 text-gray-500"
            >
              Alternative Lessons for {project.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {siblingTutorials.map((tut) => {
                const isCurrent = tut.tutorialKey === tutorial.tutorialKey;
                return (
                  <Link
                    key={tut.id}
                    href={buildSiblingHref(tut.tutorialKey)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                      isCurrent
                        ? 'cursor-default pointer-events-none'
                        : 'hover:shadow-sm hover:brightness-105'
                    }`}
                    style={
                      isCurrent
                        ? {
                            backgroundColor: 'var(--color-sage)',
                            color: '#1F1F1F',
                            borderColor: 'transparent',
                          }
                        : {
                            backgroundColor: 'white',
                            color: 'var(--color-charcoal)',
                            borderColor: 'rgba(0,0,0,0.1)',
                          }
                    }
                  >
                    {isCurrent && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-current shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {tut.videoCreatorName ? `Lesson by ${tut.videoCreatorName}` : tut.title}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Learning Mode Switcher (Video vs Written Instructions) ──────── */}
        <div className="mb-8">
          <TutorialViewSwitcher
            activeView={activeView}
            videoHref={buildViewHref('video')}
            writtenHref={buildViewHref('written')}
            hasVideo={hasVideo || hasVideoUrlButNotAllowed}
            hasSteps={hasSteps}
            stepsCount={steps.length}
          />
        </div>

        {/* ── View Panels ─────────────────────────────────────────────────── */}

        {/* Panel 1: Video Lesson View */}
        {activeView === 'video' && (
          <div id="panel-video" role="tabpanel" aria-labelledby="tab-video" className="space-y-8">
            {hasVideo && videoId ? (
              <section aria-label="Video tutorial">
                <YouTubePlayer videoId={videoId} title={`Video tutorial: ${tutorial.title}`} />

                {/* Creator credit bar below player */}
                {tutorial.videoCreatorName && (
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600 px-1">
                    <span>
                      Video by{' '}
                      {tutorial.videoCreatorUrl ? (
                        <a
                          href={tutorial.videoCreatorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                          style={{ color: 'var(--color-sage-dark)' }}
                        >
                          {tutorial.videoCreatorName}
                        </a>
                      ) : (
                        <span className="font-semibold">{tutorial.videoCreatorName}</span>
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
                )}
              </section>
            ) : hasVideoUrlButNotAllowed && watchUrl ? (
              /* Video URL exists but embedding disallowed */
              <section
                className="p-6 rounded-3xl border flex items-start gap-3.5"
                style={{
                  backgroundColor: 'rgba(245, 216, 126, 0.15)',
                  borderColor: 'var(--color-butter)',
                }}
                aria-label="Video notice"
              >
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 mt-0.5 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                </div>
                <div>
                  <p className="text-base font-semibold text-amber-950 mb-1">
                    Video available on YouTube
                  </p>
                  <p className="text-xs sm:text-sm text-amber-900 mb-4">
                    In-page playback has not been enabled for this video tutorial yet. You can watch it directly on YouTube.
                  </p>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all hover:brightness-105"
                    style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    Watch on YouTube
                  </a>
                </div>
              </section>
            ) : hasInvalidUrl ? (
              /* Malformed URL notice */
              <section className="p-6 rounded-3xl border border-red-200 bg-red-50/60" aria-label="Video error">
                <p className="text-sm font-semibold text-red-800 mb-1">Video link unavailable</p>
                <p className="text-xs text-red-700">
                  The stored video link for this tutorial could not be recognized as a valid YouTube URL.
                </p>
              </section>
            ) : (
              /* No video provided for this tutorial */
              <section
                className="p-6 sm:p-8 rounded-3xl border bg-white/80 border-black/5"
                aria-label="No video notice"
              >
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
                      No video lesson for this tutorial
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      This lesson is designed as step-by-step written instructions. Switch to the written instructions view to follow along.
                    </p>
                    <Link
                      href={buildViewHref('written')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all hover:brightness-105"
                      style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
                    >
                      Open Written Instructions &rarr;
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Quick cross-link to written instructions if available */}
            {hasSteps && (
              <div className="p-5 rounded-2xl bg-white border border-black/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Prefer reading the written steps?</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    View materials, stitch abbreviations, and {steps.length} detailed rows.
                  </p>
                </div>
                <Link
                  href={buildViewHref('written')}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-black/10 transition-colors hover:bg-black/5 shrink-0"
                >
                  View Steps &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Panel 2: Written Instructions View */}
        {activeView === 'written' && (
          <div id="panel-written" role="tabpanel" aria-labelledby="tab-written" className="space-y-6">
            {/* Quick cross-link to video if available */}
            {hasVideo && (
              <div className="p-4 rounded-2xl bg-white/80 border border-black/5 flex items-center justify-between gap-4 text-xs">
                <span className="text-gray-600">
                  Prefer watching? A video demonstration is also available for this lesson.
                </span>
                <Link
                  href={buildViewHref('video')}
                  className="font-semibold text-emerald-800 hover:underline shrink-0"
                >
                  Switch to Video &rarr;
                </Link>
              </div>
            )}

            {/* Reusable Written Instructions Component */}
            <WrittenInstructions
              terminology={tutorial.terminology}
              materialsDetails={tutorial.materialsDetails}
              abbreviations={tutorial.abbreviations}
              steps={steps}
              patternSourceTitle={tutorial.patternSourceTitle}
              patternSourceAuthor={tutorial.patternSourceAuthor}
              patternLicense={tutorial.patternLicense}
            />
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="w-full px-6 py-8 border-t border-black/5 text-center text-xs"
        style={{
          backgroundColor: 'var(--color-cream)',
          color: 'var(--color-charcoal-soft)',
        }}
      >
        <p>LOOP &bull; Crochet learning at your own pace.</p>
      </footer>
    </div>
  );
}
