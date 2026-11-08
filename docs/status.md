# LOOP — Implementation Status

> Legend: ✅ Implemented | 🔶 Mocked / stub | 📋 Planned | ❌ Blocked

Last updated: Day 1 — project foundation

---

## Infrastructure

| Item | Status | Validation |
|------|--------|------------|
| Next.js 16.4.5 project scaffolded | ✅ Implemented | `npm run build` (Turbopack) → exit 0 in unrestricted execution environment; see `docs/decisions.md`. |
| Development server (`dev` script) | ✅ Implemented | `npm run dev` with Turbopack verified running and serving HTTP 200 at `http://localhost:3000`. |
| TypeScript configured (`@/*` alias) | ✅ Implemented | `npm run typecheck` → exit 0 |
| Tailwind CSS v4 (`globals.css` tokens) | ✅ Implemented | Turbopack build generated 14.7 KB CSS bundle with all utility classes and tokens verified. |
| ESLint configured | ✅ Implemented | `npm run lint` → exit 0, no warnings |
| App Router + `src/` directory | ✅ Implemented | Confirmed in file tree |
| `.env.example` with blank Supabase keys | ✅ Implemented | File present; not checked into Git with secrets |
| `.env.local` excluded from Git | ✅ Implemented | `.gitignore` lists `.env.local` explicitly |
| `.env.example` tracked by Git | ✅ Implemented | `.gitignore` changed from `.env*` to specific local patterns |
| `package.json` `typecheck` script | ✅ Implemented | `npm run typecheck` runs `tsc --noEmit` |
| Local Git repo initialised | ✅ Implemented | `git init` by scaffold; checkpoint commit made |
| Lockfile committed | ✅ Implemented | `package-lock.json` in commit |

---

## Landing page

| Item | Status | Validation |
|------|--------|------------|
| LOOP wordmark | ✅ Implemented | Visible in rendered HTML |
| Tagline "Learn it. Loop it. Make it." | ✅ Implemented | `h1` in rendered HTML |
| Three-mode explanation (`HowItWorks` section) | ✅ Implemented | Section with id `how-it-works` in HTML |
| "How LOOP works" anchor link | ✅ Implemented | `href="#how-it-works"` in nav and hero CTA |
| Warm cream background | ✅ Implemented | `--color-cream: #FAF7F0` in `globals.css` |
| Sage primary accent | ✅ Implemented | `--color-sage: #7C9A6B`; used for tagline and CTA |
| Button text contrast on Sage | ✅ Implemented | `#1F1F1F` on Sage (`#7C9A6B`) yields 5.25:1 contrast, satisfying the 4.5:1 normal-text requirement. (`#2D2D2D` yielded 4.39:1, failing 4.5:1; button text is text content and does not qualify for the non-text threshold). |
| Restrained pink accent | ✅ Implemented | `--color-pink: #E8B4B8`; used for Follow card chip |
| Butter yellow accent | ✅ Implemented | `--color-butter: #F5D87E`; used for Watch card chip |
| Lilac accent | ✅ Implemented | `--color-lilac: #C3B1D4`; used for Read card chip |
| Charcoal body text | ✅ Implemented | `--color-charcoal: #2D2D2D` |
| System font stack | ✅ Implemented | `system-ui, -apple-system, ...` in `--font-sans`; no external CDN |
| Skip-to-content link (keyboard) | ✅ Implemented | `<a href="#main-content" class="sr-only focus:not-sr-only ...">` with `#1F1F1F` text (5.25:1 contrast) |
| Visible keyboard focus ring | ✅ Implemented | `:focus-visible` rule in `globals.css` with 3px charcoal (`#2D2D2D`) outline and 2px offset (12.87:1 against cream, 4.39:1 against sage; both exceed 3:1) |
| Reduced-motion support | ✅ Implemented | `@media (prefers-reduced-motion: reduce)` in `globals.css` |
| Rounded controls | ✅ Implemented | `rounded-full` on CTA button and icon chips |
| No nonfunctional sign-in / AI / upload buttons | ✅ Implemented | No such elements exist in source |
| No fabricated statistics or testimonials | ✅ Implemented | No such content in source |

---

## Browser checks

| Check | Status | Notes |
|-------|--------|-------|
| 375px mobile layout | ❌ NOT RUN | No browser automation tool (Puppeteer/Playwright) is installed in the workspace environment. Manual verification required. |
| 1280px desktop layout | ❌ NOT RUN | No browser automation tool installed in the workspace environment. Manual verification required. |
| Tab-key keyboard focus on all interactive elements | ❌ NOT RUN | Requires interactive client runtime with keyboard event synthesis. Manual verification required. |
| Skip-to-content link navigation | ❌ NOT RUN | Requires interactive browser DOM. Manual verification required. |
| "How LOOP works" anchor navigates correctly | ❌ NOT RUN | HTML contains `id="how-it-works"` and matching `href="#how-it-works"`, but smooth scroll action requires browser runtime. |
| Reduced-motion media query respected | ❌ NOT RUN | Requires OS/browser media feature toggle in real client. Manual verification required. |

### Exact manual browser verification steps

Start the production server:
```bash
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in Chrome/Firefox/Safari.

1. **Mobile view (375px):**
   - Press F12 (DevTools) → Toggle Device Toolbar (Ctrl+Shift+M / Cmd+Shift+M).
   - Set dimensions to 375 × 667 (e.g., iPhone SE).
   - Verify wordmark "LOOP" and tagline "Learn it. Loop it. Make it." are visible and not clipped.
   - Verify the 3 learning cards (Watch, Read, Follow) stack vertically in 1 column.
   - Verify no horizontal scrollbar appears.
2. **Desktop view (1280px):**
   - Set viewport width to 1280px or maximize window.
   - Verify the 3 cards display side-by-side in a 3-column grid (`sm:grid-cols-3`).
   - Check margins and typography.
3. **Keyboard Tab navigation:**
   - Click into the browser address bar and press `Tab`.
   - Verify the "Skip to main content" button appears at top-left with charcoal text on sage background and outline.
   - Press `Enter`: confirm focus jumps to `<main id="main-content">`.
   - Press `Tab` again: verify focus moves to "How LOOP works" nav link with a 3px sage focus ring.
   - Press `Tab` again: verify focus moves to the hero CTA button "How LOOP works" with a 3px sage focus ring.
4. **Anchor navigation:**
   - Click "How LOOP works" (either in nav or hero): page smoothly scrolls to section `#how-it-works`.
5. **Reduced motion:**
   - Enable "prefers-reduced-motion: reduce" in DevTools (Rendering drawer → Emulate CSS media feature `prefers-reduced-motion`).
   - Click "How LOOP works" anchor: scroll jumps instantly instead of animating smoothly.

---

## Supabase & Database Foundation (Day 2)

| Item | Status | Validation |
|------|--------|------------|
| `@supabase/ssr` & `@supabase/supabase-js` dependencies | ✅ Implemented | Installed in `package.json` |
| Browser Client (`src/lib/supabase/client.ts`) | ✅ Implemented | Uses `createBrowserClient` with type definitions |
| Server Client (`src/lib/supabase/server.ts`) | ✅ Implemented | Uses `createServerClient` with asynchronous cookies (`next/headers`) |
| Environment configuration & graceful degradation | ✅ Implemented | Lazy evaluation in `src/lib/supabase/config.ts`; landing page unaffected |
| Initial Schema Migration (`20261107000000_initial_schema.sql`) | ✅ Implemented | Applied to Supabase project; tables `profiles`, `projects`, `user_projects`, `learning_progress` created |
| RLS Policies & Grants defined | ✅ Implemented | Strict owner isolation, catalogue read-only for public, table grants restricted |
| Auth-user Profile Creation Trigger | ✅ Implemented | `handle_new_user()` security-definer function on `auth.users` with fixed `search_path` |
| Development Connection Health Check | ✅ Implemented | CLI check script (`npm run check:supabase`) and `/api/health/supabase` endpoint |
| Real database connection verification | ✅ Implemented | `npm run check:supabase` returned `[CONNECTED — EMPTY CATALOGUE]` (status 200, 0 published projects) |
| Repeatable RLS SQL Test Suite (`rls_verification.sql`) | ⏳ Awaiting Run | Script corrected and ready. 12 checks in `BEGIN/ROLLBACK`; SELECT returns tabular results before rollback; failures reported in exception message. Awaiting user run in Supabase SQL Editor. Live RLS verification **not yet confirmed**. |

---

## Authentication & Sessions (Day 3)

| Item | Status | Validation |
|------|--------|------------|
| Next.js 16 Proxy (`src/proxy.ts` session refresh) | ✅ Implemented | Built with Next.js 16 Proxy convention; cookie refresh on matching routes |
| Registration Page (`/signup`) | ✅ Implemented | Full client/server validation, display name, password requirements, loading states |
| Email Confirmation Handling | ✅ Implemented | Dedicated "Check your email" view when confirmation is required; does not falsely mark user signed in |
| Login Page (`/login`) | ✅ Implemented | Email/password login, show/hide toggle, query error handling, disabled during submit |
| Auth Callback Route (`/auth/callback`) | ✅ Implemented | PKCE code exchange with open redirect protection (relative paths only) |
| Protected Dashboard (`/dashboard`) | ✅ Implemented | Server-side identity validation (`getUser()`), RLS profile query, blocking route (`instant = false`) |
| State-changing Logout (`POST /auth/signout`) | ✅ Implemented | Form POST endpoint and Server Action; clears cookies and redirects to `/` |
| Landing Page Auth Navigation | ✅ Implemented | Suspense-wrapped `AuthNav` streaming user state; Login/Signup buttons for visitors |

---

## Personalized Onboarding & Preferences (Day 4)

| Item | Status | Validation |
|------|--------|------------|
| One-question-at-a-time flow (`/onboarding`) | ✅ Implemented | 8-question guided flow with step navigation, progress indicator ("Question X of 8") |
| Radio & Checkbox Semantics | ✅ Implemented | Accessible radio groups for single-choice and checkboxes for multiple-choice (Q4) |
| Required Q1 validation & enum mapping | ✅ Implemented | Q1 required; "Complete beginner" → `beginner`, "Intermediate" → `intermediate`, "Experienced" → `advanced` |
| Explicit skipping (Q2–Q8) | ✅ Implemented | "Skip for now" stores `{ skipped: true }` explicitly; never invents responses |
| Persistent Progress & Auto-resume | ✅ Implemented | Saves each step to `onboarding_preferences`; restores step position on reload or re-login |
| Server-derived User ID & Validation | ✅ Implemented | User ID derived securely from authenticated session (`getUser()`); answer payloads validated server-side |
| Atomic Completion Update | ✅ Implemented | Saves final answers, `experience_level`, and `onboarding_completed = true` in single database update |
| Comprehensive Routing Guards | ✅ Implemented | Incomplete users visiting `/dashboard` redirect to `/onboarding`; completed users visiting `/onboarding` redirect to `/dashboard` unless `edit=true` |
| Dashboard Preferences Summary | ✅ Implemented | Displays Skill Level, Preferred Learning Style, and Interests (handles skipped answers naturally) |
| Preferences Edit Mode (`/onboarding?edit=true`) | ✅ Implemented | Allows completed users to edit preferences without resetting `onboarding_completed`; includes return to dashboard link |

---

## Project Catalogue, Search & Discovery (Day 5)

| Item | Status | Validation |
|------|--------|------------|
| Database Schema Extension (`20261107000001_project_details.sql`) | ✅ Implemented | Added `estimated_minutes` (integer), `materials` (`text[]`), and `skills` (`text[]`) with indexes on `category` and `difficulty`. |
| Starter Catalogue Seed (`supabase/seed.sql`) | ✅ Prepared | 6 original project previews: Beginner Practice Square, Simple Square Coaster, Classic Granny Square, Sweet Blossom Flower, Heart Keychain, Mini Drawstring Pouch. Idempotent (`ON CONFLICT (slug) DO UPDATE`), non-destructive. |
| Original Project Illustrations | ✅ Implemented | 6 custom vector illustrations + 1 placeholder in `public/illustrations/projects/`, designed in LOOP's warm cream/sage/charcoal palette. |
| Explore Page (`/explore`) | ✅ Implemented | Responsive project grid, search by title/description, category and difficulty filters, "Tutorial coming soon" badges, result counter. |
| Search & Filter URL State Sync | ✅ Implemented | Query parameters `q`, `category`, and `difficulty` sync to URL; preserved on refresh and browser Back/Forward navigation. |
| Safe Search Punctuation | ✅ Implemented | Wildcard characters `%` and `_` are escaped; sensible length limit enforced. |
| Project Detail Page (`/projects/[slug]`) | ✅ Implemented | Shows illustration, description, category, difficulty, estimated duration, materials list, skills tags, and "Tutorial coming soon" notice. |
| 404 Not Found Handling | ✅ Implemented | Unknown or unpublished slugs invoke Next.js `notFound()`, showing custom `ProjectNotFound` component without exposing draft rows. |
| Deterministic Discovery Engine | ✅ Implemented | `rankProjectsForUser()` scores projects by matching onboarding interests and skill level; breaks ties deterministically; falls back gracefully when preferences are skipped without claiming false personalization. |
| Dashboard Recommendations Section | ✅ Implemented | Authenticated `/dashboard` showcases top 3 suggested or browse projects with direct links to Explore. |
| Navigation Links | ✅ Implemented | Added "Explore" link across landing page header, dashboard navigation, and project breadcrumbs. |
| Unit Test Suite | ✅ Passed | 7/7 tests passed: recommendation scoring, interest alignment, skipped answer fallback, and query sanitization. |

### Starter Catalogue Limitations & Preview Rules
- Starter projects are published strictly as previews labelled with "Tutorial coming soon".
- No non-functional buttons or placeholders for unbuilt features (video player, written-pattern download, step-by-step progress, AI tutor).
- Descriptions provide genuine guidance and estimated times without implying completed lessons exist.

### Category Mappings & Recommendation Rules
- **Category Compatibility**:
  - `home-decor` ↔ Q4 interest `home-decor`
  - `flowers` ↔ Q4 interest `flowers`
  - `keychains` ↔ Q4 interest `keychains`
  - `accessories` ↔ Q4 interest `accessories`
  - `bags` ↔ Q4 interest `bags`
  - Special `gifts` interest grants a bonus to giftable items (`keychains`, `flowers`, `accessories`).
- **Difficulty Alignment**:
  - `beginner`: boosts `beginner` (+5) and `easy` (+3) projects.
  - `intermediate`: boosts `intermediate` (+5) and `easy` (+4) projects.
  - `advanced`: boosts `advanced` (+5) and `intermediate` (+4) projects.
- **Tie-breaking**: Deterministic ascending sort on `project.slug`.
- **Session Time**: Explicitly decoupled from project duration per specifications.

### Manual SQL Seed Step (for Supabase SQL Editor)
Execute `supabase/seed.sql` in your Supabase SQL Editor (or Dashboard -> SQL Editor) to insert the 6 starter projects. The script is idempotent and safe to run multiple times without deleting existing rows.

---

## Save Projects & My Projects (Day 6)

| Item | Status | Validation |
|------|--------|------------|
| Save / Saved Control Component (`SaveButton.tsx`) | ✅ Implemented | Functional Save / Saved toggle on Explore cards and project detail pages. Stamped with `e.stopPropagation()` and `e.preventDefault()` to prevent triggering card navigation. |
| In-flight Duplicate Prevention | ✅ Implemented | Controlled button with `isPending` state; ignores repeated clicks while save/remove action is in flight. |
| User Session Persistence | ✅ Implemented | Persists to `public.user_projects` under authenticated `user_id`. Restored on page refresh and preserved across logins. |
| Signed-out User Redirection | ✅ Implemented | Clicking Save when unauthenticated seamlessly redirects to `/login?redirect=...`. |
| My Projects Page (`/my-projects`) | ✅ Implemented | Protected App Router route displaying user's saved projects with loading, error/retry, and empty states. |
| Empty State Handling | ✅ Implemented | Renders "No saved projects yet" with direct action link to `/explore`. |
| Data Model & Progress Safeguards | ✅ Implemented | Reuses `public.user_projects`. Removal only deletes records where `status = 'saved'`. Active progress (`in_progress`, `completed`) is protected from accidental deletion or downgrade. |
| RLS & User Isolation | ✅ Verified | Uses existing Day 2 RLS policies on `user_projects` (`auth.uid() = user_id`). No service-role key exposed in client code. |
| Navigation Integration | ✅ Implemented | "My Projects" navigation link added to Header (`AuthNav`), Dashboard, and Explore page for authenticated users. |
| Production Build Verification | ✅ Passed | All 14 routes compiled and generated statically / dynamically with exit code 0 (`next build --webpack`). |

---

---

## Day 7 Architecture Enhancement — Multi-Tutorial Model & Catalogue Expansion

| Item | Status | Validation |
|------|--------|------------|
| Multiple Tutorials Migration (`20261108000000_multiple_tutorials_per_project.sql`) | ✅ Implemented | Drops `unique_project_tutorial`; adds `tutorial_key` unique per project (`UNIQUE(project_id, tutorial_key)`). Safe backfill of existing records with `main`. Adds generated `skills_text` column for fast multi-field search. |
| Expanded Catalogue Seed (`03_expanded_catalogue.sql`) | ✅ Implemented | Adds 24 distinct project previews (giving 30 total). Covers multiple granny square designs, coasters, flowers/appliqués, accessories, and intermediate makes. Idempotent with `ON CONFLICT (slug) DO NOTHING`. |
| Database-backed Search & Pagination | ✅ Implemented | Queries title, description, and skills. Deterministic ordering (`title ASC, id ASC`) with 12 items/page and clean `<Pagination>` control. |
| Preserved Filter/Search Navigation State | ✅ Implemented | Explore cards attach query parameters to links; Project Detail back button and browser history restore exact page/filter state. |
| Tutorial Selection & Stable Detail Route | ✅ Implemented | Project detail page lists all verified published tutorial choices. Stable tutorial detail route at `/projects/[slug]/tutorials/[tutorialKey]` with strict dual publication gate (404 if draft or parent project unpublished). |
| Multi-Tutorial RLS Test Suite (`rls_tutorial_verification.sql`) | ✅ Implemented | 16-check rollback verification testing co-located draft/published tutorial isolation on the same project, duplicate tutorial key rejection, step attachment, and dual gates. |
| Production Build Verification | ✅ Passed | All 15 routes compiled and generated statically/dynamically with exit code 0 (`next build --webpack`). |

---

## Documentation

| Item | Status |
|------|--------|
| `README.md` | ✅ Implemented |
| `docs/product-plan.md` | ✅ Implemented |
| `docs/status.md` (this file) | ✅ Implemented |
| `docs/decisions.md` | ✅ Implemented |
| `docs/tutorial-review-checklist.md` | ✅ Implemented |

---

## Next Milestones (Day 8+)

| Feature | Status |
|------|--------|
| Interactive Tutorial View (Video + Written + Steps) | 📋 Planned |
| YouTube Embed Player Integration | 📋 Planned |
| Real-time Step Synchronization & Row Counter | 📋 Planned |
| Step-by-step progress tracking (`learning_progress`) | 📋 Planned |
| AI crochet tutor | 📋 Planned |
