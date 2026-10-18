// Design measurements on the built site at phone width (390 px): text under 12 px,
// tap targets under 24 × 24 px (WCAG 2.2), uppercase micro-labels and dash characters.
// Needs a running `npx astro preview` (port 4321).
//
//   node scripts/measure.mjs [pages]     pages as in shots.mjs ("home" for the home page)
import { chromium } from "@playwright/test";

const base = "http://localhost:4321/";
const pages = (process.argv[2] ?? "home,experience/,education/,projects/,skills/,about/,namecard/").split(",");

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
for (const path of pages) {
  const route = path === "home" || path === "/" ? "" : path;
  await page.goto(base + route, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const visible = (el) => {
      const s = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return s.visibility !== "hidden" && s.display !== "none" && b.width > 0 && b.height > 0;
    };
    const textEls = [...document.querySelectorAll("body *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visible(e));
    const tiny = textEls.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 12).map((e) => `${parseFloat(getComputedStyle(e).fontSize)}px "${e.textContent.trim().slice(0, 30)}"`);
    // Measure the hit area, including ::before pads used to enlarge small targets.
    const small = [...document.querySelectorAll("a,button,[role=button],summary")]
      .filter(visible)
      .map((e) => {
        const b = e.getBoundingClientRect();
        const pad = getComputedStyle(e, "::before");
        const w = Math.max(b.width, pad.content !== "none" ? parseFloat(pad.width) || 0 : 0);
        const h = Math.max(b.height, pad.content !== "none" ? parseFloat(pad.height) || 0 : 0);
        return { e, w, h };
      })
      .filter((o) => o.w < 24 || o.h < 24)
      .map((o) => `${Math.round(o.w)}x${Math.round(o.h)} "${(o.e.textContent || o.e.getAttribute("aria-label") || "").trim().slice(0, 25)}"`);
    return {
      tinyText: tiny.length,
      tinyExamples: [...new Set(tiny)].slice(0, 5),
      smallTargets: small.length,
      smallExamples: small.slice(0, 5),
      uppercaseLabels: textEls.filter((e) => getComputedStyle(e).textTransform === "uppercase").length,
      emDashes: (document.body.innerText.match(/—/g) || []).length,
    };
  });
  console.log(`/${route}`, JSON.stringify(r));
}
await browser.close();
