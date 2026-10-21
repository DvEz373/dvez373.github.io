---
title: Name card reference
aliases: [Name card reference]
type: reference
covers: [website/src/pages/namecard/, website/src/pages/namecard-qr.svg.ts, website/src/pages/devin-ezekiel-purba.vcf.ts, website/src/lib/qr.ts, website/src/layouts/Bare.astro]
---

# Name card reference

The name card is part of the website build. Research and the options compared: [01-research.md](01-research.md) (decision N1 in the [decision register](../project/decisions.md)).

## Outputs

| URL | Source | What |
|---|---|---|
| `/namecard/` | `website/src/pages/namecard/index.astro` (layout `Bare`) | Phone-first card: photo, name, role and employer, **Save contact** (.vcf), Email, Call, WhatsApp, LinkedIn, Instagram, GitHub, Website; **Share** (Web Share API, falls back to "Copy link"); **Show QR** (full-screen `<dialog>` for scanning in person) |
| `/namecard/print/` | `website/src/pages/namecard/print.astro` | Front and back, each 91 × 61 mm (85 × 55 mm card plus 3 mm bleed, text 4 mm inside the trim). `noindex`, not in the sitemap |
| `/namecard-qr.svg` | `website/src/pages/namecard-qr.svg.ts` | Vector QR for print shops, email signatures and slides |
| `/devin-ezekiel-purba.vcf` | `website/src/pages/devin-ezekiel-purba.vcf.ts` | vCard 3.0: name, title (`role`), org, email, mobile, city and country, website, LinkedIn, GitHub, Instagram, note |

Linked from the footer, the About page and the command palette.

## Data

Everything comes from `website/src/data/profile.yaml` (`name`, `givenNames`, `familyName`, `role`, `org`, `email`, `phone`, `city`, `country`, `links`, `headline`, `headlineAccent`, `tagline`) and the portrait. On cards narrower than about 256 px the accent ("Control Systems") moves to its own line without the separator dot (container query in `card/index.astro`) in `website/src/assets/photos/portrait.jpg`. WhatsApp uses `https://wa.me/<phone without + and spaces>`.

## QR

- Built at build time by `website/src/lib/qr.ts` with the `qrcode` package.
- Encodes the `/namecard/` URL (`cardUrl(site)`, today `https://dvnezkl.vercel.app/namecard/`), so card details can change without reprinting.
- Cards printed before 2026-10-21 encode a `https://dvez373.github.io/...` address. That host stopped serving when the GitHub account was renamed to `dvnezkl` (decision A10), so those cards no longer resolve: reprint them. The forwarding paths in `scripts/legacy-paths.mjs` still work on the new host.
- Error correction M, 4-module quiet zone (ISO/IEC 18004). On the print card the QR is 30 mm including the quiet zone (about 24 mm code), above the 2 to 2.5 cm guidance.
- Dark `#12161c` on white. No logo overlay.

## Printing

1. Open `/namecard/print/`, press Print or Save as PDF.
2. Margins None, scale 100 %, background graphics on: a 2-page PDF (front, back).
3. Send as "85 × 55 mm, 3 mm bleed included".
4. Test-scan a printed proof on iPhone and Android.

## Change checklist

| Change | Do |
|---|---|
| Phone, email, links, role, employer | Edit `profile.yaml`; card, print card and vCard follow. Reprint only if the printed text changed |
| Photo | Replace `portrait.jpg` (also used on Home and About); regenerate the OG image ([runbook R-09](../project/runbooks.md#r-09-regenerate-the-link-preview-image)) |
| Domain or base path | Every printed QR becomes wrong: reprint ([runbook R-11](../project/runbooks.md#r-11-move-to-a-custom-domain)) |

## Tests

`website/tests/site.spec.ts`: both card pages load without errors or overflow and pass axe; the card fits a 320 px phone (long contact rows truncate, Copy link and Show QR stack); the card test checks every contact link, the WhatsApp URL, the QR dialog and the SVG download; the vCard test checks the `.vcf` fields.
