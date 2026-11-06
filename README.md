# LOOP

**Learn it. Loop it. Make it.**

LOOP is a crochet learning platform with three connected learning modes:
embedded video, written patterns, and guided steps. Every project in LOOP
keeps these three modes in sync so you can switch between them freely.

---

## What LOOP is

A crochet learner can open any project and choose how to follow it:

- **Watch** — an embedded video they can pause and rewind freely.
- **Read** — a full written pattern in US crochet terminology, with every
  abbreviation explained.
- **Follow** — a guided step-by-step view where the learner marks each step
  complete themselves.

Watching a video never automatically completes a step. Progress is explicit
and belongs to the learner.

---

## Local setup

### Prerequisites

| Tool | Version used |
|------|-------------|
| Node.js | v24.15.0 |
| npm | 11.12.1 |
| Git | 2.53.0.windows.2 |

### Installed package versions

| Package | Version |
|---------|---------|
| next | 16.4.5 |
| react | 19.3.0 |
| react-dom | 19.3.0 |
| tailwindcss | ^4 (v4 series) |
| typescript | ^5 |
| eslint | ^9 |
| eslint-config-next | 16.4.5 |

### Clone and run

```bash
git clone <your-repo-url>
cd loop
npm install
npm run dev
```

The dev server starts at [http://localhost:3000](http://localhost:3000).

### Available scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Starts the local development server (Turbopack) |
| `npm run build` | Produces an optimised production build |
| `npm start` | Serves the production build locally |
| `npm run lint` | Runs ESLint across the project |
| `npm run typecheck` | Runs TypeScript without emitting files (`tsc --noEmit`) |

### Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values when you
reach Day 2. The landing page works without any credentials today.

```bash
cp .env.example .env.local
```

---

## Day 1 scope

Day 1 establishes the **project foundation** only:

- Next.js 16 project scaffolded with TypeScript, Tailwind CSS v4, ESLint,
  App Router, `src/` directory, and the `@/*` import alias.
- Responsive landing page: LOOP wordmark, tagline, three-mode explanation,
  LOOP colour palette, accessible focus styles, reduced-motion support.
- Project documentation: README, product plan, status tracker, decision log.
- `.env.example` with blank Supabase keys.
- Local Git checkpoint commit.

### Current limitations (Day 1)

- No authentication, database, or Supabase connection.
- No video playback, written patterns, or guided steps.
- No AI tutor — planned, not built.
- No image upload or image-based features.
- No real user accounts or progress tracking.
- No sign-in UI — no nonfunctional buttons are shown.
- Fonts: system font stack (`system-ui`, platform defaults). Web fonts
  were not tested; system fonts were chosen for reliability in this
  environment. See `docs/decisions.md` for the rationale.
