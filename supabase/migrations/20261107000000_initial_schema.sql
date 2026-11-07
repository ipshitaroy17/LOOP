-- ============================================================================
-- LOOP — Initial Database Foundation Migration
-- Milestone: Day 2
-- Entities: profiles, projects, user_projects, learning_progress
-- Security: Row Level Security (RLS) on all public tables + restricted grants
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Function: Automatic updated_at timestamp maintenance
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Table: public.profiles
-- User profile extending Supabase auth.users. Created automatically on signup.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  onboarding_preferences jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile extending Supabase auth.users with display name, skill level, and onboarding state.';
comment on column public.profiles.id is 'Matches the auth.users ID with cascading deletion on account delete.';
comment on column public.profiles.onboarding_preferences is 'Key-value preferences recorded during onboarding (e.g. yarn weight, dominant hand).';

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Table: public.projects
-- Curated crochet project catalogue. Maintained by administrators.
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'easy', 'intermediate', 'advanced')),
  thumbnail_url text,
  estimated_duration text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.projects is 'Curated crochet projects catalogue. Published projects are publicly readable.';
comment on column public.projects.slug is 'Human-readable URL slug (e.g. classic-granny-square).';
comment on column public.projects.published is 'When false, project is visible only to administrative backend operations.';

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_published on public.projects(published);

-- ----------------------------------------------------------------------------
-- 4. Table: public.user_projects
-- Tracks projects saved, started, or completed by learners.
-- ----------------------------------------------------------------------------
create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_projects_user_project_unique unique (user_id, project_id)
);

comment on table public.user_projects is 'Tracks which projects a user has saved, started, or completed.';

drop trigger if exists set_user_projects_updated_at on public.user_projects;
create trigger set_user_projects_updated_at
  before update on public.user_projects
  for each row execute function public.set_updated_at();

create index if not exists idx_user_projects_user_id on public.user_projects(user_id);
create index if not exists idx_user_projects_project_id on public.user_projects(project_id);

-- ----------------------------------------------------------------------------
-- 5. Table: public.learning_progress
-- Learner progress: last mode, video timestamp, active and completed steps.
-- ----------------------------------------------------------------------------
create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  learning_mode text not null default 'written' check (learning_mode in ('video', 'written', 'steps')),
  video_position_seconds integer not null default 0 check (video_position_seconds >= 0),
  -- NOTE: Section and step identifiers are explicitly provisional text keys
  -- until the formal pattern_steps and verification tables are authored in future releases.
  current_section text,
  active_step_identifier text,
  completed_step_identifiers text[] not null default '{}'::text[],
  notes text,
  updated_at timestamptz not null default now(),
  constraint learning_progress_user_project_unique unique (user_id, project_id)
);

comment on table public.learning_progress is 'Persistent learning progress for a user on a given project.';
comment on column public.learning_progress.video_position_seconds is 'Last playback timestamp. Distinct from step completion (video watch never automatically completes steps).';
comment on column public.learning_progress.completed_step_identifiers is 'Provisional list of steps marked complete by the learner.';

drop trigger if exists set_learning_progress_updated_at on public.learning_progress;
create trigger set_learning_progress_updated_at
  before update on public.learning_progress
  for each row execute function public.set_updated_at();

create index if not exists idx_learning_progress_user_id on public.learning_progress(user_id);
create index if not exists idx_learning_progress_project_id on public.learning_progress(project_id);

-- ----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Configuration
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.user_projects enable row level security;
alter table public.learning_progress enable row level security;

-- 6.1 public.projects policies
-- Anyone (anonymous or signed in) can view published projects.
-- Catalogue modifications from browser clients are denied (no insert/update/delete policy).
drop policy if exists "Anyone can read published projects" on public.projects;
create policy "Anyone can read published projects"
  on public.projects
  for select
  to anon, authenticated
  using (published = true);

-- 6.2 public.profiles policies
-- Users manage strictly their own profile. Ownership transfer is prevented via WITH CHECK.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
  on public.profiles
  for delete
  to authenticated
  using ((select auth.uid()) = id);

-- 6.3 public.user_projects policies
-- Users manage strictly their own saved/in-progress project relationships.
drop policy if exists "Users can read own user_projects" on public.user_projects;
create policy "Users can read own user_projects"
  on public.user_projects
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own user_projects" on public.user_projects;
create policy "Users can insert own user_projects"
  on public.user_projects
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own user_projects" on public.user_projects;
create policy "Users can update own user_projects"
  on public.user_projects
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own user_projects" on public.user_projects;
create policy "Users can delete own user_projects"
  on public.user_projects
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 6.4 public.learning_progress policies
-- Users manage strictly their own learning progress.
drop policy if exists "Users can read own learning_progress" on public.learning_progress;
create policy "Users can read own learning_progress"
  on public.learning_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own learning_progress" on public.learning_progress;
create policy "Users can insert own learning_progress"
  on public.learning_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own learning_progress" on public.learning_progress;
create policy "Users can update own learning_progress"
  on public.learning_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own learning_progress" on public.learning_progress;
create policy "Users can delete own learning_progress"
  on public.learning_progress
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 7. SQL Permissions & Grants
-- Restrict table grants strictly to operations allowed by policy.
-- ----------------------------------------------------------------------------
-- Revoke all default public permissions
revoke all on public.profiles from public, anon, authenticated;
revoke all on public.projects from public, anon, authenticated;
revoke all on public.user_projects from public, anon, authenticated;
revoke all on public.learning_progress from public, anon, authenticated;

-- Projects: SELECT only for both anonymous visitors and authenticated users
grant select on public.projects to anon, authenticated;

-- User private tables: SELECT, INSERT, UPDATE, DELETE for authenticated users only
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_projects to authenticated;
grant select, insert, update, delete on public.learning_progress to authenticated;

-- ----------------------------------------------------------------------------
-- 8. Future Signup Automation: Auth user profile creation trigger
-- Creates an empty profile row automatically when an auth.user signs up.
-- Secured with a fixed search_path and fully qualified table references.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

