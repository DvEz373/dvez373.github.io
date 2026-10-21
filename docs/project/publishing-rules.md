---
title: Publishing rules
aliases: [Publishing rules]
type: reference
covers: [website/src/content/projects/, website/src/assets/projects/, website/scripts/figures.mjs, cv/professional_experience.tex]
---

# Publishing rules

The repository is **public** and `main` deploys a public site. These rules apply to every file, figure (pixels and metadata), commit message, PR, issue and comment. They come from Devin's decisions D1 to D8 ([decisions](decisions.md)) and his later answers.

## 1. Names and places

| Never write | Allowed |
|---|---|
| Client, intermediary, plant, vendor, grid operator or market body names | General terms: "the client", "the grid operator", "the TSO's requirements", "the applicable grid code" |
| Places of projects (country, region, city, site) and anything that implies one (for example a national market operator's name) | Devin's own city (Jakarta) on the site and CV |
| Project codes, internal model names, file or folder names from client work | Generic model descriptions ("a user-defined PSS/E model") |
| The employer inside a case study | The employer in job history: Experience, the About "Role" line, the CV, the name card and vCard (D5, 2026-10-14) |

## 2. Numbers and methods (D7)

- **Approximate ratings only**, for every plant: "about 160 MVA", "gigawatt-class", "50 MW-class".
- **No internal algorithms**: describe methods at block level. No thresholds, gains, layer sizes or controller logic.
- Textbook methods may be named (for example the Clarke transform).
- Test counts, accuracy metrics and software versions are fine.
- Keep everything as general as possible.

## 3. Dates (D8)

Client case studies show the start year only. All client work falls between 2025 and now.

## 4. Facts come from Devin

- Never invent a role, date, number or result. "My part" lines (`role:` in project files) are Devin's own words, lightly edited.
- The CV may only use facts already published in the case studies or given by Devin.

## 5. Figures

1. Use figures that show no exact rating or name; otherwise re-export from a copy of the source.
2. draw.io PNG exports embed the whole editable diagram (a `zTXt` chunk) and can carry names the picture does not show. Run `node website/scripts/figures.mjs --fix` after adding a figure. `npm run check` fails while any project figure carries metadata.
3. SVG figures are refused by the guard (they can hide text). Use PNG.
4. Look at every figure at full size before committing.

## 6. The private name scan

A deny list and a name scanner live in a private folder on Devin's PC, outside the repository. They are never copied into the repository and are not available in cloud sessions. Devin runs the scan after pulling and before or right after a merge. If it finds a name in pushed history, fix it in a new commit; never rewrite pushed history.

## 7. Writing style

- Plain English, short sentences, numbers with units.
- No marketing words.
- No em dashes. `website/scripts/measure.mjs` counts them on the built site.
- Expand acronyms on first use on project pages: add new ones to `website/src/lib/glossary.ts`.

## 8. Git and GitHub

- Commit as `dvnezkl <ezekiel.devin@gmail.com>`.
- Never force-push or rewrite pushed history.
- Ask Devin before opening a PR, merging or changing the CV, unless he has already said so for that change.
