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

### Database: Supabase Integration (Day 2)
**Decision:** Use Supabase PostgreSQL with `@supabase/ssr` and `@supabase/supabase-js`.  
**Architecture & Security Decisions:**
- **Client Separation:** Browser client (`src/lib/supabase/client.ts`) and Server client (`src/lib/supabase/server.ts`) are separated. Server client uses Next.js 15+ asynchronous `cookies()` from `next/headers` with `getAll()` and `setAll()` methods.
- **Publishable Key Only:** All browser and public server calls use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`). No service-role key or secret keys are introduced into client-facing code.
- **Graceful Unconfigured Degradation:** Environment configuration is read and validated lazily via `src/lib/supabase/config.ts`. If `.env.local` is missing or contains placeholders, the public landing page continues to build and serve without runtime exceptions.
- **Row Level Security (RLS):** Every public table has RLS enabled with explicit `USING` and `WITH CHECK` clauses preventing user ID spoofing or ownership transfer. Public table grants are revoked and restricted to needed verbs (e.g. `SELECT` only on `projects`).
- **Provisional Step Modeling:** Step progress in `learning_progress` uses string identifier arrays (`completed_step_identifiers text[]`) until dedicated `pattern_steps` relational tables are built in subsequent milestones.
- **Automatic Profile Provisioning:** A `security definer` trigger `handle_new_user()` on `auth.users` creates an initial profile record on signup, with a fixed `search_path = public, auth, pg_temp` to prevent search path hijacking.

### Build toolchain: Turbopack for production build and development
**Decision:** Configure standard `"build": "next build"` in `package.json`.  
**Observed Build Behavior & Context:**
- **Restricted Environment:** When running `next build` inside the restricted sandbox environment, Turbopack failed during asset emission with:
  ```
  TurbopackInternalError: Failed to write app endpoint /page
  Caused by:
  - [project]/src/app/globals.css.css [app-client] (css)
  - creating new process
  - node process exited before we could connect to it with exit code: 0
  ```
- **The `--webpack` Side-Effect:** A temporary workaround using `"next build --webpack"` exited 0, but because the project is configured with `@tailwindcss/turbopack` and lacks `@tailwindcss/postcss` / `postcss.config.mjs`, Webpack omitted the Tailwind v4 utility classes from the final CSS output (`@layer utilities { @tailwind utilities; }` was output uncompiled), resulting in an unstyled page in the browser.
- **Unrestricted Environment:** Running `next build` (Turbopack) in an unrestricted execution environment succeeds cleanly (exit code 0 in ~3.9s), generating the complete CSS bundle (`.next/static/chunks/*.css`, ~14.7 KB) containing all Tailwind utility classes and LOOP design tokens. Standard `next build` is restored.

### Contrast: Text and Focus Rings on Sage and Cream Surfaces
**Decision:** Use `#1F1F1F` for text on sage (`#7C9A6B`) interactive buttons and links, and use a charcoal (`#2D2D2D`) outline with a 2px offset for `:focus-visible`.  
**Rationale & Computed Contrast Ratios:**
- **Text on Sage:** WCAG 2.1 AA (SC 1.4.3) requires a minimum contrast ratio of 4.5:1 for normal-sized text (under 18pt regular or 14pt bold). Button labels are text elements and do not qualify for the lower 3:1 non-text threshold:
  - White (`#FFFFFF`) on sage (`#7C9A6B`) yields **3.14:1** (fails 4.5:1).
  - Charcoal (`#2D2D2D`) on sage (`#7C9A6B`) yields **4.39:1** (fails the 4.5:1 normal text requirement).
  - Dark (`#1F1F1F`) on sage (`#7C9A6B`) yields **5.25:1** (passes WCAG 2.1 AA).
  - On hover with `brightness-105` (`#82A170`), `#1F1F1F` yields **5.71:1** (passes WCAG 2.1 AA).
- **Focus Rings:** WCAG 2.1 AA (SC 1.4.11) requires a minimum contrast ratio of 3:1 for user interface focus indicators against adjacent surfaces:
  - A sage focus ring (`#7C9A6B`) against the cream background (`#FAF7F0`) yields only **2.93:1** (fails the 3:1 non-text threshold).
  - A charcoal (`#2D2D2D`) focus ring with a 2px offset yields **12.87:1** against cream (`#FAF7F0`), **4.39:1** against sage buttons (`#7C9A6B`), and **13.77:1** against white cards, comfortably exceeding 3:1 on all backgrounds.

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

### RLS Test Script: use explicit table output, not RAISE NOTICE
**Problem:** The original `rls_verification.sql` used `RAISE NOTICE` to report pass/fail messages and `rollback` to clean up. The Supabase SQL Editor does not display `RAISE NOTICE` output — it only shows query result rows. When the script ran, the output was "Success. No rows returned", which gave no evidence of which checks passed or failed. It also swallowed some potential failures: check 1.3 (anonymous reads profiles) catches any exception and prints PASS unconditionally whether the exception was a permissions error or something unrelated.

**Fix:** Rewrote `supabase/tests/rls_verification.sql`:
- Each check records its own boolean pass flag and failure detail string; no assertion swallows a failure silently.
- After all checks run, results are inserted into a temporary table (`rls_test_results`) with explicit `PASS` / `FAIL: <reason>` status per row.
- The final `SELECT` returns a visible results table in the SQL Editor Results tab.
- If any check fails, the script raises an exception so the overall SQL result is an error (not silent success).
- Cleanup is done by explicit `DELETE` before and after (not `rollback`), so the results table persists for inspection.
- Check count corrected to 12 (not 8): 4 anonymous + 8 authenticated. The earlier "8/8" summary was a counting error.


| Decision | Status | Notes |
|----------|--------|-------|
| AI tutor provider | Open | Planned for core release. Provider (Gemini, OpenAI, etc.), spending limits, and rate-limiting strategy not yet decided. |
| First project content | Open | Which three projects to curate, who authors them, and what permissions apply. |
| First project video permissions | Open | Original recording vs. embedded third-party video; licensing implications TBD. |
| Web font for core release | Open | System fonts used in Day 1. Test Geist or similar in the production environment before committing to a web font. |
| Deployment target | Open | Vercel is a natural fit for Next.js; cost and data-residency implications to be evaluated. |
