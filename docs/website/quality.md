---
title: Website quality, tests and scripts
aliases: [Website quality tests and scripts]
type: reference
covers: [website/tests/site.spec.ts, website/scripts/legacy-paths.mjs, website/playwright.config.ts, website/scripts/figures.mjs, website/scripts/shots.mjs, website/scripts/measure.mjs, website/scripts/make-og.mjs, .github/workflows/website.yml]
---

# Website quality, tests and scripts

The gate for every change is in [runbooks R-02](../project/runbooks.md#r-02-the-gate-before-every-commit-that-touches-the-site). This page explains what each check covers.

## npm scripts (`website/package.json`)

| Script | Runs |
|---|---|
| `npm run dev` | Astro dev server with live reload |
| `npm run check` | `astro check` (TypeScript, Astro, content schemas) then `node scripts/figures.mjs` |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serves `dist/` like GitHub Pages |
| `npm test` | Playwright against the preview server (reuses one on port 4321) |
| `npm run test:install` | Downloads Chromium for Playwright (not needed in cloud sessions) |

## Playwright tests (`tests/site.spec.ts`)

Two projects: `desktop` (1280 × 900) and `mobile` (Pixel 7). CI retries once.

**Per page** (home, experience, education, projects, two project pages, skills, about, card, card print), on both projects:

- Loads with status 200 and no page or console errors.
- No horizontal overflow.
- No squeezed text and no leftover placeholder words ("placeholder", "image to come", "replace with").
- No serious or critical axe-core accessibility violations.

**Features**:

| Test | Guards |
|---|---|
| Content is in the HTML before JavaScript | H1 name; "Power System Engineer" on Experience (update when the job title changes); Open Graph image |
| Home shows selected work, figures load | Featured cards and figure loading |
| Case studies state the author's own part | "My part" when `role` is set |
| Command palette (keyboard, desktop only) and search button | Ctrl K, navigation |
| Theme choice survives navigation | `localStorage` theme across `ClientRouter` swaps |
| Experience filters and career chart | Chips, Gantt bar opens the entry |
| Project theme filters | Client and academic work together, counts |
| Closed phone menu does not block taps (phone only) | `pointer-events` fix from v5 step 10 |
| Lead figures show the whole image | R16 |
| The datasheet never covers the figures or the story (desktop) | Scrolls a project page at 1280 × 900 and 1920 × 1200 and fails on any overlap of the datasheet with other content (bug found 2026-10-14) |
| Pages fit a 320 px phone (phone only) | No sideways scroll on Home, Experience, a project page and the name card at 320 px; compares with 320, because a phone browser widens its layout viewport to fit wide content (bug found 2026-10-14) |
| Zoomed card covers stay sharp (desktop) | Each cropped card cover loads a file at least as wide as it is drawn after `cover` and zoom (blur found 2026-10-14) |
| Acronyms expanded once, at first use | R13 |
| Home features four client case studies | `featured` and `order` |
| Instrument trips, reports a nadir, settles | Demo behaviour; reduced-motion variant |
| Contact card is a valid vCard | `/devin-ezekiel-purba.vcf` fields |
| CV download name, and the CV and its old address serve a PDF | Download CV links on Home and About point to `/CV_Devin_Ezekiel_Purba.pdf` with `download`; when the build has the CV (`main` only), that file, `/cv.pdf` and `/Personal-Profile-Portfolio/cv.pdf` return a PDF (2026-10-21) |
| Old links forward to the new pages | `/Personal-Profile-Portfolio/...` (including the printed QR address `/card/`), `/card/` on the new site, a `#fragment`, and the old vCard file (move to the user site, 2026-10-18) |
| Unknown pages show the 404 page | |
| Name card links and scannable QR | Contact links, WhatsApp URL, QR dialog, SVG download |

Last result: 97 passed, 5 skipped (the skips are the device-specific tests on the other project).

## Scripts (`website/scripts/`)

| Script | Purpose | Needs |
|---|---|---|
| `figures.mjs [--fix]` | Fails if a PNG in `src/assets/projects/` carries metadata chunks (draw.io embeds its editable source) or if an SVG figure exists; `--fix` keeps image chunks only | nothing |
| `shots.mjs <dir> [pages]` | Full-page screenshots: desktop light, desktop dark, phone; reports overflow and page errors | running preview |
| `measure.mjs [pages]` | At 390 px: text under 12 px, targets under 24 × 24 px, uppercase labels, em dashes. Default pages include the name card since 2026-10-16 | running preview |
| `legacy-paths.mjs` | Runs after `astro build` (part of `npm run build`): forwarding pages for every old `/Personal-Profile-Portfolio/` and `/card/` address, and copies of the CV, vCard, QR and preview image at their old paths. Skips itself if `SITE_BASE` is not `/` | `dist/` |
| `make-og.mjs` | Screenshots `/og-card/` to `public/og.png` (and `og.jpg` with Pillow) | running preview |

Pages for `shots.mjs` and `measure.mjs` are comma-separated paths; use `home` for the home page.

## Targets

| Check | Target | Last measured (2026-10-14) |
|---|---|---|
| Text under 12 px | 0 | 0 on every page |
| Targets under 24 × 24 px | 0 | 0 |
| Phone touch targets | 44 × 44 px with 8 px gaps | met |
| Em dashes on the site | 0 | 0 |
| JavaScript per page | ≤ 40 KB gzip | about 9 to 11 KB |
| impeccable audit / critique | ≥ 18/20, ≥ 26/32 | 19/20, 25/32 |

## CI

`.github/workflows/website.yml` runs `npm ci`, `npm run check`, `npm run build`, installs Chromium and runs `npm test` on every PR touching `website/`. On failure it uploads the Playwright report for 7 days. On `main` it also compiles the CV and deploys. See [project architecture](../project/architecture.md#build-and-deploy).
