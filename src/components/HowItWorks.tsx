const modes = [
  {
    icon: (
      <svg className="w-5 h-5 text-ink ml-0.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    title: 'Watch',
    bgColour: 'bg-butter-light',
    iconBg: 'bg-butter',
    description:
      'Follow a curated project video at your own pace. Pause, rewind and re-watch any step as many times as you need. No pressure, no timer.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: 'Read',
    bgColour: 'bg-lilac-light',
    iconBg: 'bg-lilac',
    description:
      'Read the full written pattern in clear US crochet terminology. Every abbreviation is explained, so you always know exactly what a stitch means.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: 'Follow',
    bgColour: 'bg-blush-light',
    iconBg: 'bg-blush',
    description:
      'Work through the pattern one step at a time with guided prompts. Mark each step done yourself. loop never marks a step complete on your behalf.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="w-full py-20 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <h2
          id="how-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center mb-4 text-ink"
        >
          How loop works
        </h2>
        <p
          className="text-center max-w-xl mx-auto mb-14 text-base sm:text-lg font-body leading-relaxed text-ink/75"
        >
          Every project in loop has three connected learning modes. Switch
          between them freely. They all use the same pattern steps, so nothing
          gets out of sync.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {modes.map(({ icon, title, bgColour, iconBg, description }) => (
            <div
              key={title}
              className={`flex flex-col items-start rounded-[28px] p-8 shadow-[0_4px_24px_rgba(46,42,54,0.04)] border border-ink/5 ${bgColour} transition-transform hover:-translate-y-1 duration-200`}
            >
              {/* Icon badge */}
              <div
                className={`${iconBg} rounded-full w-12 h-12 flex items-center justify-center mb-6 shadow-xs shrink-0`}
              >
                {icon}
              </div>

              <h3 className="text-2xl font-display font-bold mb-3 text-ink">
                {title}
              </h3>

              <p className="text-sm sm:text-base leading-relaxed font-body text-ink/80">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
