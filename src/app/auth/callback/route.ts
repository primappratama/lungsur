import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { syncProfileFromAuth } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** Google balik ke sini bawa `code`, ditukar jadi sesi Supabase. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/masuk?error=belum-setup`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        await syncProfileFromAuth(data.user);
      } catch (e) {
        console.error("Gagal sinkron profil:", e);
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/masuk?error=profil`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/masuk?error=callback`);
}
