---
title: Sources of truth and sync map
aliases: [Sources of truth and sync map]
type: reference
covers: [website/src/data/, website/src/content/projects/, cv/title.tex, cv/config.sty, cv/professional_experience.tex, cv/education.tex, cv/certification.tex, cv/skills.tex, cv/projects.tex, website/public/og.jpg]
---

# Sources of truth and sync map

Every fact about Devin lives in one primary place. Some facts are repeated in a second place that does not read the first. Those copies must be updated by hand in the same change. This table is the checklist.

## Facts shared by the website, card and vCard (one source)

`website/src/data/profile.yaml` feeds all of these, so a change there needs no other website edit:

| Field | Shown on |
|---|---|
| `name`, `givenNames`, `familyName`, `initials` | Home hero, About, footer, name card, print card, vCard, OG card, page titles and meta tags |
| `headline`, `headlineAccent`, `tagline` | Home hero, page titles, name card, vCard note, OG card. Today: "Electrical Engineer" · "Control Systems"; tagline "Smart grids · Intelligent energy systems · Machine learning" (his long-term goal). Keep "AI" out of these three: the Skills domain and the bio already carry it, and one phrase per idea reads stronger |
| `role`, `org` | About "Role" line, name card, print card, vCard `TITLE` / `ORG`. Update when the job changes |
| `focus` | Home status line ("Learning across ...") and the Home meta description |
| `city`, `country`, `timezone`, `coordinates` | Hero eyebrow, About, footer clock, vCard address |
| `email`, `phone`, `links.*` | About contact list, footer, contact band, name card, vCard, command palette |
| `bio` | About |
| `chain` | About "Focus" tags (three blocks; the name dates from the removed home "signal chain") |

## Hard-coded copies in the website code

A few strings repeat profile facts directly in code. Search for them when the name or focus changes:

| Where | What |
|---|---|
| `website/src/components/Header.astro` | Brand name "Devin Ezekiel Purba" (text and `aria-label`) |
| `website/src/pages/{experience,education,projects/index,skills}.astro` | `description` meta text naming Devin and summarising the page |
| `index.astro`, `about.astro`, `Footer.astro`, `CommandPalette.astro` | Download file name `CV_Devin_Ezekiel_Purba.pdf` |

## Facts repeated in the CV (keep in sync by hand)

The CV is LaTeX and reads none of the YAML. When one side changes, check the other.

| Fact | Website source | CV copy |
|---|---|---|
| Name, city, phone, LinkedIn, GitHub | `profile.yaml` | `cv/title.tex` header line |
| Personal and work email | `profile.yaml` (`email`, personal only) | `cv/config.sty` (`\personalemail`, `\workemail`); also the `email` values in `.github/workflows/build-cv.yml` (the ATS check looks for them) |
| Summary, current role | `profile.yaml` (`headline`, `role`, `org`, `focus`), `about` bio | `cv/title.tex` summary paragraph |
| Jobs and campus roles (titles, orgs, places, dates) | `website/src/data/experience.yaml` (7 entries, short bullets) | `cv/professional_experience.tex` (7 entries, STAR bullets, more detail) |
| Degree, GPA, thesis | `website/src/data/education.yaml` | `cv/education.tex` |
| Certificates (7) | `website/src/data/certifications.yaml` | `cv/certification.tex` (same 7, with Coursera links) |
| Skills | `website/src/data/skills.yaml` (domains with levels 1 to 5) | `cv/skills.tex` (Technical Expertise, Hard and Soft Skills lists) |
| Academic projects (3) | `website/src/content/projects/{marl-edge,sonodirect,scanocr}.md` | `cv/projects.tex` |
| Client case-study facts (counts, ratings, accuracy) | `website/src/content/projects/*.md` (8 client files) | Bullets in the Power System Engineer entry of `cv/professional_experience.tex` |
| PDF metadata and keywords | none | `cv/config.sty` `\hypersetup` |

Rules for the CV copy: two pages, STAR bullets, approximate ratings, no locations, no client or plant names ([publishing rules](publishing-rules.md)).

## Derived outputs (regenerate, do not edit)

| Output | Made from | Regenerate when | How |
|---|---|---|---|
| `website/public/og.jpg` (link preview) | `/og-card/` page, which reads `profile.yaml` and the portrait | Name, headline, tagline or portrait changes | `node website/scripts/make-og.mjs` against a running preview ([runbooks](runbooks.md)) |
| `website/public/CV_Devin_Ezekiel_Purba.pdf` (copied to `/cv.pdf` by `legacy-paths.mjs`) | `cv/` | Every deploy (CI does it) | Not committed; built on `main` by the Website workflow |
| QR codes (`/namecard/`, `/namecard/print/`, `/namecard-qr.svg`) | The site URL in `astro.config.mjs` | Only if the domain or base path changes; then reprint cards | Built at build time by `src/lib/qr.ts` |
| `docs/graph/graph.json`, `docs/graph/README.md` | Repository files and `docs/graph/curated.mjs` | After any change to code imports, docs or CI | `node scripts/graph.mjs` |
| `design/prototype/assets/data.js` | Historical copy of v3 data | Never; history only | none |

## Things that are not facts

- Theme labels and colours: `website/src/lib/themes.ts`.
- Acronym meanings: `website/src/lib/glossary.ts`.
- Design tokens: `website/src/styles/global.css`.
