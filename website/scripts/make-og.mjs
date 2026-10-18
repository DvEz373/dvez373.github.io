// Renders /og-card/ to public/og.jpg (1200×630) for link previews.
// Usage: npm run build && npm run preview (in another terminal), then: node scripts/make-og.mjs
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";

const base = process.env.OG_URL ?? "http://localhost:4321/og-card/";
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "public/og.png" });
await browser.close();
try {
  // Smaller JPEG if Python + Pillow are available; otherwise keep the PNG.
  execFileSync("python3", ["-c", "from PIL import Image; Image.open('public/og.png').convert('RGB').save('public/og.jpg', quality=86, optimize=True, progressive=True)"]);
  console.log("wrote public/og.jpg");
} catch {
  console.log("wrote public/og.png (install Pillow to also get og.jpg)");
}
