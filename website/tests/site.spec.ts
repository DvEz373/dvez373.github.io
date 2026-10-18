import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["", "experience/", "education/", "projects/", "projects/sonodirect/", "projects/tw-fault-locator/", "skills/", "about/", "namecard/", "namecard/print/"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

for (const path of pages) {
  test(`page /${path} renders without errors or sideways scroll`, async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test(`page /${path} has no squeezed text or leftover placeholders`, async ({ page }) => {
    await page.goto(path);
    // A text block crushed into a narrow column (one word per line) means a grid track went wrong.
    const squeezed = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length >= 24))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.4;
          return r.width > 0 && r.width < 120 && r.height / lh >= 4;
        })
        .map((el) => (el.textContent ?? "").trim().slice(0, 40)),
    );
    expect(squeezed).toEqual([]);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/placeholder|image to come|replace with/i);
  });

  test(`page /${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("content is in the HTML before any JavaScript runs", async ({ request }) => {
  const html = await (await request.get("")).text();
  expect(html).toMatch(/<h1[^>]*>Devin Ezekiel Purba<\/h1>/);
  const exp = await (await request.get("experience/")).text();
  expect(exp).toContain("Power System Engineer");
  expect(exp).toContain('property="og:image"');
});

test("home shows selected work and project figures load", async ({ page }) => {
  await page.goto("");
  const cards = page.locator(`section[aria-labelledby="s-work"] .card`);
  expect(await cards.count()).toBeGreaterThanOrEqual(1);
  await cards.first().click();
  await expect(page).toHaveURL(/\/projects\/[^/]+\/$/);
  const imgs = page.locator(".lead img, .figs img");
  expect(await imgs.count()).toBeGreaterThanOrEqual(1);
  for (const img of await imgs.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect(await img.getAttribute("alt")).toBeTruthy();
  }
});

test("case studies state the author's own part when it is known", async ({ page }) => {
  await page.goto("projects/tw-fault-locator/");
  await expect(page.locator(".head .role")).toContainText("My part:");
  await expect(page.locator(".spec dt", { hasText: "My part" })).toHaveCount(1);
  await page.goto("projects/sonodirect/");
  await expect(page.locator(".head .role")).toHaveCount(0);
});

test("command palette opens with the keyboard and navigates", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut is a desktop feature");
  await page.goto("");
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-cmdk]")).toHaveAttribute("open", "");
  await page.keyboard.type("sono");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/projects\/sonodirect\/$/);
  await expect(page.locator("h1")).toHaveText("SonoDirect");
});

test("search button opens the palette", async ({ page }) => {
  await page.goto("");
  await page.locator("header [data-cmdk-open]").click();
  await expect(page.locator("[data-cmdk]")).toHaveAttribute("open", "");
  await expect(page.locator("[data-cmdk-list] [role=option]").first()).toBeVisible();
});

test("theme choice survives navigation", async ({ page }) => {
  await page.goto("");
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator("[data-theme-toggle]").click();
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(after).not.toBe(before);
  await page.goto("skills/");
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(after);
});

test("experience filters and the career chart work", async ({ page }) => {
  await page.goto("experience/");
  await page.locator('[data-filter="internship"]').click();
  await expect(page.locator("[data-shown]")).toHaveText("Showing 2 of 7");
  await page.locator('[data-filter="all"]').click();
  await page.locator('.bar[data-target="teep-ntust"]').click();
  await expect(page.locator("#teep-ntust details")).toHaveAttribute("open", "");
});

test("project theme filters show client and academic work together", async ({ page }) => {
  await page.goto("projects/");
  const total = await page.locator("[data-kind]").count();
  await page.locator('[data-filter="machines"]').click();
  await expect(page.locator("[data-shown]")).toHaveText(`Showing 3 of ${total}`);
  await page.locator('[data-filter="ai"]').click();
  await expect(page.locator("[data-kind~='ai']:visible")).toHaveCount(3);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator("[data-shown]")).toHaveText(`Showing ${total} of ${total}`);
});

test("the closed phone menu does not block taps on the page", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "phone layout only");
  await page.goto("projects/");
  const hit = await page.evaluate(() => document.elementFromPoint(150, 150)?.closest(".site-header") === null);
  expect(hit).toBe(true);
});

test("the datasheet never covers the figures or the story", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "the datasheet sits beside the story only on wide screens");
  // 1280 × 900: the datasheet scrolls with the page; 1920 × 1200: it is sticky while the story is read.
  for (const size of [{ width: 1280, height: 900 }, { width: 1920, height: 1200 }]) {
    await page.setViewportSize(size);
    await page.goto("projects/pumped-storage-dfim-model/");
    const worst = await page.evaluate(async () => {
      const spec = document.querySelector(".spec")!;
      const others = [...document.querySelectorAll(".lead, .story section, .prose > *, .figs h2, .figs figure, .pager a")];
      let max = 0;
      for (let y = 0; y < document.documentElement.scrollHeight; y += 150) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const s = spec.getBoundingClientRect();
        for (const o of others) {
          const r = o.getBoundingClientRect();
          const w = Math.min(s.right, r.right) - Math.max(s.left, r.left);
          const h = Math.min(s.bottom, r.bottom) - Math.max(s.top, r.top);
          if (w > 0 && h > 0) max = Math.max(max, w * h);
        }
      }
      return max;
    });
    expect(worst, `overlap at ${size.width} × ${size.height}`).toBe(0);
  }
});

test("project lead figures show the whole image", async ({ page }) => {
  for (const slug of ["ccgt-excitation-limiters", "datacenter-grid-compliance", "tw-fault-locator"]) {
    await page.goto(`projects/${slug}/`);
    const img = page.locator(".lead img");
    await expect(img).toBeVisible();
    await img.evaluate((el: HTMLImageElement) => el.decode());
    const [box, frame] = await Promise.all([img.boundingBox(), page.locator(".lead .figure").boundingBox()]);
    expect(box && frame).toBeTruthy();
    expect(box!.y + box!.height).toBeLessThanOrEqual(frame!.y + frame!.height + 1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
  }
});

test("zoomed card covers load an image wide enough to stay sharp", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "desktop cards at device scale 1");
  await page.goto("projects/");
  const covers = page.locator(".card .cover.cropped img");
  expect(await covers.count()).toBeGreaterThanOrEqual(1);
  for (const img of await covers.all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((el: HTMLImageElement) => el.decode());
    // object-fit: cover widens figures wider than the card, then --zoom enlarges them; the file must cover that width.
    const [natural, drawn] = await img.evaluate((el: HTMLImageElement) => {
      const zoom = Number(getComputedStyle(el.closest(".cover")!).getPropertyValue("--zoom"));
      const cover = Math.max(el.offsetWidth, (el.offsetHeight * el.naturalWidth) / el.naturalHeight);
      return [el.naturalWidth, cover * zoom];
    });
    const href = await img.evaluate((el) => el.closest("a")?.getAttribute("href") ?? "");
    expect(natural, href).toBeGreaterThanOrEqual(drawn * 0.95);
  }
});

test("acronyms are expanded once, at first use", async ({ page }) => {
  await page.goto("projects/pumped-storage-dfim-model/");
  await expect(page.locator('abbr:text-is("DFIM")')).toHaveCount(1);
  await expect(page.locator('abbr:text-is("DFIM")')).toHaveAttribute("title", "doubly fed induction machine");
  expect(await page.locator("main").innerText()).toContain("PSS/E");
  await expect(page.locator('abbr:text-is("PSS")')).toHaveCount(0);
});

test("home features four client case studies", async ({ page }) => {
  await page.goto("");
  await expect(page.locator(".work > li")).toHaveCount(4);
});

test("instrument trips, reports a nadir and settles with the controller on", async ({ page }) => {
  await page.goto("");
  await page.locator('[data-ctl="on"]').click();
  await expect(page.locator('[data-ctl="on"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-instrument]").scrollIntoViewIfNeeded();
  await page.locator("[data-trip]").click();
  await expect(page.locator("[data-settle]")).toHaveText(/^\d+\.\d$/, { timeout: 10_000 });
  const nadir = Number(await page.locator("[data-nadir]").textContent());
  expect(nadir).toBeGreaterThan(49.5);
  expect(nadir).toBeLessThan(50);
});

test("reduced motion: instrument is static and still answers a trip", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("");
  await expect(page.locator("[data-status]")).toHaveText("■ STATIC");
  await expect(page.locator("[data-run]")).toBeHidden();
  await page.locator("[data-trip]").click();
  await expect(page.locator("[data-nadir]")).toHaveText(/^49\.\d\d$/);
  await context.close();
});

test("contact card is a valid vCard", async ({ request }) => {
  const res = await request.get("devin-ezekiel-purba.vcf");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
  expect(body).toContain("FN:Devin Ezekiel Purba");
  expect(body).toContain("TEL;TYPE=CELL:+6281291615474");
  expect(body.trimEnd().endsWith("END:VCARD")).toBe(true);
});

test("pages fit a 320 px phone without sideways scroll", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "phone widths only");
  // The name card once grew to its longest contact row (bug found 2026-10-14).
  await page.setViewportSize({ width: 320, height: 700 });
  for (const path of ["", "experience/", "projects/tw-fault-locator/", "namecard/"]) {
    await page.goto(path);
    // Compare with 320, not innerWidth: a phone browser widens its layout viewport to fit the content.
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `/${path}`).toBeLessThanOrEqual(320);
  }
});

test("old project-site and /card/ links forward to the new pages", async ({ page, request }) => {
  // Printed name cards and their QR codes point to /Personal-Profile-Portfolio/card/ (moved 2026-10-18).
  for (const [from, to] of [
    ["Personal-Profile-Portfolio/card/", "/namecard/"],
    ["Personal-Profile-Portfolio/card/print/", "/namecard/print/"],
    ["Personal-Profile-Portfolio/", "/"],
    ["Personal-Profile-Portfolio/projects/sonodirect/", "/projects/sonodirect/"],
    ["card/", "/namecard/"],
  ]) {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`${to.replace(/\//g, "\\/")}$`));
    await expect(page.locator("h1")).toHaveCount(1);
  }
  await page.goto("Personal-Profile-Portfolio/experience/#teep-ntust");
  await expect(page).toHaveURL(/\/experience\/#teep-ntust$/);
  const vcf = await request.get("Personal-Profile-Portfolio/devin-ezekiel-purba.vcf");
  expect(await vcf.text()).toContain("BEGIN:VCARD");
});

test("unknown pages show the 404 page", async ({ page }) => {
  const res = await page.goto("no-such-page/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page isn't connected.");
});

test("name card links contact routes and shows a scannable QR", async ({ page, request }) => {
  await page.goto("namecard/");
  for (const name of ["Save contact", "Email", "WhatsApp", "LinkedIn", "Instagram", "GitHub", "Website"]) {
    await expect(page.getByRole("link", { name: new RegExp(name) }).first()).toBeVisible();
  }
  await expect(page.locator('a[href^="https://wa.me/62"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Show QR" }).click();
  await expect(page.locator("dialog[open] .qr-box svg")).toBeVisible();
  const qr = await request.get("namecard-qr.svg");
  expect(qr.status()).toBe(200);
  expect(await qr.text()).toContain("<svg");
});
