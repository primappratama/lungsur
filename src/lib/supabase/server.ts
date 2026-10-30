import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/**
 * Client Supabase buat Server Component, Server Action, dan Route Handler.
 * Bikin baru tiap request, jangan dipakai ulang.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = supabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Dipanggil dari Server Component yang nggak boleh nulis cookie.
          // Aman diabaikan: proxy.ts yang nyegerin sesi di tiap request.
        }
      },
    },
  });
}
