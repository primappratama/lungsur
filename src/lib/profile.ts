import "server-only";
import type { User } from "@supabase/supabase-js";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, verifications } from "@/db/schema";
import { campusDomainOf } from "./campus";

/**
 * Dipanggil sekali tiap login. Bikin atau perbarui baris profil dari data
 * akun Google, dan kasih badge kampus otomatis kalau emailnya .ac.id
 * (Google udah mastiin email itu beneran punya dia).
 */
export async function syncProfileFromAuth(user: User) {
  const email = user.email;
  if (!email) throw new Error("Akun Google ini nggak punya email.");

  const meta = user.user_metadata ?? {};
  const name: string =
    meta.full_name || meta.name || email.split("@")[0] || "Pengguna lungsur.";
  const avatarUrl: string | null = meta.avatar_url || meta.picture || null;
  const campusDomain = campusDomainOf(email);
  const now = new Date();
  const db = getDb();

  const [profile] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email,
      name,
      avatarUrl,
      campusDomain,
      verifiedAt: campusDomain ? now : null,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email,
        name,
        avatarUrl,
        // Badge yang udah ada nggak dicabut pas login pakai email lain.
        campusDomain: sql`coalesce(${profiles.campusDomain}, excluded.campus_domain)`,
        verifiedAt: sql`coalesce(${profiles.verifiedAt}, excluded.verified_at)`,
      },
    })
    .returning();

  // Catat verifikasi otomatis sekali aja, pas badge pertama kali didapat.
  if (campusDomain && profile.verifiedAt?.getTime() === now.getTime()) {
    await db.insert(verifications).values({
      profileId: profile.id,
      method: "campus_email",
      status: "approved",
      campusEmail: email,
      reviewedAt: now,
    });
  }

  return profile;
}
