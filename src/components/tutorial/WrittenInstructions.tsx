import type { MaterialItem, PatternStep } from '@/lib/tutorials/types';

export interface WrittenInstructionsProps {
  terminology: string;
  materialsDetails?: MaterialItem[];
  abbreviations?: Record<string, string>;
  steps?: PatternStep[];
  patternSourceTitle?: string | null;
  patternSourceAuthor?: string | null;
  patternLicense?: string | null;
  className?: string;
}

export default function WrittenInstructions({
  terminology,
  materialsDetails = [],
  abbreviations = {},
  steps = [],
  patternSourceTitle,
  patternSourceAuthor,
  patternLicense,
  className = '',
}: WrittenInstructionsProps) {
  // Sort steps deterministically by stepNumber
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  const hasSteps = sortedSteps.length > 0;
  const hasMaterials = materialsDetails && materialsDetails.length > 0;
  const hasAbbreviations = abbreviations && Object.keys(abbreviations).length > 0;

  // Empty state: honest availability notice when no steps are written yet
  if (!hasSteps) {
    return (
      <section
        className={`p-6 sm:p-8 rounded-3xl border ${className}`}
        style={{
          backgroundColor: 'rgba(195, 177, 212, 0.12)',
          borderColor: 'var(--color-lilac)',
        }}
        aria-label="Written instructions status"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-purple-950 mb-1">
              Written instructions — coming soon
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-purple-900">
              Step-by-step written instructions, materials lists, and stitch counts for this lesson
              are currently in preparation. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* ── Materials and Tools Breakdown ────────────────────────────────── */}
      {hasMaterials ? (
        <section
          aria-labelledby="written-materials-heading"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2
              id="written-materials-heading"
              className="text-lg sm:text-xl font-bold flex items-center gap-2.5"
              style={{ color: 'var(--color-charcoal)' }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: 'var(--color-sage)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Materials &amp; Tools Needed
            </h2>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(124, 154, 107, 0.15)',
                color: 'var(--color-sage-dark)',
              }}
            >
              {materialsDetails.length} {materialsDetails.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <ul className="divide-y divide-black/5">
            {materialsDetails.map((mat, index) => (
              <li
                key={index}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-sm"
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
        </section>
      ) : (
        /* Handled cleanly when materialsDetails is not specified */
        <section
          aria-label="Materials notice"
          className="bg-white/80 rounded-2xl p-5 border border-black/5 text-xs text-gray-600"
        >
          <p className="font-semibold text-gray-800 mb-0.5">Materials &amp; Hook</p>
          <p>
            Standard crochet yarn and a suitable hook matching your yarn weight are recommended for this tutorial.
          </p>
        </section>
      )}

      {/* ── Abbreviations Glossary ──────────────────────────────────────── */}
      {hasAbbreviations && (
        <section
          aria-labelledby="written-abbreviations-heading"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2
              id="written-abbreviations-heading"
              className="text-base sm:text-lg font-bold flex items-center gap-2"
              style={{ color: 'var(--color-charcoal)' }}
            >
              Stitch Abbreviations Used
            </h2>
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
        </section>
      )}

      {/* ── Ordered Pattern Steps ────────────────────────────────────────── */}
      <section aria-labelledby="pattern-steps-heading">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2
            id="pattern-steps-heading"
            className="text-xl sm:text-2xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Step-by-Step Instructions
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            {sortedSteps.length} {sortedSteps.length === 1 ? 'step' : 'steps'} total
          </span>
        </div>

        <ol className="space-y-5" aria-label="Pattern instructions list">
          {sortedSteps.map((step) => (
            <li
              key={step.id || step.stepNumber}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5 transition-all hover:border-black/10 focus-within:ring-2 focus-within:ring-[#7C9A6B]"
              tabIndex={0}
              aria-label={`Step ${step.stepNumber}: ${step.title}`}
            >
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 shadow-xs"
                    style={{
                      backgroundColor: 'var(--color-sage)',
                      color: '#1F1F1F',
                    }}
                    aria-hidden="true"
                  >
                    {step.stepNumber}
                  </span>
                  <h3
                    className="text-base sm:text-lg font-bold"
                    style={{ color: 'var(--color-charcoal)' }}
                  >
                    {step.title}
                  </h3>
                </div>

                {step.stitchCount && (
                  <div className="sm:self-center pl-11 sm:pl-0">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                      {step.stitchCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Step Instruction Body */}
              <p className="text-sm sm:text-base leading-relaxed text-gray-800 pl-0 sm:pl-11 mb-3">
                {step.instruction}
              </p>

              {/* Step Abbreviations Tags */}
              {step.abbreviations && step.abbreviations.length > 0 && (
                <div className="pl-0 sm:pl-11 flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Stitches:
                  </span>
                  {step.abbreviations.map((abbr) => (
                    <span
                      key={abbr}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FAF7F0] border border-black/5 text-[#5E7A50]"
                    >
                      {abbr}
                    </span>
                  ))}
                </div>
              )}

              {/* Step Notes / Tip Callout */}
              {step.notes && (
                <div className="mt-3 sm:ml-11 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs sm:text-sm text-amber-950 leading-relaxed flex items-start gap-2.5">
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
                    {step.notes}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* ── Pattern Attribution Card ────────────────────────────────────── */}
      <section className="bg-white/70 rounded-2xl p-6 border border-black/5 text-xs text-gray-600 leading-relaxed">
        <h4 className="font-semibold text-gray-800 mb-1">Pattern Attribution &amp; Credits</h4>
        <p>
          {patternSourceTitle ? (
            <>
              Pattern: <span className="font-medium text-gray-900">{patternSourceTitle}</span>
              {patternSourceAuthor && <> by {patternSourceAuthor}</>}.
            </>
          ) : (
            <>LOOP Educational Pattern Curriculum.</>
          )}
          {patternLicense && <> Licensed under {patternLicense}.</>}
        </p>
      </section>
    </div>
  );
}

