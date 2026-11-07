import { Suspense } from "react";
import Link from "next/link";
import HowItWorks from "@/components/HowItWorks";
import AuthNav from "@/components/AuthNav";

function AuthNavFallback() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="text-sm font-medium rounded-md px-3 py-2 transition-colors hover:text-black"
        style={{ color: "var(--color-charcoal)" }}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="text-sm font-semibold rounded-full px-4 py-2 transition-colors hover:brightness-105"
        style={{
          backgroundColor: "var(--color-sage)",
          color: "#1F1F1F",
        }}
      >
        Sign up
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
        style={{
          backgroundColor: "var(--color-sage)",
          color: "#1F1F1F",
        }}
      >
        Skip to main content
      </a>

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <header
        className="w-full px-6 py-5 flex items-center justify-between"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-charcoal)" }}
          aria-label="LOOP"
        >
          LOOP
        </span>

        <nav aria-label="Page navigation" className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/explore"
            className="text-sm font-medium rounded-md px-3 py-2 transition-colors hover:underline"
            style={{ color: "var(--color-charcoal)" }}
          >
            Explore
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-medium rounded-md px-3 py-2 transition-colors hidden sm:inline"
            style={{ color: "var(--color-sage)" }}
          >
            How LOOP works
          </a>

          <Suspense fallback={<AuthNavFallback />}>
            <AuthNav />
          </Suspense>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1">
        <section
          aria-labelledby="hero-heading"
          className="w-full px-6 py-24 flex flex-col items-center text-center"
          style={{ backgroundColor: "var(--color-cream)" }}
        >
          {/* Wordmark */}
          <p
            className="text-7xl font-black tracking-tighter mb-5 leading-none"
            style={{ color: "var(--color-charcoal)" }}
            aria-label="LOOP"
          >
            LOOP
          </p>

          {/* Tagline */}
          <h1
            id="hero-heading"
            className="text-2xl font-semibold mb-6 max-w-md"
            style={{ color: "var(--color-sage)" }}
          >
            Learn it. Loop it. Make it.
          </h1>

          {/* One-line description */}
          <p
            className="text-lg max-w-lg mb-10 leading-relaxed"
            style={{ color: "var(--color-charcoal-soft)" }}
          >
            LOOP is a crochet learning platform that connects video,
            written patterns, and guided steps into one seamless experience —
            so you can learn at your pace, your way.
          </p>

          {/* CTA actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="#how-it-works"
              className="inline-block rounded-full px-8 py-3 text-base font-semibold transition-colors hover:brightness-105"
              style={{
                backgroundColor: "var(--color-sage)",
                color: "#1F1F1F",
              }}
            >
              How LOOP works
            </a>
            <Link
              href="/signup"
              className="inline-block rounded-full px-8 py-3 text-base font-semibold border border-black/10 transition-colors hover:bg-black/5"
              style={{
                color: "var(--color-charcoal)",
                backgroundColor: "var(--color-white)",
              }}
            >
              Create free account
            </Link>
          </div>
        </section>

        {/* ── Three learning modes ─────────────────────────────────────── */}
        <HowItWorks />

        {/* ── Footer note ─────────────────────────────────────────────── */}
        <footer
          className="w-full px-6 py-8 text-center text-sm"
          style={{
            backgroundColor: "var(--color-cream)",
            color: "var(--color-charcoal-soft)",
          }}
        >
          <p>
            LOOP is in active development.{" "}
            <span
              className="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-butter)",
                color: "var(--color-charcoal)",
              }}
            >
              Day 6 — save projects &amp; my projects
            </span>
          </p>
        </footer>
      </main>
    </>
  );
}
