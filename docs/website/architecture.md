---
title: Website architecture
aliases: [Website architecture]
type: reference
covers: [website/src/pages/, website/src/layouts/, website/src/components/, website/src/lib/, website/src/scripts/, website/src/styles/global.css, website/astro.config.mjs, website/tsconfig.json]
---

# Website architecture

Astro 7 static site with TypeScript. Every page is pre-rendered at build time; the browser gets HTML, one CSS file and small scripts. For the content files see [content-model.md](content-model.md), for tokens and visual rules [design-system.md](design-system.md), for tests and scripts [quality.md](quality.md).

## Routes (21 pages and 2 files)

| Route | Source | Layout | Notes |
|---|---|---|---|
| `/` | `pages/index.astro` | Base | Hero with `focus` status line, Selected work (first 4 `featured` by `order`), About teaser, Interactive demo |
| `/experience/` | `pages/experience.astro` | Base | `Gantt` career chart and filterable `Timeline` |
| `/education/` | `pages/education.astro` | Base | `Timeline` of degree, exchange, courses |
| `/projects/` | `pages/projects/index.astro` | Base | Theme filter chips, client work then academic |
| `/projects/<slug>/` | `pages/projects/[slug].astro` | Base | One per project file (11). Two areas: `.main` (lead figure, datasheet beside it, Problem / Approach / Result, Markdown body) and the full-width `.figs` below, then prev/next. The datasheet is sticky only inside `.main` and only on screens at least 960 × 1100 px, so it never covers the figures or hides its own key facts. Acronyms wrapped in `<abbr>` |
| `/skills/` | `pages/skills.astro` | Base | Skill domains with levels, certificates |
| `/about/` | `pages/about.astro` | Base (`contact={false}`) | Bio, spec sheet (role, focus tags), contact list |
| `/404.html` | `pages/404.astro` | Base | |
| `/og-card/` | `pages/og-card.astro` | none | 1200 × 630 source for `public/og.jpg`; not in the sitemap |
| `/namecard/` | `pages/namecard/index.astro` | Bare | Name card, see [card reference](../card/reference.md) |
| `/namecard/print/` | `pages/namecard/print.astro` | Bare | Print layout; not in the sitemap |
| `/namecard-qr.svg` | `pages/namecard-qr.svg.ts` | endpoint | Vector QR of the card URL |
| `/devin-ezekiel-purba.vcf` | `pages/devin-ezekiel-purba.vcf.ts` | endpoint | vCard 3.0 from `profile.yaml` |

`public/` adds `favicon.svg`, `og.jpg` and, on `main` builds only, `cv.pdf`.

## Layouts

| Layout | Used by | Provides |
|---|---|---|
| `layouts/Base.astro` | All main pages | Head (title, description, canonical, Open Graph, fonts), `ClientRouter` transitions, `Header`, `Footer` (with optional contact band), `CommandPalette`, theme bootstrap, `initShell()` |
| `layouts/Bare.astro` | Card pages | Minimal head with Open Graph, `noindex` option, no header or footer |

## Components

| Component | Role |
|---|---|
| `Header` | Brand, nav (Experience, Education, Projects, Skills, About), search button, theme toggle, phone menu |
| `Footer` | Contact band, page and document links, Jakarta clock, "Updated <build date>" |
| `CommandPalette` | Ctrl/⌘ K palette of pages, projects, roles and actions; data built at build time, behaviour in `scripts/cmdk.ts` |
| `PageHead` | Page H1, intro and a `Schematic` ornament |
| `SectionHead` | Section H2 with an optional note |
| `Photo` | Responsive `<Picture>` (AVIF/WebP) with optional caption |
| `ProjectCard` | Card on Home and Projects: cover, theme label (in the theme tone), year, title, blurb, stack |
| `ProjectCover` | First figure cropped by `coverFocus` / `coverZoom` on cards, else `ProjectArt`. Scales `sizes` by how much wider than the card a crop draws the image, so the browser loads a sharp file |
| `ProjectArt` | Seeded SVG illustration by domain (energy, AI, IoT) for projects without figures |
| `Schematic` | Decorative SVG ornaments (grid, turbine, solar, neural, circuit) |
| `Timeline` | Filterable, expandable entries for Experience and Education |
| `Gantt` | Career chart; each bar opens its timeline entry |
| `Instrument` | Home demo: grid frequency after a generator trip, controller on/off; behaviour in `scripts/instrument.ts` |
| `Icon` | Inline SVG icon set |

## Libraries (`src/lib/`)

| File | Exports |
|---|---|
| `content.ts` | `getProfile`, `getExperience`, `getEducation`, `getProjects` (by `order`), `getSkills`, `getCertifications` (newest first); label maps; re-exports themes |
| `themes.ts` | `THEMES`, `CATEGORY_LABEL`, `DOMAIN`, `TONE`: one source for theme chips, labels and colours |
| `glossary.ts` | `GLOSSARY` and helpers that wrap the first use of each acronym per page in `<abbr title>` (summary fields and rendered Markdown) |
| `dates.ts` | `BUILD_DATE`, `formatMonth`, `formatRange`, `formatDuration`, `monthsBetween`, `yearFraction`, `byRecent` |
| `url.ts` | `url(path)` builds base-aware links; `routeOf(pathname)` for active nav |
| `qr.ts` | `cardUrl(site)`, `qrSvg(text)`: level M, 4-module quiet zone |
| `transitions.ts` | Page transition animation timings |

## Client scripts (`src/scripts/`)

All run on `astro:page-load`, so they work after client-side navigation, and they drop their listeners on the next navigation.

| Script | Loaded by | Does |
|---|---|---|
| `shell.ts` | `Base.astro` | Theme toggle and memory, phone menu, header state, Jakarta clock, `toast()` |
| `cmdk.ts` | `CommandPalette.astro` | Palette open/close, search, keyboard navigation (WAI-ARIA combobox) |
| `filters.ts` | `Timeline.astro`, `projects/index.astro` | Filter chips with counts, anchor opening of timeline entries |
| `instrument.ts` | `Instrument.astro` | Damped second-order frequency model, canvas drawing, reduced-motion still frames |

## Build configuration

- `astro.config.mjs`: `site` and `base` from `SITE_URL` / `SITE_BASE`; prefetch on hover; sitemap without `/og-card` and `/namecard/print`; base `/` (user site); Geist variable font (upright and italic) self-hosted from `@fontsource-variable/geist`.
- `tsconfig.json`: Astro strict.
- Dependencies: `astro`, `@astrojs/sitemap`, `@fontsource-variable/geist`, `qrcode`. Dev: `@astrojs/check`, `@playwright/test`, `@axe-core/playwright`, `typescript`.

## Conventions

- Links: always `url("path/")` from `lib/url.ts`.
- Colours: tokens only (`var(--signal)` and so on), never literals, except the print and name-card pages.
- New interactive behaviour: a plain TS module in `src/scripts/`, started on `astro:page-load`, cleaned up with an `AbortController`.
- Respect `prefers-reduced-motion` in every animation.
