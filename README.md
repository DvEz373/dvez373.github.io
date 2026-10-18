# DvEz373.github.io

Devin Ezekiel Purba's personal profile hub: Electrical Engineer · Energy & AI.

- **Website:** <https://dvez373.github.io/>
- **Name card:** <https://dvez373.github.io/namecard/>

| # | Part | Folder | Status |
|---|------|--------|--------|
| 1 | ATS-friendly CV (LaTeX) | [`cv/`](cv/) | ✅ Building |
| 2 | Personal profile website (GitHub Pages) | [`website/`](website/) (Astro) | ✅ Live |
| 3 | Online name card with QR code | [`website/src/pages/namecard/`](website/src/pages/namecard/) | ✅ Live |

## 1. CV

Source lives in `cv/`. `main.tex` pulls in one file per section.

Build locally (MiKTeX or TeX Live):

```bash
cd cv
latexmk -pdf main.tex                                                          # personal email -> main.pdf
latexmk -pdf -jobname=main-work "-usepretex=\def\UseWorkEmail{}" main.tex     # work email     -> main-work.pdf
```

The two addresses live in `cv/config.sty` (`\personalemail`, `\workemail`).

Every push that touches `cv/` runs the **Build CV** GitHub Action, which compiles the PDF,
checks that an ATS can extract its text, and uploads both variants (personal and work email) as downloadable artifacts.

**ATS notes:** single column, standard section names, real Unicode text
(`glyphtounicode` + T1 fonts), visible URLs, and PDF metadata set. No tables, icons, or images.

## 2. Website

Astro 7 + TypeScript site in [`website/`](website/): run, edit and publish instructions are in [`website/README.md`](website/README.md).
The **Website** workflow compiles the CV, type-checks, builds and browser-tests every change (desktop, phone, accessibility),
and deploys `main` to <https://dvez373.github.io/> (gated by the `PAGES_ENABLED` repository variable).

Personal details live in `website/src/data/*.yaml` and projects in `website/src/content/projects/`; edit and push, and the site rebuilds.

## 3. Name card

| URL | What |
|---|---|
| [`/namecard/`](https://dvez373.github.io/namecard/) | Phone card: save contact (.vcf), email, call, WhatsApp, LinkedIn, Instagram, GitHub, website; share and full-screen QR |
| [`/namecard/print/`](https://dvez373.github.io/namecard/print/) | Print-ready front and back, 85 × 55 mm + 3 mm bleed (Print → Save as PDF, margins None, scale 100%) |
| [`/namecard-qr.svg`](https://dvez373.github.io/namecard-qr.svg) | Vector QR for print, email signatures and slides |

The QR points to `/namecard/`, so details can change without reprinting. Old links and QR codes (`/Personal-Profile-Portfolio/...`, `/card/`) forward to the new pages. Contact data comes from `website/src/data/profile.yaml`.

## Docs

| Start here | For |
|---|---|
| [`docs/README.md`](docs/README.md) | Index and reading paths per task (website, CV, name card) |
| [`docs/project/overview.md`](docs/project/overview.md) | How the three parts fit together, sources of truth, publishing rules, runbooks |
| [`docs/graph/README.md`](docs/graph/README.md) | Knowledge graph: `node scripts/graph.mjs query <file>` shows what a file touches and which doc explains it |
| [`CLAUDE.md`](CLAUDE.md) | Short brief for coding agents |

History (research, design decisions, the step-by-step work log) stays in [`docs/website/`](docs/website/) and [`docs/card/`](docs/card/).
