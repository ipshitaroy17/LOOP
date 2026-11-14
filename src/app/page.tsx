import { Suspense } from "react";
import Link from "next/link";
import HowItWorks from "@/components/HowItWorks";
import AuthNav from "@/components/AuthNav";
import Logo from "@/components/Logo";

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
        <Logo size="md" />

        <nav aria-label="Page navigation" className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/explore"
            className="text-sm font-medium rounded-md px-3 py-2 transition-colors hover:underline"
            style={{ color: "var(--color-ink)" }}
          >
            Explore
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-medium rounded-md px-3 py-2 transition-colors hidden sm:inline"
            style={{ color: "var(--color-sage-dark)" }}
          >
            How loop works
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
          <div className="mb-6">
            <Logo size="xl" />
          </div>

          {/* Tagline */}
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl font-display font-bold mb-6 max-w-md"
            style={{ color: "var(--color-ink)" }}
          >
            Learn it. Loop it. Make it.
          </h1>

          {/* One-line description */}
          <p
            className="text-lg max-w-lg mb-10 leading-relaxed font-body"
            style={{ color: "var(--color-charcoal-soft)" }}
          >
            loop is a crochet learning platform that connects video,
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
                color: "#2E2A36",
              }}
            >
              How loop works
            </a>
            <Link
              href="/signup"
              className="inline-block rounded-full px-8 py-3 text-base font-semibold border border-ink/20 transition-colors hover:bg-black/5"
              style={{
                color: "var(--color-ink)",
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
          className="w-full px-6 py-8 text-center text-sm font-body"
          style={{
            backgroundColor: "var(--color-cream)",
            color: "var(--color-charcoal-soft)",
          }}
        >
          <p>
            loop is in active development.{" "}
            <span
              className="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-butter)",
                color: "var(--color-ink)",
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
