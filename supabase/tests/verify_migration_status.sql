-- ============================================================================
-- LOOP — Post-Migration Verification (Read-Only)
-- Milestone: Day 7 Architecture Enhancement
-- Migration: 20261108000000_multiple_tutorials_per_project.sql
--
-- HOW TO RUN:
-- 1. Open Supabase Dashboard → SQL Editor → New query.
-- 2. Paste this entire file and click Run.
-- 3. Confirm all checks show status 'PASS' and SUMMARY displays 'ALL CHECKS PASSED'.
--
-- Safety: 100% read-only queries (SELECT only). Modifies zero rows.
-- ============================================================================

with check_definitions as (
  -- 1. tutorial_key column exists on public.tutorials and is NOT NULL
  select
    '1. tutorial_key column' as check_name,
    'public.tutorials.tutorial_key' as target_object,
    'text, is_nullable=NO' as expected,
    coalesce(
      (select data_type || ', is_nullable=' || is_nullable
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'tutorials'
         and column_name = 'tutorial_key'),
      'COLUMN MISSING'
    ) as actual,
    case
      when exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'tutorials'
          and column_name = 'tutorial_key'
          and data_type = 'text'
          and is_nullable = 'NO'
      ) then 'PASS' else 'FAIL'
    end as status

  union all

  -- 2. Old singular constraint unique_project_tutorial is dropped
  select
    '2. Old unique_project_tutorial dropped',
    'public.tutorials.unique_project_tutorial',
    'DROPPED (does not exist)',
    case
      when exists (
        select 1 from information_schema.table_constraints
        where table_schema = 'public'
          and table_name = 'tutorials'
          and constraint_name = 'unique_project_tutorial'
      ) then 'STILL EXISTS (blocking multiple tutorials)'
      else 'DROPPED'
    end,
    case
      when exists (
        select 1 from information_schema.table_constraints
        where table_schema = 'public'
          and table_name = 'tutorials'
          and constraint_name = 'unique_project_tutorial'
      ) then 'FAIL' else 'PASS'
    end

  union all

  -- 3. Composite unique constraint unique_project_tutorial_key exists
  select
    '3. Composite unique constraint',
    'public.tutorials.unique_project_tutorial_key',
    'UNIQUE (project_id, tutorial_key)',
    case
      when exists (
        select 1 from information_schema.table_constraints
        where table_schema = 'public'
          and table_name = 'tutorials'
          and constraint_name = 'unique_project_tutorial_key'
          and constraint_type = 'UNIQUE'
      ) then 'EXISTS' else 'MISSING'
    end,
    case
      when exists (
        select 1 from information_schema.table_constraints
        where table_schema = 'public'
          and table_name = 'tutorials'
          and constraint_name = 'unique_project_tutorial_key'
          and constraint_type = 'UNIQUE'
      ) then 'PASS' else 'FAIL'
    end

  union all

  -- 4. skills_text column exists on public.projects
  select
    '4. skills_text column exists',
    'public.projects.skills_text',
    'text, exists',
    coalesce(
      (select data_type
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'projects'
         and column_name = 'skills_text'),
      'COLUMN MISSING'
    ),
    case
      when exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'projects'
          and column_name = 'skills_text'
          and data_type = 'text'
      ) then 'PASS' else 'FAIL'
    end

  union all

  -- 5. skills_text is a standard column (NOT a generated column)
  select
    '5. skills_text is standard column',
    'public.projects.skills_text generation',
    'is_generated = NEVER',
    coalesce(
      (select 'is_generated=' || is_generated
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'projects'
         and column_name = 'skills_text'),
      'COLUMN MISSING'
    ),
    case
      when exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'projects'
          and column_name = 'skills_text'
          and is_generated = 'NEVER'
      ) then 'PASS' else 'FAIL'
    end

  union all

  -- 6. Trigger set_project_skills_text is attached to public.projects
  select
    '6. skills_text trigger attached',
    'public.projects.set_project_skills_text',
    'TRIGGER EXISTS',
    case
      when exists (
        select 1 from information_schema.triggers
        where trigger_schema = 'public'
          and event_object_table = 'projects'
          and trigger_name = 'set_project_skills_text'
      ) then 'TRIGGER EXISTS' else 'TRIGGER MISSING'
    end,
    case
      when exists (
        select 1 from information_schema.triggers
        where trigger_schema = 'public'
          and event_object_table = 'projects'
          and trigger_name = 'set_project_skills_text'
      ) then 'PASS' else 'FAIL'
    end

  union all

  -- 7. Existing projects have skills_text backfilled from skills array
  select
    '7. projects skills_text backfill',
    'public.projects rows with empty skills_text while skills populated',
    '0 rows unbackfilled',
    (select count(*)::text || ' unbackfilled row(s)'
     from public.projects
     where skills is not null
       and array_length(skills, 1) > 0
       and (skills_text is null or skills_text = '')),
    case
      when (
        select count(*)
        from public.projects
        where skills is not null
          and array_length(skills, 1) > 0
          and (skills_text is null or skills_text = '')
      ) = 0 then 'PASS' else 'FAIL'
    end

  union all

  -- 8. Existing tutorials have tutorial_key backfilled
  select
    '8. tutorials tutorial_key backfill',
    'public.tutorials rows with NULL/empty tutorial_key',
    '0 rows unbackfilled',
    (select count(*)::text || ' unbackfilled row(s)'
     from public.tutorials
     where tutorial_key is null or tutorial_key = ''),
    case
      when (
        select count(*)
        from public.tutorials
        where tutorial_key is null or tutorial_key = ''
      ) = 0 then 'PASS' else 'FAIL'
    end
)
select * from check_definitions
union all
select
  'SUMMARY' as check_name,
  'Migration 20261108000000 Status' as target_object,
  'All 8 checks PASS' as expected,
  case
    when count(*) filter (where status = 'FAIL') = 0 then '8 / 8 checks passed'
    else count(*) filter (where status = 'FAIL')::text || ' check(s) FAILED'
  end as actual,
  case
    when count(*) filter (where status = 'FAIL') = 0 then 'ALL CHECKS PASSED'
    else 'VERIFICATION FAILED'
  end as status
from check_definitions
order by check_name;

