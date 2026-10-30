import "server-only";
import { headers } from "next/headers";

/**
 * URL asal aplikasi, dipakai buat redirect balik dari Google.
 * Pakai NEXT_PUBLIC_SITE_URL kalau ada (production), selain itu ambil dari header.
 */
export async function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
