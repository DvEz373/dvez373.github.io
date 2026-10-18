// Full-page screenshots of the built site for design review (desktop light/dark, phone).
// Needs `npm run build` and a running `npx astro preview` (port 4321).
//
//   node scripts/shots.mjs <outDir> [pages]
//   pages: comma-separated paths, default every main page; use "home" for the home page.
// Git Bash rewrites "/" arguments into Windows paths; use "home" or set MSYS_NO_PATHCONV=1.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = "http://localhost:4321/";
const out = process.argv[2] ?? "shots";
const pages = (process.argv[3] ?? "home,experience/,education/,projects/,skills/,about/,namecard/").split(",");
const variants = [
  { tag: "desktop-light", viewport: { width: 1440, height: 900 }, colorScheme: "light" },
  { tag: "desktop-dark", viewport: { width: 1440, height: 900 }, colorScheme: "dark" },
  { tag: "phone-light", viewport: { width: 390, height: 844 }, colorScheme: "light", isMobile: true, hasTouch: true },
];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
let failed = false;
for (const { tag, ...options } of variants) {
  const context = await browser.newContext({ ...options, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of pages) {
    const route = path === "home" || path === "/" ? "" : path;
    await page.goto(base + route, { waitUntil: "networkidle" });
    // Walk down the page so scroll-triggered reveals run before the capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const name = route ? route.replace(/\/$/, "").replace(/\//g, "_") : "home";
    await page.screenshot({ path: `${out}/${name}.${tag}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`${tag.padEnd(14)} /${route.padEnd(36)} overflowX=${overflow}`);
    if (overflow > 0) failed = true;
  }
  if (errors.length) {
    console.log(`${tag} page errors:`, errors);
    failed = true;
  }
  await context.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
