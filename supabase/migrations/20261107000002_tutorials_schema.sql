-- ============================================================================
-- LOOP — Tutorials & Pattern Steps Schema Migration
-- Milestone: Day 7
-- Entities: public.tutorials, public.pattern_steps
--
-- Safety Guarantees:
-- 1. Non-destructive: Does not alter or drop any existing tables or columns.
-- 2. Strict RLS: Content in 'draft' or 'in_review' status is NEVER accessible
--    to anonymous users or authenticated learners. Only 'verified_published'
--    rows are visible publicly.
-- 3. Referential integrity: Cascades deletes cleanly with parent project.
-- ============================================================================

-- 1. Create Tutorials Table
create table if not exists public.tutorials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  learning_objective text not null,
  terminology text not null default 'US',
  abbreviations jsonb not null default '{}'::jsonb,
  materials_details jsonb not null default '[]'::jsonb,

  -- Pattern source, copyright & licensing validation
  pattern_source_type text not null default 'original_loop'
    check (pattern_source_type in ('original_loop', 'creator_approved', 'public_domain', 'creative_commons', 'pending_permission')),
  pattern_source_title text,
  pattern_source_author text,
  pattern_source_url text,
  pattern_license text,
  pattern_permission_notes text,
  pattern_tested boolean not null default false,
  pattern_tested_notes text,

  -- Video tutorial source & creator attribution
  video_url text,
  video_creator_name text,
  video_creator_url text,
  video_embed_allowed boolean not null default false,

  -- Review & publication workflow gates
  review_status text not null default 'draft'
    check (review_status in ('draft', 'in_review', 'verified_published')),
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One primary tutorial per project in core release
  constraint unique_project_tutorial unique (project_id)
);

-- 2. Create Pattern Steps Table
create table if not exists public.pattern_steps (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid not null references public.tutorials(id) on delete cascade,
  step_number integer not null,
  step_identifier text not null,
  title text not null,
  instruction text not null,
  stitch_count text,
  abbreviations text[] not null default '{}'::text[],
  notes text,

  -- Optional step-to-video mapping (verified only)
  video_timestamp_seconds integer,
  timestamp_verified boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint unique_tutorial_step_number unique (tutorial_id, step_number),
  constraint unique_tutorial_step_identifier unique (tutorial_id, step_identifier),
  constraint valid_step_number check (step_number > 0),
  constraint valid_timestamp check (video_timestamp_seconds is null or video_timestamp_seconds >= 0)
);

-- 3. Performance Indexes
create index if not exists idx_tutorials_project_id on public.tutorials(project_id);
create index if not exists idx_tutorials_review_status on public.tutorials(review_status);
create index if not exists idx_pattern_steps_tutorial_id on public.pattern_steps(tutorial_id);
create index if not exists idx_pattern_steps_step_number on public.pattern_steps(tutorial_id, step_number);

-- 4. Automatic updated_at trigger helper (reuse existing or create)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_tutorials_updated_at
  before update on public.tutorials
  for each row execute function public.handle_updated_at();

create trigger set_pattern_steps_updated_at
  before update on public.pattern_steps
  for each row execute function public.handle_updated_at();

-- 5. Row Level Security (RLS)
alter table public.tutorials enable row level security;
alter table public.pattern_steps enable row level security;

-- Tutorials: publicly readable ONLY when BOTH:
--   (a) review_status = 'verified_published', AND
--   (b) the parent project is published (projects.published = true).
-- This prevents leaking tutorial content when a project is unpublished after
-- a tutorial has already been marked verified.
drop policy if exists "Public read verified published tutorials only" on public.tutorials;
create policy "Public read verified published tutorials only"
  on public.tutorials
  for select
  to public
  using (
    review_status = 'verified_published'
    and exists (
      select 1 from public.projects
      where projects.id = tutorials.project_id
        and projects.published = true
    )
  );

-- Pattern steps: publicly readable ONLY when the parent tutorial satisfies
-- the same dual condition (verified_published + parent project published).
-- The join to projects is handled transitively through the tutorials check.
drop policy if exists "Public read steps of verified published tutorials" on public.pattern_steps;
create policy "Public read steps of verified published tutorials"
  on public.pattern_steps
  for select
  to public
  using (
    exists (
      select 1
      from public.tutorials
      join public.projects on projects.id = tutorials.project_id
      where tutorials.id = pattern_steps.tutorial_id
        and tutorials.review_status = 'verified_published'
        and projects.published = true
    )
  );

-- Documentation comments
comment on table public.tutorials is 'Tutorial metadata, learning objectives, pattern source verification, and video creator attribution.';
comment on table public.pattern_steps is 'Granular ordered instructions for tutorials with stitch counts, identifiers, and verified video timestamps.';
comment on column public.tutorials.review_status is 'Content review status (draft, in_review, verified_published). Public readers can only query verified_published rows whose parent project is also published.';
comment on column public.pattern_steps.timestamp_verified is 'Whether the step-to-video timestamp has been manually verified against the video source.';

