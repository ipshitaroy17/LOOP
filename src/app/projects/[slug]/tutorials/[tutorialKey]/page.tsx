import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import AuthNav from '@/components/AuthNav';
import { getProjectBySlug } from '@/lib/catalogue/queries';
import { getVerifiedTutorial } from '@/lib/tutorials/queries';
import { isProjectSavedByUser } from '@/lib/catalogue/saved-projects';
import SaveButton from '@/components/catalogue/SaveButton';

export const instant = false;

interface TutorialDetailPageProps {
  params: Promise<{ slug: string; tutorialKey: string }>;
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

export default async function TutorialDetailPage({ params }: TutorialDetailPageProps) {
  await connection();
  const { slug, tutorialKey } = await params;

  const project = await getProjectBySlug(slug);
  if (!project || !project.published) {
    notFound();
  }

  const tutorial = await getVerifiedTutorial(slug, tutorialKey);
  // Strict publication gate: only verified published tutorials can be viewed
  if (!tutorial || tutorial.reviewStatus !== 'verified_published') {
    notFound();
  }

  const isSaved = await isProjectSavedByUser(project.id);

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
        {/* Back Link to Parent Project */}
        <div className="mb-6">
          <Link
            href={`/projects/${project.slug}`}
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
                Lesson by {tutorial.videoCreatorName}
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

          <div className="flex items-center gap-4 pt-4 border-t border-black/5">
            <SaveButton
              projectId={project.id}
              initialIsSaved={isSaved}
              projectTitle={project.title}
              variant="detail"
            />
          </div>
        </div>

        {/* Video Embed Section (Only rendered when videoUrl is valid and permitted) */}
        {tutorial.videoUrl && tutorial.videoEmbedAllowed && (
          <div className="bg-black rounded-3xl overflow-hidden shadow-md mb-8 aspect-video relative">
            <iframe
              src={tutorial.videoUrl}
              title={`Video tutorial for ${tutorial.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
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
        {tutorial.steps && tutorial.steps.length > 0 && (
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

