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
  // page with its original explore context intact (passed through to project page).
  const queryParams = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedSearchParams)) {
    if (typeof val === 'string' && val.trim()) {
      queryParams.set(key, val.trim());
    }
  }

  const project = await getProjectBySlug(slug);
  if (!project || !project.published) {
    notFound();
  }

  const tutorial = await getVerifiedTutorial(slug, tutorialKey);
  // Strict publication gate: only verified_published tutorials are viewable
  if (!tutorial || tutorial.reviewStatus !== 'verified_published') {
    notFound();
  }

  // Load sibling tutorials for the in-page switcher
  const siblingTutorials = await getVerifiedTutorialsByProjectId(project.id);

  const isSaved = await isProjectSavedByUser(project.id);

  // Parse and validate the stored video URL — never render arbitrary HTML
  const videoId = parseYouTubeVideoId(tutorial.videoUrl);
  const watchUrl = videoId ? buildWatchUrl(videoId) : null;

  // Determine what video section to render
  const hasVideo = Boolean(videoId && tutorial.videoEmbedAllowed);
  const hasVideoUrlButNotAllowed =
    tutorial.videoUrl != null && tutorial.videoEmbedAllowed === false;
  const hasInvalidUrl =
    tutorial.videoUrl != null && !videoId;

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
                {/* YouTube logo mark */}
                <svg className="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Open on YouTube
              </a>
            )}
          </div>
        </div>

        {/* ── Video Section ─────────────────────────────────────────────── */}

        {hasVideo && videoId && (
          <section aria-label="Video tutorial" className="mb-8">
            <YouTubePlayer
              videoId={videoId}
              title={`Video tutorial: ${tutorial.title}`}
            />

            {/* Creator credit bar below the player */}
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
                  )}
                  {' '}on YouTube
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
        )}

        {/* Video URL exists but embedding not permitted */}
        {hasVideoUrlButNotAllowed && watchUrl && (
          <section
            className="mb-8 p-5 rounded-2xl border flex items-start gap-3"
            style={{
              backgroundColor: 'rgba(245, 216, 126, 0.15)',
              borderColor: 'var(--color-butter)',
            }}
            aria-label="Video notice"
          >
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 mt-0.5 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-950 mb-1">
                Video available on YouTube
              </p>
              <p className="text-xs text-amber-900 mb-3">
                In-page playback is not enabled for this tutorial yet. Watch it directly on YouTube.
              </p>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:brightness-105"
                style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Watch on YouTube
              </a>
            </div>
          </section>
        )}

        {/* Video URL is present but could not be parsed as a valid YouTube URL */}
        {hasInvalidUrl && (
          <section
            className="mb-8 p-5 rounded-2xl border border-red-200 bg-red-50/50"
            aria-label="Video error"
          >
            <p className="text-sm font-semibold text-red-800 mb-1">Video unavailable</p>
            <p className="text-xs text-red-700">
              The stored video link for this tutorial could not be recognised as a valid YouTube URL.
              Contact the LOOP team to correct this tutorial record.
            </p>
          </section>
        )}

        {/* Tutorial selector — only shown when there are multiple published tutorials */}
        {siblingTutorials.length > 1 && (
          <section className="mb-8" aria-labelledby="other-tutorials-heading">
            <h2
              id="other-tutorials-heading"
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Other Tutorials for {project.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {siblingTutorials.map((tut) => {
                const isCurrent = tut.tutorialKey === tutorial.tutorialKey;
                return (
                  <Link
                    key={tut.id}
                    href={`/projects/${project.slug}/tutorials/${tut.tutorialKey}`}
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
                    {tut.videoCreatorName ? `by ${tut.videoCreatorName}` : tut.title}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Abbreviations Glossary */}
        {Object.keys(tutorial.abbreviations).length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 mb-8">
            <h2
              className="text-base font-bold mb-3 flex items-center gap-2"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Stitch Abbreviations Used
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(tutorial.abbreviations).map(([abbr, full]) => (
                <div key={abbr} className="p-2.5 rounded-xl bg-[#FAF7F0] border border-black/5">
                  <span className="font-bold text-xs mr-2" style={{ color: 'var(--color-sage)' }}>
                    {abbr}
                  </span>
                  <span className="text-xs text-gray-700">{full}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ordered Pattern Steps */}
        {tutorial.steps && tutorial.steps.length > 0 ? (
          <section className="mb-10">
            <h2
              className="text-xl font-extrabold tracking-tight mb-6"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Step-by-Step Instructions
            </h2>

            <ol className="space-y-4">
              {tutorial.steps.map((step) => (
                <li
                  key={step.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: 'rgba(124, 154, 107, 0.15)',
                          color: 'var(--color-sage)',
                        }}
                      >
                        {step.stepNumber}
                      </span>
                      <h3
                        className="text-base font-bold"
                        style={{ color: 'var(--color-charcoal)' }}
                      >
                        {step.title}
                      </h3>
                    </div>

                    {step.stitchCount && (
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-semibold shrink-0"
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                        }}
                      >
                        {step.stitchCount}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-gray-800 pl-10">
                    {step.instruction}
                  </p>

                  {step.notes && (
                    <div className="ml-10 mt-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900 leading-relaxed">
                      <span className="font-semibold">Tip: </span>
                      {step.notes}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ) : (
          /* Written/guided mode coming soon — honest, no fake buttons */
          <section
            className="mb-10 p-5 rounded-2xl border"
            style={{
              backgroundColor: 'rgba(195, 177, 212, 0.12)',
              borderColor: 'var(--color-lilac)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 mt-0.5 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-purple-950 mb-1">
                  Written instructions — coming soon
                </h2>
                <p className="text-xs leading-relaxed text-purple-900">
                  Step-by-step written instructions and row counters for this tutorial are in
                  preparation. Watch the video above in the meantime.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Source & Attribution Footer Card */}
        <section className="bg-white/60 rounded-2xl p-6 border border-black/5 text-xs text-gray-600">
          <h3 className="font-semibold text-gray-800 mb-1">Pattern Attribution &amp; Credits</h3>
          <p className="leading-relaxed">
            {tutorial.patternSourceTitle ? (
              <>
                Pattern: <span className="font-medium">{tutorial.patternSourceTitle}</span>
                {tutorial.patternSourceAuthor && <> by {tutorial.patternSourceAuthor}</>}.
              </>
            ) : (
              <>LOOP Educational Project Tutorial.</>
            )}
            {tutorial.patternLicense && <> Licensed under {tutorial.patternLicense}.</>}
          </p>
          {tutorial.videoCreatorName && (
            <p className="mt-1 leading-relaxed">
              Video lesson by{' '}
              {tutorial.videoCreatorUrl ? (
                <a
                  href={tutorial.videoCreatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                  style={{ color: 'var(--color-sage-dark)' }}
                >
                  {tutorial.videoCreatorName}
                </a>
              ) : (
                <span className="font-medium">{tutorial.videoCreatorName}</span>
              )}{' '}
              on YouTube. All video rights belong to the respective creator.
            </p>
          )}
        </section>
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
