import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

/**
 * Data Access Layer: satu-satunya tempat buat baca siapa yang lagi login.
 * Baca cookie, jadi panggil dari komponen di dalam <Suspense>.
 * Balikin null kalau belum login.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  // Tandai sebagai data per-request, biar nggak ikut di-prerender jadi halaman statis
  // walaupun env Supabase belum ada pas build.
  await connection();
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const [profile] = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profile ?? null;
}

/** Sama kayak getCurrentProfile, tapi lempar ke halaman masuk kalau belum login. */
export async function requireProfile(next = "/akun"): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/masuk?next=${encodeURIComponent(next)}`);
  if (profile.blockedAt) redirect("/masuk?error=diblokir");
  return profile;
}

/** Cuma izinin redirect ke path internal, biar nggak bisa dipakai buat phishing. */
export function safeNextPath(next: string | null | undefined, fallback = "/akun") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
