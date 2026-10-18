// Downloadable QR code for the name card (print, email signatures, slides).
import type { APIRoute } from "astro";
import { cardUrl, qrSvg } from "../lib/qr";

export const GET: APIRoute = async ({ site }) =>
  new Response(await qrSvg(cardUrl(site)), { headers: { "Content-Type": "image/svg+xml" } });
