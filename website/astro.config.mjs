// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Published as the GitHub Pages user site https://dvez373.github.io/ (repository DvEz373.github.io).
// For a custom domain, build with SITE_URL=<url>; for a project site, also set SITE_BASE=/<repository>.
const site = process.env.SITE_URL ?? "https://dvez373.github.io";
const base = process.env.SITE_BASE ?? "/";

// Fonts are self-hosted: Astro copies these files from node_modules into the build.
// No font is requested from a CDN, at build time or in the browser.
const local = fontProviders.local();
/** @param {string} path */
const font = (path) => `@fontsource${path}`;

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [sitemap({ filter: (page) => !page.includes("/og-card") && !page.includes("/namecard/print") })],
  // One typeface for the whole site (Geist, upright + italic); hierarchy comes from weight, size and colour.
  fonts: [
    {
      provider: local,
      name: "Geist",
      cssVariable: "--font-sans",
      fallbacks: ["system-ui", "sans-serif"],
      options: {
        variants: [
          { src: [font("-variable/geist/files/geist-latin-wght-normal.woff2")], weight: "100 900", style: "normal" },
          { src: [font("-variable/geist/files/geist-latin-wght-italic.woff2")], weight: "100 900", style: "italic" },
        ],
      },
    },
  ],
});
