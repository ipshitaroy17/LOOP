-- ============================================================================
-- LOOP — RLS & Multi-Tutorial Architecture Verification
-- Milestone: Day 7 Multi-Tutorial Architecture Enhancement | 16 checks
--
-- Group M1 (6): Multi-tutorial model, composite key uniqueness, step attachment,
--               and co-located draft/published isolation within the SAME project.
-- Group M2 (3): Dual published gate (published project + verified_published tutorial).
-- Group M3 (7): Write protection & draft isolation (anon & authenticated).
--
-- HOW TO RUN
--   Prerequisite: Run 20261108000000_multiple_tutorials_per_project.sql in Supabase
--   SQL Editor first.
--
--   1. Open Supabase Dashboard → SQL Editor → New query.
--   2. Paste this entire file and click Run.
--   3. Results tab shows one row per check plus a SUMMARY row.
--
-- SUCCESS looks like:
--   check_id | description                                                | status
--   ---------|------------------------------------------------------------|-------
--   M1.1     | Multiple tutorials can belong to the same project          | PASS
--   ...
--   SUMMARY  | All 16 checks passed                                       | 16 / 16 PASSED
--
-- SAFETY & ISOLATION:
--   Every INSERT/UPDATE/DELETE runs inside a single transaction that ends in
--   ROLLBACK. No test data is ever committed.
-- ============================================================================

create temp table if not exists rls_tut_results (
  check_id    text primary key,
  description text not null,
  status      text not null
);
truncate rls_tut_results;

begin;

-- ============================================================================
-- Fixtures — session user (bypasses RLS); all rolled back at end
-- ============================================================================

-- P_MULTI: Published project hosting MULTIPLE tutorials (1 verified, 1 draft)
insert into public.projects (id, slug, title, description, category, difficulty, published)
values (
  '11111111-aaaa-4111-8111-111111111111'::uuid,
  'rls7-multi-pub-project', 'Multi-Tutorial Test Project (Published)',
  'Multi-tutorial fixture', 'home-decor', 'beginner', true
)
on conflict (id) do nothing;

-- P_UNPUB: Unpublished project hosting a verified tutorial (tests dual gate)
insert into public.projects (id, slug, title, description, category, difficulty, published)
values (
  '22222222-bbbb-4222-8222-222222222222'::uuid,
  'rls7-unpub-project', 'Unpublished Project (With Verified Tutorial)',
  'Dual-gate fixture', 'home-decor', 'beginner', false
)
on conflict (id) do nothing;

-- P_TARGET: Published project with NO tutorials — safe INSERT permission test target
insert into public.projects (id, slug, title, description, category, difficulty, published)
values (
  '33333333-cccc-4333-8333-333333333333'::uuid,
  'rls7-clean-target-project', 'Clean Target Project',
  'Insert permission test fixture', 'home-decor', 'beginner', true
)
on conflict (id) do nothing;

-- TUT_PUB: Verified & published tutorial on P_MULTI
insert into public.tutorials (
  id, project_id, tutorial_key, title, learning_objective, terminology, pattern_source_type, review_status
)
values (
  'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
  '11111111-aaaa-4111-8111-111111111111'::uuid,
  'main-video', 'Published Primary Lesson', 'Learn foundations', 'US', 'original_loop', 'verified_published'
)
on conflict (project_id, tutorial_key) do nothing;

-- TUT_DRAFT: Draft tutorial on the SAME project P_MULTI
insert into public.tutorials (
  id, project_id, tutorial_key, title, learning_objective, terminology, pattern_source_type, review_status
)
values (
  'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
  '11111111-aaaa-4111-8111-111111111111'::uuid,
  'variation-b', 'Draft Alternative Lesson', 'Learn variation', 'US', 'original_loop', 'draft'
)
on conflict (project_id, tutorial_key) do nothing;

-- TUT_UNPUB_VER: Verified tutorial on UNPUBLISHED project P_UNPUB
insert into public.tutorials (
  id, project_id, tutorial_key, title, learning_objective, terminology, pattern_source_type, review_status
)
values (
  'cccccccc-3333-4ccc-8ccc-cccccccccccc'::uuid,
  '22222222-bbbb-4222-8222-222222222222'::uuid,
  'main-video', 'Verified Tutorial on Unpub Project', 'Test', 'US', 'original_loop', 'verified_published'
)
on conflict (project_id, tutorial_key) do nothing;

-- STEP_PUB: Step belonging to TUT_PUB
insert into public.pattern_steps (id, tutorial_id, step_number, step_identifier, title, instruction)
values (
  'dddddddd-4444-4ddd-8ddd-dddddddddddd'::uuid,
  'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
  1, 'step-pub-1', 'Published Step 1', 'Work foundation chain'
)
on conflict (tutorial_id, step_number) do nothing;

-- STEP_DRAFT: Step belonging to TUT_DRAFT
insert into public.pattern_steps (id, tutorial_id, step_number, step_identifier, title, instruction)
values (
  'eeeeeeee-5555-4eee-8eee-eeeeeeeeeeee'::uuid,
  'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
  1, 'step-draft-1', 'Draft Step 1', 'Draft instruction'
)
on conflict (tutorial_id, step_number) do nothing;

-- STEP_UNPUB: Step belonging to TUT_UNPUB_VER
insert into public.pattern_steps (id, tutorial_id, step_number, step_identifier, title, instruction)
values (
  'ffffffff-6666-4fff-8fff-ffffffffffff'::uuid,
  'cccccccc-3333-4ccc-8ccc-cccccccccccc'::uuid,
  1, 'step-unpub-1', 'Unpublished Parent Step 1', 'Test'
)
on conflict (tutorial_id, step_number) do nothing;

-- ============================================================================
-- DO block: 16 checks
-- ============================================================================
do $$
declare
  v_count   integer;
  v_rows    integer;
  v_caught  boolean;
  v_pass    boolean;
  v_detail  text;
  v_fails   text[] := array[]::text[];

  r_ids   text[] := array[]::text[];
  r_descs text[] := array[]::text[];
  r_stats text[] := array[]::text[];

  proj_multi    uuid := '11111111-aaaa-4111-8111-111111111111';
  proj_unpub    uuid := '22222222-bbbb-4222-8222-222222222222';
  proj_target   uuid := '33333333-cccc-4333-8333-333333333333';

  tut_pub       uuid := 'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa';
  tut_draft     uuid := 'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb';
  tut_unpub_ver uuid := 'cccccccc-3333-4ccc-8ccc-cccccccccccc';

  step_pub      uuid := 'dddddddd-4444-4ddd-8ddd-dddddddddddd';
  step_draft    uuid := 'eeeeeeee-5555-4eee-8eee-eeeeeeeeeeee';
  step_unpub    uuid := 'ffffffff-6666-4fff-8fff-ffffffffffff';

  i integer;
begin

  -- ==========================================================================
  -- GROUP M1 — Multi-Tutorial Model & Project-Level Coexistence (6 checks)
  -- ==========================================================================

  -- M1.1  Multiple tutorials can belong to the same project (session user check)
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.tutorials where project_id = proj_multi;
  if v_count = 2 then v_pass := true;
  else v_detail := 'expected 2 tutorials on project, got ' || v_count;
       v_fails  := array_append(v_fails, 'M1.1: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M1.1');
  r_descs := array_append(r_descs, 'Two tutorials can belong to one project');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M1.2  Duplicate tutorial_key within the same project is rejected
  v_pass := false; v_detail := 'duplicate insert unexpectedly succeeded'; v_caught := false;
  begin
    insert into public.tutorials (
      project_id, tutorial_key, title, learning_objective, terminology, pattern_source_type, review_status
    )
    values (
      proj_multi, 'main-video', 'Duplicate Key Lesson', 'Should fail', 'US', 'original_loop', 'draft'
    );
  exception
    when unique_violation then v_caught := true;
  end;
  if v_caught then v_pass := true; v_detail := '';
  else v_fails := array_append(v_fails, 'M1.2: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M1.2');
  r_descs := array_append(r_descs, 'Duplicate tutorial_key within same project is rejected (UNIQUE)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- Switch to anon role to verify co-located isolation and step attachment
  set local role anon;
  set local "request.jwt.claim.role" = 'anon';
  set local "request.jwt.claim.sub"  = '';

  -- M1.3  Publishing one tutorial does NOT expose another draft tutorial on the same project
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.tutorials where project_id = proj_multi;
  if v_count = 1 then
    -- Verify the one row returned is indeed the verified one
    select count(*) into v_count from public.tutorials where id = tut_pub;
    if v_count = 1 then v_pass := true;
    else v_detail := 'returned row was not the published tutorial';
         v_fails  := array_append(v_fails, 'M1.3: ' || v_detail); end if;
  else
    v_detail := 'anon read ' || v_count || ' tutorial rows on project (draft leaked)';
    v_fails  := array_append(v_fails, 'M1.3: ' || v_detail);
  end if;
  r_ids   := array_append(r_ids,   'M1.3');
  r_descs := array_append(r_descs, 'Publishing one tutorial does not expose co-located draft tutorial (anon)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M1.4  Steps remain attached to correct tutorial: published tutorial steps are readable
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.pattern_steps where tutorial_id = tut_pub;
  if v_count = 1 then v_pass := true;
  else v_detail := 'expected 1 step for published tutorial, got ' || v_count;
       v_fails  := array_append(v_fails, 'M1.4: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M1.4');
  r_descs := array_append(r_descs, 'Steps of published tutorial are readable (anon)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M1.5  Steps of co-located draft tutorial remain hidden from anon
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.pattern_steps where tutorial_id = tut_draft;
  if v_count = 0 then v_pass := true;
  else v_detail := 'read ' || v_count || ' step(s) belonging to draft tutorial';
       v_fails  := array_append(v_fails, 'M1.5: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M1.5');
  r_descs := array_append(r_descs, 'Steps of co-located draft tutorial are hidden (anon)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M1.6  Steps of co-located draft tutorial remain hidden from authenticated user
  reset role;
  set local role authenticated;
  set local "request.jwt.claim.role" = 'authenticated';
  set local "request.jwt.claim.sub"  = '99999999-9999-4999-8999-999999999999';

  v_pass := false; v_detail := '';
  select count(*) into v_count from public.pattern_steps where tutorial_id = tut_draft;
  if v_count = 0 then v_pass := true;
  else v_detail := 'read ' || v_count || ' draft step(s) as authenticated user';
       v_fails  := array_append(v_fails, 'M1.6: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M1.6');
  r_descs := array_append(r_descs, 'Steps of co-located draft tutorial are hidden (authenticated)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- ==========================================================================
  -- GROUP M2 — Dual Published Gate (3 checks)
  -- ==========================================================================
  set local role anon;
  set local "request.jwt.claim.role" = 'anon';
  set local "request.jwt.claim.sub"  = '';

  -- M2.1  Verified tutorial on UNPUBLISHED project is hidden from anon
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.tutorials where id = tut_unpub_ver;
  if v_count = 0 then v_pass := true;
  else v_detail := 'read ' || v_count || ' row(s) — verified tutorial leaked under unpublished parent';
       v_fails  := array_append(v_fails, 'M2.1: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M2.1');
  r_descs := array_append(r_descs, 'Verified tutorial hidden when parent project unpublished (anon)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M2.2  Steps of verified tutorial on UNPUBLISHED project are hidden from anon
  v_pass := false; v_detail := '';
  select count(*) into v_count from public.pattern_steps where id = step_unpub;
  if v_count = 0 then v_pass := true;
  else v_detail := 'read ' || v_count || ' step(s) — leaked under unpublished parent';
       v_fails  := array_append(v_fails, 'M2.2: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M2.2');
  r_descs := array_append(r_descs, 'Steps of verified tutorial hidden when parent unpublished (anon)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M2.3  Verified tutorial on UNPUBLISHED project is hidden from authenticated user
  reset role;
  set local role authenticated;
  set local "request.jwt.claim.role" = 'authenticated';
  set local "request.jwt.claim.sub"  = '99999999-9999-4999-8999-999999999999';

  v_pass := false; v_detail := '';
  select count(*) into v_count from public.tutorials where id = tut_unpub_ver;
  if v_count = 0 then v_pass := true;
  else v_detail := 'read ' || v_count || ' row(s) — leaked to authenticated user under unpublished parent';
       v_fails  := array_append(v_fails, 'M2.3: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M2.3');
  r_descs := array_append(r_descs, 'Verified tutorial hidden when parent project unpublished (authenticated)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- ==========================================================================
  -- GROUP M3 — Write Protection & Modification Guards (7 checks)
  -- ==========================================================================
  set local role anon;
  set local "request.jwt.claim.role" = 'anon';
  set local "request.jwt.claim.sub"  = '';

  -- M3.1  Anonymous cannot insert into tutorials
  v_pass := false; v_detail := 'insert succeeded without error'; v_caught := false;
  begin
    insert into public.tutorials (
      project_id, tutorial_key, title, learning_objective, terminology, pattern_source_type, review_status
    )
    values (proj_target, 'anon-hack', 'Hack', 'Obj', 'US', 'original_loop', 'draft');
  exception
    when insufficient_privilege then v_caught := true;
    when check_violation        then v_caught := true;
  end;
  if v_caught then v_pass := true; v_detail := '';
  else v_fails := array_append(v_fails, 'M3.1: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M3.1');
  r_descs := array_append(r_descs, 'Anonymous cannot insert into tutorials');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M3.2  Anonymous cannot insert into pattern_steps
  v_pass := false; v_detail := 'insert succeeded without error'; v_caught := false;
  begin
    insert into public.pattern_steps (tutorial_id, step_number, step_identifier, title, instruction)
    values (tut_pub, 99, 'anon-step-hack', 'Hack', 'Instruction');
  exception
    when insufficient_privilege then v_caught := true;
    when check_violation        then v_caught := true;
  end;
  if v_caught then v_pass := true; v_detail := '';
  else v_fails := array_append(v_fails, 'M3.2: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M3.2');
  r_descs := array_append(r_descs, 'Anonymous cannot insert into pattern_steps');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M3.3  Anonymous cannot publish tutorial via UPDATE
  v_pass := false; v_detail := ''; v_rows := 0; v_caught := false;
  begin
    update public.tutorials set review_status = 'verified_published' where id = tut_draft;
    get diagnostics v_rows = row_count;
  exception
    when insufficient_privilege then v_caught := true;
  end;
  if v_caught or v_rows = 0 then v_pass := true;
  else v_detail := 'UPDATE affected ' || v_rows || ' row(s)';
       v_fails  := array_append(v_fails, 'M3.3: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M3.3');
  r_descs := array_append(r_descs, 'Anonymous cannot publish tutorial via UPDATE');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- Authenticated user checks
  reset role;
  set local role authenticated;
  set local "request.jwt.claim.role" = 'authenticated';
  set local "request.jwt.claim.sub"  = '99999999-9999-4999-8999-999999999999';

  -- M3.4  Authenticated user cannot insert into tutorials
  v_pass := false; v_detail := 'insert succeeded without error'; v_caught := false;
  begin
    insert into public.tutorials (
      project_id, tutorial_key, title, learning_objective, terminology, pattern_source_type, review_status
    )
    values (proj_target, 'auth-hack', 'Hack', 'Obj', 'US', 'original_loop', 'draft');
  exception
    when insufficient_privilege then v_caught := true;
    when check_violation        then v_caught := true;
  end;
  if v_caught then v_pass := true; v_detail := '';
  else v_fails := array_append(v_fails, 'M3.4: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M3.4');
  r_descs := array_append(r_descs, 'Authenticated user cannot insert into tutorials');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M3.5  Authenticated user cannot insert into pattern_steps
  v_pass := false; v_detail := 'insert succeeded without error'; v_caught := false;
  begin
    insert into public.pattern_steps (tutorial_id, step_number, step_identifier, title, instruction)
    values (tut_pub, 99, 'auth-step-hack', 'Hack', 'Instruction');
  exception
    when insufficient_privilege then v_caught := true;
    when check_violation        then v_caught := true;
  end;
  if v_caught then v_pass := true; v_detail := '';
  else v_fails := array_append(v_fails, 'M3.5: ' || v_detail); end if;
  r_ids   := array_append(r_ids,   'M3.5');
  r_descs := array_append(r_descs, 'Authenticated user cannot insert into pattern_steps');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M3.6  Authenticated user cannot update tutorial rows (draft or published)
  v_pass := false; v_detail := ''; v_rows := 0; v_caught := false;
  begin
    update public.tutorials set review_status = 'verified_published' where id = tut_draft;
    get diagnostics v_rows = row_count;
  exception
    when insufficient_privilege then v_caught := true;
  end;
  if v_caught or v_rows = 0 then
    v_rows := 0; v_caught := false;
    begin
      update public.tutorials set title = 'Hacked Title' where id = tut_pub;
      get diagnostics v_rows = row_count;
    exception
      when insufficient_privilege then v_caught := true;
    end;
    if v_caught or v_rows = 0 then v_pass := true;
    else v_detail := 'UPDATE of published tutorial affected ' || v_rows || ' row(s)';
         v_fails  := array_append(v_fails, 'M3.6: ' || v_detail); end if;
  else
    v_detail := 'UPDATE of draft tutorial affected ' || v_rows || ' row(s)';
    v_fails  := array_append(v_fails, 'M3.6: ' || v_detail);
  end if;
  r_ids   := array_append(r_ids,   'M3.6');
  r_descs := array_append(r_descs, 'Authenticated user cannot update tutorials (draft or published)');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- M3.7  Authenticated user cannot delete tutorials or pattern_steps
  v_pass := false; v_detail := ''; v_rows := 0; v_caught := false;
  begin
    delete from public.tutorials where id = tut_pub;
    get diagnostics v_rows = row_count;
  exception
    when insufficient_privilege then v_caught := true;
  end;
  if v_caught or v_rows = 0 then
    v_rows := 0; v_caught := false;
    begin
      delete from public.pattern_steps where id = step_pub;
      get diagnostics v_rows = row_count;
    exception
      when insufficient_privilege then v_caught := true;
    end;
    if v_caught or v_rows = 0 then v_pass := true;
    else v_detail := 'DELETE of pattern_step affected ' || v_rows || ' row(s)';
         v_fails  := array_append(v_fails, 'M3.7: ' || v_detail); end if;
  else
    v_detail := 'DELETE of tutorial affected ' || v_rows || ' row(s)';
    v_fails  := array_append(v_fails, 'M3.7: ' || v_detail);
  end if;
  r_ids   := array_append(r_ids,   'M3.7');
  r_descs := array_append(r_descs, 'Authenticated user cannot delete tutorials or pattern_steps');
  r_stats := array_append(r_stats, case when v_pass then 'PASS' else 'FAIL: ' || v_detail end);

  -- ==========================================================================
  -- Back to session user; write all results
  -- ==========================================================================
  reset role;

  for i in 1..16 loop
    insert into rls_tut_results (check_id, description, status)
    values (r_ids[i], r_descs[i], r_stats[i]);
  end loop;

  if array_length(v_fails, 1) is null then
    insert into rls_tut_results values ('SUMMARY', 'All 16 checks passed', '16 / 16 PASSED');
  else
    insert into rls_tut_results values (
      'SUMMARY',
      array_length(v_fails, 1)::text || ' check(s) failed',
      array_length(v_fails, 1)::text || ' / 16 FAILED'
    );
    raise exception
      'RLS VERIFICATION FAILED — % of 16 check(s) did not pass. Details: %',
      array_length(v_fails, 1),
      array_to_string(v_fails, ' | ');
  end if;

end;
$$;

-- ============================================================================
-- Return visible results (runs only when all 16 checks passed).
-- ROLLBACK removes all fixtures atomically — nothing is committed.
-- ============================================================================
select check_id, description, status
from   rls_tut_results
order  by check_id;

rollback;
