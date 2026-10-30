import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb(url: string) {
  // Supabase transaction pooler (port 6543) nggak mendukung prepared statement.
  const client = postgres(url, { prepare: false });
  return { client, db: drizzle({ client, schema }) };
}

type Db = ReturnType<typeof createDb>["db"];
type Cached = { url: string; client: postgres.Sql; db: Db };

// Disimpan di globalThis biar hot reload di dev nggak bikin koneksi baru terus.
const globalForDb = globalThis as unknown as { lungsurDb?: Partial<Cached> };

/**
 * Koneksi dibuat pas pertama dipakai, bukan pas file di-import.
 * Kalau DATABASE_URL berubah (misalnya habis ganti password), koneksi lama
 * ditutup dan diganti yang baru, jadi nggak perlu restart dev server.
 */
export function getDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi. Cek file .env.local kamu.");
  }

  const cached = globalForDb.lungsurDb;
  if (cached?.url === url && cached.db) return cached.db;

  cached?.client?.end({ timeout: 5 }).catch(() => {});
  const fresh = createDb(url);
  globalForDb.lungsurDb = { url, ...fresh };
  return fresh.db;
}
