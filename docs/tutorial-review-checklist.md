# Tutorial Review & Publication Checklist

> **Purpose:** Standard Operating Procedure (SOP) for reviewing, verifying, and publishing crochet tutorial content on LOOP.  
> **Golden Rule:** No tutorial content, pattern instructions, video embed, or timestamp mapping may be published to learners without explicit manual verification against all 5 gates below.

---

## 1. Candidate Project Overview (Day 7)

- **Project:** Beginner Practice Square
- **Catalogue Slug:** `beginner-practice-square`
- **Learning Objective:** Master yarn tension, foundation chain, uniform single crochet rows, clean turning chains, and edge counting with exactly 15 stitches.
- **Terminology:** US Crochet Terminology exclusively (with clear terminology badges).
- **Target Audience:** Absolute beginners holding a hook for the first time.

---

## 2. The 5-Gate Review Workflow

Before updating `public.tutorials.review_status` from `'draft'` to `'verified_published'`, an administrator or curriculum reviewer must verify each gate and document the evidence.

```
       [ Draft Content in DB ]
                  │
                  ▼
   ┌─────────────────────────────┐
   │ Gate 1: Source & Copyright  │ ──► Verify original ownership or written permission
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ Gate 2: Hands-on Swatching  │ ──► Physically crochet the swatch from written steps
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ Gate 3: Video Embed & Credit│ ──► Confirm YouTube embed policy & channel credit
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ Gate 4: Timestamp Alignment │ ──► Second-by-second check of step timestamps
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │ Gate 5: Publication Sign-off│ ──► Flip review_status = 'verified_published'
   └─────────────────────────────┘
```

---

### Gate 1: Pattern Source & Copyright Licensing

- [ ] **Original vs. External Source:**
  - If **Original LOOP Pattern**: Verify that the instructions were authored in-house and do not infringe on copyrighted publications or subscription patterns. Set `pattern_source_type = 'original_loop'`.
  - If **Third-Party / Creator Pattern**:
    - Verify written permission or appropriate open license (e.g., CC-BY-4.0).
    - *Crucial legal note:* A public YouTube video or blog post **does not** grant permission to copy or transcribe written pattern instructions without explicit creator consent.
    - Record consent documentation URL/email timestamp in `pattern_permission_notes`.
- [ ] **US Terminology Check:**
  - Verify every abbreviation and instruction uses US standard terms (`sc` = single crochet, not UK double crochet; `ch` = chain; `sl st` = slip stitch).
  - Explicit glossary entry exists in `tutorials.abbreviations`.

---

### Gate 2: Hands-On Physical Swatch Verification

- [ ] **Physical Test Swatch Created:**
  - The reviewer must physically pick up yarn and hook to work through each pattern step as written, without skipping steps.
- [ ] **Gauge & Tension Check:**
  - Verify hook size (5.0mm / H-8) and yarn weight (Medium #4 worsted) produce a square of approximately 4" x 4".
- [ ] **Stitch Count Verification:**
  - Row 1: exactly 15 single crochets into the 16 foundation chains.
  - Rows 2–14: turning chain-1 does *not* count as a stitch; exactly 15 sc across every single row.
  - Edges remain completely straight with no taper or flare.
- [ ] **Clarity of Instructions:**
  - Instructions clearly warn against common beginner traps (missing the first stitch after turning, or missing the edge stitch).
- [ ] **Sign-off:** Set `tutorials.pattern_tested = true` and log reviewer notes in `tutorials.pattern_tested_notes`.

---

### Gate 3: Video Sourcing & Creator Credit

- [ ] **Permitted Embed Policy:**
  - LOOP embeds tutorials using standard YouTube IFrame embeds (`youtube.com/embed/...`).
  - No downloading, rehosting, ripping, or circumventing YouTube terms of service.
  - Video must allow embedding (`video_embed_allowed = true`).
- [ ] **Proper Creator Attribution:**
  - Full creator channel/display name recorded (`video_creator_name`).
  - Link directly to creator's YouTube channel or website (`video_creator_url`).
  - Video title and description must accurately match the technique demonstrated.

---

### Gate 4: Step-to-Video Timestamp Verification

- [ ] **Second-by-Second Video Audit:**
  - For each step in `pattern_steps`, identify the exact start timestamp (`video_timestamp_seconds`) where the demonstrator introduces the movement.
  - Step 1 (Slip knot & chain): Verify timestamp.
  - Step 2 (Row 1): Verify timestamp.
  - Step 3 (Row 2 & turning chain): Verify timestamp.
  - Step 4 (Body rows): Verify timestamp.
  - Step 5 (Fasten off & weaving ends): Verify timestamp.
- [ ] **Verification Flag:**
  - Each verified step must explicitly have `timestamp_verified = true`.
  - In accordance with LOOP design decisions, unverified timestamps (`timestamp_verified = false`) are **never** displayed to learners.

---

### Gate 5: Explicit Publication Gate (Go-Live)

A tutorial must remain in `'draft'` or `'in_review'` until Gates 1–4 are 100% complete.

To publish, run the following SQL update in the Supabase SQL Editor:

```sql
-- Publication SQL (Only run after Gates 1–4 have passed)
update public.tutorials
set
  review_status = 'verified_published',
  published_at = now()
where project_id = (
  select id from public.projects where slug = 'beginner-practice-square'
);
```

When this is executed:
1. Row Level Security policies automatically allow `public` (anon and authenticated learners) to query the tutorial and its steps.
2. The project detail page at `/projects/beginner-practice-square` automatically transitions from the "Starter Catalogue Preview • Tutorial Coming Soon" banner to the active "Interactive Tutorial Available" experience.

---

## 3. Required User Inputs Before Go-Live

To advance the **Beginner Practice Square** tutorial from `draft` to `verified_published`, the following concrete inputs are required from the project owner / user:

| Required Input | Current Status | What is Needed |
| :--- | :--- | :--- |
| **1. YouTube Video URL** | `NULL` | Approved YouTube video link showcasing single crochet practice swatch. |
| **2. Creator Attribution** | `NULL` | Name and channel URL of the video creator for proper attribution. |
| **3. Embedding Permission** | Pending | Confirmation that the creator permits standard embeds or video has embedding enabled. |
| **4. Physical Swatch Test** | Pending | Confirmation that the 15-sc x 14-row pattern was physically swatched and verified. |
| **5. Step Timestamps** | `NULL` | Exact start timestamps in seconds for Steps 1 through 5. |

Until these 5 inputs are provided and verified, the tutorial safely remains in `draft` status behind RLS, ensuring no unfinished or unverified content is exposed to users.

