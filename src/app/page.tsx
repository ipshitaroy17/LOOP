import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import HowItWorks from '@/components/HowItWorks';
import AuthNav from '@/components/AuthNav';
import Logo from '@/components/Logo';
import PillButton from '@/components/ui/PillButton';
import Chip from '@/components/ui/Chip';
import { getPublishedProjects } from '@/lib/catalogue/queries';
import type { Project } from '@/lib/catalogue/types';

export const instant = false;

function AuthNavFallback() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="text-sm font-semibold rounded-full px-3.5 py-1.5 transition-colors text-ink hover:text-ink/70"
      >
        Log in
      </Link>
      <PillButton variant="primary" size="sm" href="/signup">
        Sign up
      </PillButton>
    </div>
  );
}

export default async function Home() {
  await connection();

  // Fetch real projects from Supabase catalogue
  let projects: Project[] = [];
  try {
    const res = await getPublishedProjects({}, 10);
    projects = res.projects || [];
  } catch {
    projects = [];
  }

  // Find the three featured starter projects
  const squareProject =
    projects.find((p) => p.slug === 'beginner-practice-square') ||
    projects[0] ||
    null;

  const scrunchieProject =
    projects.find((p) => p.slug === 'basic-crochet-scrunchie') ||
    projects[1] ||
    null;

  const leafProject =
    projects.find((p) => p.slug === 'botanical-leaf-pair') ||
    projects[2] ||
    null;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink font-body">
      {/* ── Skip Link ─────────────────────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:font-semibold bg-sage text-ink shadow-md"
      >
        Skip to main content
      </a>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" aria-label="loop Home" className="inline-flex items-center">
          <Logo size="md" />
        </Link>

        <nav aria-label="Page navigation" className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/explore"
            className="text-sm font-semibold text-ink transition-colors hover:text-sage-dark px-2 py-1"
          >
            Explore
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-semibold text-ink transition-colors hover:text-sage-dark px-2 py-1 hidden sm:inline"
          >
            How loop works
          </a>

          <Suspense fallback={<AuthNavFallback />}>
            <AuthNav />
          </Suspense>
        </nav>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1">
        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="w-full max-w-7xl mx-auto px-6 pt-8 pb-20 md:py-20 lg:py-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-6 flex flex-col items-start text-left max-w-xl">
              {/* Category Pill */}
              <Chip variant="butter" size="md" className="mb-6 font-semibold px-4 py-1.5 shadow-xs">
                Crochet, made friendly
              </Chip>

              {/* Main Headline */}
              <h1
                id="hero-heading"
                className="font-display font-bold text-ink leading-[1.04] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.75rem)' }}
              >
                Learn it.
                <br />
                Loop it.
                <br />
                <span className="text-sage-dark">Make it.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed text-ink/80 mb-8 max-w-lg">
                loop is a crochet learning platform that connects video, written patterns and
                guided steps into one seamless experience, so you can learn at your pace, your way.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <PillButton variant="primary" size="lg" href="/signup">
                  Start a project
                </PillButton>
                <PillButton variant="outline" size="lg" href="/explore">
                  Explore patterns
                </PillButton>
              </div>
            </div>

            {/* Right Column: 3 Tilted Project Cards + Dotted Yarn Trajectory */}
            <div className="lg:col-span-6 relative w-full max-w-md mx-auto h-[480px] sm:h-[520px] flex items-center justify-center">
              {/* Dotted yarn line SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
                viewBox="0 0 460 520"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M 60 480 C 100 400, 160 360, 210 300 C 260 240, 270 170, 360 80"
                  stroke="#CDBDEB"
                  strokeWidth="5"
                  strokeDasharray="6 12"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>

              {/* Card 1: Beginner Practice Square (Top Left, tilted -rotate-2) */}
              <Link
                href={
                  squareProject
                    ? `/projects/${squareProject.slug}`
                    : '/projects/beginner-practice-square'
                }
                className="absolute top-2 left-2 sm:left-4 w-[210px] sm:w-[225px] bg-white rounded-[26px] p-4 shadow-[0_12px_32px_rgba(46,42,54,0.08)] border border-ink/5 -rotate-2 hover:-rotate-1 hover:scale-105 transition-all duration-300 z-10"
                aria-label={squareProject?.title || 'Beginner Practice Square'}
              >
                <div className="bg-blush-light rounded-2xl h-24 sm:h-28 flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center text-ink shadow-xs">
                    {/* Pattern lines icon */}
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-ink line-clamp-2 leading-tight">
                  {squareProject?.title || 'Beginner Practice Square'}
                </h3>
                <div className="mt-2">
                  <Chip variant="sage-light" size="sm">
                    Beginner
                  </Chip>
                </div>
              </Link>

              {/* Card 2: Basic Crochet Scrunchie (Top Right, tilted rotate-3) */}
              <Link
                href={
                  scrunchieProject
                    ? `/projects/${scrunchieProject.slug}`
                    : '/projects/basic-crochet-scrunchie'
                }
                className="absolute top-0 right-2 sm:right-4 w-[210px] sm:w-[225px] bg-white rounded-[26px] p-4 shadow-[0_12px_32px_rgba(46,42,54,0.08)] border border-ink/5 rotate-3 hover:rotate-1 hover:scale-105 transition-all duration-300 z-10"
                aria-label={scrunchieProject?.title || 'Basic Crochet Scrunchie'}
              >
                <div className="bg-lilac-light rounded-2xl h-24 sm:h-28 flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full border-4 border-ink flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-ink" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-ink line-clamp-2 leading-tight">
                  {scrunchieProject?.title || 'Basic Crochet Scrunchie'}
                </h3>
                <div className="mt-2">
                  <Chip variant="sage-light" size="sm">
                    Beginner
                  </Chip>
                </div>
              </Link>

              {/* Card 3: Botanical Leaf Pair (Bottom Center, tilted rotate-1) */}
              <Link
                href={
                  leafProject
                    ? `/projects/${leafProject.slug}`
                    : '/projects/botanical-leaf-pair'
                }
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[220px] sm:w-[235px] bg-white rounded-[26px] p-4 shadow-[0_16px_36px_rgba(46,42,54,0.1)] border border-ink/5 rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300 z-20"
                aria-label={leafProject?.title || 'Botanical Leaf Pair'}
              >
                <div className="bg-sage-light rounded-2xl h-24 sm:h-28 flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-sage flex items-center justify-center text-ink shadow-xs">
                    {/* Botanical Leaf SVG */}
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 21V11M12 11C12 7 8 3 3 3C3 8 7 12 12 12ZM12 11C12 7 16 3 21 3C21 8 17 12 12 12Z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-ink line-clamp-2 leading-tight">
                  {leafProject?.title || 'Botanical Leaf Pair'}
                </h3>
                <div className="mt-2">
                  <Chip variant="sage-light" size="sm">
                    Beginner
                  </Chip>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── How loop works Section ───────────────────────────────────── */}
        <HowItWorks />

        {/* ── 3-Step Journey Section ───────────────────────────────────── */}
        <section className="w-full py-16 sm:py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-ink mb-4">
              Your crochet journey in 3 steps
            </h2>
            <p className="text-base sm:text-lg text-ink/75 leading-relaxed font-body">
              Everything you need to go from your very first slip knot to finished, beautiful makes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1: Pick a project */}
            <div className="bg-sage-light rounded-[28px] p-8 border border-ink/5 shadow-[0_4px_24px_rgba(46,42,54,0.04)] flex flex-col justify-between">
              <div>
                <span className="w-9 h-9 rounded-full bg-sage-dark text-white font-bold text-sm inline-flex items-center justify-center mb-6 shadow-xs">
                  1
                </span>
                <h3 className="text-2xl font-display font-bold text-ink mb-3">
                  Pick a project
                </h3>
                <p className="text-sm sm:text-base text-ink/80 leading-relaxed font-body">
                  Choose from 30 beginner-friendly swatches, wearables, and decor projects with
                  clear materials and verified difficulty ratings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink/10">
                <Link
                  href="/explore"
                  className="text-xs font-bold text-sage-dark uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                >
                  Browse projects &rarr;
                </Link>
              </div>
            </div>

            {/* Step 2: Follow along */}
            <div className="bg-blush-light rounded-[28px] p-8 border border-ink/5 shadow-[0_4px_24px_rgba(46,42,54,0.04)] flex flex-col justify-between">
              <div>
                <span className="w-9 h-9 rounded-full bg-blush text-ink font-bold text-sm inline-flex items-center justify-center mb-6 shadow-xs">
                  2
                </span>
                <h3 className="text-2xl font-display font-bold text-ink mb-3">
                  Follow along
                </h3>
                <p className="text-sm sm:text-base text-ink/80 leading-relaxed font-body">
                  Switch between video demonstrations, step-by-step guided instructions, and full
                  written patterns whenever you need a different perspective.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink/10">
                <a
                  href="#how-it-works"
                  className="text-xs font-bold text-ink uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                >
                  See 3 learning modes &rarr;
                </a>
              </div>
            </div>

            {/* Step 3: Ask the tutor */}
            <div className="bg-lilac-light rounded-[28px] p-8 border border-ink/5 shadow-[0_4px_24px_rgba(46,42,54,0.04)] flex flex-col justify-between">
              <div>
                <span className="w-9 h-9 rounded-full bg-lilac text-ink font-bold text-sm inline-flex items-center justify-center mb-6 shadow-xs">
                  3
                </span>
                <h3 className="text-2xl font-display font-bold text-ink mb-3">
                  Ask the tutor
                </h3>
                <p className="text-sm sm:text-base text-ink/80 leading-relaxed font-body">
                  Get unstuck quickly with maker tips, stitch abbreviation glossaries, and stitch
                  counts tracked clearly for every single row.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink/10">
                <Link
                  href="/signup"
                  className="text-xs font-bold text-ink uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                >
                  Join the platform &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Butter CTA Banner ────────────────────────────────────────── */}
        <section className="w-full px-6 py-12 max-w-7xl mx-auto">
          <div className="bg-butter rounded-[32px] p-8 sm:p-14 text-center border border-ink/5 shadow-[0_8px_32px_rgba(46,42,54,0.06)] flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-ink mb-3 tracking-tight">
              Ready for your first loop?
            </h2>
            <p className="text-base sm:text-lg text-ink/80 font-body mb-8 max-w-lg">
              Free to start. Your projects and progress stay saved.
            </p>
            <PillButton
              variant="primary"
              size="lg"
              href="/signup"
              className="bg-ink text-cream hover:bg-ink/85 px-8 py-3.5 shadow-sm"
            >
              Create free account
            </PillButton>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="w-full px-6 py-10 border-t border-ink/5 text-center text-xs text-ink/60 font-body">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="inline-flex items-center">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold text-ink/75">
            <Link href="/explore" className="hover:underline">
              Explore
            </Link>
            <a href="#how-it-works" className="hover:underline">
              How loop works
            </a>
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
          </div>
          <p>loop is in active development.</p>
        </div>
      </footer>
    </div>
  );
}
