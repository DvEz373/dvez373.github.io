# Website

Devin Ezekiel Purba's portfolio, built with [Astro](https://astro.build) 7 and TypeScript. It ships static HTML with about 9–11 KB of JavaScript per page.
Reference docs: [architecture](../docs/website/architecture.md), [content model](../docs/website/content-model.md), [design system](../docs/website/design-system.md), [quality and tests](../docs/website/quality.md). Index of all docs: [`docs/README.md`](../docs/README.md).

## Run it on your computer (Windows, macOS or Linux)

1. Install **Node.js 22.12 or newer** (24 LTS recommended). On Windows: `winget install OpenJS.NodeJS.LTS`, or the installer from nodejs.org.
2. In a terminal:
   ```bash
   cd website
   npm install
   npm run dev
   ```
3. Open <http://localhost:4321/>. Pages reload as you edit.

## Edit the content

All text lives in plain files. Change them and save; the build checks every field and stops with a clear message if something is wrong (for example a date written as `Sept 2025` instead of `2025-09`).

| What | File |
|---|---|
| Name, headline, contact, bio, the fields in the home page status line (`focus`) | `src/data/profile.yaml` |
| Jobs, internships, campus roles | `src/data/experience.yaml` |
| Education timeline | `src/data/education.yaml` |
| Skill domains and levels (1–5) | `src/data/skills.yaml` |
| Certificates | `src/data/certifications.yaml` |
| Projects (one file each; the file name becomes the URL) | `src/content/projects/*.md` |
| Project figures | `src/assets/projects/<project>/` (PNG; resized to AVIF/WebP automatically) |
| Photos | `src/assets/photos/` (resized to AVIF/WebP automatically) |

Dates are `YYYY-MM`. Use `end: present` for something ongoing. Projects may also use a bare year (`"2025"`) and may leave out `end`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local preview with live reload |
| `npm run check` | Type-checks the code and content |
| `npm run build` | Builds the site into `dist/` |
| `npm run preview` | Serves `dist/` the way GitHub Pages will |
| `npm run test:install` | One time: downloads the browser used by the tests |
| `node scripts/shots.mjs <dir> [pages]` | Full-page screenshots (desktop light and dark, phone) of a running preview |
| `node scripts/measure.mjs [pages]` | Phone-width checks: text under 12 px, targets under 24 px, uppercase labels, em dashes |
| `node scripts/figures.mjs [--fix]` | Fails if a project figure carries metadata (draw.io embeds its editable source); `--fix` strips it. Part of `npm run check` |
| `npm test` | Builds must exist first. Runs the browser tests (pages load, no errors, no sideways scroll, accessibility scan, interactions) on desktop and phone sizes |

## Add a project

1. Copy the figures into `src/assets/projects/<project>/`. Export diagrams as PNG on a white background; the site shows them on a sheet in both themes, and the first figure becomes the card cover.
   - Large draw.io diagrams: export as SVG and render that SVG in Chromium at device scale 2 (Playwright, a screenshot of the `svg` element). A `--scale 2` PNG export can crop large diagrams, so check every export at full extent.
   - Run `node scripts/figures.mjs --fix`. draw.io PNGs embed the whole editable diagram, which can hold names the picture does not show. `npm run check` fails until the metadata is gone. Then look at every figure.
2. Create `src/content/projects/<project>.md`. Copy the front matter from an existing file and fill it in:

   | Field | Meaning |
   |---|---|
   | `kind` | `professional` (client work, listed first) or `academic` |
   | `category`, `also` | Main theme chip, and any extra chips. Themes come from `src/lib/themes.ts`: `controllers` (Plant controllers), `machines` (Machine models), `grid` (Grid studies), `ai` (AI), `iot` (IoT). A new theme goes there, with its label, tone and domain |
   | `featured` | `true` puts it in "Selected work" on the home page (first four by `order`) |
   | `role` | Your own part in one line. Shown as "My part" in the datasheet and under the blurb |
   | `facts` | Short label/value pairs shown under "Key facts" |
   | `figures` | `src` (path to the image, relative to the `.md` file), `alt` (what the figure shows, for screen readers) and `caption` |
   | `coverFocus`, `coverZoom` | Optional card crop of the cover: a CSS `object-position` (for example `"20% 35%"`) and a zoom from 1 to 3. Cards only; the project page always shows the whole figure |

3. Anything below the front matter is Markdown, shown after Problem / Approach / Result.
4. Acronyms are expanded on first use per page from `src/lib/glossary.ts`. Add any new acronym there with a plain meaning.
5. Keep client work general: no client, employer, plant, vendor, grid operator, market body or place names, no project codes and no internal model names. This holds for the text, the figure pixels and the figure metadata, and for commit messages too. Use approximate ratings only and describe methods at block level.
6. `npm run check && npm run build && npm test`. The build stops with a message if a field is missing or an image path is wrong.

## Still to confirm

- **Skill levels** in `skills.yaml` are self-assessed.
- **Client project dates** show the start year only, by choice. All client work falls between 2025 and now; Devin will say if a year needs to change.

## Social preview image

`public/og.jpg` is what LinkedIn or WhatsApp show when the link is shared. After changing the name or headline, regenerate it:

```bash
npm run build && npm run preview      # terminal 1
node scripts/make-og.mjs               # terminal 2
```

## Publishing

The **Website** GitHub Actions workflow builds and tests every pull request that touches `website/`. On `main` it also compiles the CV into `cv.pdf` for the download button and deploys the tested `dist/` to Vercel as prebuilt static output (Vercel does not rebuild, because it cannot compile LaTeX). It deploys only after Vercel is set up:

1. On <https://vercel.com>, create a project named `dvnezkl` (Add New → Project; any template, or `vercel link` in `website/`). The project name gives the address <https://dvnezkl.vercel.app/>. Turn off its Git integration builds (Settings → Git → Ignored Build Step: "Don't build anything"), so only the workflow deploys.
2. Create a token: Account Settings → Tokens.
3. Copy the Team ID (Settings → General) and the Project ID (project Settings → General).
4. **GitHub → Settings → Secrets and variables → Actions**: secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` (the Team ID), `VERCEL_PROJECT_ID`; variable `VERCEL_ENABLED` = `true`.
5. Re-run the latest **Website** workflow on `main`. The site appears at <https://dvnezkl.vercel.app/>.

For a custom domain, build with `SITE_URL=https://your.domain`. Under a sub-path it would also need `SITE_BASE=/<path>`. `npm run build` also writes forwarding pages for the old `/Personal-Profile-Portfolio/` and `/card/` addresses (`scripts/legacy-paths.mjs`).
