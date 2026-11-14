const modes = [
  {
    emoji: "▶",
    emojiLabel: "play button",
    title: "Watch",
    colour: "bg-butter",
    description: (
      <>
        Follow a curated project video at your own pace. Pause, rewind, and re-watch any step as many times as you need — no pressure, no timer.
      </>
    ),
  },
  {
    emoji: "📄",
    emojiLabel: "document",
    title: "Read",
    colour: "bg-lilac",
    description: (
      <>
        Read the full written pattern in clear US crochet terminology. Every abbreviation is explained, so you always know exactly what a stitch means.
      </>
    ),
  },
  {
    emoji: "✦",
    emojiLabel: "star",
    title: "Follow",
    colour: "bg-blush",
    description: (
      <>
        Work through the pattern one step at a time with guided prompts. Mark each step done yourself — loop never marks a step complete on your behalf.
      </>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="w-full py-20 px-6 bg-white"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="how-heading"
          className="text-3xl sm:text-4xl font-display font-bold text-center mb-4 text-ink"
        >
          How loop works
        </h2>
        <p
          className="text-center max-w-xl mx-auto mb-14 text-lg font-body"
          style={{ color: "var(--color-charcoal-soft)" }}
        >
          Every project in loop has three connected learning modes. Switch
          between them freely — they all use the same pattern steps, so nothing
          gets out of sync.
        </p>

        <ol className="grid gap-8 sm:grid-cols-3 list-none p-0">
          {modes.map(({ emoji, emojiLabel, title, colour, description }) => (
            <li
              key={title}
              className="flex flex-col items-center text-center rounded-[28px] p-8 shadow-[0_4px_24px_rgba(46,42,54,0.06)] border border-ink/5"
              style={{ backgroundColor: "var(--color-cream)" }}
            >
              {/* Coloured icon chip */}
              <span
                className={`${colour} rounded-full w-14 h-14 flex items-center justify-center text-2xl mb-5`}
                role="img"
                aria-label={emojiLabel}
              >
                {emoji}
              </span>

              <h3
                className="text-xl font-display font-bold mb-3 text-ink"
              >
                {title}
              </h3>

              <div
                className="text-sm leading-relaxed font-body"
                style={{ color: "var(--color-charcoal-soft)" }}
              >
                {description}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
