'use client';

import { useState } from 'react';
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
  // Sort once; stable reference kept via useMemo-like pattern (props are plain arrays)
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const totalSteps = sortedSteps.length;

  // Reset index during render when the steps array reference changes
  // (official React pattern: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const [prevSteps, setPrevSteps] = useState(steps);
  const [activeIndex, setActiveIndex] = useState(0);

  if (steps !== prevSteps) {
    setPrevSteps(steps);
    setActiveIndex(0);
  }

  // Collapsible materials panel
  const [materialsOpen, setMaterialsOpen] = useState(false);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (totalSteps === 0) {
    return (
      <section
        className={`p-6 sm:p-8 rounded-3xl border ${className}`}
        style={{
          backgroundColor: 'rgba(195, 177, 212, 0.12)',
          borderColor: 'var(--color-lilac)',
        }}
        aria-label="Guided steps status"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 mt-0.5 shrink-0">
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
            <h2 className="text-base sm:text-lg font-bold text-purple-950 mb-1">
              Guided steps — coming soon
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-purple-900">
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

  // Abbreviations relevant to the current step
  const stepAbbreviations = currentStep.abbreviations ?? [];
  const hasAbbrGlossary = Object.keys(abbreviations).length > 0;
  const hasMaterials = materialsDetails.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--color-sage-dark)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          Step {safeIndex + 1} of {totalSteps}
        </span>
        <div
          className="flex-1 h-1.5 rounded-full bg-black/8 overflow-hidden"
          role="progressbar"
          aria-valuenow={safeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Step ${safeIndex + 1} of ${totalSteps}`}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((safeIndex + 1) / totalSteps) * 100}%`,
              backgroundColor: 'var(--color-sage)',
            }}
          />
        </div>
      </div>

      {/* ── Step card ─────────────────────────────────────────────────────── */}
      <section
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Step ${safeIndex + 1}: ${currentStep.title}`}
        className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-black/5"
      >
        {/* Step header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-5 border-b border-black/5">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-xs"
              style={{
                backgroundColor: 'var(--color-sage)',
                color: '#1F1F1F',
              }}
              aria-hidden="true"
            >
              {currentStep.stepNumber}
            </span>
            <h2
              className="text-lg sm:text-xl font-bold"
              style={{ color: 'var(--color-charcoal)' }}
            >
              {currentStep.title}
            </h2>
          </div>

          {currentStep.stitchCount && (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
              style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              {currentStep.stitchCount}
            </span>
          )}
        </div>

        {/* Instruction body */}
        <p className="text-sm sm:text-base leading-relaxed text-gray-800 mb-5">
          {currentStep.instruction}
        </p>

        {/* Step abbreviation tags */}
        {stepAbbreviations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Stitches:
            </span>
            {stepAbbreviations.map((abbr) => (
              <span
                key={abbr}
                title={hasAbbrGlossary ? abbreviations[abbr] : undefined}
                className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FAF7F0] border border-black/5 text-[#5E7A50]"
              >
                {abbr}
                {hasAbbrGlossary && abbreviations[abbr] ? (
                  <span className="hidden sm:inline text-[10px] font-normal text-gray-500 ml-1">
                    — {abbreviations[abbr]}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        )}

        {/* Maker tip callout */}
        {currentStep.notes && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs sm:text-sm text-amber-950 leading-relaxed flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <span className="font-semibold text-amber-900">Maker tip: </span>
              {currentStep.notes}
            </div>
          </div>
        )}
      </section>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous */}
        <button
          type="button"
          onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
          disabled={isFirst}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border border-black/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-black/5"
          aria-label="Previous step"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Centre: last-step state or next */}
        {isLast ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(124, 154, 107, 0.15)',
                color: 'var(--color-sage-dark)',
              }}
              role="status"
              aria-live="polite"
            >
              🎉 Last step
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex(0)}
              className="text-xs font-semibold underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] focus-visible:ring-offset-2"
              style={{ color: 'var(--color-sage-dark)' }}
            >
              Back to first step
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setActiveIndex((i) => Math.min(i + 1, totalSteps - 1))}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] focus-visible:ring-offset-2 hover:brightness-105"
            style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
            aria-label="Next step"
          >
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Collapsible Materials & Terminology ───────────────────────────── */}
      {(hasMaterials || hasAbbrGlossary) && (
        <section
          aria-labelledby="guided-reference-heading"
          className="bg-white/80 rounded-3xl border border-black/5 overflow-hidden"
        >
          <button
            type="button"
            id="guided-reference-heading"
            onClick={() => setMaterialsOpen((o) => !o)}
            aria-expanded={materialsOpen}
            aria-controls="guided-reference-panel"
            className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] focus-visible:ring-inset"
          >
            <span className="text-sm font-bold" style={{ color: 'var(--color-charcoal)' }}>
              Materials, Tools &amp; Abbreviations
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${materialsOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {materialsOpen && (
            <div id="guided-reference-panel" className="px-6 pb-6 space-y-6 border-t border-black/5 pt-5">
              {/* Materials list */}
              {hasMaterials && (
                <div>
                  <h3
                    className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--color-charcoal-soft)' }}
                  >
                    Materials &amp; Tools
                  </h3>
                  <ul className="divide-y divide-black/5">
                    {materialsDetails.map((mat, index) => (
                      <li
                        key={index}
                        className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider shrink-0"
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              color: 'var(--color-charcoal-soft)',
                            }}
                          >
                            {mat.category}
                          </span>
                          <div>
                            <span className="font-semibold text-gray-900">{mat.item}</span>
                            {mat.notes && (
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{mat.notes}</p>
                            )}
                          </div>
                        </div>
                        {mat.quantity && (
                          <span className="sm:self-start text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-200/60 rounded-md px-2.5 py-1 shrink-0">
                            {mat.quantity}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Abbreviations glossary */}
              {hasAbbrGlossary && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-charcoal-soft)' }}
                    >
                      Stitch Abbreviations
                    </h3>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: 'rgba(124, 154, 107, 0.15)',
                        color: 'var(--color-sage)',
                      }}
                    >
                      {terminology} Terminology
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(abbreviations).map(([abbr, full]) => (
                      <div
                        key={abbr}
                        className="p-3 rounded-2xl bg-[#FAF7F0] border border-black/5 flex flex-col"
                      >
                        <span
                          className="font-bold text-xs uppercase tracking-wide"
                          style={{ color: 'var(--color-sage-dark)' }}
                        >
                          {abbr}
                        </span>
                        <span className="text-xs text-gray-700 mt-0.5">{full}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
