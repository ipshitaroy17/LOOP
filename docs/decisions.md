# LOOP — Decision Log

---

## Stack decisions

### Framework: Next.js with App Router
**Decision:** Next.js (latest via `create-next-app@latest`, landed on 16.4.5) with the App Router.  
**Rationale:** App Router is the current recommended pattern. TypeScript, Tailwind, ESLint, and `src/` directory layout all scaffolded by the official CLI.

### Styling: Tailwind CSS v4
**Decision:** Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`; no `tailwind.config.ts`).  
**Rationale:** The scaffold generated Tailwind v4. Following the generated setup avoids configuration drift. LOOP's design tokens (palette, fonts) are placed in `globals.css` inside the `@theme inline` block per v4 convention.

### Fonts: system font stack
**Decision:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", ...` — no external font CDN.  
**Rationale:** The sandbox environment has no outbound network access. Any web font loaded from Google Fonts or another CDN would silently fail or cause build warnings. System fonts are universally available, load instantly, are WCAG-accessible, and look clean on all major operating systems. This decision should be revisited before the core release to test whether Geist or another web font can load reliably in the production environment.

### Database: Supabase (planned)
**Decision:** Supabase for auth and PostgreSQL.  
**Rationale:** Provides auth, row-level security, and a managed Postgres database in one service. Keys are blank in `.env.example`; no connection is made in Day 1.

---

## Scope decisions

### US crochet terminology as default
**Decision:** All patterns use US crochet terminology and label this clearly.  
**Rationale:** US terminology is the most common system in online crochet content. UK/international variants differ on key stitch names (e.g., UK "double crochet" = US "single crochet"). Clear labelling prevents confusion. International variants are a post-core consideration.

### One video per project (core release)
**Decision:** Each project has exactly one tutorial video in the core release.  
**Rationale:** Keeps the data model straightforward. The `tutorials` table supports multiple videos per project for future expansion.

### Verified timestamp mappings only
**Decision:** Step-to-video timestamp links are only shown when `verified = true` in `step_video_mappings`.  
**Rationale:** Unverified or algorithmically generated mappings could mislead learners. Trust is established by manual review before display.

### No automatic step completion from video
**Decision:** Watching past a timestamp never marks a step complete. Learners mark steps done explicitly.  
**Rationale:** Learners may re-watch steps multiple times. Automatic completion would create a false record and undermine the learner's sense of agency.

### Progress fields are distinct
**Decision:** Video position (`video_position_seconds`), selected step (`selected_step_id`), and step completion (`step_completions`) are stored separately.  
**Rationale:** These represent three different things. Conflating them would require awkward workarounds and make future features (e.g., resume from last position) harder to build correctly.

### No fabricated content
**Decision:** No placeholder testimonials, popularity statistics, or fake integrations on any page.  
**Rationale:** Accuracy and honesty are core product values. Fake social proof would need to be removed before launch and could mislead early testers.

---

## Open decisions

| Decision | Status | Notes |
|----------|--------|-------|
| AI tutor provider | Open | Planned for core release. Provider (Gemini, OpenAI, etc.), spending limits, and rate-limiting strategy not yet decided. |
| First project content | Open | Which three projects to curate, who authors them, and what permissions apply. |
| First project video permissions | Open | Original recording vs. embedded third-party video; licensing implications TBD. |
| Web font for core release | Open | System fonts used in Day 1. Test Geist or similar in the production environment before committing to a web font. |
| Deployment target | Open | Vercel is a natural fit for Next.js; cost and data-residency implications to be evaluated. |
