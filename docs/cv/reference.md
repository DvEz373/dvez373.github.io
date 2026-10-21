---
title: CV reference
aliases: [CV reference]
type: reference
covers: [cv/, .github/workflows/build-cv.yml]
---

# CV reference

ATS-friendly two-page CV in LaTeX. It is published on the website as `CV_Devin_Ezekiel_Purba.pdf` (the old address `/cv.pdf` serves a copy) and built in CI in two variants.

## Files

| File | Holds |
|---|---|
| `cv/main.tex` | A4, 10 pt article; inputs the sections in order: title, education, professional experience, projects, certifications, skills |
| `cv/config.sty` | Margins, ATS settings (`glyphtounicode`, `cmap`, T1 fonts, Latin Modern), `hyperref` metadata and keywords, the two emails (`\personalemail`, `\workemail`, switched by `\UseWorkEmail`), `\newEntry{title}{place}{org}{dates}{body}`, section style |
| `cv/title.tex` | Name, contact line, summary paragraph (role and specialization, tools, degree, ML background, then the long-term goal: digital transformation of power grids toward smart grids and intelligent energy systems) |
| `cv/education.tex` | Degree, GPA, concentration, thesis, internship and scholarship |
| `cv/professional_experience.tex` | Seven entries; the current job has nine STAR bullets |
| `cv/projects.tex` | Three academic projects with links |
| `cv/certification.tex` | Seven certificates with Coursera links |
| `cv/skills.tex` | "Additional Information": technical expertise, hard and soft skills |

## Build

| Variant | Command (in `cv/`) | Output | Used for |
|---|---|---|---|
| Personal email | `latexmk -pdf main.tex` | `main.pdf` | Website "Download CV" (`public/CV_Devin_Ezekiel_Purba.pdf`, built by `website.yml` on `main`; `/cv.pdf` keeps a copy for old links) |
| Work email | `latexmk -pdf -jobname=main-work "-usepretex=\def\UseWorkEmail{}" main.tex` | `main-work.pdf` | Sharing from the work account |

Without `latexmk`, run `pdflatex` twice. PDFs and LaTeX aux files are ignored by git (`.gitignore`).

`build-cv.yml` builds both variants on every push or PR touching `cv/`, refreshes apt, installs `poppler-utils`, and fails unless `pdftotext` finds "Devin Ezekiel Purba", "Education", "Experience", "Skills", "PSCAD", "Python" and the variant's email. It uploads both PDFs as artifacts.

## Writing rules

1. **Two pages.** Shorten bullets before touching fonts, margins or spacing. Check with `pdfinfo main.pdf`.
2. **STAR bullets** for work: the task or situation, the action, a measured result. Use only facts from the case studies or from Devin.
3. **Publishing rules apply** ([publishing rules](../project/publishing-rules.md)): no client, plant, vendor, grid operator or market body names, no locations of projects, approximate ratings. Grid codes are "the applicable grid code" or "the TSO's requirements".
4. **ATS**: one column, standard section names, real text (no icons, images or tables), visible URLs. `R\textsuperscript{2}` extracts as plain text where `$R^2$` does not.
5. Avoid single words alone on the last line of a bullet; the layout has no spare lines.
6. Keep the same facts as the website: [sources of truth](../project/sources-of-truth.md).

## Known state (2026-10-14)

- Both variants compile to 2 pages; page 2 is full, so any addition needs an equal cut.
- One harmless overfull box warning in `skills.tex` (Hard Skills line, 6 pt).
