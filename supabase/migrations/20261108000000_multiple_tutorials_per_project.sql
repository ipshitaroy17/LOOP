-- ============================================================================
-- LOOP — Multiple Tutorials Per Project & Catalogue Search Migration (Corrected)
-- Milestone: Day 7 Architecture Enhancement
-- Entities: public.tutorials, public.projects
--
-- Safety Guarantees:
-- 1. Atomic: Wrapped in BEGIN ... COMMIT.
-- 2. Fully Idempotent: Safely handles untouched, partial, or re-run states.
-- 3. Trigger-maintained skills_text: Uses a regular text column updated via a
--    BEFORE INSERT OR UPDATE trigger instead of an unsupported generated column.
-- 4. Handles NULL and empty skills arrays gracefully.
-- 5. Preserves all existing tutorials, steps, projects, saves, and RLS policies.
-- ============================================================================

begin;

-- 1. Remove the singular tutorial constraint if present
alter table public.tutorials
  drop constraint if exists unique_project_tutorial;

-- 2. Add stable tutorial_key column (unique per project)
alter table public.tutorials
  add column if not exists tutorial_key text;

-- 3. Safely backfill any existing records with a clean default key
update public.tutorials
  set tutorial_key = 'main'
  where tutorial_key is null or tutorial_key = '';

-- 4. Enforce NOT NULL on tutorial_key
alter table public.tutorials
  alter column tutorial_key set not null;

-- 5. Establish composite uniqueness per project
alter table public.tutorials
  drop constraint if exists unique_project_tutorial_key;

alter table public.tutorials
  add constraint unique_project_tutorial_key unique (project_id, tutorial_key);

-- 6. Performance index on project_id + tutorial_key
create index if not exists idx_tutorials_project_tutorial_key
  on public.tutorials (project_id, tutorial_key);

-- 7. Add standard (non-generated) skills_text column to public.projects
alter table public.projects
  add column if not exists skills_text text not null default '';

-- 8. Trigger function to maintain skills_text on INSERT or UPDATE
-- Accurately handles NULL arrays, empty arrays, and populated arrays
create or replace function public.handle_project_skills_text()
returns trigger as $$
begin
  if new.skills is null or array_length(new.skills, 1) is null or array_length(new.skills, 1) = 0 then
    new.skills_text := '';
  else
    new.skills_text := array_to_string(new.skills, ' ');
  end if;
  return new;
end;
$$ language plpgsql;

-- 9. Attach trigger to public.projects
drop trigger if exists set_project_skills_text on public.projects;
create trigger set_project_skills_text
  before insert or update on public.projects
  for each row execute function public.handle_project_skills_text();

-- 10. Backfill skills_text for all existing projects
update public.projects
  set skills_text = case
    when skills is null or array_length(skills, 1) is null or array_length(skills, 1) = 0 then ''
    else array_to_string(skills, ' ')
  end;

-- 11. Performance index for search on skills_text
create index if not exists idx_projects_skills_text
  on public.projects (skills_text);

-- 12. Documentation comments
comment on column public.tutorials.tutorial_key is 'Stable unique identifier/slug for a tutorial within its parent project.';
comment on column public.projects.skills_text is 'Trigger-maintained concatenated skills string for fast multi-column catalogue search.';

commit;
