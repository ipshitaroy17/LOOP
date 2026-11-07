import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { connection } from 'next/server';
import AuthNav from '@/components/AuthNav';
import { getProjectBySlug } from '@/lib/catalogue/queries';
import { getCategoryLabel, getDifficultyLabel } from '@/lib/catalogue/categories';

export const instant = false;

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
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

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  await connection();
  const { slug } = await params;

  const project = await getProjectBySlug(slug);

  // Unknown or unpublished slugs must return a proper 404 page
  if (!project || !project.published) {
    notFound();
  }

  const difficultyColor = (() => {
    switch (project.difficulty) {
      case 'beginner':
        return { bg: '#E8F3E5', text: '#2C5A24' };
      case 'easy':
        return { bg: '#FEF9E7', text: '#7D5A08' };
      case 'intermediate':
        return { bg: '#F4EEF8', text: '#552D75' };
      case 'advanced':
        return { bg: '#FDF2F2', text: '#8A2020' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  })();

  const thumbnailSrc =
    project.thumbnail_url || '/illustrations/projects/project-placeholder.svg';

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

          <nav aria-label="Breadcrumb navigation" className="flex items-center gap-2 text-sm">
            <Link
              href="/explore"
              className="text-xs sm:text-sm font-medium transition-colors hover:underline"
              style={{ color: 'var(--color-sage)' }}
            >
              Explore
            </Link>
            <span className="text-gray-400" aria-hidden="true">&rsaquo;</span>
            <span
              className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-[240px]"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              {project.title}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Suspense fallback={<NavFallback />}>
            <AuthNav />
          </Suspense>
        </div>
      </header>

      {/* ── Main Detail Content ──────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 sm:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:underline"
            style={{ color: 'var(--color-sage)' }}
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to all projects</span>
          </Link>
        </div>

        {/* Project Header & Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Illustration Column */}
          <div className="md:col-span-5 flex flex-col">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4EFE6] border border-black/5 shadow-sm">
              <Image
                src={thumbnailSrc}
                alt={`Illustration of ${project.title}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'var(--color-charcoal)' }}
                >
                  {getCategoryLabel(project.category)}
                </span>
              </div>
            </div>
          </div>

          {/* Title & Metadata Column */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: difficultyColor.bg,
                    color: difficultyColor.text,
                  }}
                >
                  {getDifficultyLabel(project.difficulty)}
                </span>

                {project.estimated_duration && (
                  <span
                    className="text-xs font-medium flex items-center gap-1.5"
                    style={{ color: 'var(--color-charcoal-soft)' }}
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {project.estimated_duration}
                  </span>
                )}
              </div>

              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: 'var(--color-charcoal)' }}
              >
                {project.title}
              </h1>

              {project.description && (
                <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: 'var(--color-charcoal-soft)' }}>
                  {project.description}
                </p>
              )}
            </div>

            {/* Preview Banner: Explains tutorial status without fake CTA buttons */}
            <div
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: 'rgba(245, 216, 126, 0.15)',
                borderColor: 'var(--color-butter)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-amber-950 mb-1">
                    Starter Catalogue Preview &bull; Tutorial Coming Soon
                  </h2>
                  <p className="text-xs leading-relaxed text-amber-900">
                    We are currently crafting step-by-step video demonstrations, interactive row counters, and written pattern charts for this project. Check back in upcoming releases!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Materials and Skills Breakdown ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {/* Suggested Materials Card */}
          <section
            aria-labelledby="materials-heading"
            className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
          >
            <h2
              id="materials-heading"
              className="text-base font-bold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-charcoal)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--color-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Suggested Materials
            </h2>

            {project.materials && project.materials.length > 0 ? (
              <ul className="space-y-2.5 text-sm" style={{ color: 'var(--color-charcoal)' }}>
                {project.materials.map((mat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--color-sage)' }} />
                    <span>{mat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Standard crochet yarn and suitable hook.</p>
            )}
          </section>

          {/* Skills & Stitches Involved Card */}
          <section
            aria-labelledby="skills-heading"
            className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
          >
            <h2
              id="skills-heading"
              className="text-base font-bold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-charcoal)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--color-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Skills &amp; Stitches Involved
            </h2>

            {project.skills && project.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--color-cream)',
                      color: 'var(--color-charcoal)',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Basic foundational crochet stitches.</p>
            )}
          </section>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="w-full px-6 py-8 border-t border-black/5 text-center text-xs"
        style={{
          backgroundColor: 'var(--color-cream)',
          color: 'var(--color-charcoal-soft)',
        }}
      >
        <p>
          LOOP &bull; Crochet learning at your own pace.
        </p>
      </footer>
    </div>
  );
}

