-- ============================================================================
-- LOOP — Catalogue Slugs Verification (Read-Only)
-- Milestone: Day 7 Architecture & Catalogue Expansion
-- Expected Total: 30 projects (6 starter + 24 expanded)
--
-- HOW TO RUN:
-- 1. Open Supabase Dashboard → SQL Editor → New query.
-- 2. Paste this entire file and click Run.
-- 3. Confirm all 30 project rows show status 'PASS' and the SUMMARY shows 'ALL 30 PROJECTS PRESENT'.
--
-- Safety: 100% read-only queries (SELECT only). Modifies zero rows.
-- ============================================================================

with expected_slugs(expected_slug, group_name) as (
  values
    -- 6 Starter Projects
    ('beginner-practice-square', '1. Starter Catalogue'),
    ('simple-square-coaster', '1. Starter Catalogue'),
    ('classic-granny-square', '1. Starter Catalogue'),
    ('sweet-blossom-flower', '1. Starter Catalogue'),
    ('heart-keychain', '1. Starter Catalogue'),
    ('mini-drawstring-pouch', '1. Starter Catalogue'),

    -- 24 Expanded Catalogue Projects
    ('solid-granny-square', '2. Expanded Granny Squares'),
    ('sunburst-granny-square', '2. Expanded Granny Squares'),
    ('two-tone-framed-square', '2. Expanded Granny Squares'),
    ('daisy-center-square', '2. Expanded Granny Squares'),
    ('mitered-corner-square', '2. Expanded Granny Squares'),
    ('spiral-granny-square', '2. Expanded Granny Squares'),
    ('ribbed-mug-rug', '3. Home Accessories'),
    ('circular-cotton-coaster', '3. Home Accessories'),
    ('hexagon-table-mat', '3. Home Accessories'),
    ('hanging-plant-sling', '3. Home Accessories'),
    ('waffle-stitch-washcloth', '3. Home Accessories'),
    ('nesting-trinket-bowl', '3. Home Accessories'),
    ('cherry-blossom-applique', '4. Flowers & Appliqués'),
    ('layered-rose-motif', '4. Flowers & Appliqués'),
    ('botanical-leaf-pair', '4. Flowers & Appliqués'),
    ('five-point-star-motif', '4. Flowers & Appliqués'),
    ('chunky-ribbed-beanie', '5. Accessories & Clothes'),
    ('infinity-loop-cowl', '5. Accessories & Clothes'),
    ('basic-crochet-scrunchie', '5. Accessories & Clothes'),
    ('twist-front-headband', '5. Accessories & Clothes'),
    ('fingerless-wrist-warmers', '5. Accessories & Clothes'),
    ('market-mesh-tote', '6. Bags & Pouches'),
    ('striped-clutch-purse', '6. Bags & Pouches'),
    ('minimalist-crossbody-pouch', '6. Bags & Pouches')
),
evaluated as (
  select
    e.expected_slug,
    e.group_name,
    p.title as title_found,
    p.category,
    p.difficulty,
    p.published,
    p.skills_text,
    case
      when p.id is null then 'FAIL: MISSING'
      when p.published is not true then 'FAIL: UNPUBLISHED'
      else 'PASS'
    end as status
  from expected_slugs e
  left join public.projects p on p.slug = e.expected_slug
)
select
  expected_slug,
  group_name,
  coalesce(title_found, '—') as title,
  coalesce(category, '—') as category,
  coalesce(difficulty::text, '—') as difficulty,
  coalesce(published::text, '—') as published,
  status
from evaluated

union all

select
  'SUMMARY' as expected_slug,
  'All Groups' as group_name,
  (count(*) filter (where status = 'PASS'))::text || ' of 30 projects present & published' as title,
  '—' as category,
  '—' as difficulty,
  '—' as published,
  case
    when count(*) filter (where status = 'PASS') = 30 then 'ALL 30 PROJECTS PRESENT'
    else (30 - count(*) filter (where status = 'PASS'))::text || ' PROJECT(S) MISSING'
  end as status
from evaluated
order by group_name, expected_slug;

