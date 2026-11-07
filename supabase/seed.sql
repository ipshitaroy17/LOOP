-- ============================================================================
-- LOOP — Starter Catalogue Seed
-- Milestone: Day 5
-- Entity: public.projects (6 starter project previews)
--
-- Safety Guarantees:
-- 1. Idempotent: Uses ON CONFLICT (slug) DO NOTHING (rerunning will not overwrite manual edits).
-- 2. Non-destructive: Does NOT delete or truncate existing rows.
-- 3. Isolated: Only inserts these 6 specific starter slugs if they do not already exist.
-- 4. Schema-safe: Ensures columns exist before inserting.
-- ============================================================================

-- Ensure required columns exist (safe idempotent check)
alter table public.projects
  add column if not exists estimated_minutes integer,
  add column if not exists materials text[] not null default '{}'::text[],
  add column if not exists skills text[] not null default '{}'::text[];

-- Insert the 6 starter project previews.
-- Uses ON CONFLICT (slug) DO NOTHING so that re-running this seed script will
-- NOT overwrite any manually edited titles, descriptions, materials, or thumbnails.
insert into public.projects (
  slug,
  title,
  description,
  category,
  difficulty,
  estimated_minutes,
  estimated_duration,
  materials,
  skills,
  thumbnail_url,
  published
)
values
(
  'beginner-practice-square',
  'Beginner Practice Square',
  'A foundational single-crochet practice swatch designed to help you master yarn tension, consistent edge stitches, and turning chains. Perfect for your first crochet session.',
  'home-decor',
  'beginner',
  25,
  '25 mins (est.)',
  array[
    'Worsted weight cotton or acrylic yarn (~25g)',
    '5.0mm (H-8) crochet hook',
    'Tapestry needle for weaving ends',
    'Scissors'
  ],
  array[
    'Slip knot',
    'Foundation chain (ch)',
    'Single crochet (sc)',
    'Turning chain',
    'Fastening off'
  ],
  '/illustrations/projects/beginner-practice-square.svg',
  true
),
(
  'simple-square-coaster',
  'Simple Square Coaster',
  'A practical textured coaster worked in dense half-double crochet with a crisp slip-stitch border. Creates an absorbent tabletop protector for your favorite mug.',
  'home-decor',
  'beginner',
  35,
  '35 mins (est.)',
  array[
    '100% cotton yarn in medium/worsted weight (~35g)',
    '4.5mm (7) crochet hook',
    'Tapestry needle',
    'Scissors'
  ],
  array[
    'Chain stitch',
    'Half double crochet (hdc)',
    'Slip stitch border',
    'Weaving in yarn tails'
  ],
  '/illustrations/projects/simple-square-coaster.svg',
  true
),
(
  'classic-granny-square',
  'Classic Granny Square',
  'The timeless multi-round crochet motif worked from the center outwards using double crochet clusters and corner chain spaces. A versatile gateway to blankets, cardigans, and tote bags.',
  'accessories',
  'easy',
  45,
  '45 mins (est.)',
  array[
    'DK or worsted weight yarn in 1–3 colors (~40g total)',
    '4.0mm (G-6) crochet hook',
    'Yarn needle',
    'Locking stitch markers'
  ],
  array[
    'Magic ring or chain-4 loop',
    'Double crochet (dc)',
    'Chain-2 corner spaces',
    'Working in the round',
    'Joining rounds with slip stitch'
  ],
  '/illustrations/projects/classic-granny-square.svg',
  true
),
(
  'sweet-blossom-flower',
  'Sweet Blossom Crochet Flower',
  'A delightful five-petal dimensional flower worked in two quick rounds. Ideal for embellishing hats, tote bags, headbands, or attaching to handmade gift packaging.',
  'flowers',
  'beginner',
  20,
  '20 mins (est.)',
  array[
    'Scrap yarn in medium or DK weight (~15g in petal & center colors)',
    '3.5mm (E-4) crochet hook',
    'Tapestry needle',
    'Small safety pin or hairpin (optional attachment)'
  ],
  array[
    'Magic ring',
    'Single crochet (sc)',
    'Half double crochet (hdc)',
    'Double crochet (dc)',
    'Slip stitch joins'
  ],
  '/illustrations/projects/crochet-flower.svg',
  true
),
(
  'heart-keychain',
  'Heart Keychain',
  'A compact stuffed crochet heart worked in continuous spirals and joined seamlessly. Fitted with a split ring for a sweet everyday accessory or personalized handmade gift.',
  'keychains',
  'easy',
  40,
  '40 mins (est.)',
  array[
    'DK weight cotton yarn in red, pink, or sage (~20g)',
    '3.0mm (C-2) crochet hook',
    'Polyester fiberfill stuffing (~5g)',
    'Split key ring with jump ring',
    'Tapestry needle'
  ],
  array[
    'Magic ring',
    'Single crochet in spiral rounds',
    'Increasing (2 sc in one st)',
    'Invisible decrease (inv dec)',
    'Joining two lobes seamlessly'
  ],
  '/illustrations/projects/heart-keychain.svg',
  true
),
(
  'mini-drawstring-pouch',
  'Mini Drawstring Pouch',
  'A handy cylindrical pouch featuring a solid flat circular base, mesh-stitch sides, and an eyelet round with a braided drawstring cord. Great for earphones or stitch markers.',
  'bags',
  'intermediate',
  60,
  '60 mins (est.)',
  array[
    'Worsted weight cotton or linen yarn (~60g)',
    '4.0mm (G-6) crochet hook',
    'Tapestry needle',
    'Two wooden beads for cord ends (optional)'
  ],
  array[
    'Flat circle base with regular increases',
    'Double crochet mesh body',
    'Eyelet row for drawstring',
    'Braided cord (chain with slip stitch)',
    'Assembly and bead fastening'
  ],
  '/illustrations/projects/mini-drawstring-pouch.svg',
  true
)
on conflict (slug) do nothing;

