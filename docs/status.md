# LOOP — Implementation Status

> Legend: ✅ Implemented | 🔶 Mocked / stub | 📋 Planned | ❌ Blocked

Last updated: Day 1 — project foundation

---

## Infrastructure

| Item | Status | Validation |
|------|--------|------------|
| Next.js 16.4.5 project scaffolded | ✅ Implemented | `npm run build` → exit 0 |
| TypeScript configured (`@/*` alias) | ✅ Implemented | `npm run typecheck` → exit 0 |
| Tailwind CSS v4 (`globals.css` tokens) | ✅ Implemented | `npm run build` compiled without CSS errors |
| ESLint configured | ✅ Implemented | `npm run lint` → exit 0, no warnings |
| App Router + `src/` directory | ✅ Implemented | Confirmed in file tree |
| `.env.example` with blank Supabase keys | ✅ Implemented | File present; not checked into Git with secrets |
| `.env.local` excluded from Git | ✅ Implemented | `.gitignore` lists `.env.local` explicitly |
| `.env.example` tracked by Git | ✅ Implemented | `.gitignore` changed from `.env*` to specific local patterns |
| `package.json` `typecheck` script | ✅ Implemented | `npm run typecheck` runs `tsc --noEmit` |
| Local Git repo initialised | ✅ Implemented | `git init` by scaffold; checkpoint commit made |
| Lockfile committed | ✅ Implemented | `package-lock.json` in commit |

---

## Landing page

| Item | Status | Validation |
|------|--------|------------|
| LOOP wordmark | ✅ Implemented | Visible in rendered HTML |
| Tagline "Learn it. Loop it. Make it." | ✅ Implemented | `h1` in rendered HTML |
| Three-mode explanation (`HowItWorks` section) | ✅ Implemented | Section with id `how-it-works` in HTML |
| "How LOOP works" anchor link | ✅ Implemented | `href="#how-it-works"` in nav and hero CTA |
| Warm cream background | ✅ Implemented | `--color-cream: #FAF7F0` in `globals.css` |
| Sage primary accent | ✅ Implemented | `--color-sage: #7C9A6B`; used for tagline and CTA |
| Restrained pink accent | ✅ Implemented | `--color-pink: #E8B4B8`; used for Follow card chip |
| Butter yellow accent | ✅ Implemented | `--color-butter: #F5D87E`; used for Watch card chip |
| Lilac accent | ✅ Implemented | `--color-lilac: #C3B1D4`; used for Read card chip |
| Charcoal body text | ✅ Implemented | `--color-charcoal: #2D2D2D` |
| System font stack | ✅ Implemented | `system-ui, -apple-system, ...` in `--font-sans`; no external CDN |
| Skip-to-content link (keyboard) | ✅ Implemented | `<a href="#main-content" class="sr-only focus:not-sr-only ...">` |
| Visible keyboard focus ring | ✅ Implemented | `:focus-visible` rule in `globals.css` with 3px sage outline |
| Reduced-motion support | ✅ Implemented | `@media (prefers-reduced-motion: reduce)` in `globals.css` |
| Rounded controls | ✅ Implemented | `rounded-full` on CTA button and icon chips |
| No nonfunctional sign-in / AI / upload buttons | ✅ Implemented | No such elements exist in source |
| No fabricated statistics or testimonials | ✅ Implemented | No such content in source |

---

## Browser checks

| Check | Status | Notes |
|-------|--------|-------|
| 375px mobile layout | ⚠️ Not run | No browser tool available. Manual check instructions below. |
| 1280px desktop layout | ⚠️ Not run | No browser tool available. Manual check instructions below. |
| Tab-key keyboard focus on all interactive elements | ⚠️ Not run | Manual check instructions below. |
| "How LOOP works" anchor navigates correctly | ⚠️ Not run | HTML confirms `id="how-it-works"` and matching `href="#how-it-works"`. |

### Manual browser checklist

Run `npm run dev` and open http://localhost:3000 in your browser.

**375px (mobile):**
- [ ] Open DevTools → toggle device toolbar → set width to 375.
- [ ] Wordmark and tagline are readable, not clipped.
- [ ] The three learning-mode cards stack vertically (single column).
- [ ] The sage CTA button is fully visible.
- [ ] Footer note is readable.

**1280px (desktop):**
- [ ] Three learning-mode cards appear side by side (3-column grid).
- [ ] No horizontal scrollbar appears.
- [ ] Text sizes feel comfortable.

**Tab-key focus:**
- [ ] Press Tab from the top of the page. The skip-to-content link becomes visible.
- [ ] Press Tab again. The "How LOOP works" nav link receives a visible sage focus ring.
- [ ] Press Tab again. The hero "How LOOP works" CTA button receives a visible sage focus ring.
- [ ] No other interactive elements remain. Focus cycles correctly.

**Anchor check:**
- [ ] Click "How LOOP works" (nav or hero button). Page scrolls to the three-mode section smoothly (or instantly with reduced-motion).
- [ ] The URL updates to `/#how-it-works`.

---

## Documentation

| Item | Status |
|------|--------|
| `README.md` | ✅ Implemented |
| `docs/product-plan.md` | ✅ Implemented |
| `docs/status.md` (this file) | ✅ Implemented |
| `docs/decisions.md` | ✅ Implemented |

---

## Not started (Day 2+)

| Feature | Status |
|---------|--------|
| Supabase client setup | 📋 Planned |
| Authentication (sign up / sign in) | 📋 Planned |
| Onboarding flow | 📋 Planned |
| Projects listing page | 📋 Planned |
| Written pattern view | 📋 Planned |
| Guided steps view | 📋 Planned |
| Video player (embedded) | 📋 Planned |
| Progress tracking | 📋 Planned |
| AI tutor | 📋 Planned |
| Image upload / image-to-pattern | 📋 Planned (post-core) |
