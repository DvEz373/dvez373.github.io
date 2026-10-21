---
title: Working environments
aliases: [Working environments]
type: reference
covers: [website/package.json, website/playwright.config.ts, website/scripts/shots.mjs]
---

# Working environments

Two places do the work: Devin's Windows PC and Claude Code cloud sessions (Linux). The private folder and the client source files exist only on the PC.

| Item | Devin's PC (Windows) | Claude Code cloud session (Linux) |
|---|---|---|
| Shell | PowerShell and Git Bash; Python is `py -3` | bash; `python3` |
| Node | 24 | 22 or later; run `cd website && npm ci` once |
| Browser for tests | `npm run test:install` once | Chromium is preinstalled; do not run `playwright install` |
| LaTeX | MiKTeX or TeX Live, `latexmk` | Not installed. `sudo apt-get install -y texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended lmodern` (a few minutes), then `pdflatex` twice |
| Private name scan and deny list | Available (private folder outside the repository) | Not available. Never recreate it in the repository |
| Client source folders, draw.io desktop | Available, read-only | Not available: no new figures or case-study facts |
| Live site | Reachable | Usually blocked by the network policy; check deploys through the Actions API or a local build |
| Pushing | Ask Devin first | Push only to the session's branch; force-push is blocked |
| Obsidian | The repository root is the vault; run `node scripts/obsidian-setup.mjs` once ([obsidian](obsidian.md)) | Not available; edit the same Markdown files |

## Gotchas

- **Git Bash path rewriting** (PC only): arguments starting with `/` become `C:/Program Files/Git/...`. Use `home` for the home page in `scripts/shots.mjs`, or set `MSYS_NO_PATHCONV=1`.
- **Preview server**: tests and the screenshot scripts expect `npx astro preview --port 4321`. After a rebuild the running preview serves the new files without a restart.
- **draw.io exports**: `--scale 3` draws larger than the canvas on the PC (display scaling) and crops silently. Use `--scale 2`, or SVG rendered in Chromium at device scale 2 for large diagrams.
- **Large PNGs**: image viewers in agent tools show only part of a very large PNG. Make a scaled copy with `sharp` from `website/node_modules` in a scratch folder, never next to the source.
- **Stale apt index on CI runners**: run `apt-get update` before `apt-get install` (fixed in `build-cv.yml`).
- **Squash merges**: after a PR is squash-merged, the branch's commits are not ancestors of `main`. Start new work from `main`; in a cloud session where force-push is blocked, merge `main` into the branch instead of resetting it.
- **CRLF checkouts** (a PC with `core.autocrlf=true`): since 2026-10-21 `scripts/graph.mjs` normalizes line endings when it reads files, and `website/scripts/legacy-paths.mjs` resolves `dist/` with `fileURLToPath`. Before that, the graph check reported every doc as missing `type` and `covers`, and `npm run build` failed on a `C:\C:\...` path.
