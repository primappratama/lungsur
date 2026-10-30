"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData: FormData) {
  const next = safeNextPath(formData.get("next")?.toString());
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      // Selalu tampilkan pilihan akun, biar gampang ganti ke email kampus.
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) redirect("/masuk?error=google");
  redirect(data.url);
}
