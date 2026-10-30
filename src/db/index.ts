import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi. Cek file .env.local kamu.");
  }
  // Supabase transaction pooler (port 6543) nggak mendukung prepared statement.
  const client = postgres(url, { prepare: false });
  return drizzle({ client, schema });
}

// Disimpan di globalThis biar hot reload di dev nggak bikin koneksi baru terus.
const globalForDb = globalThis as unknown as { lungsurDb?: Db };

/** Koneksi dibuat pas pertama dipakai, bukan pas file di-import. */
export function getDb(): Db {
  if (!globalForDb.lungsurDb) {
    globalForDb.lungsurDb = createDb();
  }
  return globalForDb.lungsurDb;
}
