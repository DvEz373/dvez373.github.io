import QRCode from "qrcode";
import { url } from "./url";

/** Public address of the online name card; this is what every QR code points to. */
export const cardUrl = (site: URL | undefined) => new URL(url("namecard/"), site).toString();

/**
 * QR code as an SVG string. Level M with the 4-module quiet zone ISO/IEC 18004 asks for;
 * the card URL is short, so the code stays sparse enough to print at 2.5 cm.
 */
export function qrSvg(text: string, dark = "#12161c", light = "#ffffff") {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 4, color: { dark, light } });
}
