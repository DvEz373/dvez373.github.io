// Keeps old links working after the move from the project site (dvez373.github.io/Personal-Profile-Portfolio/)
// to the site root and from /card/ to /namecard/. Runs after `astro build`.
//
// The site is plain static files (no host redirect config), so every old page gets a small HTML page that forwards to the
// new address (meta refresh plus a script that keeps any #fragment, and a visible link). Files that are not
// pages (CV, contact card, QR, preview image) are copied to their old paths instead; the CV also keeps its old
// file name cv.pdf at the root, because the site served it under that name until 2026-10-21.
// Printed name cards and their QR codes point to /Personal-Profile-Portfolio/card/, so that path must stay.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url)); // not .pathname: that gives /C:/... on Windows
const OLD_BASE = "Personal-Profile-Portfolio";
const RENAMED = [["card/", "namecard/"]]; // old route -> new route, longest prefix first
const FILES = { "cv.pdf": "CV_Devin_Ezekiel_Purba.pdf", "devin-ezekiel-purba.vcf": "devin-ezekiel-purba.vcf", "og.jpg": "og.jpg", "favicon.svg": "favicon.svg", "card-qr.svg": "namecard-qr.svg" };

const base = process.env.SITE_BASE ?? "/";
if (base.replace(/\/+$/, "") !== "") {
  console.log(`legacy-paths: skipped (SITE_BASE=${base}, not the user site)`);
  process.exit(0);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const page = (to) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${esc(to)}">
<meta http-equiv="refresh" content="0; url=${esc(to)}">
<script>location.replace(${JSON.stringify(to)} + location.search + location.hash)</script>
</head>
<body>
<p>This page has moved to <a href="${esc(to)}">${esc(to)}</a>.</p>
</body>
</html>
`;
const write = (route, to) => {
  const dir = join(dist, route);
  if (existsSync(join(dir, "index.html"))) return false; // never overwrite a real page
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(to));
  return true;
};

// Every built page, as a route like "" or "projects/sonodirect/".
const routes = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (relative(dist, p) !== OLD_BASE) walk(p);
    } else if (name === "index.html") {
      routes.push(relative(dist, dir).split(sep).filter(Boolean).map((s) => `${s}/`).join(""));
    }
  }
};
walk(dist);

const oldRoute = (route) => {
  for (const [from, to] of RENAMED) if (route.startsWith(to)) return from + route.slice(to.length);
  return route;
};

let pages = 0;
for (const route of routes) {
  const to = `/${route}`;
  if (write(`${OLD_BASE}/${oldRoute(route)}`, to)) pages++; // old project-site address
  if (oldRoute(route) !== route && write(oldRoute(route), to)) pages++; // old /card/ address on the new site
}
let files = 0;
for (const [oldName, newName] of Object.entries(FILES)) {
  if (!existsSync(join(dist, newName))) continue; // the CV exists only in main builds
  mkdirSync(join(dist, OLD_BASE), { recursive: true });
  cpSync(join(dist, newName), join(dist, OLD_BASE, oldName));
  if (oldName !== newName) cpSync(join(dist, newName), join(dist, oldName));
  files++;
}
console.log(`legacy-paths: ${pages} redirect pages, ${files} files copied to old paths`);
