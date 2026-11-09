-- ============================================================================
-- LOOP — Video Tutorial Candidates Seed (Draft Only)
-- File: supabase/seeds/04_video_candidates_draft.sql
--
-- PURPOSE
-- -------
-- Creates four draft tutorial records linking real YouTube videos to existing
-- LOOP catalogue projects. These records are NEVER publicly visible until
-- a human reviewer clears all five Gates in docs/tutorial-review-checklist.md.
--
-- VIDEOS INCLUDED
-- ---------------
-- 1. classic-granny-square / bella-coco-video
--    Title: "CROCHET: How to Crochet a Granny Square | Absolute Beginners | Bella Coco"
--    Creator: Bella Coco  (oEmbed author_name: "Bella Coco")
--    URL: https://www.youtube.com/watch?v=GALGQdP_POw
--    oEmbed check: HTTP 200 — video exists, embedding ENABLED (iframe returned)
--
-- 2. classic-granny-square / hooked-by-robin-granny-video
--    Title: "How to Crochet a Granny Square for ABSOLUTE BEGINNERS"
--    Creator: Hooked by Robin  (oEmbed author_name: "Hooked by Robin")
--    URL: https://www.youtube.com/watch?v=RwnArj7HdXo
--    oEmbed check: HTTP 200 — video exists, embedding ENABLED (iframe returned)
--
-- 3. solid-granny-square / hooked-by-robin-video
--    Title: "How to Crochet a SEAMLESS Solid Square WITHOUT Turning! 🧶"
--    Creator: Hooked by Robin  (oEmbed author_name: "Hooked by Robin")
--    URL: https://www.youtube.com/watch?v=AXJpyGLFleM
--    oEmbed check: HTTP 200 — video exists, embedding ENABLED (iframe returned)
--
-- 4. sunburst-granny-square / hooked-by-robin-video
--    Title: "Crochet Sunburst Sunflower Granny Square Tutorial 🌻"
--    Creator: Hooked by Robin  (oEmbed author_name: "Hooked by Robin")
--    URL: https://www.youtube.com/watch?v=T7LxrBtpAXM
--    oEmbed check: HTTP 200 — video exists, embedding ENABLED (iframe returned)
--
-- CHANNEL URLS (from oEmbed author_url — verified programmatically)
-- ----------------------------------------------------------------
--    Bella Coco:       https://www.youtube.com/@bellacococrochet
--    Hooked by Robin:  https://www.youtube.com/@HookedbyRobin
--
-- SAFETY CONSTRAINTS (enforced in this file)
-- -------------------------------------------
-- • review_status = 'draft'      — hidden from anon/authenticated by RLS
-- • video_embed_allowed          — set TRUE because oEmbed returned iframe HTML,
--                                   confirming the creator has enabled embedding
--                                   on YouTube. Must still be verified manually
--                                   in a browser before display in the app.
-- • pattern_source_type          = 'pending_permission'
--                                   Linking to a YouTube video does not constitute
--                                   reproducing pattern instructions. However, any
--                                   transcription, timestamp extraction, or step
--                                   creation from the video requires the creator's
--                                   explicit permission. No permission has been
--                                   sought or confirmed for any of these videos.
-- • terminology                  = 'US' (DEFAULT)
--                                   ⚠ UNVERIFIED: US terminology is the DB default
--                                   and is a reasonable assumption for these creators,
--                                   but has NOT been confirmed by watching the videos.
--                                   A reviewer must confirm US vs UK stitch names
--                                   (sc/dc distinction) before this tutorial is
--                                   used in interactive playback.
-- • pattern_tested = false       — No physical swatch has been made.
-- • published_at = NULL          — Never set a publish date on a draft.
-- • pattern_steps                — NONE. Steps require manual extraction from each
--                                   video after: (a) watching content, (b) confirming
--                                   terminology, and (c) obtaining creator permission.
--
-- IDEMPOTENCY
-- -----------
-- Each INSERT uses ON CONFLICT (project_id, tutorial_key) DO NOTHING.
-- Safe to rerun after partial execution or errors.
--
-- EXECUTION ORDER
-- ---------------
-- Run AFTER: 01_starter_projects.sql, 02_beginner_square_tutorial.sql,
--             03_expanded_catalogue.sql
-- (Requires classic-granny-square, solid-granny-square, sunburst-granny-square
--  slugs to exist in public.projects)
-- ============================================================================

do $$
declare
  v_classic_id  uuid;
  v_solid_id    uuid;
  v_sunburst_id uuid;
begin

  -- ── Resolve project IDs by slug ──────────────────────────────────────────

  select id into v_classic_id
  from public.projects
  where slug = 'classic-granny-square'
  limit 1;

  if v_classic_id is null then
    raise notice 'Project "classic-granny-square" not found — skipping its tutorials.';
  end if;

  select id into v_solid_id
  from public.projects
  where slug = 'solid-granny-square'
  limit 1;

  if v_solid_id is null then
    raise notice 'Project "solid-granny-square" not found — skipping its tutorial.';
  end if;

  select id into v_sunburst_id
  from public.projects
  where slug = 'sunburst-granny-square'
  limit 1;

  if v_sunburst_id is null then
    raise notice 'Project "sunburst-granny-square" not found — skipping its tutorial.';
  end if;


  -- ── 1. Classic Granny Square — Bella Coco video ──────────────────────────
  -- oEmbed title: "CROCHET: How to Crochet a Granny Square | Absolute Beginners | Bella Coco"

  if v_classic_id is not null then
    insert into public.tutorials (
      project_id,
      tutorial_key,
      title,
      learning_objective,
      terminology,
      abbreviations,
      materials_details,
      pattern_source_type,
      pattern_source_title,
      pattern_source_author,
      pattern_source_url,
      pattern_license,
      pattern_permission_notes,
      pattern_tested,
      pattern_tested_notes,
      video_url,
      video_creator_name,
      video_creator_url,
      video_embed_allowed,
      review_status,
      published_at
    )
    values (
      v_classic_id,
      'bella-coco-video',
      'Classic Granny Square — Bella Coco (Video Candidate)',
      -- Honest objective scoped to what a classic granny square tutorial covers.
      -- NOT derived from watching this specific video.
      'Learn to work magic rings or chain rings, cluster stitches in rounds, join rounds with slip stitches, and change colours to build a classic four-round granny square.',
      -- ⚠ UNVERIFIED: US default assumed. Reviewer must confirm US vs UK terms.
      'US',
      '{}'::jsonb,       -- No abbreviation map until terminology is confirmed
      '[]'::jsonb,       -- No materials until video is reviewed
      'pending_permission',
      null,              -- No separate pattern document to cite
      null,
      null,
      null,
      -- Permission note: explicit and prominent
      'No permission has been sought or confirmed from Bella Coco for this video. '
      'Linking to a public YouTube video is generally permissible under YouTube ToS, '
      'but transcribing, reproducing, or adapting pattern instructions from this video '
      'requires explicit creator consent. Do not create pattern_steps from this video '
      'without written permission from the creator.',
      false,             -- pattern_tested = false; no physical swatch made
      null,
      'https://www.youtube.com/watch?v=GALGQdP_POw',
      'Bella Coco',
      -- Channel URL from oEmbed author_url (programmatically verified)
      'https://www.youtube.com/@bellacococrochet',
      -- video_embed_allowed: oEmbed returned iframe HTML confirming embedding is
      -- enabled on YouTube. Must still be verified manually in browser before display.
      true,
      'draft',
      null
    )
    on conflict (project_id, tutorial_key) do nothing;
  end if;


  -- ── 2. Classic Granny Square — Hooked by Robin video ─────────────────────
  -- oEmbed title: "How to Crochet a Granny Square for ABSOLUTE BEGINNERS"

  if v_classic_id is not null then
    insert into public.tutorials (
      project_id,
      tutorial_key,
      title,
      learning_objective,
      terminology,
      abbreviations,
      materials_details,
      pattern_source_type,
      pattern_source_title,
      pattern_source_author,
      pattern_source_url,
      pattern_license,
      pattern_permission_notes,
      pattern_tested,
      pattern_tested_notes,
      video_url,
      video_creator_name,
      video_creator_url,
      video_embed_allowed,
      review_status,
      published_at
    )
    values (
      v_classic_id,
      'hooked-by-robin-granny-video',
      'Classic Granny Square — Hooked by Robin (Video Candidate)',
      'Learn to work magic rings or chain rings, cluster stitches in rounds, join rounds with slip stitches, and change colours to build a classic four-round granny square.',
      -- ⚠ UNVERIFIED: US default assumed. Reviewer must confirm US vs UK terms.
      'US',
      '{}'::jsonb,
      '[]'::jsonb,
      'pending_permission',
      null,
      null,
      null,
      null,
      'No permission has been sought or confirmed from Hooked by Robin for this video. '
      'Linking to a public YouTube video is generally permissible under YouTube ToS, '
      'but transcribing, reproducing, or adapting pattern instructions from this video '
      'requires explicit creator consent. Do not create pattern_steps from this video '
      'without written permission from the creator.',
      false,
      null,
      'https://www.youtube.com/watch?v=RwnArj7HdXo',
      'Hooked by Robin',
      -- Channel URL from oEmbed author_url (programmatically verified)
      'https://www.youtube.com/@HookedbyRobin',
      -- video_embed_allowed: oEmbed returned iframe HTML confirming embedding enabled
      true,
      'draft',
      null
    )
    on conflict (project_id, tutorial_key) do nothing;
  end if;


  -- ── 3. Solid Granny Square — Hooked by Robin video ───────────────────────
  -- oEmbed title: "How to Crochet a SEAMLESS Solid Square WITHOUT Turning! 🧶"

  if v_solid_id is not null then
    insert into public.tutorials (
      project_id,
      tutorial_key,
      title,
      learning_objective,
      terminology,
      abbreviations,
      materials_details,
      pattern_source_type,
      pattern_source_title,
      pattern_source_author,
      pattern_source_url,
      pattern_license,
      pattern_permission_notes,
      pattern_tested,
      pattern_tested_notes,
      video_url,
      video_creator_name,
      video_creator_url,
      video_embed_allowed,
      review_status,
      published_at
    )
    values (
      v_solid_id,
      'hooked-by-robin-video',
      'Solid Granny Square (Seamless) — Hooked by Robin (Video Candidate)',
      'Learn to build a solid, seamless granny square worked in continuous rounds without turning, achieving a smooth, uninterrupted fabric.',
      -- ⚠ UNVERIFIED: US default assumed. Reviewer must confirm US vs UK terms.
      'US',
      '{}'::jsonb,
      '[]'::jsonb,
      'pending_permission',
      null,
      null,
      null,
      null,
      'No permission has been sought or confirmed from Hooked by Robin for this video. '
      'Linking to a public YouTube video is generally permissible under YouTube ToS, '
      'but transcribing, reproducing, or adapting pattern instructions from this video '
      'requires explicit creator consent. Do not create pattern_steps from this video '
      'without written permission from the creator.',
      false,
      null,
      'https://www.youtube.com/watch?v=AXJpyGLFleM',
      'Hooked by Robin',
      'https://www.youtube.com/@HookedbyRobin',
      -- video_embed_allowed: oEmbed returned iframe HTML confirming embedding enabled
      true,
      'draft',
      null
    )
    on conflict (project_id, tutorial_key) do nothing;
  end if;


  -- ── 4. Sunburst Granny Square — Hooked by Robin video ────────────────────
  -- oEmbed title: "Crochet Sunburst Sunflower Granny Square Tutorial 🌻"

  if v_sunburst_id is not null then
    insert into public.tutorials (
      project_id,
      tutorial_key,
      title,
      learning_objective,
      terminology,
      abbreviations,
      materials_details,
      pattern_source_type,
      pattern_source_title,
      pattern_source_author,
      pattern_source_url,
      pattern_license,
      pattern_permission_notes,
      pattern_tested,
      pattern_tested_notes,
      video_url,
      video_creator_name,
      video_creator_url,
      video_embed_allowed,
      review_status,
      published_at
    )
    values (
      v_sunburst_id,
      'hooked-by-robin-video',
      'Sunburst Granny Square — Hooked by Robin (Video Candidate)',
      'Learn to crochet a sunburst-style granny square featuring radiating colour-change rounds that create a sunflower or starburst effect from the centre.',
      -- ⚠ UNVERIFIED: US default assumed. Reviewer must confirm US vs UK terms.
      'US',
      '{}'::jsonb,
      '[]'::jsonb,
      'pending_permission',
      null,
      null,
      null,
      null,
      'No permission has been sought or confirmed from Hooked by Robin for this video. '
      'Linking to a public YouTube video is generally permissible under YouTube ToS, '
      'but transcribing, reproducing, or adapting pattern instructions from this video '
      'requires explicit creator consent. Do not create pattern_steps from this video '
      'without written permission from the creator.',
      false,
      null,
      'https://www.youtube.com/watch?v=T7LxrBtpAXM',
      'Hooked by Robin',
      'https://www.youtube.com/@HookedbyRobin',
      -- video_embed_allowed: oEmbed returned iframe HTML confirming embedding enabled
      true,
      'draft',
      null
    )
    on conflict (project_id, tutorial_key) do nothing;
  end if;


end $$;

-- ============================================================================
-- READ-ONLY VERIFICATION QUERY
-- Run this after executing the seed to confirm all four records were created.
-- ============================================================================
--
-- select
--   p.slug           as project_slug,
--   t.tutorial_key,
--   t.title,
--   t.video_creator_name,
--   t.video_url,
--   t.video_embed_allowed,
--   t.review_status,
--   t.pattern_source_type,
--   t.published_at
-- from public.tutorials t
-- join public.projects p on p.id = t.project_id
-- where t.tutorial_key in (
--   'bella-coco-video',
--   'hooked-by-robin-granny-video',
--   'hooked-by-robin-video'
-- )
-- order by p.slug, t.tutorial_key;
--
-- Expected: 4 rows, all with review_status = 'draft', published_at = NULL
-- ============================================================================

