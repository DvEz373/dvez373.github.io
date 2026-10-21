---
title: Decision register
aliases: [Decision register]
type: reference
covers: [docs/website/04-framework-research.md, docs/website/05-visual-direction.md, docs/website/07-v5-plan.md, docs/card/01-research.md]
---

# Decision register

One line per decision that still holds, with where the full reasoning lives. Newest rule wins where two conflict. Add new decisions at the bottom of the matching table.

## Platform and design

| ID | Date | Decision | Why (short) | Source |
|---|---|---|---|---|
| A1 | 2026-10-03 | Astro 7 with TypeScript; interactivity as small plain-TS scripts, no UI framework runtime | Scored 86/100, first under every weighting; zero JS by default; schema-checked content | [04 framework research](../website/04-framework-research.md) §6 to §7 |
| A2 | 2026-10-03 | Content as YAML (lists) and Markdown (projects), validated by Zod at build | A typo stops the build instead of shipping a broken page | 04 §7 |
| A3 | 2026-10-03 | Self-hosted fonts from npm, no CDN | Control and reliability; Google Fonts failed in the test environment | 04 §7 |
| A4 | 2026-10-03 | Deploy from `main` only, gated by `PAGES_ENABLED` (since A10: `VERCEL_ENABLED`) | No red runs before Pages was enabled | 04 §7 |
| A5 | 2026-10-03 | "Grid & Signal" visual direction: instrument panel and technical drawing, playable frequency demo | Generic v3 look; show, do not tell | [05 visual direction](../website/05-visual-direction.md) §2 |
| A6 | 2026-10-03 | v4.1: one typeface (Geist), no section numbers or FIG labels, motion pass | Simpler hierarchy | [work log](../website/03-work-log.md) step 9 |
| A7 | 2026-10-03 | Motion: 120 / 240 / 400 ms, no scroll-jacking, `prefers-reduced-motion` respected | NN/g and WCAG 2.3.3 | 05 §5 |
| A8 | 2026-10-03 | Budgets: JS ≤ 40 KB gzip per page, no serious axe violations, keyboard access everywhere | Fast and accessible | 05 §6 |
| A9 | 2026-10-18 | Site at the root, <https://dvez373.github.io/>: repository renamed to `DvEz373.github.io` (user site), base `/`; forwarding pages keep every old `/Personal-Profile-Portfolio/` link and printed QR working | Devin wants the short address; GitHub does not forward project-site URLs after a rename | [project architecture](architecture.md#base-path-and-urls) |
| A10 | 2026-10-21 | Site on Vercel at <https://dvnezkl.vercel.app/>, deployed by the Website workflow as prebuilt static output; GitHub account renamed `DvEz373` → `dvnezkl`, repository renamed to `dvnezkl.github.io`. Supersedes the host in A9 and the QR URL in N3 | The account rename ended `dvez373.github.io`; Devin chose Vercel; CI keeps compiling the CV and running tests before deploy | [project architecture](architecture.md#base-path-and-urls) |
| A11 | 2026-10-21 | `dvnezkl.github.io` serves forwarding pages to the same path on <https://dvnezkl.vercel.app/> (job `pages-redirect` in `website.yml`) | GitHub does not allow switching Pages off for a `*.github.io` repository, and it was serving an outdated copy | [project architecture](architecture.md#base-path-and-urls) |

## Name card

| ID | Date | Decision | Why | Source |
|---|---|---|---|---|
| N1 | 2026-10-03 | Card web page `/card/` plus a QR to its URL, a vCard 3.0 download, a print layout and a vector QR; no Wallet pass | Works on every phone, editable without reprinting, free, no third party | [card research](../card/01-research.md) |
| N2 | 2026-10-03 | QR level M, 4-module quiet zone, about 24 mm code on the print card | ISO/IEC 18004 and print guidance | [card reference](../card/reference.md) |
| N3 | 2026-10-18 | Name card at `/namecard/` (was `/card/`); the QR encodes `https://dvez373.github.io/namecard/`. Old card addresses forward | Devin's choice; shorter URL gives a less dense QR | [card reference](../card/reference.md) |

## Content and publishing (Devin)

| ID | Date | Decision | Source |
|---|---|---|---|
| D1 | 2026-10-11 | Client case studies name no client, employer, intermediary, plant, vendor, grid operator, market body or place, and no project codes or internal model names, in text, figure pixels or metadata | [07 v5 plan](../website/07-v5-plan.md) §3 |
| D2 | 2026-10-11 | (Replaced by D7) exact ratings for common plants | 07 §3 |
| D3 | 2026-10-11 | The two PV controller projects are one case study | 07 §3 |
| D4 | 2026-10-11 | Devin gives each "My part" line; agents never invent one | 07 §3 |
| D5 | 2026-10-11, confirmed 2026-10-14 | The employer appears only in job history: Experience, the About "Role" line, the CV, the name card. Never in case studies | 07 §3, work log 2026-10-14 |
| D6 | 2026-10-11 | The interactive demo stays, at the bottom of Home | 07 §3 |
| D7 | 2026-10-13 | Publishing allowed: no names, no locations, approximate ratings only for every plant, no internal algorithms, as general as possible | 07 §3 |
| D8 | 2026-10-13 | Start years only; R3 (theme filters) and R4 (Home rhythm) approved | 07 §3 |
| D9 | 2026-10-14 | Home status line lists the fields Devin keeps learning across (`focus`), not the job title and employer | [work log](../website/03-work-log.md) 2026-10-14 |
| D10 | 2026-10-14 | CV: STAR bullets; grid codes and operators in general terms; no locations anywhere (market operator and grid-code names removed) | work log 2026-10-14 |
| D11 | 2026-10-14 | Years of client work are not important for now (all 2025 to now); Devin will ask for changes | work log 2026-10-14 |

## Design revision (v5, all done)

R1 card crops (`coverFocus`, `coverZoom`) · R2 "My part" (`role`) · R3 theme filters · R4 Home rhythm (hero, selected work, about, demo) · R5 fewer eyebrows · R6 hero eyebrow is the location · R7 no second contact band on About · R8 no photo inside the degree entry · R9 labels at least 12 px · R10 less dead space · R11 no hidden section index · R12 off-white figure sheets in dark mode · R13 plain-language first sentences and `<abbr>` acronyms · R14 44 px touch targets on phones · R15 colour tokens · R16 lead figures never cropped · R17 no em dashes in readouts, no version in the footer. Details: [07 v5 plan](../website/07-v5-plan.md) §5.

## Documentation

| ID | Date | Decision | Why |
|---|---|---|---|
| K1 | 2026-10-14 | Layered docs: `CLAUDE.md` (always loaded, short) → `docs/README.md` index → reference docs → history docs | Agents load only what the task needs |
| K2 | 2026-10-14 | Knowledge graph generated from the repository by `scripts/graph.mjs`, checked in CI | A hand-written graph goes stale; a checked one cannot |
| K3 | 2026-10-14 | History docs (website 01 to 08, card 01) are kept unchanged apart from front matter; current facts live in reference docs | History explains why; reference says what is true now |
| K5 | 2026-10-14 | Visual work uses the design tools (draw.io, frontend-design, design-critique; impeccable and taste-skill on the PC), the site palette and a single-line-diagram vocabulary, with a rendered critique before commit | Devin wants visuals that are not generic |
| K4 | 2026-10-14 | The repository root is also an Obsidian vault: relative Markdown links (wikilinks allowed and checked), `aliases` on every doc, `.obsidian/` not committed, settings merged by `scripts/obsidian-setup.mjs` | Devin works with Claude Code and Obsidian on the same files; links must work on GitHub too |
