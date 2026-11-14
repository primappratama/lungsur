import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase buat komponen browser ("use client"). Sesinya dibaca dari
 * cookie yang sama dengan server, jadi upload ke Storage ikut atas nama user
 * yang lagi login dan kena policy Storage-nya.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase belum disetel. Cek NEXT_PUBLIC_SUPABASE_* di .env.local.");
  }
  return createBrowserClient(url, key);
}
