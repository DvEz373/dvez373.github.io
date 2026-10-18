---
title: Work log
aliases: [Work log]
type: log
---

# Website work log

Each step records what was done, why, and how it was checked.

## 2026-10-03 · Step 0: Groundwork (PR #1, merged)

- Built a simple one-page site in `website/` from the CV, plus the `Deploy website` workflow that builds the CV into `cv.pdf` and publishes to GitHub Pages on pushes to `main`.
- **Check:** rendered in Chromium at 375 px and 1280 px; no sideways scrolling.
- That page stays live until the new design replaces it.

## 2026-10-03 · Step 1: Design plan

- Wrote [01-design-plan.md](01-design-plan.md): requirements mapped to design decisions, a 5-page structure, wireframes, colour and type tokens, the interaction list with fallbacks, breakpoints, accessibility targets, and the tech choice.
- **Key decisions:**
  - **Minimal home page.** Name, title, one tagline, four numbers, four doorway tiles. Every detail moves to its own page.
  - **Three-phase waveform** as the signature interaction. It ties the site to power systems without needing a photo, and colours A/B/C are reused for the timeline categories.
  - **Plain HTML/CSS/JS, no build step.** GitHub Pages serves it as-is and it can be edited on Windows without installing Node.
  - **One content file (`data.js`)** so updating the site means editing one place.

## 2026-10-03 · Step 2: Clickable prototype

- Built `design/prototype/` with all 5 pages, placeholder figures, and every interaction in the plan: waveform, counters, filters, expandable timeline, project modal with a swipeable figure strip, animated skill bars, copy-email, dark-mode toggle, collapsible phone menu, scroll reveals.
- Respects `prefers-reduced-motion`: animation stops, numbers show instantly, the waveform draws once and redraws only when touched.
- Theme choice is stored in `localStorage` inside try/catch, so the site still works when storage is blocked.
- **Checks (headless Chromium):**
  - All 5 pages at 375 × 812 (light) and 1280 × 860 (dark): no JavaScript errors, no horizontal overflow.
  - Opened a project modal and confirmed it renders.
  - Sticky menu bar is at the top of the viewport.
  - Google Fonts could not load inside the build container (its network proxy), so screenshots used fallback fonts; this does not affect real visitors.

## 2026-10-03 · Step 3: Review round 1

Feedback: separate experience types, add an education timeline, keep the site general to ECE/CS, highlight AI and intelligent control, and present renewable energy and power systems as the main field.

- **Experience** now has three types: Work, Internships, Campus & academic. TEEP and PLN ICON+ became internships; lab assistant, KSE and EXERCISE became campus roles.
- **New Education page** using the same timeline component: degree, Coursera AI courses, the NTUST exchange, and a placeholder for high school. Ordered by end date.
- **Repositioned content:** new tagline, 8 focus chips on Home and About, a 3-paragraph bio (background → current work → interests), skills regrouped into Renewable energy & power systems, AI & intelligent control, Automation & digitalization, and Tools. Project filters renamed. The thesis is tagged Reinforcement learning and Digital twin.
- **Stats** (except GPA) are now counted from the content lists, so they update when entries are added.
- **Check:** all 6 pages at 375, 800 and 1280 px: no JavaScript errors, no horizontal overflow.

## 2026-10-03 · Step 4: Review round 2 (photos, palette, ornaments)

Feedback: headline "Electrical Engineer · Energy & AI", keep the waves and add digital/renewable/grid ornaments, design a palette that matches the photos, show the phone number, drop the high-school entry, use the two photos with a light touch-up.

- **Headline** changed. The current job now sits under it as a small line with a pulsing status dot.
- **Photos** touched up with Pillow (script steps listed in plan §12) and exported as WebP + JPEG. The portrait is in the Home hero and About. The graduation photo is the Education banner, the degree entry and About.
- **Palette** rebuilt from the photos (plan §12). Waves, timeline dots, focus chips and skill bars now use sun / blue / leaf.
- **Ornaments** added as a fixed SVG background layer (plan §12).
- **Phone** added to the About contact buttons (tap to call) and the footer.
- **High school** entry removed.
- **Fixes found while testing:**
  - The hero-only portrait ordering leaked into About; scoped it to `.hero`.
  - Contact buttons wrapped mid-number; they are now one per row when narrow.
  - Footer links no longer break inside the phone number.
- **Check:** all 6 pages at 375, 800 and 1280 px: no JavaScript errors, no horizontal overflow. Light and dark screenshots reviewed.

## 2026-10-03 · Step 5: Framework research (v4)

Request: upgrade the frontend, research frameworks first (React, Vue, Next.js or a better option); the site looked too generic.

- Checked claims against official documentation (GitHub Docs, Next.js, Astro, web.dev, MDN, W3C, NN/g). Direct fetches were blocked by the build environment's network policy, so checks went through search results restricted to those domains.
- **Measured** what each framework ships for an identical tiny page in headless Chromium:

  | Setup | JS (gzip) | Content in HTML |
  |---|---:|:-:|
  | Astro 7 | 0 KB | yes |
  | SvelteKit 3 | 30.6 KB | yes |
  | Vite + React 19 | 66.2 KB | no |
  | Next.js 16 | 130.3 KB | yes |
  | Vite + Vue 3.5 | 23.3 KB | no |

  The v3 prototype also failed the "content in HTML" check.
- Scored six options on seven weighted criteria. **Astro 7** ranked first (86/100) and stayed first under five different weightings.
- Full record: [04-framework-research.md](04-framework-research.md); raw data and apps: [research/framework-benchmark/](research/framework-benchmark/).

## 2026-10-03 · Step 6: Visual direction v4, "Grid & Signal"

- Diagnosed why v3 looked generic: a template layout, one undistinguished typeface, uniform cards, decoration that carried no meaning, and stock interactions.
- New concept: the portfolio as an engineer's instrument panel and technical drawing.
  - **Type:** serif headlines, monospace annotations.
  - **Navigation:** a single-line diagram.
  - **Home:** a playable grid-frequency demo.
- Record: [05-visual-direction.md](05-visual-direction.md).

## 2026-10-03 · Step 7: Build in Astro (`website/`)

- **Content moved** from one `data.js` into YAML and Markdown files with build-time schema checks (`src/content.config.ts`).
- **New features:**
  - FIG. 01 grid-frequency instrument (toy second-order model, controller on/off, Run/Pause, a static version for reduced motion, screen-reader announcement).
  - Single-line-diagram section links.
  - "Signal chain" block diagram.
  - Interactive career chart linked to the timeline.
  - One datasheet page per project.
  - VU-meter skill levels.
  - Command palette (Ctrl/⌘ K).
  - Page transitions.
  - Live Jakarta clock.
  - Downloadable contact card (`.vcf`).
  - 404 "open circuit" page.
  - Social preview image.
- **Self-hosted fonts:** Geist, Geist Mono and Instrument Serif. The first attempt used Astro's npm font provider, which still downloaded from a CDN at build time and failed here; switched to the `local` provider pointing at the npm packages, so builds need no network.
- **Photos:** optimized at build time to AVIF/WebP, so the portrait goes from 44 KB to 4–12 KB.
- **Fixes found by reviewing screenshots and tests:**
  - Overlapping canvas labels: added an axis gutter.
  - Flat-topped overshoot on the frequency trace: widened the axis to 50.55 Hz.
  - Overlapping portrait labels on phones.
  - A CSS class name clash on the chart axis.
  - Alphabetical skill order: added an explicit `order`.
  - Chart clicks not opening entries: Astro's router does not fire `hashchange`.
  - The `hidden` attribute overridden by button styles.
  - Low-contrast menu numbers, caught by the axe-core scan.
  - Event listeners stacking up across client-side navigations: scoped with `AbortController`.

## 2026-10-03 · Step 8: Verification

- **Static checks:** `astro check` reports 0 errors, 0 warnings. `astro build` produces 12 pages.
- **Browser tests:** 45 Playwright tests pass, 1 skipped (keyboard shortcut on phones). They run on desktop (1280×900) and phone (Pixel 7) and cover:
  - every page loads with no errors and no sideways scroll;
  - content is present in the server HTML;
  - axe-core finds no serious or critical violations;
  - the command palette, theme persistence, filters, chart → timeline link, instrument, reduced-motion mode, vCard and 404 page all work.
- **Weight per page (phone, measured):**
  - JavaScript: 8.6–11.3 KB gzip (budget 40 KB).
  - Fonts: 93 KB.
  - Largest image on first view: 89 KB (budget 120 KB).
- **Lighthouse 13.5, default mobile settings (lab data, one run each):**

  | Page | Perf | A11y | Best practices | SEO | LCP | TBT | CLS |
  |---|---:|---:|---:|---:|---:|---:|---:|
  | Home | 99 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
  | Education | 98 | 100 | 100 | 100 | 2.3 s | 0 ms | 0 |

  Lab results on a fast machine, not field data from real visitors.
- **CI:** the `Website` workflow now runs `check`, `build` and the browser tests on every pull request. It deploys only when `PAGES_ENABLED` is set, replacing the old deploy workflow that failed while Pages was off.
- **First CI run caught a type error** that my local check missed, because I had type-checked before writing the tests. `@axe-core/playwright` pulled in `playwright-core` 1.63.0 while `@playwright/test` uses 1.56.1, so their `Page` types differed. Fixed with an npm `overrides` entry that pins one `playwright-core`. Reproduced locally first, then `npm ci`, `astro check` (0 errors) and all 45 tests passed before pushing.

## Next (after review)

1. Review v4 in the browser (`cd website && npm install && npm run dev`).
2. Replace placeholders: project figures, skill levels, the hybrid PPC project.
3. Turn on GitHub Pages (repo public or GitHub Pro → Source: GitHub Actions) and set the `PAGES_ENABLED` variable to `true`.
4. Optional: delete `design/prototype/` once v4 is approved.

## Step 9: Website v4.1 (PR #7)
Single Geist typeface; removed section numbers, § and FIG labels; clearer section titles; motion pass (hero entrance, scroll reveals, smooth dropdowns, mobile menu slide, nav underline). Deployed 2026-10-03.

## Step 10: Online name card with QR
Research in `docs/card/01-research.md`, build notes in `docs/card/02-build.md` (now `docs/card/reference.md`). Added `/card/`, `/card/print/` and `/card-qr.svg`.

## 2026-10-11 · Step 11: Design audit of the live site
- Pulled `main` (`bd3a209`), built it and captured every page at 1440 px (light and dark) and 390 px.
- Reviewed against taste-skill and ui-ux-pro-max, plus scripted measurements (text under 12 px, targets under 24 px, labels, dashes) and the existing 55-test suite (all pass).
- Found two live P0 issues: the Skills certificates list collapses (a v4.1 leftover grid column) and developer placeholder notes are public.
- Main gap: no proof of professional work on Home or in Projects.
- Full record: [06-design-audit.md](06-design-audit.md).

## 2026-10-11 · Step 12: P0 fixes and real client projects (branch `website-v5-audit-and-projects`)
- **Certificates list:** the grid kept a 36 px column for the row number that v4.1 removed. Now `minmax(0, 1fr) auto 20px` (desktop) and `minmax(0, 1fr) 20px` (phone).
- **Placeholders:** deleted `hybrid-ppc.md`; removed the "Image to come" figure slots and the placeholder notice; Skills caveat now reads "Levels are self-assessed."
- **Project schema:** `kind` (professional / academic), `featured`, `client`, `also` (extra filter chips), `facts`, and `figures` as real images (`src`, `alt`, `caption`). Dates accept a bare year and `end` is optional.
- **New components:** `ProjectCover` (first figure on a white sheet, falls back to the drawn illustration) and `ProjectCard` (shared by Projects and Home).
- **Projects page:** "Client work" and "Academic and personal" groups; filters match any of a project's categories.
- **Project page:** real lead figure with "Full size" link, client and key facts in the datasheet, full-width figure gallery, Markdown body styles; H1 back on the type system; removed the 56 px indent left from the step numbers.
- **Home:** "Selected work" (first four `featured` projects) directly under the hero, then the demo.
- **Career chart:** 24 × 24 px minimum hit area per bar.
- **Added projects (figures from the project folders, checked for confidential content first):**
  - `datacenter-grid-compliance`: two figures.
  - `tw-fault-locator`: three figures.
- **Blocked:** the other seven project folders were cloud-only OneDrive files. Pinning them (`attrib +P`) queued downloads, but nothing arrived within 10 minutes, and this session cannot trigger the download itself.
- **Check:** `astro check` 0 errors; build 15 pages; Playwright 81 passed, 1 skipped. The new squeezed-text test fails on the old build, as intended.

## 2026-10-11 · Step 13: Demo moved to the bottom of Home
- Feedback: the interactive demo is not the most important thing on the page.
- New Home order: hero → Selected work → Explore → Career direction → Interactive demo → contact. The demo already pauses when off-screen (IntersectionObserver), so it costs nothing until scrolled to.
- **Check:** build 15 pages; Playwright 81 passed, 1 skipped.

## 2026-10-11 · Step 14: Client work kept anonymous
- Rule from Devin: client case studies name no client, employer or project, and no location.
- Fault locator: dropped the client and country, and the employer from the context line; the body now says "the utility". Removed the development-path figure, because the client name is drawn into it.
- Data center: "European Network Code on Demand Connection" is now "the grid code for demand connection".
- Removed the `client` field from the project schema and page, so a name cannot slip back in; the README states the rule.
- Every new figure is checked for drawn-in names before it is added.

## 2026-10-13 · Step 15: Research, plan and handover for the remaining case studies
- All client project sources are now in a local folder (read-only). Read the summaries and screened every figure: SVG text for drawn-in names, PNG metadata, and a visual check of the candidate covers.
- **Found:** draw.io PNG exports embed the whole editable diagram (`zTXt`), and several figures that look clean carry client or plant names there. The "Full size" link serves the original PNG.
  - Added `scripts/figures.mjs` (check, `--fix` strips everything but image chunks) and made it part of `npm run check`.
  - Stripped the two published fault-locator figures and rewrote the unpushed commit, so no embedded source is in the branch history.
- Added `scripts/shots.mjs` (screenshots) and `scripts/measure.mjs` (12 px text, 24 px targets, labels, em dashes).
- Research: taste-skill, ui-ux-pro-max design-system query, the Design plugin's critique framework, and web sources on case-study structure and NDA work. `frontend-design` is in the plugin catalog but not installed; `impeccable` is not available.
- Decisions from Devin: round the ratings of unique plants, merge the two PV controller projects, and give his own role per project.
- Wrote [07-v5-plan.md](07-v5-plan.md) and [08-handover.md](08-handover.md). The source map, removal lists, deny list and name scanner sit in a private folder outside the repo.
- Tested the draw.io command-line export for re-exporting figures without exact ratings.

## 2026-10-13 · v5 Step 0: Baseline
- Branch `website-v5-audit-and-projects` clean, 3 commits on top of `main`, not pushed.
- Read the audit (06), the v5 plan (07), the handover (08) and the private source map.
- **Gate:** `npm run check` 0 errors, "figures: no metadata found"; build 15 pages; Playwright 81 passed, 1 skipped; private name scan clean; screenshots of Home, Projects and the data-center case study viewed (desktop light, desktop dark, phone), no horizontal overflow.

## 2026-10-13 · Step 16: impeccable installed and run
- Devin approved installing impeccable. Cloned the repository to a scratch folder and reviewed it before installing:
  - read `SKILL.md`, `audit.md`, `critique.md` and `polish.md` in full;
  - scanned every other instruction file for downloads, shell commands, settings or hook changes, credentials and injected instructions (none found).
- Installed the instructions only into `~/.claude/skills/impeccable`. Left out the launcher, the engine binary it downloads on first run, and the Claude Code hooks it would add.
- Ran its audit and critique by hand (no detector): audit 16/20, critique 23/32. Three new plan items, R13 (plain language), R14 (44 px phone targets) and R15 (colour tokens), are recorded in [07-v5-plan.md](07-v5-plan.md) §2.4; handover step 11 now uses impeccable.

## 2026-10-13 · v5 Step 1: Answers from Devin
- **His part per project** (his words, lightly edited; one named test set and market body generalised):
  1. Data center: MATLAB and PSCAD model developer, benchmark measurement test bench developer, model validation.
  2. Pumped storage: RMS model developer (PSS/E user-defined model) and a simplified PSCAD EMT model for early benchmarking.
  3. Synchronous condenser: PSS/E RMS model developer (user-defined and generic), PSCAD vs PSS/E benchmarking for the grid operator's model acceptance tests, steady-state studies (short circuit, load flow, QV capability, component current ratings), generic limiter model benchmarking in PSS/E and PSCAD.
  4. Fault locator: physics-informed machine learning model developer and research.
  5. Combined-cycle limiters: RMS model developer (PSS/E user-defined model) and basic functional testing for the user guide.
  6. PV plant controllers: same as 5.
  7. Gas engine plant: same as 5, plus steady-state studies (load flow, short circuit, PQ capability).
  8. Biogas CHP: same as 5, plus EMT model development in PSCAD.
- **Dates:** not needed; start years only.
- **R3 and R4:** "proceed as you see fit"; both go ahead as recommended.
- **Permission:** allowed on these terms: no names, no locations, no real ratings (approximate only, for every plant), no internal algorithms, as general as possible. Recorded as plan decisions D7 and D8; D7 replaces the D2 exception that kept exact ratings for common plants.

## 2026-10-13 · v5 Step 2: "My part" and card crops (plan R1, R2)
- Schema: optional `role`, `coverFocus` (CSS `object-position`) and `coverZoom` (1–3) on projects.
- Project page: "My part" as the first datasheet row and as one line under the blurb.
- `ProjectCover`: with a focus or zoom, card thumbnails crop to that region (`object-fit: cover`, scaled from the focus point); page headers still show the whole figure.
- Fault locator: role added from Devin's answer.
- Test: a project with `role` shows "My part" in the header and datasheet; one without does not.
- **Gate:** check 0 errors, figures clean; 15 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed.

## 2026-10-13 · Handover update (building paused after step 2)
- Devin: this session only prepares the handover; no further code changes or audit runs here.
- The step 3 draft (rounded data-center text and role, re-exported overview without voltages, fault-locator approach and figure generalised per D7) is kept in `git stash`, not committed and not gated.
- Found while drafting: draw.io `--scale 3` exports are cropped on this machine, so `--scale 2` is used; the Read tool shows only part of large PNGs, so preview a scaled copy.
- [08-handover.md](08-handover.md): new step 2b (design audit before continuing: what to run and how, no code changes), Devin's publishing terms as rule 7, D7 notes in steps 3–9, export and relabel notes in §3.

## 2026-10-14 · v5 Step 2b: Design audit before the case studies
- Screenshots of Home, Projects and the data-center case study (desktop light and dark, phone) and `scripts/measure.mjs`; no code changed.
- impeccable audit and critique by hand (single context, no detector): audit 16/20 and critique 23/32, both unchanged from the 2026-10-13 baseline. taste-skill §14 and ui-ux-pro-max §1–§3 on the same pages.
- **New finding (P1):** the project-page lead figure is clipped. The image is taller than its 16:9 box, so the bottom of the data-center diagram is cut off. Plan item R16.
- Also new: R17 (em dashes in the demo's empty readouts, Astro version in the footer). Every other finding maps to R1, R4–R6, R9, R10, R13–R15, step 3 or step 10. Results in [07-v5-plan.md](07-v5-plan.md) §2.4.
- Open question added to the handover: the Home hero names the current employer.
- **Gate:** check 0 errors, figures clean; build 15 pages; Playwright 83 passed, 1 skipped; name scan clean.

## 2026-10-14 · v5 Step 3: Data center rounded, fault locator generalised (D7)
- Applied the stashed draft. Data center: "over 100 MW of IT load", "high-voltage transmission network", "tens of thousands of 3 kW PSUs"; voltage-levels fact dropped; role added from Devin's answer.
- Overview figure re-exported without voltages (HV / MV / LV bands only) and replaced; metadata clean; viewed.
- Fault locator: approach describes the textbook steps only (Clarke transform, Teager energy, arrival times); the arrival threshold and the layer count are gone from text and figure. No other published text names an internal parameter.
- Card crops (R1): `coverFocus` and `coverZoom` for the data center, `coverFocus` for the fault locator; both cards now show a readable region.
- **Gate:** check 0 errors, figures clean; 15 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed (lead figure still clipped, R16).

## 2026-10-14 · v5 Step 4: Pumped storage case study
- New `pumped-storage-dfim-model`: blurb, Problem / Approach / Result, four facts, role from Devin's answer, "What we did" and "How we checked it". Ratings as classes only ("gigawatt-class, several units", "extra-high-voltage grid"); control described at block level (D7). Start year 2025 from the source.
- Figures re-exported from scratch copies of the three `.drawio` files, with every unit rating, bus voltage, the model code and the manufacturer's document name removed: plant overview (cover), PSS/E model against the WT3 chain, development workflow. Metadata stripped; each viewed.
- **Found:** draw.io crops this overview even at `--scale 2` (scale 1 is complete). Exported it as SVG and rendered it in Chromium at 2× instead; noted in the handover §3.
- Card crop on the reservoir and machine (`coverFocus`, `coverZoom`).
- **Gate:** check 0 errors, figures clean; 16 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed (desktop light and dark, phone).

## 2026-10-14 · v5 Step 5: Synchronous condenser case study
- New `synchronous-condenser-model`: "about 160 MVA" on the "high-voltage transmission grid"; the acceptance tests and the market body are not named; the limiter and controller model is described at block level (D7). Role from Devin's answer, shortened without changing its content. Start year 2026 from the source.
- Network overview re-exported from a scratch copy (rating rounded, three voltages replaced by "Machine terminal", "Step-up transformer", "HV bus"), rendered via SVG at 2×; metadata stripped; viewed.
- **Gate:** check 0 errors, figures clean; 17 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed (desktop dark, phone, Projects cards).

## 2026-10-14 · v5 Step 6: Combined-cycle excitation limiter case study
- New `ccgt-excitation-limiters`: "gigawatt-class combined cycle, three gas and one steam turbine unit" on the "extra-high-voltage grid"; limiters named by function only, no settings (D7). Role from Devin's answer. Start year 2026 (start years only, D8).
- Figures: plant and unit control overview re-exported without unit ratings, voltages and the plant name in the page title; unit model chain re-exported with the employer abbreviation replaced by "user-defined model". Both rendered via SVG at 2×, metadata stripped, viewed.
- **Skipped** the excitation reference chain figure: it draws the limiter logic with its settings (internal algorithm, D7).
- Synchronous condenser card crop moved to the machine and its excitation system.
- **Gate:** check 0 errors, figures clean; 18 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed. The lead figure on this page is clipped too (R16, step 11).

## 2026-10-14 · v5 Step 7: PV power plant controller case study (two projects merged, D3)
- New `pv-plant-controller-models`: the port from PSCAD to PSS/E and the later release update as one story. Ratings approximate ("about 20 and 25 MVA", "high-voltage transmission grid"); controller functions listed by name only, no settings, and the import limit value left out (D7). Role from Devin's answer. Start year 2026.
- Figures: both network overviews re-exported without plant ratings, transformer ratings or voltages (approximate plant size kept as "about 20 / 25 MVA"); rendered via SVG at 2×; metadata stripped; viewed. The manufacturer's controller-logic figures were not used.
- **Gate:** check 0 errors, figures clean; 19 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed.

## 2026-10-14 · v5 Step 8: Gas engine plant case study
- New `gas-engine-plant-model`: "five units of about 12 MVA", "about 50 MW", "high-voltage transmission grid"; no grid short-circuit data, no country, no vendors; the user model described at block level (D7). Role from Devin's answer, including the steady-state studies. Start year 2026.
- Plant overview re-exported without unit, transformer and grid ratings or voltages; rendered via SVG at 2×; metadata stripped; viewed.
- **Skipped** the model structure figure: it draws the controller internals (controller types, a fault threshold, mode flags) and carries the model code name.
- **Gate:** check 0 errors, figures clean; 20 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed.

## 2026-10-14 · v5 Step 9: Biogas CHP case study
- New `biogas-chp-plant-controller`: "about 5 MW, three gensets", "medium-voltage distribution network"; no client, farm, state or country, no network company or market operator names, no model code; controller functions by name only (D7). Role from Devin's answer, including the PSCAD EMT model. Start year 2025.
- Figures: network overview (cover) and the aggregated version, both re-exported without genset, plant, transformer and bus ratings and with the plant name removed from the page title; rendered via SVG at 2×; metadata stripped; viewed.
- **Skipped:** the control architecture figure (controller internals and the model code) and the project workflow (names drawn in).
- Gas engine card crop moved to the left edge of the figure.
- **Gate:** check 0 errors, figures clean; 21 pages; Playwright 83 passed, 1 skipped; name scan clean; screenshots viewed. All eight client case studies are now in.

## 2026-10-14 · v5 Step 10: Selection, order and theme filters (R3)
- Featured on Home: data center, pumped storage, synchronous condenser, fault locator. Client work ordered 1–8 as in plan §4; academic projects keep 20–22.
- **R3:** themes replace Energy / AI / IoT: Plant controllers (3), Machine models (3), Grid studies (1), AI (3), IoT (1). One source in `src/lib/themes.ts` (labels, tones, and the domain that picks the drawn illustration); schema, Projects, project pages, Home and the illustrations use it. The three energy themes share the sun colour, so colour still means domain. Palette and Explore hint now read "Client studies, AI and IoT builds".
- **Found and fixed (live since v4):** on phones the closed menu keeps its 326 px box under the header, and that empty box swallowed every tap on the page below it. `.nav` now has `pointer-events: none`, the open menu `auto`. Checked: menu links and chips both work on a phone.
- Tests: theme filters (3 machine models, 3 AI, back to all), Home shows four case studies, the closed phone menu does not block taps.
- **Gate:** check 0 errors, figures clean; 21 pages; Playwright 88 passed, 2 skipped; name scan clean; Home and Projects screenshots viewed (desktop light and dark, phone).

## 2026-10-14 · v5 Step 11: Design revision (R4–R17)
- **R4** Home: hero, Selected work (4), About (one paragraph and a link), Interactive demo, contact. Explore and Career direction removed; their components (`FeederNav`, `SignalChain`) deleted.
- **R5/R11** Page headers lose the eyebrow that repeated the H1; `PageHead` and `SectionHead` lose their `index` props and the hidden `§` span. Section notes are now sentence-case text, not uppercase labels. The footer "Contact" label is gone.
- **R6** Hero eyebrow shows the location only. **R7** About has no second contact band (`Base contact={false}`). **R8** No photo inside the degree entry (photo field removed from the schema, data and `Timeline`).
- **R9** Every label at least 12 px. **R10** Less space under the hero and above the footer. **R12/R15** `--figure-sheet` (off-white in dark mode) and `--screen` tokens; dead annotation CSS removed from Home.
- **R13** `src/lib/glossary.ts`: acronyms in project pages get `<abbr title>` at first use (summary fields and Markdown body; "PSS" inside "PSS/E" is left alone). Astro 7's default Markdown processor no longer takes rehype plugins without an extra package, so the body is processed from its rendered HTML instead.
- **R14** 44 px targets with 8 px gaps under `(pointer: coarse)`: header tools, filter chips, footer links (checked on a Pixel 5 profile).
- **R16** Project-page lead figures keep their own shape (height capped, never cropped). **R17** Demo readouts start at "–"; footer shows "Updated <date>" without the Astro version.
- Tests: lead figures fit their box (three pages), acronyms expanded once, plus the step 10 tests.
- Review: audit 19/20, critique 25/32, measurements in [07-v5-plan.md](07-v5-plan.md) §2.4. The critique target (26) is not met; the reasons are listed there.
- **Gate:** check 0 errors, figures clean; 21 pages; Playwright 92 passed, 2 skipped; name scan clean; screenshots of every page viewed, no horizontal overflow.

## 2026-10-14 · Paused before step 12
- Devin asked to pause. Steps 2b–11 are committed; step 12 (README, audit §6, clean-build gate, screenshots, push question) is next. The handover prompt (§7) now starts there.

## 2026-10-14 · Handover to a Claude Code cloud session
- Devin wants step 12 done in a Claude Code cloud session on GitHub. [08-handover.md](08-handover.md) §7 has the new prompt and §8 the differences: Linux, no private folder, no source folders, no name scan in the cloud.
- The name scan moves to Devin's PC: pull the branch and run it before the PR is merged.
- Two open questions added to §6: the start years of the new case studies, and the shortened synchronous condenser role.

## 2026-10-14 · v5 Step 12: Wrap-up (cloud session)
- `website/README.md` "Add a project": `role` ("My part"), `coverFocus` / `coverZoom` (card crop only), the theme values from `src/lib/themes.ts` (they replace `energy` / `ai` / `iot`), the acronym glossary in `src/lib/glossary.ts`, the no-names rule, `scripts/figures.mjs --fix`, and the SVG route for large draw.io figures (rendered in Chromium at 2×, because `--scale 2` PNG exports can crop). "Still to confirm" now says start years only, by choice.
- [06-design-audit.md](06-design-audit.md) §6: client projects 8 of 8 done; new row for R1–R17 done. Plan and handover status lines updated.
- **Gate on a clean build** (`rm -rf dist`, Linux cloud container): check 0 errors, 2 hints, figures clean; 21 pages; Playwright 92 passed, 2 skipped. `measure.mjs`: no text under 12 px, no target under 24 px, no em dashes on any page; uppercase labels Home 9, Experience 5.
- Screenshots of Home, Projects, the data-center and the pumped-storage case studies (desktop light, desktop dark, phone) viewed and shared in the chat; not committed. No horizontal overflow; lead figures whole; dark-mode figure sheets off-white; acronyms underlined.
- **Not run here:** the private name scan (Devin's PC only). No case-study facts, ratings, dates or figures changed in this step.

## 2026-10-14 · Devin's answers, then merge to main
- **Home status line:** no longer shows the job title and employer. It lists the fields Devin keeps learning across, from a new `focus` list in `profile.yaml` (power systems, control, power electronics, AI/ML and intelligent systems, cyber-physical energy systems, digitalization, digital twins). The Home meta description follows. Job title and employer stay on About, Experience, the name card and the contact card. The status pill now has 14 px corners at every width, so a two-line status looks right.
- **Synchronous condenser role** in Devin's words: control engineer for the model development, power system engineer for the dynamic and steady-state studies. The model and study details from his first answer are kept.
- **Start years:** kept as they are. All client work falls between 2025 and now; Devin will say if one needs to change.
- Handover §6: these three questions are settled. Still open: Experience bullets and the CV name a market operator and a grid-code document.
- Devin asked to merge into `main` now. He will run the private name scan on his PC after pulling.
- **Gate:** check 0 errors, figures clean; 21 pages; Playwright 92 passed, 2 skipped; Home and the synchronous condenser page viewed in desktop light, desktop dark and phone, no horizontal overflow.

## 2026-10-14 · CV in STAR form, no locations
- `cv/professional_experience.tex`: the Power System Engineer entry is now nine STAR bullets (task, action, measured result), one per client project plus one for the smaller work. Facts and numbers come only from the published case studies and the earlier CV; ratings stay approximate.
- Devin: no locations. Grid codes and operators are written in general terms ("grid-code test scenarios", "the TSO's requirements", "the applicable grid code"). The market operator and grid-code acronyms are gone from the CV summary, experience and skills, from Experience on the site, and from the prototype data.
- **Checks:** both CV builds (personal and work email) compile to 2 pages with pdflatex and pass the workflow's text-extraction keywords. Website: check 0 errors, figures clean; 21 pages; Playwright 92 passed, 2 skipped.

## 2026-10-14 · Documentation system and knowledge graph (website, CV, name card)
- **Plan**: one documentation system for the whole portfolio, layered so an agent loads only what a task needs: `CLAUDE.md` (always loaded, about 750 tokens) → `docs/README.md` index with reading paths → reference docs (about 600 to 1,500 tokens each) → history docs (about 30,000 tokens, read only for the "why").
- **Entry layer**: `CLAUDE.md` (rules, where to look, commands, finish checklist), `AGENTS.md` pointer, `docs/README.md` rewritten as the index, root and website READMEs point to it.
- **Project reference** (`docs/project/`): overview, architecture (data flow, build and deploy diagrams), sources of truth (which facts the CV repeats by hand, hard-coded copies, derived outputs), publishing rules, decision register (A1 to A8, N1 to N2, D1 to D11, R1 to R17, K1 to K3), runbooks R-01 to R-13, environments (PC versus cloud).
- **Component reference**: website architecture, content model, design system, quality; `docs/cv/reference.md`; `docs/card/reference.md` (replaces `02-build.md`). History docs keep their text and gain front matter (`type: history`, `current:` pointing to the reference that replaced them).
- **Knowledge graph**: `scripts/graph.mjs` extracts imports, LaTeX inputs, content collections (attributed per getter, so a data file maps to the pages that use it), routes, tests, doc front matter and links; `docs/graph/curated.mjs` adds products, outputs, rules, decisions and sync links. Output: `docs/graph/graph.json` (one node or edge per line) and a generated `docs/graph/README.md` (counts, coverage, diagrams, doc and sync tables). `query <file>` and `impact <file>` answer "what does this touch, which doc explains it, which rule applies" without reading code.
- **Guard**: `node scripts/graph.mjs --check` fails on a stale graph, a broken relative link, a missing `covers` or curated path, or a code file no reference doc covers (82 of 82 covered). New `.github/workflows/docs.yml` runs it.
- Also: `profile.yaml` comment on `chain` corrected (it feeds About, not Home).
- **Checks**: graph check passes (215 nodes, about 540 edges); all Mermaid diagrams render (mermaid 11 in Chromium); website gate: check 0 errors, 21 pages, Playwright 92 passed, 2 skipped.

## 2026-10-14 · Obsidian vault
- Devin works with Claude Code and Obsidian. The repository root is now also an Obsidian vault ([obsidian](../project/obsidian.md)).
- `scripts/obsidian-setup.mjs` merges the needed settings into `.obsidian/app.json` (relative Markdown links, wikilinks off by default, auto-update links, `node_modules` and build output excluded) without touching other settings. `.obsidian/` and `.trash/` are ignored by git, so a pull never clashes with a local vault.
- Every doc has `aliases` (its title), so "CV reference" and "Name card reference" are distinct in the quick switcher. `docs/README.md` has the alias "Home".
- New: `docs/Docs.base` (Bases dashboard: all docs by type, reference, history), generated `docs/graph/portfolio.canvas` (documentation map), generated `docs/graph/modules.md` (the large diagram moved out of `<details>`, which Obsidian does not render).
- `scripts/graph.mjs` now also validates `[[wikilinks]]` (by file name, path or alias; ambiguous and broken ones fail) and requires `title` in front matter.
- **Checks**: graph check passes; wikilink cases tested (alias, path with display text, heading, ambiguous, broken); setup script tested on an empty and an existing `app.json` (merges, idempotent); canvas JSON and Base YAML parse; Mermaid renders. Not tested in the Obsidian app itself (not available in the cloud session).

## 2026-10-14 · Design pass on the documentation visuals
- Devin asked that every visual use the design tools and skills so it does not look generic. Rule recorded in `CLAUDE.md` (rule 6), decision K5 and the new [diagram style guide](../project/diagram-style.md).
- **Tools used**: `frontend-design` skill (brief, token plan, check against its list of generic defaults); draw.io MCP (`create_diagram`, viewer link shared); `design:design-critique` on rendered PNGs; mxgraph (draw.io's engine, from npm) in Chromium to export the editable `.drawio.svg`, because the draw.io CDN is blocked in the cloud. **Not available here**: impeccable, taste-skill and ui-ux-pro-max (installed only on Devin's PC); run impeccable `critique` on the diagram there if wanted.
- **New**: `docs/project/img/system-single-line.drawio.svg`, the build and publish path as a single-line diagram (generators, check breakers, build bus, LaTeX and Astro transformers, PR checks as a relay, GitHub Pages as the grid), in the site palette with the case-study line legend. It replaces the generic data-flow chart in `architecture.md` and heads `overview.md`.
- **Critique and fixes** (three renders): circles drawn as squares and blue label fills (named styles unknown to mxgraph), a diagonal drop to the bus, edge labels over node labels, a command line through a label, text too small at GitHub width (1,170 px wide, now 1,000 px at 14 px), a legend line wrap. All fixed; final checked at 900 px.
- **Mermaid** (architecture build and deploy, generated graph diagrams): themed with the site tokens and node classes (code, data, out, prod, ext). Found and avoided a Mermaid bug: a font list in `fontFamily` drops the CSS and falls back to a serif.
- **Canvas**: column colours are now the site tokens.
- **Checks**: all Mermaid blocks render (mermaid 11 in Chromium); graph check passes.

## 2026-10-14 · Project pages: datasheet no longer covers the figures
- **Reported by Devin** (screenshot of the pumped storage page): the sticky datasheet on the right covered wide figures lower on the page.
- **Cause**: `.spec` was `position: sticky` inside the same grid as the full-width Figures section, and a sticky element moves within its whole containing block. Second problem found while testing: the datasheet is 780 to 966 px tall, so on screens up to 900 px high a sticky datasheet hid its own key facts.
- **Reproduced** with a scroll audit of all 11 project pages at 2560 × 1440, 1920 × 1200, 1920 × 1080, 1440 × 900, 1280 × 720, 1024 × 768 and 390 × 844, light and dark: 1,520 overlapping scroll positions before the fix, on every client case study with extra figures, at every desktop size.
- **Fix** (`projects/[slug].astro`): the page now has two areas, `.main` (lead figure, datasheet, story) and the full-width `.figs`; the datasheet can only stick inside `.main`, and only at 960 × 1100 px and up, with a scroll fallback for very long datasheets. Elsewhere it scrolls with the page.
- Also fixed, found by `measure.mjs`: the "Projects" breadcrumb and the "Full size" link were under 24 px tall; both now have 24 px targets.
- **New test**: "the datasheet never covers the figures or the story" (fails on the old layout, passes on the new one).
- **Checks**: scroll audit 0 overlaps at all sizes and themes; `measure.mjs` on project pages: no text under 12 px, no target under 24 px; check 0 errors; 21 pages; Playwright 93 passed, 3 skipped; screenshots viewed (desktop light and dark at 1440 and 1920 × 1200, phone light and dark).

## 2026-10-14 · Visual check of the whole site, six fixes
- **Asked by Devin**: a detailed, page-by-page visual check of the real site in light and dark, phone and desktop. The live site is blocked from the cloud session, so the check ran on a production build of the same code.
- **Method**: every page (Home, Experience, Education, Projects, three project pages of different kinds, Skills, About, name card, 404) screen by screen as a visitor scrolls, at 1440 × 900 light and dark and 390 × 844 light and dark; interactive states (command palette, demo after a trip, filters, phone menu, QR dialog, keyboard focus); axe on all 20 pages in both themes (0 findings of any impact); internal links (0 broken; `cv.pdf` exists only on `main` builds); sideways overflow at ten widths from 320 to 2,560 px. Critique with the `design:design-critique` framework.
- **Fixed**:
  1. Name card overflowed by 39 px on a 320 px phone. Cause: the page grid sized its column to the longest contact row, so the rows never truncated. Fix: `minmax(0, 1fr)` column; Copy link and Show QR stack when they do not fit. New test checks 320 px against a fixed width (comparing with `innerWidth` hides it, because phone browsers widen the layout viewport).
  2. Timeline meta rows on phones started a wrapped line with a lone "·" ("· Campus & academic"). Line-start dots are now clipped.
  3. Experience and Education had two left edges: the timeline column was centred, the title and chart were not. The column now starts at the page edge.
  4. Datasheet values could end with one short word on its own line ("km"); `text-wrap: pretty`.
  5. Demo readout showed "F" (uppercase style on the symbol f; F is the farad). Now "Frequency".
  6. Stacked prev/next cards on phones: the right-aligned "Next" title read raggedly over three lines; left-aligned when stacked.
- **Left as is, for Devin to decide**: some card crops cut a diagram label at the top edge (synchronous condenser, PV, excitation); "Client work" repeats on every card in the Client work section; "My part" appears in the header and again in the datasheet; the graduation photo on Education is about 680 px tall on desktop; the phone footer repeats the whole navigation.
- **Checks**: check 0 errors; 21 pages; Playwright 94 passed, 4 skipped; `measure.mjs` 0 small text, 0 small targets, 0 em dashes; overflow none at all ten widths; every fix viewed after the change.

## 2026-10-14 · Card crops and card labels
- **Asked by Devin** after the visual check: fix the card crops that cut labels, and drop the repeated "Client work" label.
- **Crops**: every client card cover was rendered next to its whole figure with the visible area outlined. Seven of eight cut text at an edge (for example "Plant Controller (RTU)", "Bus PoC", "Terminal bus", "Fault distance"). Each crop is now a 16:9 rectangle drawn in image pixels with all four edges in white space, checked with ink measurements where labels sit close, then converted to `coverFocus` / `coverZoom` (method in the [content model](content-model.md#projects)). The PV figure is already about 16:9 and has no clean rectangle that keeps its controller, so its card shows the whole figure. The data center crop already cut no text and is unchanged.
- **Sharper crops**: zoomed covers were blurry, most visibly on the excitation limiter card (zoom 2.4). The browser picked a file for the card width, then CSS enlarged it. `ProjectCover` now scales `sizes` by how much wider than the card the crop draws the image. New test: each zoomed cover loads a file at least as wide as it is drawn (fails before: 380 px file for 513 px drawn).
- **Labels**: client cards said "Client work" under the "Client work" heading. Cards now show the theme for all projects ("Grid studies", "Machine models", "Plant controllers", "AI", "IoT"), in the theme colour, matching the filter chips. The project page eyebrow keeps "Client work · theme".
- **Checks**: check 0 errors; 21 pages; Playwright 95 passed, 5 skipped; `measure.mjs` on Home and Projects 0 small text, 0 small targets; cards viewed on Projects (desktop light and dark) and Home (phone).

## 2026-10-16 · Headline: control systems specialization
- **Asked by Devin**: say he is an electrical engineer specializing in control systems, and stop repeating "AI" on the name card (it said "Energy & AI" and then "AI & intelligent control").
- **`profile.yaml`**: `headlineAccent` "Energy & AI" -> "Control Systems"; `tagline` -> "Power systems · Renewable energy · Machine learning". First bio paragraph now opens "I'm an electrical engineer specializing in control systems. I majored in Electrical Engineering at Universitas Indonesia, concentrating in Control Systems and Automation" (facts as on the CV). Third paragraph says "machine learning, deep learning and reinforcement learning" once instead of "AI, machine learning".
- **About**: intro "An electrical engineer specializing in control systems, from power grids to machine learning."; page description updated.
- **Follows automatically**: Home hero, page titles, name card, printable card, vCard note.
- **Link preview**: `og.jpg` regenerated. Its eyebrow is now the location only, so "Electrical Engineer" no longer appears twice.
- **Layout**: on phones the Home headline wraps before "Control Systems"; the separator dot is clipped at line starts (same method as the Timeline). The name card drops the dot and stacks the accent below 256 px card width (320 px phones).
- **Also fixed**: "Download QR" and "Print card" on the name card were 18 px tall, now 24 px. `measure.mjs` did not cover the card by default; it does now.
- **CV**: unchanged. Its summary already says "Power System Engineer specializing in control systems" and "B.Eng. in Electrical Engineering (Control Systems and Automation, Cum Laude)".
- **Checks**: check 0 errors; 21 pages; Playwright 95 passed, 5 skipped; `measure.mjs` 0 small text and 0 small targets on all 7 default pages; Home (desktop, phone light and dark), name card (390 px light, 320 px dark), printable card and `og.jpg` viewed.

## 2026-10-16 · Control systems in the status line, long-term goal stated
- **Asked by Devin**: write "control systems" rather than "control" (the field covers control engineering and control theory), and state his end goal: digital transformation of the power grid, smart grids and intelligent energy systems.
- **`profile.yaml`**: `focus` "control" -> "control systems" (Home status line and Home description). Third bio paragraph now states the goal: "My long-term goal is the digital transformation of the power grid: smart grids and intelligent energy systems. That is where my interests meet, from control theory and power system dynamics to machine learning, reinforcement learning and digital twins." The "Direction" block of `chain` now leads with Smart grids, Intelligent energy systems, Digital transformation.
- **Home**: the About section shows the goal paragraph after "Today I work on...", so the goal is visible without opening About.
- **About**: contact line "Open to conversations about smart grids, control and intelligent energy systems."
- **Checks**: check 0 errors; 21 pages; Playwright 95 passed, 5 skipped; `measure.mjs` on Home and About 0 small text, 0 small targets; Home hero and About section (desktop light, phone dark) and About bio and focus tags viewed.
- **Follow-up, approved by Devin**: tagline -> "Smart grids · Intelligent energy systems · Machine learning" (vCard note and link preview; `og.jpg` regenerated). CV summary ends with "Long-term goal: the digital transformation of power grids toward smart grids and intelligent energy systems."; both CV versions still 2 pages, the line extracts as text. Headline unchanged.

## 2026-10-18 · Site at https://dvez373.github.io/, name card at /namecard/
- **Asked by Devin**: the site address without anything after the domain, and the name card at `.../namecard`.
- **How**: GitHub serves `https://<owner>.github.io/` only from a repository named `<owner>.github.io` (GitHub Docs, "What is GitHub Pages?", types of sites). The repository is renamed from `Personal-Profile-Portfolio` to `DvEz373.github.io` and the build uses base `/` (decision A9). GitHub forwards git and web traffic after a rename "with the exception of project site URLs" (GitHub Docs, "Renaming a repository"), so the old addresses need their own forwarding.
- **Forwarding** (`website/scripts/legacy-paths.mjs`, run by `npm run build`): a page for every old `/Personal-Profile-Portfolio/<path>/` and for `/card/...`, forwarding to the new page and keeping any `#fragment`; copies of `cv.pdf`, the vCard, the QR SVG and `og.jpg` at their old paths. Printed cards carry `.../Personal-Profile-Portfolio/card/`, which now opens `/namecard/`.
- **Name card**: `src/pages/card/` -> `src/pages/namecard/`, `card-qr.svg` -> `namecard-qr.svg` (decision N3). The QR now encodes `https://dvez373.github.io/namecard/` (decoded with jsQR from the SVG and from the print page). Shorter text, less dense code.
- **Also**: Footer and About links, `playwright.config.ts`, `shots.mjs`, `measure.mjs`, `make-og.mjs`, sitemap filter, README files, CLAUDE.md, project architecture, overview, sources of truth, runbooks R-01, R-10, R-11, card reference, website architecture, graph.
- **Order of release**: the PR builds for the root, so it is merged and the repository renamed one right after the other; between the two the old address shows an unstyled page for a few minutes.
- **Checks**: check 0 errors; 21 pages plus 22 forwarding pages; Playwright 97 passed, 5 skipped (new test: old links forward); QR decoded; name card (phone) and print card viewed.
