# LOOP — Product Plan

> **Terminology note:** "Core release" refers to the first full public
> version of LOOP. "Post-core" refers to features planned after the core
> release gate. The labels "MVP" and "beta" are not used to avoid confusion.

---

## Core release scope

The core release includes:

| Area | Features |
|------|----------|
| **Authentication** | Sign up, sign in, sign out (Supabase Auth) |
| **Onboarding** | First-visit flow, skill-level selection |
| **Projects** | Three curated crochet projects |
| **Discovery** | Project listing with difficulty and mode indicators |
| **Learning modes** | Watch (embedded video), Read (written pattern), Follow (guided steps) |
| **Timestamp links** | Verified video timestamp → pattern step links only; unverified mappings are never shown as verified |
| **Progress** | Persistent step completion per user per project |
| **AI tutor** | Contextual tutor that knows the current project and step (provider TBD) |

---

## Post-core scope

Features planned after the core release gate:

| Feature | Notes |
|---------|-------|
| Image-to-pattern | Upload a photo; receive a generated pattern |
| Image-based tutorial discovery | Find tutorials by photo reference |
| Generated patterns | AI-assisted pattern generation and usage records |

---

## Proposed architecture

```
Next.js 16 (App Router, TypeScript)
  ├── src/app/          — pages and layouts
  ├── src/components/   — shared UI components
  ├── src/lib/          — data fetching, Supabase client, helpers
  └── src/types/        — shared TypeScript types

Supabase
  ├── Auth              — email/password, session management
  ├── PostgreSQL        — relational data (see entities below)
  └── Storage           — user-uploaded images (post-core)

Deployment target: TBD (Vercel or similar)
```

---

## Content preparation dependencies

Before the core release can ship:

1. **Three curated projects** must be authored with:
   - Original or explicitly permitted written patterns (US terminology).
   - Recorded video content (original or permitted).
   - Verified timestamp-to-step mappings (manually reviewed; no unverified mappings shipped).
   - Completed pattern steps in the `pattern_steps` table.

2. **Legal review** of all video and pattern content for permissions.

3. **US crochet terminology** applied consistently across all patterns.
   International variants are a post-core consideration.

---

## Proposed database entities

> Owner-only access for all private user data. Row-level security (RLS)
> enforced at the Supabase/PostgreSQL layer.

### `profiles`
Extends Supabase `auth.users`. Stores display name, skill level, onboarding state.

### `projects`
A curated crochet project. Fields: title, description, difficulty, cover image URL, published status.

### `tutorials`
One video per project (core release). Fields: project_id, video_provider, video_id, duration_seconds.

### `patterns`
The written pattern document for a project. Fields: project_id, terminology (`us`), content (long text or structured JSON).

### `pattern_steps`
Individual steps shared by both Read and Follow modes. Fields: pattern_id, step_number, instruction, abbreviation hints.

> **Constraint:** Written and guided modes consume the same `pattern_steps` rows — there is no separate step list per mode.

### `step_video_mappings`
Maps a `pattern_step` to a timestamp in a `tutorial` video. Fields: step_id, tutorial_id, start_seconds, verified (boolean).

> **Constraint:** Only rows where `verified = true` are shown to learners. Unverified mappings are never displayed as verified.

### `user_projects`
Tracks which projects a user has started. Fields: user_id, project_id, started_at, last_accessed_at.

### `learning_progress`
Stores the learner's last-known video position and selected step per project. Fields: user_project_id, video_position_seconds, selected_step_id, updated_at.

> **Distinction:** `video_position_seconds` (where the video was paused), `selected_step_id` (which step is highlighted in Follow mode), and completed steps (see below) are **three separate values**. Advancing video position never sets a step complete.

### `step_completions`
Records which steps a user has explicitly marked done. Fields: user_project_id, step_id, completed_at.

> **Later additions (post-core):** `generated_patterns`, `generation_usage_records`.

---

## Open decisions

See `docs/decisions.md`.
