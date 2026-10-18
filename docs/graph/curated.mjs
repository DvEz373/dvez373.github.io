// Hand-written layer of the knowledge graph. scripts/graph.mjs merges it with what it
// extracts from the repository (imports, LaTeX inputs, content collections, routes,
// doc front matter and links). Keep entries short; every path must exist (checked).
//
// Node ids: "product:x", "output:x", "rule:x", "decision:x", "host:x". Paths are relative
// to the repository root; a path ending in "/" means a folder and everything under it.

/** Which product a path belongs to. First match wins, so list specific prefixes first. */
export const products = [
  { id: "product:card", label: "Name card", summary: "Phone card, print card, QR and vCard; built with the website", paths: ["website/src/pages/namecard/", "website/src/pages/namecard-qr.svg.ts", "website/src/pages/devin-ezekiel-purba.vcf.ts", "website/src/lib/qr.ts", "website/src/layouts/Bare.astro", "docs/card/"] },
  { id: "product:cv", label: "CV", summary: "Two-page ATS-friendly LaTeX CV, personal and work variants", paths: ["cv/", ".github/workflows/build-cv.yml", "docs/cv/"] },
  { id: "product:website", label: "Website", summary: "Astro 7 portfolio on GitHub Pages", paths: ["website/", ".github/workflows/website.yml", "docs/website/", "design/"] },
  { id: "product:project", label: "Project docs and tooling", summary: "Cross-cutting docs, agent brief, knowledge graph", paths: ["docs/", "scripts/", "CLAUDE.md", "AGENTS.md", "README.md", ".github/", ".gitignore"] },
];

/** Things the build produces or the world sees. "from" lists what each one is made from. */
export const outputs = [
  { id: "output:cv-pdf", label: "cv.pdf on the website", summary: "Personal-email CV, compiled on main by website.yml into public/cv.pdf", from: ["cv/main.tex", ".github/workflows/website.yml"] },
  { id: "output:cv-artifacts", label: "CV PDF artifacts", summary: "main.pdf and main-work.pdf from build-cv.yml, after an ATS text check", from: ["cv/main.tex", ".github/workflows/build-cv.yml"] },
  { id: "output:og-image", label: "Link preview image", summary: "website/public/og.jpg, rendered from /og-card/ by make-og.mjs; regenerate by hand", from: ["route:/og-card/", "website/scripts/make-og.mjs"] },
  { id: "output:pages-site", label: "Public site on GitHub Pages", summary: "website/dist deployed from main when PAGES_ENABLED is true", from: [".github/workflows/website.yml", "website/astro.config.mjs"] },
];

export const hosts = [
  { id: "host:github-pages", label: "GitHub Pages", summary: "https://dvez373.github.io/ (user site; old project-site paths forward)", from: ["output:pages-site"] },
];

/** Rules and the paths they govern. Details live in the doc named in "doc". */
export const rules = [
  { id: "rule:no-names", label: "No names, places, codes", summary: "No client, plant, vendor, grid operator, market body or place names, project codes or internal model names (D1, D7, D10)", doc: "docs/project/publishing-rules.md", governs: ["website/src/content/projects/", "website/src/assets/projects/", "cv/", "docs/"] },
  { id: "rule:approx-ratings", label: "Approximate ratings, no algorithms", summary: "Approximate or class ratings for every plant; methods at block level only (D7)", doc: "docs/project/publishing-rules.md", governs: ["website/src/content/projects/", "website/src/assets/projects/", "cv/professional_experience.tex"] },
  { id: "rule:facts-from-devin", label: "Facts come from Devin", summary: "Never invent roles, dates or numbers; role lines are Devin's words (D4)", doc: "docs/project/publishing-rules.md", governs: ["website/src/content/projects/", "website/src/data/", "cv/"] },
  { id: "rule:employer-job-history", label: "Employer only in job history", summary: "Employer named on Experience, About role line, CV and name card; never in case studies (D5)", doc: "docs/project/publishing-rules.md", governs: ["website/src/data/profile.yaml", "website/src/data/experience.yaml", "website/src/content/projects/", "cv/professional_experience.tex"] },
  { id: "rule:figure-metadata", label: "Figures carry pixels only", summary: "PNG only, metadata stripped by figures.mjs --fix; npm run check fails otherwise", doc: "docs/project/publishing-rules.md", governs: ["website/src/assets/projects/", "website/scripts/figures.mjs"] },
  { id: "rule:cv-two-pages", label: "CV: two pages, STAR, ATS", summary: "Two pages, STAR bullets, extractable text; shorten bullets instead of shrinking layout", doc: "docs/cv/reference.md", governs: ["cv/"] },
  { id: "rule:base-path-links", label: "Base-aware links", summary: "Build every internal link with url() from src/lib/url.ts", doc: "docs/website/architecture.md", governs: ["website/src/"] },
  { id: "rule:tokens-only", label: "Colour tokens only", summary: "Use CSS variables from global.css, not literal colours (print and card pages excepted)", doc: "docs/website/design-system.md", governs: ["website/src/"] },
  { id: "rule:reduced-motion", label: "Respect reduced motion", summary: "Every animation stops under prefers-reduced-motion", doc: "docs/website/design-system.md", governs: ["website/src/styles/global.css", "website/src/scripts/", "website/src/components/"] },
  { id: "rule:plain-english", label: "Plain English, no em dashes", summary: "Short sentences, numbers with units, no marketing words, no em dashes; acronyms in glossary.ts", doc: "docs/project/publishing-rules.md", governs: ["website/src/content/", "website/src/data/", "cv/", "docs/"] },
];

/** Decisions that still hold. Full register: docs/project/decisions.md. */
export const decisions = [
  { id: "decision:A1", label: "Astro 7 + TypeScript, no UI framework runtime", affects: ["website/"] },
  { id: "decision:A2", label: "YAML and Markdown content, Zod-validated", affects: ["website/src/content.config.ts"] },
  { id: "decision:A5", label: "Grid & Signal visual direction", affects: ["website/src/styles/global.css", "website/src/components/"] },
  { id: "decision:N1", label: "Card web page + QR + vCard, no Wallet pass", affects: ["website/src/pages/namecard/"] },
  { id: "decision:D1", label: "No names in client case studies", affects: ["website/src/content/projects/"] },
  { id: "decision:D4", label: "My part lines come from Devin", affects: ["website/src/content/projects/"] },
  { id: "decision:D5", label: "Employer only in job history", affects: ["website/src/data/profile.yaml", "website/src/data/experience.yaml"] },
  { id: "decision:D7", label: "Approximate ratings, no algorithms, general", affects: ["website/src/content/projects/", "website/src/assets/projects/"] },
  { id: "decision:D8", label: "Start years only for client work", affects: ["website/src/content/projects/"] },
  { id: "decision:D9", label: "Home status line lists focus fields", affects: ["website/src/data/profile.yaml", "website/src/pages/index.astro"] },
  { id: "decision:D10", label: "CV in STAR form, no locations", affects: ["cv/professional_experience.tex", "cv/title.tex", "cv/skills.tex"] },
  { id: "decision:K1", label: "Layered docs, CLAUDE.md first", affects: ["CLAUDE.md", "docs/README.md"] },
  { id: "decision:K2", label: "Generated, CI-checked knowledge graph", affects: ["scripts/graph.mjs", "docs/graph/"] },
  { id: "decision:K5", label: "Visual work is designed with draw.io and design skills", affects: ["docs/project/diagram-style.md", "docs/project/img/"] },
  { id: "decision:K4", label: "Repository root is also an Obsidian vault", affects: ["scripts/obsidian-setup.mjs", "docs/Docs.base", "docs/project/obsidian.md"] },
];

/** Facts that live in two files that do not read each other. Update both in one change. */
export const sync = [
  { a: "website/src/data/profile.yaml", b: "cv/title.tex", what: "name, city, phone, LinkedIn, GitHub, summary and current role" },
  { a: "website/src/data/profile.yaml", b: "cv/config.sty", what: "email (CV holds personal and work addresses)" },
  { a: "cv/config.sty", b: ".github/workflows/build-cv.yml", what: "emails the ATS check expects" },
  { a: "website/src/data/experience.yaml", b: "cv/professional_experience.tex", what: "roles, orgs, places, dates (CV has STAR detail)" },
  { a: "website/src/data/education.yaml", b: "cv/education.tex", what: "degree, GPA, thesis, exchange" },
  { a: "website/src/data/certifications.yaml", b: "cv/certification.tex", what: "seven certificates and dates" },
  { a: "website/src/data/skills.yaml", b: "cv/skills.tex", what: "skills (levels on the site, lists on the CV)" },
  { a: "website/src/content/projects/", b: "cv/projects.tex", what: "three academic projects" },
  { a: "website/src/content/projects/", b: "cv/professional_experience.tex", what: "client case-study facts used in CV bullets" },
  { a: "website/src/data/profile.yaml", b: "website/src/components/Header.astro", what: "brand name hard-coded in the header" },
  { a: "website/src/data/experience.yaml", b: "website/tests/site.spec.ts", what: "test expects the current job title on Experience" },
];
