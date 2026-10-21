---
title: Framework research and decision
aliases: [Framework research and decision]
type: history
current: ../project/decisions.md
---

# Framework research and decision

Status: **Decided** · Date: 2026-10-03 · Benchmark data: [`research/framework-benchmark/`](research/framework-benchmark/)

## 1. The question

Which front-end technology should the portfolio be built with so that it:

1. looks and feels less generic and more interactive,
2. stays fast, readable and accessible,
3. deploys to GitHub Pages (static files only), and
4. stays easy for Devin to maintain on Windows?

Candidates named in the request: React, Vue, Next.js, "or others". Added for completeness: SvelteKit, Astro, and keeping the current vanilla JavaScript.

## 2. What is known, uncertain and unknown

| | Item | Evidence |
|---|---|---|
| Known | GitHub Pages hosts static files. Limits: published site ≤ 1 GB, soft bandwidth limit 100 GB/month, deployments time out after 10 minutes | [GitHub Pages limits][gh-limits] |
| Known | Pages works on private repos only with GitHub Pro, Team or Enterprise. The *published site* is public unless the owner is an organization on Enterprise Cloud | [GitHub plans][gh-plans], [Pages visibility][gh-visibility] |
| Known | The current deploy workflow fails because Pages is not enabled yet (`Get Pages site failed … Not Found`) | [Run #1 on main][run1] |
| Measured | JavaScript each framework ships for an identical tiny page, and whether its HTML contains the content (§4) | This study |
| Uncertain | Real Core Web Vitals of the finished site. They depend on photos, fonts and the canvas work, so they are measured after the build, not predicted here | — |
| Uncertain | Whether GitHub Pages serves the files gzip- or Brotli-compressed. Sizes below are compressed locally | Not verified |
| Unknown | Whether a blog or long articles will be added later. Content-heavy plans favour a content-focused framework | Ask the owner |

**Verification method:** direct page fetches to most documentation sites are blocked in the build environment. Web claims were checked through search results restricted to the official domains listed in §9. Version numbers and release dates come straight from the npm registry. Bundle sizes were measured in a real browser.

## 3. Criteria

| # | Criterion | Weight | Why it matters here |
|---|---|---:|---|
| C1 | Content is in the HTML the server sends | 20 | Search engines, LinkedIn and WhatsApp link previews read the HTML `<head>` and body ([Open Graph][ogp]). A visitor without JavaScript still sees content. The QR name card will send people straight to deep pages |
| C2 | JavaScript cost | 20 | Client-side JavaScript competes for the main thread and can hurt INP. Static rendering gives fast FCP and low TBT/INP as long as client JS stays small ([Rendering on the Web][rendering]). Targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 ([Web Vitals][vitals]) |
| C3 | Room for rich interactivity | 15 | Canvas visualizations, page transitions, filters, a command palette |
| C4 | Owner maintainability | 15 | Content should be editable in plain files with errors caught at build time, on Windows, without a heavy toolchain |
| C5 | Image optimization on static hosting | 10 | The site's largest files are photos |
| C6 | Ecosystem and career value | 10 | Skills that transfer to jobs (React and Next.js are widely used and wanted; [Stack Overflow 2025][so2025]) |
| C7 | Stability / upgrade churn | 10 | Fewer breaking upgrades means less maintenance |

## 4. Measurements

Method, versions and raw output: [`research/framework-benchmark/README.md`](research/framework-benchmark/README.md). Same page everywhere: a heading plus a click counter, loaded in headless Chromium.

| Setup | JS loaded (gzip) | `<h1>` in server HTML | `node_modules` |
|---|---:|:-:|---:|
| **Astro 7.3**, interactivity in a plain `<script>` | **0 KB** (106 B inlined) | yes | 169 MB |
| Astro 7.3 + one React 19 island | 67.4 KB | yes | 180 MB |
| Next.js 16.3 static export | 130.3 KB | yes | 341 MB |
| Vite 8 + React 19 (single-page app) | 66.2 KB | **no** | 42 MB |
| Vite 8 + Vue 3.5 (single-page app) | 23.3 KB | **no** | 51 MB |
| SvelteKit 3.0 static | 30.6 KB | yes | 45 MB |
| Current prototype (vanilla, v3) | 11.7 KB | **no** | — |

What the numbers show:
- **Content visibility:** the two single-page apps, and the current prototype, send an empty page that JavaScript fills in. That fails C1.
- **Next.js baseline:** Next.js ships about 2× the JavaScript of a plain React app for the same page.
- **Astro:** sends no framework code at all unless a component opts in.

Major release dates (npm registry), relevant to C7:

| Package | Majors since 2023 |
|---|---|
| astro | v2 Jan 2023, v3 Aug 2023, v4 Dec 2023, v5 Dec 2024, v6 Mar 2026, v7 Jun 2026 |
| next | v14 Oct 2023, v15 Oct 2024, v16 Oct 2025 |
| vite | v5 Nov 2023, v6 Nov 2024, v7 Jun 2025, v8 Mar 2026 |
| @sveltejs/kit | v2 Dec 2023, **v3 1 Oct 2026** (two days before this study; it already changed the config format) |
| react | v19 Dec 2024 |

## 5. Options

| Option | Strengths | Weaknesses |
|---|---|---|
| A. Keep vanilla JS | Smallest dependency list, nothing to upgrade | Content is rendered by JS (fails C1). Every page shell is duplicated. No type checks on content. Image resizing is manual |
| B. Vite + React SPA | Huge ecosystem, valuable skill | Empty HTML (measured). Deep links on GitHub Pages need a `404.html` workaround. 66 KB baseline |
| C. Next.js 16 static export | React plus pre-rendered HTML | Highest baseline JS (130 KB). The default image optimizer is not available with `output: 'export'`, so it needs a custom loader or `unoptimized` ([Next.js static exports][next-export], [export-image-api][next-img]). Largest install (341 MB). Its server features go unused on Pages |
| D. Vite + Vue SPA | Light runtime (23 KB) | Empty HTML (measured). Nuxt's static generation would fix that but was not measured |
| E. SvelteKit 3 static | Light (31 KB), pre-rendered | Major version two days old, already a breaking config change. Smaller ecosystem |
| **F. Astro 7** | Zero JS by default. Interactive "islands" only where needed, in any framework or plain TS ([Islands architecture][islands]). Content collections validated against a schema at build time ([content collections][astro-cc]). Build-time image optimization to WebP/AVIF ([Astro images][astro-img]). Page transitions via `<ClientRouter />`, which turns animations off for reduced-motion users ([view transitions][astro-vt]). Official GitHub Pages guide ([deploy guide][astro-gh]) | Frequent majors (6 since 2023). Requires Node ≥ 22.12. Version 7's new compiler rejects invalid HTML that used to pass ([upgrade guide][astro-v7]) |

## 6. Scoring

Scores are 1–5 judgements based on §4 and §5. Measured cells are C1, C2 and the install sizes inside C4.

| Option | C1 | C2 | C3 | C4 | C5 | C6 | C7 | **Total /100** |
|---|---|---|---|---|---|---|---|---:|
| **Astro 7** | 5 | 5 | 4 | 4 | 5 | 4 | 2 | **86.0** |
| SvelteKit 3 | 5 | 4 | 4 | 3 | 3 | 3 | 2 | 73.0 |
| Next.js 16 export | 5 | 2 | 5 | 2 | 2 | 5 | 3 | 69.0 |
| Vite + React SPA | 1 | 3 | 5 | 3 | 2 | 5 | 4 | 62.0 |
| Vite + Vue SPA | 1 | 4 | 4 | 3 | 2 | 4 | 4 | 61.0 |
| Vanilla (current) | 2 | 5 | 3 | 2 | 1 | 2 | 5 | 59.0 |

Sensitivity check (re-weighting, ranks):

| Weighting | 1st | 2nd |
|---|---|---|
| As above | Astro 86.0 | SvelteKit 73.0 |
| Career value ×3 | Astro 85.0 | Next.js 74.2 |
| Stability ×3 | Astro 78.3 | Next.js / SvelteKit 67.5 |
| Ignore JS cost entirely | Astro 82.5 | Next.js 76.2 |
| All criteria equal | Astro 82.9 | Next.js / SvelteKit 68.6 |

Astro stays first under every weighting tried. The result is driven mainly by C1 + C2 + C5, and Astro's weakest criterion (C7) does not change the ranking even at triple weight.

## 7. Decision

**Use Astro 7 with TypeScript.** Interactive parts are written as small plain-TypeScript islands, so no UI framework runtime is shipped. React stays available: `npx astro add react` lets any single component be React (measured cost about 67 KB gzip, paid only on pages that use it). That keeps the React and Next.js learning path open without making every visitor pay for it.

Supporting choices:

| Concern | Choice | Reason |
|---|---|---|
| Content | Astro content collections. YAML for lists (experience, education, skills, certificates), Markdown per project | Edit plain files. The Zod schema stops the build on a typo instead of shipping a broken page |
| Fonts | Self-hosted from npm (Fontsource): Geist, Geist Mono, Instrument Serif | No third-party request, version-pinned. web.dev notes that self-hosting is *not* reliably faster ([font best practices][fonts]); it is chosen for control and reliability. Google Fonts failed to load in the test environment |
| Motion | CSS and Web Animations first, no scroll-jacking | NN/g found scroll-jacking disorients users, especially with text ([Scrolljacking 101][nng-scroll]). Motion should be brief and purposeful ([NN/g animation duration][nng-anim]) |
| Accessibility | Every animation respects `prefers-reduced-motion` | [MDN][mdn-rm], [WCAG 2.3.3][wcag233] |
| Deploy | Custom GitHub Actions workflow (build + test on PRs). Deploy only from `main`, and only once the repository variable `PAGES_ENABLED` is `true` | Avoids the red runs seen in [run #1][run1] until Pages is switched on |

## 8. Counter-arguments and mitigations

| Counter-argument | Assessment |
|---|---|
| "React/Next.js is more valuable for a career." | True for skills ([SO 2025][so2025]). Mitigation: React components can be used inside Astro whenever a feature justifies it. The site's own interactions do not need a framework |
| "Astro has too many breaking releases." | Supported by the data (§4). Mitigation: exact versions pinned and lockfile committed; upgrades done deliberately with the official guide; the site is small, so an upgrade is hours, not days |
| "SvelteKit is lean too." | Yes (31 KB). Rejected for now because v3 is two days old and already broke its config. Worth revisiting in 2027 |
| "Next.js can export static sites." | Yes, but measured at 2× React's baseline, with the default image optimizer unavailable and the largest toolchain. Its server features are wasted on GitHub Pages |

## 9. Limitations

- **Benchmark scope:** the hello-world benchmark measures fixed cost only. The finished site is measured separately (see the work log).
- **Scoring:** the 1–5 scores are reasoned judgements. Different weights are possible, but the ranking held under the five weightings tested.
- **Source checking:** documentation was verified through search-engine excerpts of the official pages, not full reads. Follow the links to re-check.
- **Not measured:** Nuxt and Remix/React Router were not tested.

## Sources

- [GitHub Docs: GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub Docs: GitHub's plans](https://docs.github.com/get-started/learning-about-github/githubs-products)
- [GitHub Docs: Changing the visibility of your GitHub Pages site](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)
- [This repo: Deploy website run #1 (failed, Pages not enabled)](https://github.com/dvnezkl/Personal-Profile-Portfolio/actions/runs/37113199040)
- [The Open Graph protocol](https://ogp.me/)
- [web.dev: Rendering on the Web](https://web.dev/articles/rendering-on-the-web)
- [web.dev: Web Vitals](https://web.dev/articles/vitals)
- [Stack Overflow Developer Survey 2025: Technology](https://survey.stackoverflow.co/2025/technology)
- [Next.js Docs: Static Exports](https://nextjs.org/docs/pages/guides/static-exports)
- [Next.js Docs: Export with Image Optimization API](https://nextjs.org/docs/messages/export-image-api)
- [Jason Miller: Islands Architecture](https://jasonformat.com/islands-architecture/)
- [Astro Docs: Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Docs: Images](https://docs.astro.build/en/guides/images/)
- [Astro Docs: View transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Astro Docs: Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [Astro Docs: Upgrade to Astro v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [web.dev: Best practices for fonts](https://web.dev/articles/font-best-practices)
- [NN/g: Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/)
- [NN/g: Executing UX Animations: Duration and Motion Characteristics](https://www.nngroup.com/articles/animation-duration/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [W3C: Understanding SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

[gh-limits]: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
[gh-plans]: https://docs.github.com/get-started/learning-about-github/githubs-products
[gh-visibility]: https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site
[run1]: https://github.com/dvnezkl/Personal-Profile-Portfolio/actions/runs/37113199040
[ogp]: https://ogp.me/
[rendering]: https://web.dev/articles/rendering-on-the-web
[vitals]: https://web.dev/articles/vitals
[so2025]: https://survey.stackoverflow.co/2025/technology
[next-export]: https://nextjs.org/docs/pages/guides/static-exports
[next-img]: https://nextjs.org/docs/messages/export-image-api
[islands]: https://jasonformat.com/islands-architecture/
[astro-cc]: https://docs.astro.build/en/guides/content-collections/
[astro-img]: https://docs.astro.build/en/guides/images/
[astro-vt]: https://docs.astro.build/en/guides/view-transitions/
[astro-gh]: https://docs.astro.build/en/guides/deploy/github/
[astro-v7]: https://docs.astro.build/en/guides/upgrade-to/v7/
[fonts]: https://web.dev/articles/font-best-practices
[nng-scroll]: https://www.nngroup.com/articles/scrolljacking-101/
[nng-anim]: https://www.nngroup.com/articles/animation-duration/
[mdn-rm]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
[wcag233]: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
