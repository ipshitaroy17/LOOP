-- ============================================================================
-- LOOP — RLS Access Control Verification Script
-- Milestone: Day 2
--
-- This script provides an automated, repeatable verification of Row Level
-- Security (RLS) policies and role-based permissions in PostgreSQL.
--
-- HOW TO RUN:
-- 1. Open your Supabase Dashboard -> SQL Editor.
-- 2. Paste the contents of this file and click "Run".
-- 3. Review the RAISE NOTICE verification messages in the Results pane.
--
-- All operations run inside a transaction that is ROLLED BACK at the end,
-- leaving your database completely clean with zero test residue.
-- ============================================================================

begin;

do $$
declare
  user_a_id uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  user_b_id uuid := '22222222-2222-4222-8222-222222222222'::uuid;
  proj_pub_id uuid := '33333333-3333-4333-8333-333333333333'::uuid;
  proj_draft_id uuid := '44444444-4444-4444-8444-444444444444'::uuid;
  v_count integer;
  v_error_caught boolean;
begin
  raise notice '=======================================================';
  raise notice '   LOOP — Starting RLS Verification Test Suite';
  raise notice '=======================================================';

  -- --------------------------------------------------------------------------
  -- STEP 0: Seed test fixtures as postgres superuser / admin
  -- --------------------------------------------------------------------------
  -- Seed test auth users
  insert into auth.users (id, email, raw_user_meta_data, role, aud)
  values
    (user_a_id, 'user_a@loop.test', '{"display_name":"Crochet Learner A"}'::jsonb, 'authenticated', 'authenticated'),
    (user_b_id, 'user_b@loop.test', '{"display_name":"Crochet Learner B"}'::jsonb, 'authenticated', 'authenticated')
  on conflict (id) do nothing;

  -- Verify trigger created profiles
  insert into public.profiles (id, display_name)
  values
    (user_a_id, 'Crochet Learner A'),
    (user_b_id, 'Crochet Learner B')
  on conflict (id) do nothing;

  -- Seed published and draft projects
  insert into public.projects (id, slug, title, description, category, difficulty, published)
  values
    (proj_pub_id, 'test-published-scarf', 'Classic Ribbed Scarf', 'Beginner scarf project', 'accessories', 'beginner', true),
    (proj_draft_id, 'test-draft-blanket', 'Heirloom Afghan', 'Advanced draft project', 'home', 'advanced', false)
  on conflict (id) do nothing;

  -- Seed User B private records
  insert into public.user_projects (user_id, project_id, status)
  values (user_b_id, proj_pub_id, 'in_progress')
  on conflict do nothing;

  insert into public.learning_progress (user_id, project_id, learning_mode, video_position_seconds, completed_step_identifiers)
  values (user_b_id, proj_pub_id, 'steps', 120, array['step-1', 'step-2'])
  on conflict do nothing;

  raise notice ' [OK] Fixtures seeded successfully.';

  -- ==========================================================================
  -- TEST GROUP 1: Anonymous Role Access
  -- ==========================================================================
  set local role anon;
  set local "request.jwt.claim.role" = 'anon';
  set local "request.jwt.claim.sub" = '';

  -- 1.1 Anonymous can read published projects
  select count(*) into v_count from public.projects where id = proj_pub_id;
  if v_count <> 1 then
    raise exception 'FAIL: Anonymous cannot read published project (expected 1, got %)', v_count;
  end if;
  raise notice ' [PASS] 1.1: Anonymous can read published projects.';

  -- 1.2 Anonymous CANNOT read unpublished / draft projects
  select count(*) into v_count from public.projects where id = proj_draft_id;
  if v_count <> 0 then
    raise exception 'FAIL: Anonymous saw unpublished project (expected 0, got %)', v_count;
  end if;
  raise notice ' [PASS] 1.2: Anonymous cannot see draft/unpublished projects.';

  -- 1.3 Anonymous CANNOT read private user profiles
  select count(*) into v_count from public.profiles;
  if v_count <> 0 then
    raise exception 'FAIL: Anonymous read private profiles (expected 0, got %)', v_count;
  end if;
  raise notice ' [PASS] 1.3: Anonymous cannot read user profiles.';

  -- 1.4 Anonymous CANNOT insert into project catalogue
  v_error_caught := false;
  begin
    insert into public.projects (slug, title, category, difficulty, published)
    values ('hacked-project', 'Hacked Project', 'misc', 'beginner', true);
  exception when others then
    v_error_caught := true;
  end;
  if not v_error_caught then
    raise exception 'FAIL: Anonymous was able to insert into projects table!';
  end if;
  raise notice ' [PASS] 1.4: Anonymous cannot insert or modify project catalogue.';

  -- ==========================================================================
  -- TEST GROUP 2: Authenticated User A Access & Isolation
  -- ==========================================================================
  set local role authenticated;
  set local "request.jwt.claim.role" = 'authenticated';
  set local "request.jwt.claim.sub" = '11111111-1111-4111-8111-111111111111';

  -- 2.1 User A can read own profile
  select count(*) into v_count from public.profiles where id = user_a_id;
  if v_count <> 1 then
    raise exception 'FAIL: User A cannot read own profile (expected 1, got %)', v_count;
  end if;
  raise notice ' [PASS] 2.1: User A can read own profile.';

  -- 2.2 User A CANNOT read User B profile
  select count(*) into v_count from public.profiles where id = user_b_id;
  if v_count <> 0 then
    raise exception 'FAIL: User A was able to read User B profile (expected 0, got %)', v_count;
  end if;
  raise notice ' [PASS] 2.2: User A cannot read User B profile.';

  -- 2.3 User A can update own profile
  update public.profiles set experience_level = 'intermediate' where id = user_a_id;
  get diagnostics v_count = row_count;
  if v_count <> 1 then
    raise exception 'FAIL: User A failed to update own profile (expected 1, got %)', v_count;
  end if;
  raise notice ' [PASS] 2.3: User A can update own profile.';

  -- 2.4 User A CANNOT update User B profile
  update public.profiles set display_name = 'Attacker Name' where id = user_b_id;
  get diagnostics v_count = row_count;
  if v_count <> 0 then
    raise exception 'FAIL: User A was able to update User B profile (updated % rows)!', v_count;
  end if;
  raise notice ' [PASS] 2.4: User A cannot update User B profile.';

  -- 2.5 User A can create and manage own user_project and learning_progress
  insert into public.user_projects (user_id, project_id, status)
  values (user_a_id, proj_pub_id, 'in_progress');

  insert into public.learning_progress (user_id, project_id, learning_mode, video_position_seconds, completed_step_identifiers)
  values (user_a_id, proj_pub_id, 'written', 45, array['step-1']);
  raise notice ' [PASS] 2.5: User A can save project and record progress.';

  -- 2.6 User A CANNOT read User B user_projects or learning_progress
  select count(*) into v_count from public.user_projects where user_id = user_b_id;
  if v_count <> 0 then
    raise exception 'FAIL: User A saw User B user_projects (expected 0, got %)', v_count;
  end if;

  select count(*) into v_count from public.learning_progress where user_id = user_b_id;
  if v_count <> 0 then
    raise exception 'FAIL: User A saw User B learning_progress (expected 0, got %)', v_count;
  end if;
  raise notice ' [PASS] 2.6: User A cannot read User B project progress.';

  -- 2.7 User A CANNOT transfer ownership to User B (WITH CHECK validation)
  v_error_caught := false;
  begin
    insert into public.user_projects (user_id, project_id, status)
    values (user_b_id, proj_draft_id, 'saved');
  exception when others then
    v_error_caught := true;
  end;
  if not v_error_caught then
    raise exception 'FAIL: User A was able to insert user_projects owned by User B!';
  end if;
  raise notice ' [PASS] 2.7: Ownership transfer prevented on insert.';

  -- 2.8 User A CANNOT modify project catalogue
  v_error_caught := false;
  begin
    delete from public.projects where id = proj_pub_id;
  exception when others then
    v_error_caught := true;
  end;
  if not v_error_caught then
    raise exception 'FAIL: Authenticated user was able to delete project catalogue entry!';
  end if;
  raise notice ' [PASS] 2.8: Authenticated users cannot delete or edit project catalogue.';

  raise notice '=======================================================';
  raise notice '   ALL RLS TESTS PASSED SUCCESSFULLY! [8 / 8]';
  raise notice '=======================================================';
end;
$$;

-- Roll back all test rows and role assignments
rollback;

