'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { MaterialItem, PatternStep } from '@/lib/tutorials/types';

export interface GuidedStepsProps {
  steps: PatternStep[];
  terminology: string;
  abbreviations?: Record<string, string>;
  materialsDetails?: MaterialItem[];
  className?: string;
}

export default function GuidedSteps({
  steps,
  terminology,
  abbreviations = {},
  materialsDetails = [],
  className = '',
}: GuidedStepsProps) {
  const searchParams = useSearchParams();

  // Sort once by stepNumber
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const totalSteps = sortedSteps.length;

  // Initialize activeIndex from URL query param ?step= if provided
  const getInitialIndex = () => {
    const stepParam = searchParams?.get('step');
    if (stepParam) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= sortedSteps.length) {
        return parsed - 1;
      }
    }
    return 0;
  };

  const [prevSteps, setPrevSteps] = useState(steps);
  const [activeIndex, setActiveIndex] = useState(getInitialIndex);

  // Reset index during render when the steps array reference changes
  if (steps !== prevSteps) {
    setPrevSteps(steps);
    setActiveIndex(0);
  }

  // Collapsible materials drawer
  const [materialsOpen, setMaterialsOpen] = useState(false);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (totalSteps === 0) {
    return (
      <section
        className={`p-6 sm:p-8 rounded-[28px] border bg-lilac-light/40 border-lilac text-ink ${className}`}
        aria-label="Guided steps status"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-lilac/30 text-ink mt-0.5 shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-ink mb-1">
              Written instructions coming soon
            </h2>
            <p className="font-body text-sm leading-relaxed text-ink/75">
              Step-by-step guided instructions for this lesson are currently in preparation.
              Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Clamp index defensively ──────────────────────────────────────────────────
  const safeIndex = Math.min(Math.max(activeIndex, 0), totalSteps - 1);
  const currentStep = sortedSteps[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === totalSteps - 1;
  const progressPercent = Math.round(((safeIndex + 1) / totalSteps) * 100);

  const updateStepIndex = (newIndex: number) => {
    setActiveIndex(newIndex);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('step', String(newIndex + 1));
      window.history.replaceState(null, '', url.toString());
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      updateStepIndex(safeIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      updateStepIndex(safeIndex + 1);
    }
  };

  const handleReset = () => {
    updateStepIndex(0);
  };

  const hasAbbrGlossary = Object.keys(abbreviations).length > 0;
  const hasMaterials = materialsDetails.length > 0;

  // Format stitch count text nicely
  const stitchCountText = currentStep.stitchCount
    ? currentStep.stitchCount.toLowerCase().startsWith('stitch count')
      ? currentStep.stitchCount
      : `Stitch count: ${currentStep.stitchCount}`
    : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Progress bar row ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between text-sm font-semibold mb-2">
          <span className="text-ink">
            Step {safeIndex + 1} of {totalSteps}
          </span>
          <span className="text-ink/70">
            {progressPercent}% done
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full bg-ink/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={safeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Step ${safeIndex + 1} of ${totalSteps}`}
        >
          <div
            className="h-full rounded-full bg-sage transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Large white card ───────────────────────────────────────────────── */}
      <section
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Step ${safeIndex + 1}: ${currentStep.title}`}
        className="bg-white rounded-[28px] p-8 sm:p-12 shadow-[0_4px_24px_rgba(46,42,54,0.06)] border border-ink/5"
      >
        {/* Butter stitch-count badge */}
        {stitchCountText && (
          <div className="mb-4">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-butter text-ink shadow-xs">
              {stitchCountText}
            </span>
          </div>
        )}

        {/* Step title in Fraunces */}
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight mb-4">
          {currentStep.title}
        </h2>

        {/* Instructions at 20px font size */}
        <p className="font-body text-[20px] leading-relaxed text-ink/85 mb-6">
          {currentStep.instruction}
        </p>

        {/* Butter-light "Maker tip" box */}
        {currentStep.notes && (
          <div className="bg-butter-light rounded-2xl p-5 border border-butter/40 text-ink/90 text-sm sm:text-base leading-relaxed">
            <strong className="font-bold text-ink">Maker tip: </strong>
            {currentStep.notes.replace(/^Maker tip:\s*/i, '')}
          </div>
        )}
      </section>

      {/* ── Navigation controls ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous button */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirst}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold border border-ink/25 text-ink hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
          aria-label="Previous step"
        >
          &larr; Previous
        </button>

        {/* Next / Last step controls */}
        {isLast ? (
          <div className="flex items-center gap-3">
            <span
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-light text-sage-dark"
              role="status"
            >
              Last step
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold border border-ink/25 text-ink hover:bg-black/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
            >
              Back to first step
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center px-7 py-2.5 rounded-full text-sm font-semibold bg-sage text-ink hover:bg-sage-dark hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
            aria-label="Next step"
          >
            Next &rarr;
          </button>
        )}
      </div>

      {/* ── Collapsible Materials drawer ──────────────────────────────────── */}
      {(hasMaterials || hasAbbrGlossary) && (
        <section className="bg-white rounded-[24px] border border-ink/5 shadow-[0_4px_24px_rgba(46,42,54,0.04)] overflow-hidden">
          <button
            type="button"
            onClick={() => setMaterialsOpen((o) => !o)}
            aria-expanded={materialsOpen}
            className="w-full flex items-center justify-between px-6 py-5 text-left font-display font-bold text-base text-ink hover:bg-cream/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
          >
            <span>Materials, tools &amp; abbreviations</span>
            <span
              className={`text-lg text-ink/60 transition-transform duration-200 inline-block ${
                materialsOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {materialsOpen && (
            <div className="px-6 pb-6 pt-2 border-t border-ink/5 space-y-6">
              {/* Materials list */}
              {hasMaterials && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sage-dark mb-3">
                    Materials &amp; Tools ({terminology} Terminology)
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-ink/80 font-body">
                    {materialsDetails.map((mat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 bg-cream/50 rounded-xl p-3 border border-ink/5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0" />
                        <span>
                          <strong className="font-semibold text-ink">{mat.item}</strong>
                          {mat.quantity ? ` — ${mat.quantity}` : ''}
                          {mat.notes ? ` (${mat.notes})` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Abbreviations glossary */}
              {hasAbbrGlossary && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sage-dark mb-3">
                    Abbreviations Glossary
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-body">
                    {Object.entries(abbreviations).map(([abbr, meaning]) => (
                      <div
                        key={abbr}
                        className="bg-cream/50 rounded-xl p-3 border border-ink/5"
                      >
                        <dt className="font-bold text-ink">{abbr}</dt>
                        <dd className="text-ink/70 mt-0.5">{meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
