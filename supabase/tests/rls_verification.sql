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
-- 3. Review the explicit results table returned in the Results tab.
--
-- All operations clean up after themselves, leaving your database completely
-- clean with zero test residue.
-- ============================================================================

-- Create temporary table to store visible test results in SQL Editor
create temp table if not exists rls_test_results (
  check_id text primary key,
  description text not null,
  status text not null
);
truncate rls_test_results;

do $$
declare
  user_a_id uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  user_b_id uuid := '22222222-2222-4222-8222-222222222222'::uuid;
  proj_pub_id uuid := '33333333-3333-4333-8333-333333333333'::uuid;
  proj_draft_id uuid := '44444444-4444-4444-8444-444444444444'::uuid;
  v_count integer;
  v_error_caught boolean;
  v_failures integer := 0;

  -- Test pass flags
  v_pass_1_1 boolean := false;
  v_pass_1_2 boolean := false;
  v_pass_1_3 boolean := false;
  v_pass_1_4 boolean := false;
  v_pass_2_1 boolean := false;
  v_pass_2_2 boolean := false;
  v_pass_2_3 boolean := false;
  v_pass_2_4 boolean := false;
  v_pass_2_5 boolean := false;
  v_pass_2_6 boolean := false;
  v_pass_2_7 boolean := false;
  v_pass_2_8 boolean := false;

  v_detail_1_1 text := '';
  v_detail_1_2 text := '';
  v_detail_1_3 text := '';
  v_detail_1_4 text := '';
  v_detail_2_1 text := '';
  v_detail_2_2 text := '';
  v_detail_2_3 text := '';
  v_detail_2_4 text := '';
  v_detail_2_5 text := '';
  v_detail_2_6 text := '';
  v_detail_2_7 text := '';
  v_detail_2_8 text := '';
begin
  -- --------------------------------------------------------------------------
  -- STEP 0: Clean and seed test fixtures as postgres session user
  -- --------------------------------------------------------------------------
  delete from public.learning_progress where user_id in (user_a_id, user_b_id);
  delete from public.user_projects where user_id in (user_a_id, user_b_id);
  delete from public.profiles where id in (user_a_id, user_b_id);
  delete from auth.users where id in (user_a_id, user_b_id);
  delete from public.projects where id in (proj_pub_id, proj_draft_id);

  insert into auth.users (id, email, raw_user_meta_data, role, aud)
  values
    (user_a_id, 'user_a@loop.test', '{"display_name":"Crochet Learner A"}'::jsonb, 'authenticated', 'authenticated'),
    (user_b_id, 'user_b@loop.test', '{"display_name":"Crochet Learner B"}'::jsonb, 'authenticated', 'authenticated')
  on conflict (id) do nothing;

  insert into public.profiles (id, display_name)
  values
    (user_a_id, 'Crochet Learner A'),
    (user_b_id, 'Crochet Learner B')
  on conflict (id) do update set display_name = excluded.display_name;

  insert into public.projects (id, slug, title, description, category, difficulty, published)
  values
    (proj_pub_id, 'test-published-scarf', 'Classic Ribbed Scarf', 'Beginner scarf project', 'accessories', 'beginner', true),
    (proj_draft_id, 'test-draft-blanket', 'Heirloom Afghan', 'Advanced draft project', 'home', 'advanced', false)
  on conflict (id) do nothing;

  insert into public.user_projects (user_id, project_id, status)
  values (user_b_id, proj_pub_id, 'in_progress')
  on conflict (user_id, project_id) do nothing;

  insert into public.learning_progress (user_id, project_id, learning_mode, video_position_seconds, completed_step_identifiers)
  values (user_b_id, proj_pub_id, 'steps', 120, array['step-1', 'step-2'])
  on conflict (user_id, project_id) do nothing;

  -- ==========================================================================
  -- TEST GROUP 1: Anonymous Role Access (4 checks)
  -- ==========================================================================
  set local role anon;
  set local "request.jwt.claim.role" = 'anon';
  set local "request.jwt.claim.sub" = '';

  -- 1.1 Anonymous can read published projects
  select count(*) into v_count from public.projects where id = proj_pub_id;
  if v_count = 1 then
    v_pass_1_1 := true;
  else
    v_detail_1_1 := 'expected 1, got ' || v_count;
  end if;

  -- 1.2 Anonymous CANNOT read unpublished / draft projects
  select count(*) into v_count from public.projects where id = proj_draft_id;
  if v_count = 0 then
    v_pass_1_2 := true;
  else
    v_detail_1_2 := 'saw unpublished projects: ' || v_count;
  end if;

  -- 1.3 Anonymous CANNOT read private user profiles
  -- Exception is caught for table grant revocation. If query succeeds, count must strictly be 0.
  v_error_caught := false;
  v_count := -1;
  begin
    select count(*) into v_count from public.profiles;
  exception when others then
    v_error_caught := true;
  end;
  if v_error_caught or v_count = 0 then
    v_pass_1_3 := true;
  else
    v_detail_1_3 := 'profiles read by anonymous: ' || v_count;
  end if;

  -- 1.4 Anonymous CANNOT insert into project catalogue
  v_error_caught := false;
  begin
    insert into public.projects (slug, title, category, difficulty, published)
    values ('hacked-project', 'Hacked Project', 'misc', 'beginner', true);
  exception when others then
    v_error_caught := true;
  end;
  if v_error_caught then
    v_pass_1_4 := true;
  else
    v_detail_1_4 := 'anonymous insert succeeded';
  end if;

  -- ==========================================================================
  -- TEST GROUP 2: Authenticated User A Access & Isolation (8 checks)
  -- ==========================================================================
  reset role;
  set local role authenticated;
  set local "request.jwt.claim.role" = 'authenticated';
  set local "request.jwt.claim.sub" = '11111111-1111-4111-8111-111111111111';

  -- 2.1 User A can read own profile
  select count(*) into v_count from public.profiles where id = user_a_id;
  if v_count = 1 then
    v_pass_2_1 := true;
  else
    v_detail_2_1 := 'expected 1, got ' || v_count;
  end if;

  -- 2.2 User A CANNOT read User B profile
  select count(*) into v_count from public.profiles where id = user_b_id;
  if v_count = 0 then
    v_pass_2_2 := true;
  else
    v_detail_2_2 := 'read User B profile count: ' || v_count;
  end if;

  -- 2.3 User A can update own profile
  update public.profiles set experience_level = 'intermediate' where id = user_a_id;
  get diagnostics v_count = row_count;
  if v_count = 1 then
    v_pass_2_3 := true;
  else
    v_detail_2_3 := 'updated ' || v_count || ' rows';
  end if;

  -- 2.4 User A CANNOT update User B profile
  update public.profiles set display_name = 'Attacker Name' where id = user_b_id;
  get diagnostics v_count = row_count;
  if v_count = 0 then
    v_pass_2_4 := true;
  else
    v_detail_2_4 := 'updated User B rows: ' || v_count;
  end if;

  -- 2.5 User A can create and manage own user_project and learning_progress
  v_error_caught := false;
  begin
    insert into public.user_projects (user_id, project_id, status)
    values (user_a_id, proj_pub_id, 'in_progress');

    insert into public.learning_progress (user_id, project_id, learning_mode, video_position_seconds, completed_step_identifiers)
    values (user_a_id, proj_pub_id, 'written', 45, array['step-1']);
  exception when others then
    v_error_caught := true;
    v_detail_2_5 := sqlerrm;
  end;
  if not v_error_caught then
    v_pass_2_5 := true;
  end if;

  -- 2.6 User A CANNOT read User B user_projects or learning_progress
  select count(*) into v_count from public.user_projects where user_id = user_b_id;
  if v_count = 0 then
    select count(*) into v_count from public.learning_progress where user_id = user_b_id;
    if v_count = 0 then
      v_pass_2_6 := true;
    else
      v_detail_2_6 := 'read User B progress: ' || v_count;
    end if;
  else
    v_detail_2_6 := 'read User B user_projects: ' || v_count;
  end if;

  -- 2.7 User A CANNOT transfer ownership to User B (WITH CHECK validation)
  v_error_caught := false;
  begin
    insert into public.user_projects (user_id, project_id, status)
    values (user_b_id, proj_draft_id, 'saved');
  exception when others then
    v_error_caught := true;
  end;
  if v_error_caught then
    v_pass_2_7 := true;
  else
    v_detail_2_7 := 'ownership transfer allowed';
  end if;

  -- 2.8 User A CANNOT modify project catalogue
  v_error_caught := false;
  begin
    delete from public.projects where id = proj_pub_id;
  exception when others then
    v_error_caught := true;
  end;
  if v_error_caught then
    v_pass_2_8 := true;
  else
    v_detail_2_8 := 'catalogue deletion allowed';
  end if;

  -- ==========================================================================
  -- STEP 3: Record results and clean up test fixtures as session user
  -- ==========================================================================
  reset role;

  -- Clean up test records completely
  delete from public.learning_progress where user_id in (user_a_id, user_b_id);
  delete from public.user_projects where user_id in (user_a_id, user_b_id);
  delete from public.profiles where id in (user_a_id, user_b_id);
  delete from auth.users where id in (user_a_id, user_b_id);
  delete from public.projects where id in (proj_pub_id, proj_draft_id);

  -- Populate explicit result rows
  insert into rls_test_results values
    ('1.1', 'Anonymous can read published projects', case when v_pass_1_1 then 'PASS' else 'FAIL: ' || v_detail_1_1 end),
    ('1.2', 'Anonymous cannot see draft/unpublished projects', case when v_pass_1_2 then 'PASS' else 'FAIL: ' || v_detail_1_2 end),
    ('1.3', 'Anonymous cannot read user profiles (access restricted)', case when v_pass_1_3 then 'PASS' else 'FAIL: ' || v_detail_1_3 end),
    ('1.4', 'Anonymous cannot insert or modify project catalogue', case when v_pass_1_4 then 'PASS' else 'FAIL: ' || v_detail_1_4 end),
    ('2.1', 'User A can read own profile', case when v_pass_2_1 then 'PASS' else 'FAIL: ' || v_detail_2_1 end),
    ('2.2', 'User A cannot read User B profile', case when v_pass_2_2 then 'PASS' else 'FAIL: ' || v_detail_2_2 end),
    ('2.3', 'User A can update own profile', case when v_pass_2_3 then 'PASS' else 'FAIL: ' || v_detail_2_3 end),
    ('2.4', 'User A cannot update User B profile', case when v_pass_2_4 then 'PASS' else 'FAIL: ' || v_detail_2_4 end),
    ('2.5', 'User A can save project and record progress', case when v_pass_2_5 then 'PASS' else 'FAIL: ' || v_detail_2_5 end),
    ('2.6', 'User A cannot read User B project progress', case when v_pass_2_6 then 'PASS' else 'FAIL: ' || v_detail_2_6 end),
    ('2.7', 'Ownership transfer prevented on insert', case when v_pass_2_7 then 'PASS' else 'FAIL: ' || v_detail_2_7 end),
    ('2.8', 'Authenticated users cannot delete or edit project catalogue', case when v_pass_2_8 then 'PASS' else 'FAIL: ' || v_detail_2_8 end);

  select count(*) into v_failures from rls_test_results where status like 'FAIL%';
  if v_failures = 0 then
    insert into rls_test_results values ('SUMMARY', 'All 12 RLS security checks passed successfully', '12 / 12 PASSED');
  else
    insert into rls_test_results values ('SUMMARY', 'RLS security checks failed', v_failures || ' / 12 FAILED');
    raise exception 'RLS verification failed: % check(s) did not pass. Inspect results.', v_failures;
  end if;
end;
$$;

-- Return tabular pass/fail results directly in Supabase SQL Editor
select check_id, description, status from rls_test_results order by check_id;
