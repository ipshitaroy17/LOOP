-- ============================================================================
-- LOOP — First Tutorial Content Seed (Draft Preparation)
-- Milestone: Day 7
-- Candidate Project: Beginner Practice Square (slug: beginner-practice-square)
--
-- Safety & Content Principles:
-- 1. Explicitly DRAFT: review_status is set to 'draft'.
-- 2. No fabricated video URLs or creator permissions: video fields are left NULL
--    until verified and approved.
-- 3. Clearly labeled US crochet terminology.
-- 4. Idempotent & non-destructive: uses DO NOTHING on conflict.
-- 5. RLS protected: because review_status = 'draft', this content is NOT
--    queryable by public/anonymous learners until explicitly verified.
-- ============================================================================

do $$
declare
  v_project_id uuid;
  v_tutorial_id uuid;
begin
  -- 1. Find the project ID for 'beginner-practice-square'
  select id into v_project_id
  from public.projects
  where slug = 'beginner-practice-square'
  limit 1;

  if v_project_id is null then
    raise notice 'Project "beginner-practice-square" not found. Skipping tutorial seed.';
    return;
  end if;

  -- 2. Insert Tutorial Record in DRAFT status
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
    v_project_id,
    'main',
    'Beginner Practice Square: Mastering Single Crochet Swatches',
    'Learn how to create a slip knot, work an even foundation chain, single crochet in flat back-and-forth rows, turn with a turning chain, and count stitches accurately to produce neat, straight edges.',
    'US',
    '{
      "ch": "chain stitch",
      "sc": "single crochet (US)",
      "st(s)": "stitch(es)",
      "sl st": "slip stitch",
      "yo": "yarn over",
      "tch": "turning chain"
    }'::jsonb,
    '[
      {"category": "Yarn", "item": "Medium / Worsted weight (#4) acrylic or cotton yarn", "quantity": "Approx. 25g / 40 yards"},
      {"category": "Hook", "item": "5.0 mm (US H-8) ergonomic or aluminum crochet hook", "notes": "A smooth hook helps beginner yarn glide easily"},
      {"category": "Notions", "item": "Tapestry needle with blunt tip", "notes": "Used for weaving in ends"},
      {"category": "Notions", "item": "Sharp scissors", "notes": "For snipping working yarn"},
      {"category": "Optional", "item": "Locking stitch markers (2)", "notes": "Recommended to mark the first and last stitches of each row"}
    ]'::jsonb,
    'original_loop',
    'LOOP Foundational Single Crochet Practice Swatch',
    'LOOP Curriculum Team',
    null,
    'LOOP Educational Content - Review Pending',
    'Original instructional pattern drafted for LOOP introductory learners. Requires hands-on physical swatch verification and user testing before publication.',
    false,
    'Pending hands-on swatch verification for gauge consistency and row count clarity.',
    null, -- No fabricated video URL
    null, -- Creator attribution added after creator confirmation
    null,
    false,
    'draft', -- Explicit DRAFT gate
    null
  )
  on conflict (project_id, tutorial_key) do nothing
  returning id into v_tutorial_id;

  -- If the tutorial already existed, fetch its ID
  if v_tutorial_id is null then
    select id into v_tutorial_id
    from public.tutorials
    where project_id = v_project_id and tutorial_key = 'main';
  end if;

  -- 3. Insert Ordered Steps with Stable Identifiers and Stitch Counts
  -- Step 1: Slip Knot & Foundation Chain
  insert into public.pattern_steps (
    tutorial_id,
    step_number,
    step_identifier,
    title,
    instruction,
    stitch_count,
    abbreviations,
    notes,
    video_timestamp_seconds,
    timestamp_verified
  )
  values (
    v_tutorial_id,
    1,
    'practice-square-step-1-foundation-chain',
    'Slip Knot & Foundation Chain',
    'Leave a 5-inch tail and make a slip knot. Place the loop onto your hook and gently tighten until it slides smoothly without pinching. The loop already sitting on the hook is NOT counted as a chain. Yarn over (yo) and draw through that loop to form your first chain (ch). Work 16 chains in total, keeping each chain loop roughly equal in size.',
    '16 ch (not counting the starting loop on the hook)',
    array['ch', 'yo'],
    'Keep your chain relaxed; working foundation chains too tightly makes inserting your hook into Row 1 difficult and can cause the bottom edge to curl inward.',
    null,
    false
  )
  on conflict (tutorial_id, step_number) do nothing;

  -- Step 2: Row 1 — First Single Crochet Row
  insert into public.pattern_steps (
    tutorial_id,
    step_number,
    step_identifier,
    title,
    instruction,
    stitch_count,
    abbreviations,
    notes,
    video_timestamp_seconds,
    timestamp_verified
  )
  values (
    v_tutorial_id,
    2,
    'practice-square-step-2-row-1',
    'Row 1: Working into the Foundation Chain',
    'Insert your hook into the second chain from the hook (skipping the chain loop directly adjacent to your hook). Yarn over and pull up a loop (2 loops on hook). Yarn over and pull through both loops. You have completed 1 single crochet (sc). Work 1 sc into each remaining chain across to the end of the foundation chain.',
    '15 sc',
    array['sc', 'yo'],
    'Count your single crochets after completing this row. You should have exactly 15 sc stitches. Tip: Place a stitch marker into the very first sc made to identify your edge later.',
    null,
    false
  )
  on conflict (tutorial_id, step_number) do nothing;

  -- Step 3: Row 2 — Turning Chain & Edge Alignment
  insert into public.pattern_steps (
    tutorial_id,
    step_number,
    step_identifier,
    title,
    instruction,
    stitch_count,
    abbreviations,
    notes,
    video_timestamp_seconds,
    timestamp_verified
  )
  values (
    v_tutorial_id,
    3,
    'practice-square-step-3-row-2',
    'Row 2: Turning Chain & First Stitch Placement',
    'Chain 1 (this is your turning chain, tch) and turn your work like turning the page of a book. The turning chain does NOT count as a stitch. Insert your hook under both top loops of the very first stitch (at the base of the turning chain). Work 1 sc. Work 1 sc under both loops of each stitch across. Be sure to work the final stitch into the last sc of the previous row.',
    '15 sc',
    array['ch', 'sc', 'tch'],
    'The most common beginner mistake is accidentally skipping the first stitch or missing the somewhat hidden final stitch. Always count to verify 15 stitches.',
    null,
    false
  )
  on conflict (tutorial_id, step_number) do nothing;

  -- Step 4: Rows 3 to 14 — Consistent Gauge & Repetition
  insert into public.pattern_steps (
    tutorial_id,
    step_number,
    step_identifier,
    title,
    instruction,
    stitch_count,
    abbreviations,
    notes,
    video_timestamp_seconds,
    timestamp_verified
  )
  values (
    v_tutorial_id,
    4,
    'practice-square-step-4-body-rows',
    'Rows 3 to 14: Building the Practice Square',
    'Repeat Row 2 for Rows 3 through 14: chain 1, turn, and work 1 sc into each stitch across. Maintain uniform yarn tension and check that both side edges remain straight and parallel.',
    '15 sc per row (14 rows total)',
    array['ch', 'sc'],
    'Measure your swatch periodically. If the sides taper inward or flare outward, count your stitches—you may have dropped or added an edge stitch.',
    null,
    false
  )
  on conflict (tutorial_id, step_number) do nothing;

  -- Step 5: Fastening Off & Weaving Ends
  insert into public.pattern_steps (
    tutorial_id,
    step_number,
    step_identifier,
    title,
    instruction,
    stitch_count,
    abbreviations,
    notes,
    video_timestamp_seconds,
    timestamp_verified
  )
  values (
    v_tutorial_id,
    5,
    'practice-square-step-5-fastening-off',
    'Fastening Off & Weaving in Yarn Tails',
    'After completing Row 14, cut your working yarn leaving a 6-inch tail. Yarn over and pull the tail all the way through your last working loop to secure the knot. Thread the tail onto a blunt tapestry needle. Weave the tail through the centers of stitches on the wrong side for 1.5 inches, reverse direction for 1 inch, and reverse once more before trimming close to the fabric.',
    'Finished swatch — final size depends on your yarn weight, hook size, and personal tension',
    array['yo'],
    'Weaving in multiple opposing directions helps prevent the yarn ends from working loose over time. Final durability depends on your yarn type, tension, and how the swatch is cared for.',
    null,
    false
  )
  on conflict (tutorial_id, step_number) do nothing;

end $$;

