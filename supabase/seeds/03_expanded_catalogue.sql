-- ============================================================================
-- LOOP — Expanded Project Catalogue Seed (Corrected)
-- Milestone: Day 7 Architecture & Catalogue Expansion
-- Entity: public.projects (24 additional starter project previews -> 30 total)
--
-- Safety Guarantees:
-- 1. Atomic: Wrapped in BEGIN ... COMMIT.
-- 2. Fully Idempotent: Every single INSERT uses ON CONFLICT (slug) DO NOTHING.
-- 3. Non-destructive: Leaves all existing projects and manual edits untouched.
--    Only missing project previews are inserted.
-- 4. Safe to rerun after any partial execution or error.
-- ============================================================================

begin;

-- ── 1. Solid Granny Square ──────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'solid-granny-square',
  'Solid Granny Square',
  'A classic dense square worked without open corner chain spaces, producing a warm and sturdy fabric ideal for structured blankets and tote bags. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'beginner',
  null, null,
  array['Medium/Worsted weight yarn', '4.5mm (US 7) crochet hook', 'Tapestry needle', 'Scissors'],
  array['Double crochet (dc)', 'Treble crochet corners', 'Slip stitch join', 'Working in the round'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 2. Sunburst Granny Square ───────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'sunburst-granny-square',
  'Sunburst Granny Square',
  'A vintage-inspired floral square featuring a center circle of puff stitches and cluster groups that transition into a crisp four-corner border. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'easy',
  null, null,
  array['DK or worsted weight yarn in 3–4 contrasting colors', '4.0mm (G-6) crochet hook', 'Tapestry needle'],
  array['Magic ring', 'Puff stitch', 'Cluster stitch (dc3tog)', 'Corner chain spaces'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 3. Two-Tone Framed Square ───────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'two-tone-framed-square',
  'Two-Tone Framed Square',
  'A graphic modern square worked with an inner center block and a contrasting perimeter border. Excellent for practicing clean yarn color changes at corners. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'beginner',
  null, null,
  array['Worsted weight yarn in 2 contrasting colors', '5.0mm (H-8) crochet hook', 'Scissors'],
  array['Chain stitch', 'Single crochet', 'Color changing at corner joins', 'Weaving ends'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 4. Daisy Center Granny Square ───────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'daisy-center-square',
  'Daisy Center Granny Square',
  'A bright floral motif with a raised yellow flower center and white petals squared off into a pastel background. Catalogue preview; tutorial in preparation.',
  'flowers',
  'easy',
  null, null,
  array['DK weight cotton yarn in yellow, white, and accent color', '3.75mm (F-5) crochet hook', 'Yarn needle'],
  array['Working in rounds', 'Treble crochet petals', 'Corner squaring technique'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 5. Mitered Corner Square ────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'mitered-corner-square',
  'Mitered Corner Square',
  'An L-shaped diagonal crochet motif worked back and forth from one corner outwards, forming diagonal graphic stripes. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'easy',
  null, null,
  array['Worsted weight yarn in 2 or more colors', '5.0mm (H-8) crochet hook', 'Locking stitch marker'],
  array['Single crochet', 'Corner 3-stitch increases', 'Stripe color changes'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 6. Spiral Granny Square ─────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'spiral-granny-square',
  'Spiral Granny Square',
  'A mesmerizing continuous four-color spiral worked simultaneously from the center without typical round-end joins. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'intermediate',
  null, null,
  array['DK weight yarn in 4 distinct colors', '4.0mm (G-6) crochet hook', '4 locking stitch markers'],
  array['Simultaneous multi-strand working', 'Half double crochet', 'Double crochet', 'Gauge management'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 7. Ribbed Mug Rug ───────────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'ribbed-mug-rug',
  'Ribbed Mug Rug',
  'A charming textured tabletop coaster worked in back-loop-only stitches with playful fringe along the shorter edges. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'beginner',
  null, null,
  array['100% cotton worsted yarn', '4.5mm (US 7) crochet hook', 'Scissors'],
  array['Foundation chain', 'Single crochet in back loop only (BLO)', 'Attaching yarn fringe'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 8. Circular Cotton Coaster ──────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'circular-cotton-coaster',
  'Circular Cotton Coaster',
  'A clean, minimalist round coaster worked in continuous spiral rounds, perfect for practicing flat circular increase formulas without puckering. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'beginner',
  null, null,
  array['100% cotton medium yarn', '4.0mm (G-6) crochet hook', 'Stitch marker'],
  array['Magic circle', 'Even single crochet increases (2 sc in 1 st)', 'Seamless invisible join'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 9. Hexagon Table Mat ────────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'hexagon-table-mat',
  'Hexagon Table Mat',
  'A geometric six-sided tabletop centerpiece worked from the center outwards with sharp corner chain points. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'easy',
  null, null,
  array['Medium cotton or linen blend yarn', '4.5mm (US 7) crochet hook', 'Tapestry needle'],
  array['Double crochet clusters', 'Chain-2 corners', 'Symmetrical hexagonal increases'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 10. Hanging Plant Sling ─────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'hanging-plant-sling',
  'Hanging Plant Sling',
  'An openwork mesh plant holder with strong braided hanging cords, tailored to cradle small terracotta pots. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'easy',
  null, null,
  array['Durable cotton twine or macrame-weight yarn', '5.5mm (I-9) crochet hook', 'Wooden ring (optional)'],
  array['Chain net mesh', 'Slip stitch joins', 'Single crochet ring anchor'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 11. Waffle Stitch Washcloth ─────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'waffle-stitch-washcloth',
  'Waffle Stitch Washcloth',
  'A deeply textured, absorbent washcloth featuring raised dimensional square ridges created with post stitches. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'intermediate',
  null, null,
  array['100% unmercerized cotton yarn (~50g)', '4.5mm (US 7) crochet hook', 'Tapestry needle'],
  array['Front post double crochet (FPdc)', 'Standard double crochet', 'Maintaining row multiples'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 12. Nesting Trinket Bowl ────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'nesting-trinket-bowl',
  'Nesting Trinket Bowl',
  'A structured shallow catchall bowl for keys and jewelry, worked in tight stitches with a reinforced rim. Catalogue preview; tutorial in preparation.',
  'home-decor',
  'easy',
  null, null,
  array['Bulky cotton or t-shirt yarn', '6.0mm (J-10) crochet hook', 'Locking stitch marker'],
  array['Dense single crochet', 'Working in continuous rounds', 'Reverse single crochet (crab stitch) rim'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 13. Cherry Blossom Appliqué ─────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'cherry-blossom-applique',
  'Cherry Blossom Appliqué',
  'A delicate five-petal springtime blossom with subtle picot petal tips, designed for sewing onto garments or hair clips. Catalogue preview; tutorial in preparation.',
  'flowers',
  'easy',
  null, null,
  array['Fingering or sport weight yarn', '3.0mm crochet hook', 'Tapestry needle'],
  array['Magic loop', 'Treble crochet petals', 'Slip stitch petal dividers', 'Chain picot'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 14. Layered Rose Motif ──────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'layered-rose-motif',
  'Layered Rose Motif',
  'A dimensional multi-tier garden rose created by crocheting a wavy petal strip and rolling it into a realistic bloom. Catalogue preview; tutorial in preparation.',
  'flowers',
  'intermediate',
  null, null,
  array['DK weight acrylic or wool yarn', '3.5mm (E-4) crochet hook', 'Yarn needle for assembly'],
  array['Shell stitches (varying heights)', 'Foundation chain', 'Rolling and securing coiled fabric'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 15. Botanical Leaf Pair ─────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'botanical-leaf-pair',
  'Botanical Leaf Pair',
  'Graceful pointed leaves worked around both sides of a central foundation spine with graduated stitch heights. Catalogue preview; tutorial in preparation.',
  'flowers',
  'beginner',
  null, null,
  array['Sport or DK weight green yarn', '3.5mm (E-4) crochet hook', 'Scissors'],
  array['Working on opposite side of foundation chain', 'Slip stitch', 'Single, half-double, and double crochet'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 16. Five-Point Star Motif ───────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'five-point-star-motif',
  'Five-Point Star Motif',
  'A flat symmetrical star ornament that comes together quickly in just two rounds. Great for garlands and holiday tags. Catalogue preview; tutorial in preparation.',
  'accessories',
  'beginner',
  null, null,
  array['Worsted or metallic-blend yarn', '4.0mm (G-6) crochet hook', 'Tapestry needle'],
  array['Center ring', 'Picot stitch tips', 'Double crochet cluster arms'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 17. Chunky Ribbed Beanie ────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'chunky-ribbed-beanie',
  'Chunky Ribbed Beanie',
  'A cozy fold-over brim beanie crocheted flat as a simple textured rectangle and gathered tightly at the crown. Catalogue preview; tutorial in preparation.',
  'clothes',
  'easy',
  null, null,
  array['Bulky (#5) acrylic or wool blend yarn (~100g)', '6.5mm (K-10.5) crochet hook', 'Yarn needle'],
  array['Half double crochet back-loop-only (HDC BLO)', 'Vertical flat seaming', 'Crown gathering method'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 18. Infinity Loop Cowl ──────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'infinity-loop-cowl',
  'Infinity Loop Cowl',
  'A continuous circular neck scarf worked in tall, airy stitches that drapes comfortably in double loops. Catalogue preview; tutorial in preparation.',
  'clothes',
  'beginner',
  null, null,
  array['Worsted or aran weight soft yarn (~150g)', '6.0mm (J-10) crochet hook', 'Scissors'],
  array['Joining foundation chain without twisting', 'Double crochet in continuous spiral', 'Even tension over long rows'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 19. Basic Crochet Scrunchie ─────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'basic-crochet-scrunchie',
  'Basic Crochet Scrunchie',
  'A beginner project worked directly around an elastic hair tie to create ruffled fabric folds. Catalogue preview; tutorial in preparation.',
  'accessories',
  'beginner',
  null, null,
  array['DK weight velvet or cotton yarn', '4.0mm (G-6) crochet hook', 'Standard elastic hair band'],
  array['Encasing an elastic band', 'Dense single crochet', 'Double crochet ruffle increases'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 20. Twist-Front Headband ────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'twist-front-headband',
  'Twist-Front Headband',
  'A trendy ear warmer band crocheted in a flat rib pattern and joined using a clever folded interlocking front twist seam. Catalogue preview; tutorial in preparation.',
  'clothes',
  'easy',
  null, null,
  array['Worsted weight yarn (~60g)', '5.0mm (H-8) crochet hook', 'Tapestry needle'],
  array['Half double crochet', 'Folded interlocking seam assembly', 'Elastic stitch gauge'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 21. Fingerless Wrist Warmers ────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'fingerless-wrist-warmers',
  'Fingerless Wrist Warmers',
  'Practical texturing wrist gloves worked flat with an integrated thumb-hole gap, seamed up the side. Catalogue preview; tutorial in preparation.',
  'clothes',
  'easy',
  null, null,
  array['DK or light worsted wool yarn (~50g)', '4.0mm (G-6) crochet hook', 'Tapestry needle'],
  array['Single crochet ribbing', 'Chain-space thumb opening', 'Mattress stitch seaming'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 22. Market Mesh Tote ────────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'market-mesh-tote',
  'Market Mesh Tote',
  'An expandable eco-friendly produce tote featuring an open diamond-mesh body and reinforced double-chain handles. Catalogue preview; tutorial in preparation.',
  'bags',
  'easy',
  null, null,
  array['Durable mercerized cotton yarn (~150g)', '4.5mm (US 7) crochet hook', 'Stitch markers'],
  array['Chain-5 net loops', 'Solid base oval increases', 'Integrated handle straps'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 23. Striped Clutch Purse ────────────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'striped-clutch-purse',
  'Striped Clutch Purse',
  'A structured envelope-fold clutch worked in dense color blocks with a secure button-loop closure. Catalogue preview; tutorial in preparation.',
  'bags',
  'easy',
  null, null,
  array['Sturdy cotton cord or worsted yarn', '4.0mm (G-6) crochet hook', '1-inch button'],
  array['Dense single crochet', 'Crisp horizontal color changes', 'Buttonhole loop', 'Folded side seams'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

-- ── 24. Minimalist Crossbody Pouch ──────────────────────────────────────────
insert into public.projects (
  slug, title, description, category, difficulty,
  estimated_minutes, estimated_duration, materials, skills, thumbnail_url, published
)
values (
  'minimalist-crossbody-pouch',
  'Minimalist Crossbody Pouch',
  'A compact phone-sized crossbody bag worked in dense thermal crochet that produces thick, protective fabric without needing a fabric lining. Catalogue preview; tutorial in preparation.',
  'bags',
  'intermediate',
  null, null,
  array['100% cotton yarn', '4.0mm (G-6) crochet hook', '2 D-rings or clip hooks'],
  array['Thermal single crochet', 'Sturdy Romanian cord strap', 'Working into back loops and rows below'],
  '/illustrations/projects/project-placeholder.svg',
  true
)
on conflict (slug) do nothing;

commit;
