---
title: Runbooks
aliases: [Runbooks]
type: runbook
covers: [website/README.md, website/scripts/, website/src/data/, website/src/content/projects/, cv/, scripts/graph.mjs]
---

# Runbooks

Short, tested recipes. Each one lists the files to touch and how to check the result. Commands run from the repository root unless a `cd` is shown. Environment setup: [environments.md](environments.md).

## R-01 Run the website locally

```bash
cd website && npm ci && npm run dev        # live reload at http://localhost:4321/
```

## R-02 The gate (before every commit that touches the site)

```bash
cd website
npm run check                 # astro check (types, content schemas) + figure metadata guard
npm run build                 # 21 pages expected today
npx astro preview --port 4321 &   # tests reuse a running preview
npm test                      # Playwright, desktop and phone (97 passed, 5 skipped today)
node scripts/shots.mjs <scratch>/shots "home,projects/,projects/<slug>/"   # desktop light/dark + phone
node scripts/measure.mjs      # no text < 12 px, no target < 24 px, uppercase labels, em dashes
cd .. && node scripts/graph.mjs --check
```

Look at the screenshots. Keep them out of the repository.

## R-03 Add a client case study

1. Read [publishing rules](publishing-rules.md). Get the "My part" line from Devin.
2. Figures: `website/src/assets/projects/<slug>/<name>.png`. Large draw.io diagrams: export SVG and render it in Chromium at device scale 2 (a `--scale 2` PNG export can crop). Then `cd website && node scripts/figures.mjs --fix` and look at each figure.
3. Write `website/src/content/projects/<slug>.md`, copying `datacenter-grid-compliance.md`. Fields: [content model](../website/content-model.md#projects).
4. New acronyms → `website/src/lib/glossary.ts`.
5. `featured: true` puts it on Home (first four by `order`).
6. Update the CV bullet if the project belongs in it ([sources of truth](sources-of-truth.md)).
7. Gate (R-02). Regenerate the graph (R-12).

## R-04 Add an academic project

As R-03 with `kind: academic`, `order` 20 and up, start and end as `YYYY-MM`. No figure needed: the card draws an illustration from the theme. Also add it to `cv/projects.tex` if it should be on the CV.

## R-05 Change or leave a job

| Step | File |
|---|---|
| End the old role: `end: "YYYY-MM"` instead of `present` | `website/src/data/experience.yaml` |
| Add the new role (type, role, org, place, start, `end: present`, summary, points, tags) | same file |
| Update `role` and `org` (About line, name card, vCard) | `website/src/data/profile.yaml` |
| Update the CV entry and summary; work email if it changes | `cv/professional_experience.tex`, `cv/title.tex`, `cv/config.sty`, `.github/workflows/build-cv.yml` (matrix email) |
| Optional: `focus` list, bio | `profile.yaml` |

Then the gate, and R-08 for the CV. If the job title changes, update the test that expects "Power System Engineer" in `website/tests/site.spec.ts`.

## R-06 Change contact details

Phone, email, links: `website/src/data/profile.yaml` and `cv/title.tex` (and `cv/config.sty` for email). The name card, vCard and footer follow `profile.yaml` automatically. The QR does not change.

## R-07 Add a certificate, skill or education entry

`website/src/data/{certifications,skills,education}.yaml` and the matching `cv/{certification,skills,education}.tex`. Dates are `YYYY-MM`. Skill levels are 1 to 5.

## R-08 Build and check the CV

```bash
cd cv
latexmk -pdf main.tex                                                        # personal -> main.pdf
latexmk -pdf -jobname=main-work "-usepretex=\def\UseWorkEmail{}" main.tex   # work -> main-work.pdf
pdfinfo main.pdf | grep Pages                                                # must be 2
pdftotext main.pdf - | grep -c "PSCAD"                                       # ATS can read it
```

No `latexmk`? Run `pdflatex` twice instead. Keep it at two pages: shorten bullets rather than shrink fonts or margins. Details: [CV reference](../cv/reference.md).

## R-09 Regenerate the link-preview image

After changing the name, headline, tagline or portrait:

```bash
cd website && npm run build && npx astro preview --port 4321 &
node scripts/make-og.mjs        # writes public/og.png, and public/og.jpg if Pillow is installed
```

Commit `public/og.jpg`. Delete the leftover `og.png` if `og.jpg` was written.

## R-10 Print name cards

Open `/namecard/print/`, then Print → Save as PDF, margins None, scale 100 %, background graphics on. Send as "85 × 55 mm, 3 mm bleed included". Test-scan a proof on iPhone and Android. Details: [card reference](../card/reference.md).

## R-11 Move to a custom domain

Build with `SITE_URL=https://<domain>` (set in `website.yml`), configure Pages, then reprint the cards: the QR encodes the full URL. Add the current `https://dvez373.github.io/` paths to `scripts/legacy-paths.mjs` so existing links keep working.

## R-12 Update docs and the knowledge graph

0. In Obsidian, rename or move notes inside Obsidian so links update ([obsidian](obsidian.md)).
1. Edit the reference doc that covers the file you changed (the graph tells you which: `node scripts/graph.mjs query <path>`).
2. New concept, rule or decision: add it to `docs/project/decisions.md` and, if it links files, to `docs/graph/curated.mjs`.
3. `node scripts/graph.mjs` regenerates `docs/graph/graph.json` and `docs/graph/README.md`.
4. `node scripts/graph.mjs --check` must pass (CI runs it).
5. Add a dated entry to [the work log](../website/03-work-log.md).

## R-13 Ship a change

1. Branch from `main`. Commit as `DvEz373 <ezekiel.devin@gmail.com>`; no names in messages.
2. Push, open a PR (ask Devin first), wait for Website / Build CV / Docs checks.
3. Merge with squash (the repository's convention). Merging deploys.
4. Check the Website run on `main` (build and deploy jobs) and open the live site.
5. Devin pulls `main` and runs the private name scan.
