---
title: System architecture
aliases: [System architecture]
type: reference
covers: [website/astro.config.mjs, website/package.json, cv/main.tex, .github/workflows/website.yml, .github/workflows/build-cv.yml, .github/workflows/docs.yml, .gitignore]
---

# System architecture

## Repository layout

| Path | What | Notes |
|---|---|---|
| `website/` | Astro 7 site, also the name card | Node 22.12+ (CI uses 24). Own `README.md` for running and editing |
| `website/src/data/*.yaml` | Profile, experience, education, skills, certificates | Validated by `src/content.config.ts` |
| `website/src/content/projects/*.md` | One file per project; the file name is the URL slug | Front matter is the datasheet, the body is Markdown |
| `website/src/assets/` | Photos and project figures (PNG) | Resized to AVIF/WebP at build time |
| `website/scripts/` | Figure guard, screenshots, measurements, OG image | Run with `node scripts/<name>.mjs` from `website/` |
| `website/tests/site.spec.ts` | Playwright tests, desktop and phone | Against the built site (`astro preview`) |
| `cv/` | LaTeX CV, one file per section | `main.tex` inputs the others; `config.sty` holds layout, metadata, the two email addresses |
| `docs/` | Documentation and the knowledge graph | Index: [docs/README.md](../README.md) |
| `scripts/graph.mjs` | Builds and checks the knowledge graph | Node built-ins only, no install needed |
| `design/prototype/` | v3 vanilla-JS prototype | History only, not built or deployed |
| `.github/workflows/` | CI: Website, Build CV, Docs | See below |

## Data flow

![The build and publish path drawn as a single-line diagram: three generators (profile and data, case studies, CV) feed a build bus through check breakers; the CV passes a LaTeX transformer; the bus feeds GitHub Pages through merge and deploy breakers; PR checks measure the bus and the docs and permit the merge.](img/system-single-line.drawio.svg)

Drawn as a single-line diagram, the drawing Devin works with every day: content sources are generators, each check is a breaker, the build is the bus, and GitHub Pages is the grid. The file is an editable draw.io SVG: open it in draw.io (desktop or app.diagrams.net), edit, save; GitHub and Obsidian show the new version.


Two facts matter most:

1. **Website, card and vCard share one source.** `profile.yaml` feeds the home hero, the About page, the footer, the name card, the print card, the vCard and the command palette. Change it once.
2. **The CV does not read the YAML.** It repeats many of the same facts in LaTeX. They must be kept in sync by hand: see [sources-of-truth.md](sources-of-truth.md).

## Build and deploy

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontSize": "14px", "primaryColor": "#ffffff", "primaryTextColor": "#12161c", "primaryBorderColor": "#12161c", "lineColor": "#4c5866", "secondaryColor": "#f3f5f7", "tertiaryColor": "#f3f5f7", "clusterBkg": "#f3f5f7", "clusterBorder": "#aeb8c3", "edgeLabelBackground": "#f3f5f7"}}}%%
flowchart TB
  classDef code fill:#e1eaf8,stroke:#1d5fc4,color:#12161c
  classDef check fill:#ffffff,stroke:#0e8f7e,color:#12161c
  classDef out fill:#fbf1cf,stroke:#8a6300,color:#12161c
  PUSH[push or PR]:::code --> W{paths}
  W -->|"website/** or cv/**"| WEB[Website workflow]:::check
  W -->|"cv/**"| CVW[Build CV workflow]:::check
  W -->|"docs, code, CI files"| DOCS[Docs workflow]:::check
  WEB --> C1["compile cv/main.tex to public/cv.pdf<br/>(main only)"]
  C1 --> C2["npm ci, check, build, test"]
  C2 -->|"main and PAGES_ENABLED"| DEP[deploy to GitHub Pages]:::out
  CVW --> V1["personal and work variants<br/>ATS text check, PDF artifacts"]
  DOCS --> G["node scripts/graph.mjs --check"]
```

| Workflow | Triggers | Does |
|---|---|---|
| `website.yml` | Push to `main` touching `website/**`, `cv/**` or the workflow; PRs touching `website/**`; manual | On `main`: compiles the CV into `public/cv.pdf`. Always: `npm ci`, `npm run check` (types, content, figure metadata), `npm run build`, Playwright tests. On `main` with `PAGES_ENABLED=true`: deploys `website/dist` to Pages |
| `build-cv.yml` | Push touching `cv/**` or the workflow; PRs touching `cv/**`; manual | Builds both CV variants, checks that an ATS can extract key words and the email, uploads the PDFs |
| `docs.yml` | Push and PRs touching docs, `CLAUDE.md`, `README.md`, `scripts/`, `website/src/`, `cv/` or workflows | Fails if the knowledge graph is stale or a doc link or `covers:` path is broken |

**Merging to `main` publishes.** A merged PR that touches `website/` or `cv/` redeploys the public site within a few minutes.

## Base path and URLs

Since 2026-10-18 the site is a GitHub Pages user site: the repository is named `DvEz373.github.io` and the site lives at the root, <https://dvez373.github.io/> (decision A9). `astro.config.mjs` reads `SITE_URL` and `SITE_BASE` (defaults: `https://dvez373.github.io`, `/`). In code, always build links with `url()` from `src/lib/url.ts`, never with a hard-coded `/`, so the base can change again. After `astro build`, `scripts/legacy-paths.mjs` writes a forwarding page for every old address under `/Personal-Profile-Portfolio/` and for `/card/` (now `/namecard/`), and copies the CV, vCard, QR and preview image to their old paths: GitHub does not forward project-site URLs after a rename, and printed cards carry the old QR. A custom domain needs a new `SITE_URL` and a reprint of the name card, because the QR encodes the full URL.

## Runtime behaviour

The site is static HTML with small plain-TypeScript scripts (about 9 to 11 KB of JavaScript per page). No UI framework runs in the browser. Page transitions use Astro's `ClientRouter`, so every script re-initialises on `astro:page-load`. Details: [website architecture](../website/architecture.md).
