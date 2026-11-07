-- ============================================================================
-- LOOP — Project Details & Catalogue Enhancement Migration
-- Milestone: Day 5
-- Entity: public.projects (add materials, skills, estimated_minutes)
-- ============================================================================

-- 1. Add detailed catalogue attributes
alter table public.projects
  add column if not exists estimated_minutes integer,
  add column if not exists materials text[] not null default '{}'::text[],
  add column if not exists skills text[] not null default '{}'::text[];

-- 2. Add documentation comments
comment on column public.projects.estimated_minutes is 'Estimated completion time in minutes (numeric for filtering and sorting).';
comment on column public.projects.materials is 'Suggested materials, yarn weight, hook size, and notions.';
comment on column public.projects.skills is 'Key crochet techniques and stitch abbreviations involved in the project.';

-- 3. Add index on category and difficulty for performant exploration
create index if not exists idx_projects_category on public.projects(category);
create index if not exists idx_projects_difficulty on public.projects(difficulty);

