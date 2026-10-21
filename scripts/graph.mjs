#!/usr/bin/env node
// Knowledge graph of the whole portfolio (website, CV, name card, docs, CI).
// Extracts imports, LaTeX inputs, content collections, routes, tests, doc front matter
// and links from the repository, merges the hand-written layer in docs/graph/curated.mjs,
// and writes docs/graph/graph.json and docs/graph/README.md. Node built-ins only.
//
//   node scripts/graph.mjs                  regenerate the graph files
//   node scripts/graph.mjs --check          fail if they are stale, a doc link is broken,
//                                           or a covers/curated path does not exist (CI)
//   node scripts/graph.mjs query <path|id>  neighbours, covering docs, rules, sync partners
//   node scripts/graph.mjs impact <path>    pages and outputs affected by changing a file
//
// The repository root is also an Obsidian vault (docs/project/obsidian.md): links may be
// relative Markdown links or [[wikilinks]] (resolved by file name or alias), and the
// script also writes docs/graph/modules.md and the Obsidian canvas docs/graph/portfolio.canvas.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve, basename, extname, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = "docs/graph/graph.json";
const OUT_MD = "docs/graph/README.md";
const OUT_MODULES = "docs/graph/modules.md";
const OUT_CANVAS = "docs/graph/portfolio.canvas";
const GENERATED = new Set([OUT_JSON, OUT_MD, OUT_MODULES, OUT_CANVAS]);
const curated = await import(pathToFileURL(join(ROOT, "docs/graph/curated.mjs")).href);

// ---------- File discovery ----------

const SCAN = ["website/src", "website/scripts", "website/tests", "cv", ".github/workflows", "docs", "scripts"];
const TOP_FILES = ["README.md", "CLAUDE.md", "AGENTS.md", ".gitignore", "website/README.md", "website/package.json", "website/astro.config.mjs", "website/playwright.config.ts", "website/tsconfig.json"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".astro", "test-results", "playwright-report", ".obsidian", ".trash", ".git"]);
const SKIP_PATHS = [...GENERATED, "docs/website/research/framework-benchmark/"];
const KEEP_IN_SKIPPED = new Set(["docs/website/research/framework-benchmark/README.md"]);
const EXT = new Set([".base", ".astro", ".ts", ".mjs", ".js", ".css", ".yaml", ".yml", ".md", ".tex", ".sty", ".json", ".png", ".jpg", ".svg"]);

const rel = (abs) => relative(ROOT, abs).split("\\").join("/");
const read = (p) => readFileSync(join(ROOT, p), "utf8").replace(/\r\n/g, "\n"); // CRLF checkouts (git autocrlf) parse the same
const isDir = (p) => existsSync(join(ROOT, p)) && statSync(join(ROOT, p)).isDirectory();
const exists = (p) => existsSync(join(ROOT, p.replace(/\/$/, "")));

function walk(dir, out) {
  for (const name of readdirSync(join(ROOT, dir)).sort()) {
    const p = `${dir}/${name}`;
    if (SKIP_DIRS.has(name)) continue;
    if (isDir(p)) walk(p, out);
    else if (EXT.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

const files = [...new Set([...SCAN.filter(exists).flatMap((d) => walk(d, [])), ...TOP_FILES.filter(exists)])]
  .filter((p) => KEEP_IN_SKIPPED.has(p) || !SKIP_PATHS.some((s) => (s.endsWith("/") ? p.startsWith(s) : p === s)))
  .filter((p) => !p.startsWith("website/src/assets/") || /\.(png|jpg)$/i.test(p))
  .filter((p) => !(p.startsWith("website/src/") && extname(p) === ".svg"))
  .sort();

// ---------- Graph model ----------

const nodes = new Map();
const edges = new Map();
const problems = [];

function addNode(id, attrs) {
  const prev = nodes.get(id);
  nodes.set(id, { id, ...(prev ?? {}), ...Object.fromEntries(Object.entries(attrs).filter(([, v]) => v !== undefined && v !== "")) });
  return id;
}
function addEdge(from, to, type, note) {
  const key = `${type}|${from}|${to}`;
  if (!edges.has(key)) edges.set(key, { from, to, type, ...(note ? { note } : {}) });
}
/** A path that may be a folder ("x/") or a file; folders become "dir" nodes. */
function pathNode(p, origin) {
  if (!exists(p)) {
    problems.push(`${origin}: path does not exist: ${p}`);
    return null;
  }
  if (isDir(p)) {
    const id = p.endsWith("/") ? p : `${p}/`;
    return addNode(id, { type: "dir", label: id, product: productOf(id) });
  }
  if (!nodes.has(p)) addNode(p, { type: typeOf(p), label: basename(p), product: productOf(p) });
  return p;
}

function productOf(p) {
  for (const prod of curated.products) if (prod.paths.some((x) => (x.endsWith("/") ? p.startsWith(x) : p === x))) return prod.id.slice(8);
  return undefined;
}

function typeOf(p) {
  const rules = [
    [/^website\/src\/pages\/.*\.astro$/, "page"],
    [/^website\/src\/pages\/.*\.ts$/, "endpoint"],
    [/^website\/src\/layouts\//, "layout"],
    [/^website\/src\/components\//, "component"],
    [/^website\/src\/lib\//, "lib"],
    [/^website\/src\/scripts\//, "client-script"],
    [/^website\/src\/styles\//, "style"],
    [/^website\/src\/data\//, "data"],
    [/^website\/src\/content\//, "content"],
    [/^website\/src\/assets\//, "asset"],
    [/\.(svg|png|jpg)$/, "asset"],
    [/^website\/src\/content\.config\.ts$/, "schema"],
    [/^website\/tests\//, "test"],
    [/^(website\/)?scripts\//, "tool"],
    [/^\.github\/workflows\//, "workflow"],
    [/^cv\//, "latex"],
    [/^docs\/graph\/curated\.mjs$/, "graph-data"],
    [/\.md$/, "doc"],
  ];
  for (const [re, t] of rules) if (re.test(p)) return t;
  return "config";
}

function summaryOf(p, text) {
  const ext = extname(p);
  let s = "";
  if (ext === ".md") s = frontMatter(text).title ?? (text.match(/^#\s+(.+)$/m)?.[1] ?? "");
  else if ([".ts", ".mjs", ".js"].includes(ext)) {
    const body = text.replace(/^#!.*\n/, "");
    s = body.match(/^\s*\/\/\s?(.+)/)?.[1] ?? body.match(/^\s*\/\*\*?\s*\n?\s*\*?\s*(.+)/)?.[1] ?? "";
  } else if (ext === ".astro") s = text.match(/^---\s*\n\s*\/\/\s?(.+)/)?.[1] ?? text.match(/^---\s*\n\s*\/\*\*?\s*(.+)/)?.[1] ?? "";
  else if ([".yaml"].includes(ext)) s = text.match(/^#\s?(.+)/)?.[1] ?? "";
  else if ([".yml"].includes(ext)) s = text.match(/^name:\s*(.+)$/m)?.[1] ?? "";
  s = s.replace(/\*\/\s*$/, "").trim();
  return s.length > 150 ? `${s.slice(0, 147)}...` : s;
}

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim();
    out[kv[1]] = v.startsWith("[") ? v.slice(1, -1).split(",").map((x) => x.trim()).filter(Boolean) : v;
  }
  return out;
}

// ---------- Extraction ----------

const texts = new Map(files.filter((p) => !/\.(png|jpg)$/i.test(p)).map((p) => [p, read(p)]));
for (const p of files) addNode(p, { type: typeOf(p), label: basename(p), product: productOf(p), summary: texts.has(p) ? summaryOf(p, texts.get(p)) : undefined });

// Imports between code files (frontmatter and <script> blocks alike).
const IMPORT_RE = /^\s*import\s+(?:type\s+)?(?:[\w*{}\s,]+?\s+from\s+)?["']([^"']+)["']/gm;
const EXPORT_FROM_RE = /^\s*export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+["']([^"']+)["']/gm;
const BUILTINS = new Set(["fs", "path", "url", "child_process", "os", "util"]);
function resolveImport(from, spec) {
  const base = posix.normalize(posix.join(posix.dirname(from), spec));
  for (const cand of [base, `${base}.ts`, `${base}.astro`, `${base}.mjs`, `${base}.js`, `${base}/index.ts`]) if (nodes.has(cand) || (exists(cand) && !isDir(cand))) return cand;
  return null;
}
for (const [p, text] of texts) {
  if (![".astro", ".ts", ".mjs", ".js"].includes(extname(p)) || !p.startsWith("website/")) continue;
  for (const re of [IMPORT_RE, EXPORT_FROM_RE]) {
    for (const m of text.matchAll(re)) {
      const spec = m[1];
      if (spec.startsWith(".")) {
        const target = resolveImport(p, spec);
        if (!target) problems.push(`${p}: cannot resolve import "${spec}"`);
        else addEdge(p, pathNode(target, p), /\.(png|jpg)$/i.test(target) ? "uses_asset" : "imports");
      } else if (!spec.startsWith("node:") && !BUILTINS.has(spec)) {
        const name = spec.startsWith("astro:") ? "astro" : spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
        addEdge(p, addNode(`pkg:${name}`, { type: "package", label: name }), "imports");
      }
    }
  }
}

// LaTeX inputs.
for (const [p, text] of texts) {
  if (!p.startsWith("cv/") || ![".tex", ".sty"].includes(extname(p))) continue;
  for (const m of text.matchAll(/\\input\{([^}]+)\}/g)) {
    const name = m[1];
    if (name === "glyphtounicode") continue;
    const target = ["", ".tex"].map((e) => `cv/${name}${e}`).find((c) => nodes.has(c));
    if (target) addEdge(p, target, "inputs");
    else problems.push(`${p}: cannot resolve \\input{${name}}`);
  }
}

// Content collections: content.config.ts loaders, lib/content.ts readers.
const CONFIG = "website/src/content.config.ts";
const configText = texts.get(CONFIG) ?? "";
const projectFiles = files.filter((p) => /^website\/src\/content\/projects\/[^/]+\.md$/.test(p));
for (const m of configText.matchAll(/const (\w+) = defineCollection\(\{\s*loader:\s*(file|glob)\(([^)]*)\)/g)) {
  const [, name, kind, arg] = m;
  const col = addNode(`collection:${name}`, { type: "collection", label: name, product: "website", summary: `Content collection "${name}" (${kind} loader, schema in content.config.ts)` });
  addEdge(col, CONFIG, "defined_in");
  if (kind === "file") addEdge(col, pathNode(`website/${arg.match(/"([^"]+)"/)[1]}`, CONFIG), "loads");
  else for (const f of projectFiles) addEdge(col, f, "loads");
}
// lib/content.ts wraps each collection in a getter; attribute reads to the callers of each
// getter, so a data file only affects the pages that use it.
const CONTENT_LIB = "website/src/lib/content.ts";
const getters = new Map();
for (const m of (texts.get(CONTENT_LIB) ?? "").matchAll(/export async function (get\w+)\(\)\s*\{[^}]*?get(?:Entry|Collection)\("(\w+)"/g)) {
  getters.set(m[1], m[2]);
  addEdge(CONTENT_LIB, `collection:${m[2]}`, "provides");
}
for (const [p, text] of texts) {
  if (!p.startsWith("website/src/") || p === CONTENT_LIB) continue;
  for (const m of text.matchAll(/get(?:Entry|Collection)\("(\w+)"/g)) addEdge(p, `collection:${m[1]}`, "reads");
  for (const [fn, col] of getters) if (new RegExp(`\\b${fn}\\(`).test(text)) addEdge(p, `collection:${col}`, "reads");
}

// Project figures referenced from front matter.
for (const p of projectFiles) {
  for (const m of texts.get(p).matchAll(/^\s*-?\s*src:\s*(\S+)/gm)) {
    const target = posix.normalize(posix.join(posix.dirname(p), m[1]));
    if (nodes.has(target)) addEdge(p, target, "uses_asset");
    else problems.push(`${p}: figure not found: ${m[1]}`);
  }
}

// Routes rendered by pages and endpoints.
const PAGES = "website/src/pages/";
for (const p of files.filter((f) => f.startsWith(PAGES) && /\.(astro|ts)$/.test(f))) {
  const r = p.slice(PAGES.length);
  let routes;
  if (r === "projects/[slug].astro") routes = projectFiles.map((f) => `/projects/${basename(f, ".md")}/`);
  else if (r === "404.astro") routes = ["/404.html"];
  else if (r.endsWith(".ts")) routes = [`/${r.slice(0, -3)}`];
  else routes = [`/${r.replace(/(^|\/)index\.astro$/, "$1").replace(/\.astro$/, "/")}`];
  for (const route of routes) {
    const id = addNode(`route:${route}`, { type: "route", label: route, product: productOf(p) });
    addEdge(p, id, "renders");
    const slug = route.match(/^\/projects\/([^/]+)\/$/)?.[1];
    if (slug) addEdge(`website/src/content/projects/${slug}.md`, id, "feeds");
  }
}

// Routes covered by the Playwright tests.
for (const p of files.filter((f) => f.startsWith("website/tests/"))) {
  const text = texts.get(p);
  const listed = text.match(/const pages = \[([^\]]*)\]/)?.[1].match(/"([^"]*)"/g)?.map((s) => s.slice(1, -1)) ?? [];
  const literal = [...nodes.keys()].filter((id) => id.startsWith("route:/") && id !== "route:/").map((id) => id.slice(6)).filter((r) => text.includes(`"${r.slice(1)}"`) || text.includes(`'${r.slice(1)}'`));
  for (const r of new Set([...listed.map((s) => `/${s}`), ...literal])) if (nodes.has(`route:${r}`)) addEdge(p, `route:${r}`, "tests");
}

// Docs: front matter (type, covers, current) and relative links.
const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|^\[[^\]]+\]:\s*(\S+)/gm;
// The generated README is an output, never an input: describe it here instead of parsing it.
addNode(OUT_MD, { type: "doc", label: "README.md", product: productOf(OUT_MD), docType: "index", summary: "Knowledge graph (generated)" });
for (const c of ["scripts/graph.mjs", "docs/graph/curated.mjs"]) addEdge(OUT_MD, c, "documents");
addNode(OUT_MODULES, { type: "doc", label: "modules.md", product: productOf(OUT_MODULES), docType: "index", summary: "Website file-level import diagram (generated)" });
addEdge(OUT_MD, OUT_MODULES, "links");

// Obsidian wikilinks resolve by file name (without .md), by vault path, or by alias.
const notes = [...texts.keys()].filter((p) => extname(p) === ".md").concat([OUT_MD, OUT_MODULES]);
const byName = new Map();
const addName = (k, p) => byName.set(k.toLowerCase(), [...new Set([...(byName.get(k.toLowerCase()) ?? []), p])]);
for (const p of notes) {
  addName(basename(p, ".md"), p);
  addName(p.replace(/\.md$/, ""), p);
  for (const a of [].concat(texts.has(p) ? frontMatter(texts.get(p)).aliases ?? [] : [])) addName(a, p);
}
addName("Knowledge graph", OUT_MD);
for (const [p, text] of texts) {
  if (extname(p) !== ".md" || p === OUT_MD) continue;
  const fm = frontMatter(text);
  if (p.startsWith("docs/")) {
    if (!fm.type) problems.push(`${p}: front matter needs "type"`);
    if (!fm.title) problems.push(`${p}: front matter needs "title"`);
    addNode(p, { docType: fm.type });
  }
  for (const c of [].concat(fm.covers ?? [])) {
    const id = pathNode(c, `${p} covers`);
    if (id) addEdge(p, id, "documents");
  }
  if (fm.current) {
    const target = posix.normalize(posix.join(posix.dirname(p), fm.current));
    if (exists(target)) addEdge(p, target, "superseded_by");
    else problems.push(`${p}: "current" does not exist: ${fm.current}`);
  }
  const body = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const m of body.matchAll(LINK_RE)) {
    const href = m[1] ?? m[2];
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const target = posix.normalize(posix.join(posix.dirname(p), decodeURI(href.split("#")[0])));
    if (!exists(target) && !GENERATED.has(target)) {
      problems.push(`${p}: broken link ${href}`);
      continue;
    }
    if (nodes.has(target)) addEdge(p, target, "links");
    else if (isDir(target)) addEdge(p, pathNode(target, p), "links");
  }
  for (const m of body.matchAll(/!?\[\[([^\]|#^]+)(?:[#^][^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const hits = byName.get(m[1].trim().replace(/\.md$/, "").toLowerCase()) ?? [];
    if (hits.length === 1) addEdge(p, hits[0], "links");
    else if (hits.length > 1) problems.push(`${p}: ambiguous wikilink [[${m[1]}]] matches ${hits.join(", ")}; use the path, e.g. [[${hits[0].replace(/\.md$/, "")}]]`);
    else if (!exists(m[1]) && !exists(posix.join(posix.dirname(p), m[1]))) problems.push(`${p}: broken wikilink [[${m[1]}]]`);
  }
}

// ---------- Curated layer ----------

for (const prod of curated.products) {
  addNode(prod.id, { type: "product", label: prod.label, summary: prod.summary });
  for (const x of prod.paths) if (!exists(x)) problems.push(`curated product ${prod.id}: path does not exist: ${x}`);
}
for (const o of [...curated.outputs, ...curated.hosts]) {
  addNode(o.id, { type: o.id.startsWith("host:") ? "host" : "output", label: o.label, summary: o.summary });
  for (const f of o.from) {
    if (nodes.has(f)) addEdge(o.id, f, "built_from");
    else {
      const id = pathNode(f, `curated ${o.id}`);
      if (id) addEdge(o.id, id, "built_from");
    }
  }
}
for (const r of curated.rules) {
  addNode(r.id, { type: "rule", label: r.label, summary: r.summary });
  addEdge(r.id, pathNode(r.doc, `curated ${r.id}`) ?? r.doc, "explained_in");
  for (const g of r.governs) {
    const id = pathNode(g, `curated ${r.id}`);
    if (id) addEdge(r.id, id, "governs");
  }
}
for (const d of curated.decisions) {
  addNode(d.id, { type: "decision", label: d.label, summary: `${d.id.slice(9)}: ${d.label}. Register: docs/project/decisions.md` });
  addEdge(d.id, "docs/project/decisions.md", "explained_in");
  for (const a of d.affects) {
    const id = pathNode(a, `curated ${d.id}`);
    if (id) addEdge(d.id, id, "affects");
  }
}
for (const s of curated.sync) {
  const a = pathNode(s.a, "curated sync");
  const b = pathNode(s.b, "curated sync");
  if (a && b) addEdge(a, b, "syncs_with", s.what);
}
// Product membership is the "product" attribute on each node (no edges, to keep the file small).

// Every route belongs to the deployed site.
for (const n of nodes.values()) if (n.type === "route" && n.id !== "route:/og-card/") addEdge("output:pages-site", n.id, "built_from");

// ---------- Coverage: every code, data and config file needs a reference doc ----------

const EXPLAINERS = new Set([...nodes.values()].filter((n) => n.type === "doc" && ["reference", "runbook", "index"].includes(n.docType)).map((n) => n.id));
const explained = [...edges.values()].filter((e) => e.type === "documents" && EXPLAINERS.has(e.from)).map((e) => e.to);
const NOT_CODE = new Set(["doc", "route", "dir", "decision", "rule", "product", "output", "host", "package", "collection", "asset"]);
const coverage = [...nodes.values()].filter((n) => !NOT_CODE.has(n.type)).map((n) => ({ id: n.id, ok: explained.some((c) => c === n.id || (c.endsWith("/") && n.id.startsWith(c))) }));
for (const c of coverage.filter((x) => !x.ok)) problems.push(`${c.id}: no reference doc covers it (add it to a doc's "covers" front matter)`);

// ---------- Queries ----------

const NODE_LIST = [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
const EDGE_LIST = [...edges.values()].sort((a, b) => a.type.localeCompare(b.type) || a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
const outOf = (id) => EDGE_LIST.filter((e) => e.from === id);
const into = (id) => EDGE_LIST.filter((e) => e.to === id);
const ancestors = (id) => {
  const parts = id.replace(/\/$/, "").split("/");
  return parts.slice(0, -1).map((_, i) => `${parts.slice(0, i + 1).join("/")}/`).concat(id.endsWith("/") ? [id] : []);
};
/** [dependent, dependency] for edges that mean "changing the dependency can change the dependent". */
function dependency(e) {
  if (["imports", "reads", "loads", "inputs", "uses_asset", "built_from", "defined_in"].includes(e.type)) return [e.from, e.to];
  if (["renders", "feeds"].includes(e.type)) return [e.to, e.from];
  return null;
}
function dependents(id) {
  const seen = new Set([id]);
  const queue = [id, ...(nodes.get(id)?.type === "dir" ? NODE_LIST.filter((n) => n.id.startsWith(id) && n.id !== id).map((n) => n.id) : [])];
  for (const q of queue) seen.add(q);
  while (queue.length) {
    const cur = queue.shift();
    for (const e of EDGE_LIST) {
      const d = dependency(e);
      if (d && d[1] === cur && !seen.has(d[0])) {
        seen.add(d[0]);
        queue.push(d[0]);
      }
    }
  }
  seen.delete(id);
  return [...seen].map((x) => nodes.get(x)).filter(Boolean);
}
function normalise(arg) {
  if (!arg) return null;
  let id = arg.replace(/^\.\//, "").replace(/\\/g, "/");
  if (nodes.has(id)) return id;
  if (nodes.has(`${id}/`)) return `${id}/`;
  if (isDir(id)) return pathNode(id, "query");
  const hits = NODE_LIST.filter((n) => n.id.endsWith(id) || n.label === id);
  return hits.length === 1 ? hits[0].id : (hits.length ? (console.log(`Ambiguous, pick one:\n  ${hits.map((h) => h.id).join("\n  ")}`), null) : null);
}
const fmt = (n) => `${n.id}${n.summary ? `: ${n.summary}` : ""}`;
const show = (title, list) => list.length && console.log(`\n${title}\n${list.map((l) => `  ${l}`).join("\n")}`);

function query(arg) {
  const id = normalise(arg);
  if (!id) return console.log(`Not found: ${arg}`), 1;
  const n = nodes.get(id);
  console.log(`${n.id}  [${n.type}${n.product ? `, ${n.product}` : ""}${n.docType ? `, ${n.docType}` : ""}]${n.summary ? `\n  ${n.summary}` : ""}`);
  const group = (list, side) => Object.entries(list.reduce((acc, e) => ((acc[e.type] ??= []).push(`${side === "out" ? e.to : e.from}${e.note ? ` (${e.note})` : ""}`), acc), {}));
  for (const [t, xs] of group(outOf(id).filter((e) => e.type !== "part_of"), "out")) show(`${t} →`, xs);
  for (const [t, xs] of group(into(id).filter((e) => !["documents", "governs", "part_of"].includes(e.type)), "in")) show(`← ${t}`, xs);
  const scope = ancestors(id).concat(id);
  show("Docs that explain it", [...new Set(EDGE_LIST.filter((e) => e.type === "documents" && scope.includes(e.to)).map((e) => e.from))]);
  show("Rules that govern it", [...new Set(EDGE_LIST.filter((e) => e.type === "governs" && scope.includes(e.to)).map((e) => `${e.from}: ${nodes.get(e.from).summary}`))]);
  show("Keep in sync with", EDGE_LIST.filter((e) => e.type === "syncs_with" && (scope.includes(e.from) || scope.includes(e.to))).map((e) => `${scope.includes(e.from) ? e.to : e.from} (${e.note})`));
  return 0;
}

function impact(arg) {
  const id = normalise(arg);
  if (!id) return console.log(`Not found: ${arg}`), 1;
  const deps = dependents(id);
  console.log(`Changing ${id} can affect ${deps.length} nodes.`);
  show("Routes", deps.filter((n) => n.type === "route").map((n) => n.label).sort());
  show("Outputs", deps.filter((n) => ["output", "host"].includes(n.type)).map(fmt));
  show("Code and content in between", deps.filter((n) => !["route", "output", "host", "collection"].includes(n.type)).map((n) => n.id).sort());
  const tests = [...new Set(EDGE_LIST.filter((e) => e.type === "tests" && deps.some((d) => d.id === e.to)).map((e) => e.from))];
  show("Tests that cover those routes", tests);
  const scope = ancestors(id).concat(id);
  show("Keep in sync with", EDGE_LIST.filter((e) => e.type === "syncs_with" && (scope.includes(e.from) || scope.includes(e.to))).map((e) => `${scope.includes(e.from) ? e.to : e.from} (${e.note})`));
  return 0;
}

// ---------- Output ----------

function graphJson() {
  const line = (o) => `    ${JSON.stringify(o)}`;
  return [
    "{",
    `  "about": "Generated by scripts/graph.mjs from the repository and docs/graph/curated.mjs. Do not edit; run node scripts/graph.mjs. One node or edge per line, so grep works.",`,
    `  "nodes": [\n${NODE_LIST.map(line).join(",\n")}\n  ],`,
    `  "edges": [\n${EDGE_LIST.map(line).join(",\n")}\n  ]`,
    "}",
    "",
  ].join("\n");
}

// Mermaid theme: the website's tokens (docs/website/design-system.md), so diagrams match the site.
const MERMAID_INIT = `%%{init: {"theme": "base", "themeVariables": {"fontSize": "14px", "primaryColor": "#ffffff", "primaryTextColor": "#12161c", "primaryBorderColor": "#12161c", "lineColor": "#4c5866", "secondaryColor": "#f3f5f7", "tertiaryColor": "#f3f5f7", "clusterBkg": "#f3f5f7", "clusterBorder": "#aeb8c3", "edgeLabelBackground": "#f3f5f7"}}}%%`;
const MERMAID_CLASSES = [
  "  classDef code fill:#e1eaf8,stroke:#1d5fc4,color:#12161c",
  "  classDef data fill:#d9f0ec,stroke:#0e8f7e,color:#12161c",
  "  classDef out fill:#fbf1cf,stroke:#8a6300,color:#12161c",
  "  classDef prod fill:#12161c,stroke:#12161c,color:#ffffff",
  "  classDef ext fill:#ffffff,stroke:#aeb8c3,color:#4c5866",
];

const mid = (() => {
  const ids = new Map();
  return (id) => ids.get(id) ?? (ids.set(id, `n${ids.size}`), ids.get(id));
})();
const esc = (s) => s.replace(/"/g, "'");

function moduleDiagram() {
  const groups = ["pages", "layouts", "components", "lib", "scripts", "styles"];
  const inGroup = (id) => groups.find((g) => id.startsWith(`website/src/${g}/`));
  const code = NODE_LIST.filter((n) => n.type !== "dir" && (inGroup(n.id) || n.id === CONFIG));
  const lines = [MERMAID_INIT, "flowchart LR", ...MERMAID_CLASSES];
  for (const g of groups) {
    lines.push(`  subgraph ${g}`);
    for (const n of code.filter((c) => inGroup(c.id) === g)) lines.push(`    ${mid(n.id)}["${esc(n.id.slice(`website/src/${g}/`.length))}"]:::code`);
    lines.push("  end");
  }
  lines.push(`  ${mid(CONFIG)}["content.config.ts"]:::data`);
  for (const n of NODE_LIST.filter((x) => x.type === "data")) lines.push(`  ${mid(n.id)}[("${esc(n.label)}")]:::data`);
  lines.push(`  ${mid("website/src/content/projects/")}[("projects/*.md")]:::data`);
  const ids = new Set(code.map((c) => c.id));
  for (const e of EDGE_LIST.filter((x) => x.type === "imports" && ids.has(x.from) && ids.has(x.to))) lines.push(`  ${mid(e.from)} --> ${mid(e.to)}`);
  for (const e of EDGE_LIST.filter((x) => x.type === "reads")) lines.push(`  ${mid(e.from)} -.-> ${mid(CONFIG)}`);
  for (const e of EDGE_LIST.filter((x) => x.type === "loads" && x.to.startsWith("website/src/data/"))) lines.push(`  ${mid(CONFIG)} -.-> ${mid(e.to)}`);
  lines.push(`  ${mid(CONFIG)} -.-> ${mid("website/src/content/projects/")}`);
  // Dedupe edges only: every subgraph needs its own "end" line.
  return lines.filter((l, i) => !l.includes("-->") && !l.includes("-.->") || lines.indexOf(l) === i).join("\n");
}

function folderDiagram() {
  const groupOf = (id) => {
    if (id === CONFIG) return "schema";
    if (id.startsWith("collection:")) return "collections";
    if (id.startsWith("pkg:")) return "packages";
    const m = id.match(/^website\/src\/(pages|layouts|components|lib|scripts|styles|data|content|assets)\//);
    return m ? m[1] : null;
  };
  const label = { pages: `pages (${NODE_LIST.filter((n) => n.type === "page").length} + ${NODE_LIST.filter((n) => n.type === "endpoint").length} endpoints)`, layouts: "layouts", components: "components", lib: "lib", scripts: "client scripts", styles: "styles", data: "data/*.yaml", content: "content/projects/*.md", assets: "assets (images)", schema: "content.config.ts", collections: "content collections", packages: "npm packages" };
  const counts = new Map();
  for (const e of EDGE_LIST.filter((x) => ["imports", "reads", "loads", "defined_in", "uses_asset"].includes(x.type))) {
    const a = groupOf(e.from);
    const b = groupOf(e.to);
    if (!a || !b || a === b) continue;
    const key = `${a}|${b}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const used = new Set([...counts.keys()].flatMap((k) => k.split("|")));
  const cls = { data: "data", content: "data", assets: "data", schema: "data", collections: "data", packages: "ext" };
  const lines = [MERMAID_INIT, "flowchart LR", ...MERMAID_CLASSES];
  for (const g of Object.keys(label).filter((x) => used.has(x))) lines.push(`  ${g}["${label[g]}"]:::${cls[g] ?? "code"}`);
  for (const [k, n] of [...counts].sort()) {
    const [a, b] = k.split("|");
    lines.push(`  ${a} -->|${n}| ${b}`);
  }
  return lines.join("\n");
}

function overviewDiagram() {
  const lines = [MERMAID_INIT, "flowchart LR", ...MERMAID_CLASSES];
  for (const p of curated.products.filter((x) => x.id !== "product:project")) lines.push(`  ${mid(p.id)}{{"${esc(p.label)}"}}:::prod`);
  for (const o of [...curated.outputs, ...curated.hosts]) {
    lines.push(`  ${mid(o.id)}(["${esc(o.label)}"]):::out`);
    for (const f of o.from) {
      const label = f.startsWith("route:") ? f.slice(6) : f.startsWith("output:") ? null : basename(f.replace(/\/$/, ""));
      if (label) lines.push(`  ${mid(f)}["${esc(label)}"]:::code`);
      lines.push(`  ${mid(f)} --> ${mid(o.id)}`);
    }
  }
  lines.push(`  ${mid("product:website")} --> ${mid("output:pages-site")}`, `  ${mid("product:card")} --> ${mid("output:pages-site")}`, `  ${mid("product:cv")} --> ${mid("output:cv-pdf")}`);
  return [...new Set(lines)].join("\n");
}

function readme() {
  const count = (list, key) => Object.entries(list.reduce((a, x) => ((a[x[key]] = (a[x[key]] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  const table = (rows, head) => [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  const docs = NODE_LIST.filter((n) => n.type === "doc" && ["reference", "runbook", "index"].includes(n.docType));
  const covers = (id) => EDGE_LIST.filter((e) => e.from === id && e.type === "documents").map((e) => `\`${e.to}\``).join(", ");
  const relLink = (p) => posix.relative("docs/graph", p);
  return `---
title: Knowledge graph
aliases: [Knowledge graph]
type: index
covers: [scripts/graph.mjs, docs/graph/curated.mjs]
---

# Knowledge graph

<!-- Generated by scripts/graph.mjs. Do not edit by hand: change the code, the docs or docs/graph/curated.mjs, then run node scripts/graph.mjs. -->

A map of the whole portfolio (website, CV, name card, docs, CI) as nodes and edges. It lets a person or an agent answer "what does this file touch, what touches it, which doc explains it and which rule applies" without opening the code. Most of it is extracted from the repository; [curated.mjs](curated.mjs) adds products, outputs, rules, decisions and sync links.

## Use it

\`\`\`bash
node scripts/graph.mjs query website/src/lib/qr.ts      # neighbours, docs, rules, sync partners
node scripts/graph.mjs query collection:profile         # any node id works too
node scripts/graph.mjs impact website/src/data/profile.yaml   # routes and outputs affected
node scripts/graph.mjs                                  # regenerate after changes
node scripts/graph.mjs --check                          # what CI runs
grep '"website/src/lib/url.ts"' docs/graph/graph.json   # raw lines, one node or edge each
\`\`\`

## Contents

${table(count(NODE_LIST, "type").map(([t, n]) => [`\`${t}\``, n]), ["Node type", "Count"])}

${table(count(EDGE_LIST, "type").map(([t, n]) => [`\`${t}\``, n, EDGE_MEANING[t] ?? ""]), ["Edge type", "Count", "Meaning"])}

## Coverage

${coverage.filter((c) => c.ok).length} of ${coverage.length} code, data, config and CI files are explained by a reference doc (front matter \`covers\`). \`--check\` fails on any file that is not.

## Products and outputs

\`\`\`mermaid
${overviewDiagram()}
\`\`\`

## Website modules

By folder. Numbers count the edges (imports, collection reads and loads, image uses) between folders. Use \`query\` for the files behind an arrow.

\`\`\`mermaid
${folderDiagram()}
\`\`\`

File by file: [modules.md](modules.md) (large). In Obsidian, [portfolio.canvas](portfolio.canvas) shows the documentation map on a canvas.

## Which doc explains what

${table(docs.map((d) => [`[${d.id}](${relLink(d.id)})`, d.docType, covers(d.id)]), ["Doc", "Type", "Covers"])}

## Facts kept in two places

${table(EDGE_LIST.filter((e) => e.type === "syncs_with").map((e) => [`\`${e.from}\``, `\`${e.to}\``, e.note]), ["File", "Must match", "What"])}

## Rules

${table(curated.rules.map((r) => [r.label, r.summary, r.governs.map((g) => `\`${g}\``).join(", ")]), ["Rule", "Says", "Governs"])}
`;
}

function modulesMd() {
  return `---
title: Website module diagram
aliases: [Website module diagram]
type: index
---

# Website module diagram

<!-- Generated by scripts/graph.mjs. Do not edit by hand. -->

Every file in \`website/src\` and its imports. Solid arrows are imports; dotted arrows show files reading content collections and the data files behind them. The folder-level view is in [the knowledge graph](README.md#website-modules).

\`\`\`mermaid
${moduleDiagram()}
\`\`\`
`;
}

/** Obsidian canvas (JSON Canvas 1.0) of the documentation: one column per layer, file cards open the notes. */
function canvasJson() {
  const docs = NODE_LIST.filter((n) => n.type === "doc" && (n.id === "CLAUDE.md" || n.id === "README.md" || n.id.startsWith("docs/") || n.id === "website/README.md"));
  const column = (id) => {
    const t = nodes.get(id).docType;
    if (["CLAUDE.md", "README.md", "docs/README.md", OUT_MD, OUT_MODULES].includes(id)) return 0;
    if (t === "history" || t === "log") return 4;
    if (id.startsWith("docs/project/")) return 1;
    if (id.startsWith("docs/website/") || id === "website/README.md") return 2;
    return 3;
  };
  const titles = ["Start here", "Project reference", "Website reference", "CV and name card", "History (why)"];
  const colors = ["#12161c", "#0e8f7e", "#1d5fc4", "#8a6300", "#aeb8c3"]; // ink, leaf, signal, sun-ink, line (site tokens)
  const W = 340, H = 70, GAP = 24, COL = W + 120, PAD = 30;
  const cards = [];
  const groups = [];
  const safe = (x) => x.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  titles.forEach((title, c) => {
    const inCol = docs.filter((d) => column(d.id) === c).sort((a, b) => a.id.localeCompare(b.id));
    inCol.forEach((d, i) => cards.push({ id: `doc-${safe(d.id)}`, type: "file", file: d.id, x: c * COL + PAD, y: 60 + i * (H + GAP) + PAD, width: W, height: H, color: colors[c] }));
    groups.push({ id: `group-${c}`, type: "group", label: title, x: c * COL, y: 0, width: W + 2 * PAD, height: 60 + Math.max(1, inCol.length) * (H + GAP) + 2 * PAD - GAP, color: colors[c] });
  });
  const cardOf = new Map(cards.map((c) => [c.file, c.id]));
  const links = EDGE_LIST.filter((e) => ["superseded_by", "links"].includes(e.type) && cardOf.has(e.from) && cardOf.has(e.to) && e.from !== e.to)
    .filter((e) => e.type === "superseded_by" || (column(e.from) === 0 && column(e.to) !== 0 && column(e.to) !== 4))
    .map((e) => ({ id: `edge-${safe(e.from)}-${safe(e.to)}`, fromNode: cardOf.get(e.from), toNode: cardOf.get(e.to), ...(e.type === "superseded_by" ? { label: "now in", fromSide: "left", toSide: "right" } : { fromSide: "right", toSide: "left" }) }));
  const uniq = [...new Map(links.map((l) => [l.id, l])).values()];
  return `${JSON.stringify({ nodes: [...groups, ...cards], edges: uniq }, null, "\t")}\n`;
}

const EDGE_MEANING = {
  imports: "Code import (file or npm package)",
  reads: "Code reads a content collection",
  provides: "Content library wraps a collection in a getter",
  loads: "Collection loads a data or content file",
  defined_in: "Collection schema location",
  inputs: "LaTeX \\input",
  uses_asset: "Uses an image",
  renders: "Page or endpoint produces a route",
  feeds: "Project file supplies a project route",
  tests: "Test visits a route",
  documents: "Doc explains a file or folder (front matter covers)",
  links: "Doc links to a file or folder",
  superseded_by: "History doc replaced by a reference doc",
  built_from: "Output made from a source",
  governs: "Rule applies to a path",
  affects: "Decision shaped a path",
  explained_in: "Rule or decision is explained in a doc",
  syncs_with: "Same facts in two files that do not read each other",
};

// ---------- Main ----------

const [cmd, arg] = process.argv.slice(2);
if (cmd === "query") process.exit(query(arg));
if (cmd === "impact") process.exit(impact(arg));

const outputs = { [OUT_JSON]: graphJson(), [OUT_MD]: readme(), [OUT_MODULES]: modulesMd(), [OUT_CANVAS]: canvasJson() };
if (cmd === "--check") {
  for (const [p, text] of Object.entries(outputs)) if (!exists(p) || read(p) !== text) problems.push(`${p} is stale: run node scripts/graph.mjs and commit the result`);
} else {
  for (const [p, text] of Object.entries(outputs)) writeFileSync(join(ROOT, p), text);
  console.log(`graph: ${NODE_LIST.length} nodes, ${EDGE_LIST.length} edges -> ${Object.keys(outputs).join(", ")}`);
}
if (problems.length) {
  console.error(`graph: ${problems.length} problem(s)\n${problems.map((x) => `  ${x}`).join("\n")}`);
  process.exit(1);
}
if (cmd === "--check") console.log(`graph: up to date (${NODE_LIST.length} nodes, ${EDGE_LIST.length} edges), links and paths valid`);
