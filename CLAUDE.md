# CLAUDE.md

Devin Ezekiel Purba's professional profile: a **website** (Astro 7, `website/`), a **CV** (LaTeX, `cv/`) and a **name card** (`website/src/pages/namecard/`). Public repository; `main` deploys <https://dvez373.github.io/> (repository `DvEz373.github.io`; old `/Personal-Profile-Portfolio/` links forward).

## Rules that are never negotiable

1. **Public repo.** No client, intermediary, plant, vendor, grid operator or market body names, no project locations, no project codes or internal model names, in any file, figure (pixels or metadata), commit, PR or issue. Approximate ratings only; no internal algorithms. The employer appears only in job history (Experience, About "Role", CV, name card). Full rules: `docs/project/publishing-rules.md`.
2. **Never invent facts.** Roles, dates, numbers and "My part" lines come from Devin or from already published case studies.
3. **The private folder and name scanner live only on Devin's PC.** Never ask for their contents or recreate them here.
4. **Ask Devin before** opening a PR, merging (merging deploys), or changing the CV, unless he already said so for this change. Never force-push or rewrite pushed history.
5. Commit as `DvEz373 <ezekiel.devin@gmail.com>`. Plain English, short sentences, no em dashes.
6. **Visual work is designed, not defaulted.** Any diagram, figure or image: use draw.io, the `frontend-design` and `design:design-critique` skills (and impeccable / taste-skill on Devin's PC), the site palette, and a rendered critique before committing. Guide: `docs/project/diagram-style.md`.

## Find things without reading everything

- `node scripts/graph.mjs query <path-or-id>`: what a file imports, what uses it, which docs explain it, which rules govern it.
- `node scripts/graph.mjs impact <path>`: every page and output affected by changing a file.
- `docs/README.md`: index and reading paths per task. Reference docs are current; numbered `docs/website/0x-*.md` files are history.
- The repo root is also Devin's **Obsidian vault** (`docs/project/obsidian.md`). In docs, use relative Markdown links; every doc needs front matter `title`, `aliases`, `type` (reference docs also `covers`). Never edit the generated files in `docs/graph/` (only `curated.mjs` there is hand-written).

| Task | Start here |
|---|---|
| Add or edit a project | `docs/website/content-model.md`, runbook R-03 in `docs/project/runbooks.md` |
| Change a personal fact | `docs/project/sources-of-truth.md` (the CV repeats the YAML by hand) |
| Website code | `docs/website/architecture.md`, `design-system.md`, `quality.md` |
| CV | `docs/cv/reference.md` (two pages, STAR bullets, ATS check) |
| Name card | `docs/card/reference.md` |
| Why something is so | `docs/project/decisions.md` |

## Commands

```bash
cd website && npm ci                      # once
npm run check && npm run build            # types, content schemas, figure metadata; 21 pages
npx astro preview --port 4321 &           # then:
npm test                                  # Playwright desktop + phone (97 passed, 5 skipped)
node scripts/shots.mjs <scratch> "home,projects/"   # screenshots; node scripts/measure.mjs for sizes
cd .. && node scripts/graph.mjs --check   # docs and graph up to date
```

CV: `cd cv && latexmk -pdf main.tex` (or `pdflatex` twice); must stay 2 pages. Environment differences (Windows PC, cloud session): `docs/project/environments.md`.

## Before you finish a change

1. Gate above passes; screenshots viewed for UI changes (keep them out of the repo).
2. Reference doc that covers the changed file updated; `node scripts/graph.mjs` run; graph committed.
3. Dated entry in `docs/website/03-work-log.md`.
