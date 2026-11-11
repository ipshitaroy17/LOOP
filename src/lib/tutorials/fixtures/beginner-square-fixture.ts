import type { Tutorial, PatternStep, MaterialItem } from '../types';

/**
 * DEV-ONLY Fixture: Beginner Practice Square Draft Tutorial & Pattern Steps
 * =========================================================================
 * Used EXCLUSIVELY in development preview routes (/dev/tutorial-preview/*).
 *
 * This fixture directly mirrors the draft seed in:
 *   supabase/seeds/02_beginner_square_tutorial.sql
 *
 * Purpose:
 *   Allows local UI verification of the Written Instructions component
 *   with realistic 5-step pattern content, materials details, and
 *   abbreviations WITHOUT querying database draft records or bypassing RLS.
 *
 * Strict Isolation:
 *   - reviewStatus is explicitly 'draft'
 *   - NEVER imported into production bundle or public routes
 *   - Not attached to any granny square video tutorials
 */

export const BEGINNER_PRACTICE_SQUARE_MATERIALS: MaterialItem[] = [
  {
    category: 'Yarn',
    item: 'Medium / Worsted weight (#4) acrylic or cotton yarn',
    quantity: 'Approx. 25g / 40 yards',
    notes: 'Smooth, light-colored yarn makes stitches easy to see.',
  },
  {
    category: 'Hook',
    item: '5.0 mm (US H-8) ergonomic or aluminum crochet hook',
    notes: 'A smooth hook helps beginner yarn glide easily.',
  },
  {
    category: 'Notions',
    item: 'Tapestry needle with blunt tip',
    notes: 'Used for weaving in yarn ends neatly.',
  },
  {
    category: 'Notions',
    item: 'Sharp scissors',
    notes: 'For snipping working yarn cleanly.',
  },
  {
    category: 'Optional',
    item: 'Locking stitch markers (2)',
    notes: 'Recommended to mark the first and last stitches of each row.',
  },
];

export const BEGINNER_PRACTICE_SQUARE_ABBREVIATIONS: Record<string, string> = {
  ch: 'chain stitch',
  sc: 'single crochet (US)',
  'st(s)': 'stitch(es)',
  'sl st': 'slip stitch',
  yo: 'yarn over',
  tch: 'turning chain',
};

export const BEGINNER_PRACTICE_SQUARE_STEPS: PatternStep[] = [
  {
    id: 'step-fixture-1',
    tutorialId: 'draft-beginner-practice-square',
    stepNumber: 1,
    stepIdentifier: 'practice-square-step-1-foundation-chain',
    title: 'Slip Knot & Foundation Chain',
    instruction:
      'Leave a 5-inch tail and make a slip knot. Place the loop onto your hook and gently tighten until it slides smoothly without pinching. The loop already sitting on the hook is NOT counted as a chain. Yarn over (yo) and draw through that loop to form your first chain (ch). Work 16 chains in total, keeping each chain loop roughly equal in size.',
    stitchCount: '16 ch (not counting the starting loop on the hook)',
    abbreviations: ['ch', 'yo'],
    notes:
      'Keep your chain relaxed; working foundation chains too tightly makes inserting your hook into Row 1 difficult and can cause the bottom edge to curl inward.',
    videoTimestampSeconds: null,
    timestampVerified: false,
    createdAt: '2026-11-07T00:00:00Z',
    updatedAt: '2026-11-07T00:00:00Z',
  },
  {
    id: 'step-fixture-2',
    tutorialId: 'draft-beginner-practice-square',
    stepNumber: 2,
    stepIdentifier: 'practice-square-step-2-row-1',
    title: 'Row 1: Working into the Foundation Chain',
    instruction:
      'Insert your hook into the second chain from the hook (skipping the chain loop directly adjacent to your hook). Yarn over and pull up a loop (2 loops on hook). Yarn over and pull through both loops. You have completed 1 single crochet (sc). Work 1 sc into each remaining chain across to the end of the foundation chain.',
    stitchCount: '15 sc',
    abbreviations: ['sc', 'yo'],
    notes:
      'Count your single crochets after completing this row. You should have exactly 15 sc stitches. Tip: Place a stitch marker into the very first sc made to identify your edge later.',
    videoTimestampSeconds: null,
    timestampVerified: false,
    createdAt: '2026-11-07T00:00:00Z',
    updatedAt: '2026-11-07T00:00:00Z',
  },
  {
    id: 'step-fixture-3',
    tutorialId: 'draft-beginner-practice-square',
    stepNumber: 3,
    stepIdentifier: 'practice-square-step-3-row-2',
    title: 'Row 2: Turning Chain & First Stitch Placement',
    instruction:
      'Chain 1 (this is your turning chain, tch) and turn your work like turning the page of a book. The turning chain does NOT count as a stitch. Insert your hook under both top loops of the very first stitch (at the base of the turning chain). Work 1 sc. Work 1 sc under both loops of each stitch across. Be sure to work the final stitch into the last sc of the previous row.',
    stitchCount: '15 sc',
    abbreviations: ['ch', 'sc', 'tch'],
    notes:
      'The most common beginner mistake is accidentally skipping the first stitch or missing the somewhat hidden final stitch. Always count to verify 15 stitches.',
    videoTimestampSeconds: null,
    timestampVerified: false,
    createdAt: '2026-11-07T00:00:00Z',
    updatedAt: '2026-11-07T00:00:00Z',
  },
  {
    id: 'step-fixture-4',
    tutorialId: 'draft-beginner-practice-square',
    stepNumber: 4,
    stepIdentifier: 'practice-square-step-4-body-rows',
    title: 'Rows 3 to 14: Building the Practice Square',
    instruction:
      'Repeat Row 2 for Rows 3 through 14: chain 1, turn, and work 1 sc into each stitch across. Maintain uniform yarn tension and check that both side edges remain straight and parallel.',
    stitchCount: '15 sc per row (14 rows total)',
    abbreviations: ['ch', 'sc'],
    notes:
      'Measure your swatch periodically. If the sides taper inward or flare outward, count your stitches—you may have dropped or added an edge stitch.',
    videoTimestampSeconds: null,
    timestampVerified: false,
    createdAt: '2026-11-07T00:00:00Z',
    updatedAt: '2026-11-07T00:00:00Z',
  },
  {
    id: 'step-fixture-5',
    tutorialId: 'draft-beginner-practice-square',
    stepNumber: 5,
    stepIdentifier: 'practice-square-step-5-fastening-off',
    title: 'Fastening Off & Weaving in Yarn Tails',
    instruction:
      'After completing Row 14, cut your working yarn leaving a 6-inch tail. Yarn over and pull the tail all the way through your last working loop to secure the knot. Thread the tail onto a blunt tapestry needle. Weave the tail through the centers of stitches on the wrong side for 1.5 inches, reverse direction for 1 inch, and reverse once more before trimming close to the fabric.',
    stitchCount:
      'Finished swatch — final size depends on your yarn weight, hook size, and personal tension',
    abbreviations: ['yo'],
    notes:
      'Weaving in multiple opposing directions helps prevent the yarn ends from working loose over time. Final durability depends on your yarn type, tension, and how the swatch is cared for.',
    videoTimestampSeconds: null,
    timestampVerified: false,
    createdAt: '2026-11-07T00:00:00Z',
    updatedAt: '2026-11-07T00:00:00Z',
  },
];

export const BEGINNER_PRACTICE_SQUARE_TUTORIAL_FIXTURE: Tutorial = {
  id: 'fixture-beginner-practice-square',
  projectId: 'fixture-project-beginner-practice-square',
  tutorialKey: 'main',
  title: 'Beginner Practice Square: Mastering Single Crochet Swatches',
  learningObjective:
    'Learn how to create a slip knot, work an even foundation chain, single crochet in flat back-and-forth rows, turn with a turning chain, and count stitches accurately to produce neat, straight edges.',
  terminology: 'US',
  abbreviations: BEGINNER_PRACTICE_SQUARE_ABBREVIATIONS,
  materialsDetails: BEGINNER_PRACTICE_SQUARE_MATERIALS,
  patternSourceType: 'original_loop',
  patternSourceTitle: 'LOOP Foundational Single Crochet Practice Swatch',
  patternSourceAuthor: 'LOOP Curriculum Team',
  patternSourceUrl: null,
  patternLicense: 'LOOP Educational Content - Review Pending',
  patternPermissionNotes:
    'Original instructional pattern drafted for LOOP introductory learners. Requires hands-on physical swatch verification and user testing before publication.',
  patternTested: false,
  patternTestedNotes:
    'Pending hands-on swatch verification for gauge consistency and row count clarity.',
  videoUrl: null,
  videoCreatorName: null,
  videoCreatorUrl: null,
  videoEmbedAllowed: false,
  reviewStatus: 'draft',
  publishedAt: null,
  createdAt: '2026-11-07T00:00:00Z',
  updatedAt: '2026-11-07T00:00:00Z',
  steps: BEGINNER_PRACTICE_SQUARE_STEPS,
};

