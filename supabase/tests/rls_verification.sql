-- ============================================================================
-- LOOP — RLS Access Control Verification Script
-- Milestone: Day 2  |  12 checks: Anonymous (4) + Authenticated isolation (8)
--
-- HOW TO RUN
--   1. Open Supabase Dashboard → SQL Editor → New query.
--   2. Paste this entire file and click Run.
--   3. In the Results tab you will see one row per check plus a SUMMARY row.
--
-- SUCCESS looks like:
--   check_id | description                                | status
--   ---------|--------------------------------------------|---------------
--   1.1      | Anonymous can read published projects      | PASS
--   ...      | ...                                        | PASS
--   SUMMARY  | All 12 checks passed                       | 12 / 12 PASSED
--
-- ON FAILURE:
--   The script raises an error. The error message shown by the SQL Editor
--   contains each failing check's id and reason (e.g. "1.3: read 2 rows").
--   Because the whole run is inside a BEGIN/ROLLBACK, the result table rows
--   are rolled back along with the fixtures and are not shown after an error.
--   The error message is therefore the definitive failure record.
--
-- SAFETY
--   Every INSERT, UPDATE, and DELETE runs inside a single transaction that
--   ends in ROLLBACK. No test data is ever committed to the database.
-- ============================================================================

-- Create result table for the session (outside the transaction; its schema
-- survives the rollback; the rows inserted inside are rolled back with everything
-- else, but the SELECT that shows them runs before the rollback).
create temp table if not exists rls_results (
  check_id    text primary key,
  description text not null,
  status      text not null
);
truncate rls_results;

-- ============================================================================
-- Everything from here to ROLLBACK is one atomic transaction.
-- ============================================================================
begin;

-- ---- Seed test fixtures (all rolled back at the end) -----------------------
insert into auth.users (id, email, raw_user_meta_data, role, aud)
values
  ('11111111-1111-4111-8111-111111111111'::uuid,
   'user_a@loop.test', '{"display_name":"Crochet Learner A"}'::jsonb,
   'authenticated', 'authenticated'),
  ('22222222-2222-4222-8222-222222222222'::uuid,
   'user_b@loop.test', '{"display_name":"Crochet Learner B"}'::jsonb,
   'authenticated', 'authenticated')
on conflict (id) do nothing;

-- Trigger handle_new_user creates profiles automatically; ensure display names
-- are set even if the trigger already fired.
insert into public.profiles (id, display_name)
values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Crochet Learner A'),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Crochet Learner B')
on conflict (id) do update set display_name = excluded.display_name;

insert into public.projects (id, slug, title, description, category, difficulty, published)
values
  ('33333333-3333-4333-8333-333333333333'::uuid,
   'test-rls-scarf', 'RLS Test Scarf', 'RLS test fixture — published',
   'accessories', 'beginner', true),
  ('44444444-4444-4444-8444-444444444444'::uuid,
   'test-rls-blanket', 'RLS Test Blanket', 'RLS test fixture — draft',
   'home', 'advanced', false)
on conflict (id) do nothing;

-- User B already has saved progress (used to test isolation for User A)
insert into public.user_projects (user_id, project_id, status)
values ('22222222-2222-4222-8222-222222222222'::uuid,
        '33333333-3333-4333-8333-333333333333'::uuid, 'in_progress')
on conflict (user_id, project_id) do nothing;

insert into public.learning_progress
  (user_id, project_id, learning_mode, video_position_seconds, completed_step_identifiers)
values ('22222222-2222-4222-8222-222222222222'::uuid,
        '33333333-3333-4333-8333-333333333333'::uuid,
        'steps', 120, array['step-1', 'step-2'])
on conflict (user_id, project_id) do nothing;

-- ============================================================================
-- DO block: run all 12 checks, then SELECT results, then signal failures.
--
-- Design rules applied here:
--   • Negative DML tests (we expect a permission error) catch only
--     insufficient_privilege / check_violation so that our own RAISE EXCEPTION
--     is never silently swallowed and misreported as a pass.
--   • Positive DML tests (we expect success) use WHEN OTHERS to record any
--     unexpected error as a failure without aborting remaining checks.
--   • If any checks fail, all failure details are embedded in one final
--     RAISE EXCEPTION so they appear in the SQL Editor error message.
--     (The SELECT below only runs when every check passes.)
-- ============================================================================
do $$
declare
  user_a   uuid := '11111111-1111-4111-8111-111111111111';
  user_b   uuid := '22222222-2222-4222-8222-222222222222';
  pub_proj uuid := '33333333-3333-4333-8333-333333333333';
  dft_proj uuid := '44444444-4444-4444-8444-444444444444';

  v_count  integer;
  v_rows   integer;
  v_caught boolean;

  -- Failure accumulator: each failing check appends "id: reason"
  v_fails  text[] := '{}';

  -- Per-check pass flag and detail
  v_pass   boolean;
  v_detail text;
begin

  -- ==========================================================================
  -- GROUP 1 — Anonymous role (4 checks)
  -- ==========================================================================
  set local role anon;
  set local "request.jwt.claim.role" = 'anon';
  set local "request.jwt.claim.sub"  = '';

  -- 1.1  Anonymous can read published projects
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.projects where id = pub_proj;
  if v_count = 1 then
    v_pass := true;
  else
    v_detail := 'expected 1 row, got ' || v_count;
    v_fails  := v_fails || ('1.1: ' || v_detail);
  end if;
  insert into rls_results values
    ('1.1', 'Anonymous can read published projects',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 1.2  Anonymous cannot read draft projects
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.projects where id = dft_proj;
  if v_count = 0 then
    v_pass := true;
  else
    v_detail := 'read ' || v_count || ' unpublished row(s)';
    v_fails  := v_fails || ('1.2: ' || v_detail);
  end if;
  insert into rls_results values
    ('1.2', 'Anonymous cannot read draft/unpublished projects',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 1.3  Anonymous cannot read user profiles
  --      Catch only insufficient_privilege (table-level grant revoked).
  --      An RLS-silent zero count is also a valid pass.
  --      Any other exception propagates and aborts the DO block (not hidden).
  v_pass := false; v_detail := ''; v_count := -1;
  begin
    select count(*) into v_count from public.profiles;
  exception
    when insufficient_privilege then v_count := 0;   -- grant denied → pass
  end;
  if v_count = 0 then
    v_pass := true;
  else
    v_detail := 'read ' || v_count || ' profile row(s)';
    v_fails  := v_fails || ('1.3: ' || v_detail);
  end if;
  insert into rls_results values
    ('1.3', 'Anonymous cannot read user profiles',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 1.4  Anonymous cannot insert into project catalogue
  --      Catch only insufficient_privilege; our own RAISE EXCEPTION is not caught.
  v_pass := false; v_detail := 'insert succeeded without error'; v_caught := false;
  begin
    insert into public.projects (slug, title, category, difficulty, published)
    values ('rls-hack-attempt', 'Hacked', 'misc', 'beginner', true);
  exception
    when insufficient_privilege then v_caught := true;
  end;
  if v_caught then
    v_pass := true; v_detail := '';
  else
    v_fails := v_fails || ('1.4: ' || v_detail);
  end if;
  insert into rls_results values
    ('1.4', 'Anonymous cannot insert into project catalogue',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- ==========================================================================
  -- GROUP 2 — Authenticated User A, isolated from User B (8 checks)
  -- ==========================================================================
  reset role;
  set local role authenticated;
  set local "request.jwt.claim.role" = 'authenticated';
  set local "request.jwt.claim.sub"  = '11111111-1111-4111-8111-111111111111';

  -- 2.1  User A can read own profile
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.profiles where id = user_a;
  if v_count = 1 then
    v_pass := true;
  else
    v_detail := 'expected 1, got ' || v_count;
    v_fails  := v_fails || ('2.1: ' || v_detail);
  end if;
  insert into rls_results values
    ('2.1', 'User A can read own profile',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 2.2  User A cannot read User B profile
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.profiles where id = user_b;
  if v_count = 0 then
    v_pass := true;
  else
    v_detail := 'read ' || v_count || ' row(s) for User B';
    v_fails  := v_fails || ('2.2: ' || v_detail);
  end if;
  insert into rls_results values
    ('2.2', 'User A cannot read User B profile',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 2.3  User A can update own profile
  v_pass := false; v_detail := ''; v_rows := 0;
  update public.profiles set experience_level = 'intermediate' where id = user_a;
  get diagnostics v_rows = row_count;
  if v_rows = 1 then
    v_pass := true;
  else
    v_detail := 'updated ' || v_rows || ' rows (expected 1)';
    v_fails  := v_fails || ('2.3: ' || v_detail);
  end if;
  insert into rls_results values
    ('2.3', 'User A can update own profile',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 2.4  User A cannot update User B profile
  v_pass := false; v_detail := ''; v_rows := 0;
  update public.profiles set display_name = 'Attacker' where id = user_b;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    v_pass := true;
  else
    v_detail := 'updated ' || v_rows || ' row(s) for User B';
    v_fails  := v_fails || ('2.4: ' || v_detail);
  end if;
  insert into rls_results values
    ('2.4', 'User A cannot update User B profile',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 2.5  User A can save a project AND record learning progress
  --      Both INSERTs must succeed; WHEN OTHERS records any failure detail.
  --      (This is a positive test: we expect success, so catching all errors
  --       is correct — there is no security boundary to accidentally pass.)
  v_pass := false; v_detail := '';
  begin
    insert into public.user_projects (user_id, project_id, status)
    values (user_a, pub_proj, 'in_progress');

    insert into public.learning_progress
      (user_id, project_id, learning_mode, video_position_seconds, completed_step_identifiers)
    values (user_a, pub_proj, 'written', 45, array['step-1']);

    v_pass := true;
  exception
    when others then
      v_detail := sqlerrm;
      v_fails  := v_fails || ('2.5: ' || v_detail);
  end;
  insert into rls_results values
    ('2.5', 'User A can save project and record learning progress',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 2.6  User A cannot read User B user_projects OR learning_progress
  --      Both tables are checked; failing either table is a failure.
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.user_projects where user_id = user_b;
  if v_count <> 0 then
    v_detail := 'read ' || v_count || ' user_projects row(s) for User B';
    v_fails  := v_fails || ('2.6: ' || v_detail);
  else
    select count(*) into v_count from public.learning_progress where user_id = user_b;
    if v_count <> 0 then
      v_detail := 'read ' || v_count || ' learning_progress row(s) for User B';
      v_fails  := v_fails || ('2.6: ' || v_detail);
    else
      v_pass := true;
    end if;
  end if;
  insert into rls_results values
    ('2.6', 'User A cannot read User B project progress (user_projects + learning_progress)',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 2.7  User A cannot insert a record owned by User B (ownership spoofing)
  --      Catch only the two error codes an RLS WITH CHECK violation produces.
  --      Our own RAISE EXCEPTION (sqlstate P0001) is not caught here.
  v_pass := false; v_detail := 'insert succeeded without error'; v_caught := false;
  begin
    insert into public.user_projects (user_id, project_id, status)
    values (user_b, dft_proj, 'saved');
  exception
    when insufficient_privilege then v_caught := true;
    when check_violation        then v_caught := true;
  end;
  if v_caught then
    v_pass := true; v_detail := '';
  else
    v_fails := v_fails || ('2.7: ' || v_detail);
  end if;
  insert into rls_results values
    ('2.7', 'User A cannot create records owned by User B (ownership spoofing)',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- 2.8  Authenticated user cannot delete OR update project catalogue
  --      Two operations tested; both must be blocked.
  --      DELETE: either raises insufficient_privilege or returns 0 affected rows.
  --      UPDATE: either raises insufficient_privilege or returns 0 affected rows.
  v_pass := false; v_detail := ''; v_caught := false; v_rows := 0;

  -- 2.8a DELETE
  begin
    delete from public.projects where id = pub_proj;
    get diagnostics v_rows = row_count;
  exception
    when insufficient_privilege then v_caught := true;
  end;
  if not v_caught and v_rows > 0 then
    v_detail := 'deleted ' || v_rows || ' catalogue row(s)';
    v_fails  := v_fails || ('2.8: ' || v_detail);
  else
    -- 2.8b UPDATE
    v_caught := false; v_rows := 0;
    begin
      update public.projects set description = 'Hacked' where id = pub_proj;
      get diagnostics v_rows = row_count;
    exception
      when insufficient_privilege then v_caught := true;
    end;
    if not v_caught and v_rows > 0 then
      v_detail := 'updated ' || v_rows || ' catalogue row(s)';
      v_fails  := v_fails || ('2.8: ' || v_detail);
    else
      v_pass := true;
    end if;
  end if;
  insert into rls_results values
    ('2.8', 'Authenticated user cannot delete or update project catalogue',
     case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- ==========================================================================
  -- Summary row
  -- ==========================================================================
  reset role;

  if array_length(v_fails, 1) is null then
    insert into rls_results values
      ('SUMMARY', 'All 12 checks passed', '12 / 12 PASSED');
  else
    insert into rls_results values (
      'SUMMARY',
      array_length(v_fails, 1)::text || ' check(s) failed',
      array_length(v_fails, 1)::text || ' / 12 FAILED'
    );
    -- Raise with all failure details embedded in the message.
    -- The SELECT below will not run on this path; the error message IS the report.
    raise exception
      'RLS VERIFICATION FAILED — % of 12 check(s) did not pass. Details: %',
      array_length(v_fails, 1),
      array_to_string(v_fails, ' | ');
  end if;

end;
$$;

-- ============================================================================
-- Return visible results (runs only when all 12 checks passed).
-- The ROLLBACK that follows cleans up fixtures + result rows atomically.
-- ============================================================================
select check_id, description, status
from   rls_results
order  by check_id;

rollback;
