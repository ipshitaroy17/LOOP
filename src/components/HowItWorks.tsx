const modes = [
  {
    emoji: "▶",
    emojiLabel: "play button",
    title: "Watch",
    colour: "bg-[#F5D87E]", // butter
    description:
      "Follow a curated project video at your own pace. Pause, rewind, and re-watch any step as many times as you need — no pressure, no timer.",
  },
  {
    emoji: "📄",
    emojiLabel: "document",
    title: "Read",
    colour: "bg-[#C3B1D4]", // lilac
    description:
      "Read the full written pattern in clear US crochet terminology. Every abbreviation is explained, so you always know exactly what a stitch means.",
  },
  {
    emoji: "✦",
    emojiLabel: "star",
    title: "Follow",
    colour: "bg-[#E8B4B8]", // pink
    description:
      "Work through the pattern one step at a time with guided prompts. Mark each step done yourself — LOOP never marks a step complete on your behalf.",
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
          className="text-3xl font-bold text-center mb-4"
          style={{ color: "var(--color-charcoal)" }}
        >
          How LOOP works
        </h2>
        <p
          className="text-center max-w-xl mx-auto mb-14 text-lg"
          style={{ color: "var(--color-charcoal-soft)" }}
        >
          Every project in LOOP has three connected learning modes. Switch
          between them freely — they all use the same pattern steps, so nothing
          gets out of sync.
        </p>

        <ol className="grid gap-8 sm:grid-cols-3 list-none p-0">
          {modes.map(({ emoji, emojiLabel, title, colour, description }) => (
            <li
              key={title}
              className="flex flex-col items-center text-center rounded-2xl p-8 shadow-sm border border-black/5"
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
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--color-charcoal)" }}
              >
                {title}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--color-charcoal-soft)" }}
              >
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
