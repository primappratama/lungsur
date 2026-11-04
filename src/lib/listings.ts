import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { and, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { connection } from "next/server";
import { getDb } from "@/db";
import { categories, listings, profiles } from "@/db/schema";
import { DEMO_LISTINGS, SAMPLE_LISTINGS } from "./sample-listings";

export type Condition = "like_new" | "used" | "defect";

export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  condition: Condition;
  meetupPoint: string;
  categorySlug: string;
  categoryName: string;
  sellerVerified: boolean;
  imageUrl: string | null;
};

export type ListingResult = {
  items: ListingCardData[];
  /** true = database belum disambungin, yang tampil kartu contoh. */
  sample: boolean;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Mode demo buat screenshot porto: kartu contoh tampil kayak barang beneran
 * (tanpa label "contoh"), pakai foto di public/demo/. Database nggak disentuh.
 * Cuma nyala kalau LUNGSUR_DEMO=1. Jangan pernah dinyalain di production.
 */
export function isDemoMode() {
  return process.env.LUNGSUR_DEMO === "1";
}

function demoListings(): ListingCardData[] {
  return DEMO_LISTINGS.map(({ image, ...item }) => {
    const found = existsSync(path.join(process.cwd(), "public", "demo", image));
    return { ...item, imageUrl: found ? `/demo/${image}` : null };
  });
}

/** Sumber kartu kalau nggak baca database: demo atau contoh berlabel. */
function offlineSource(): ListingResult {
  return isDemoMode()
    ? { items: demoListings(), sample: false }
    : { items: SAMPLE_LISTINGS, sample: true };
}

/** URL publik foto di bucket Storage `listing-images`. */
function imageUrl(path: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  return `${base}/storage/v1/object/public/listing-images/${path}`;
}

/**
 * Ubah ketikan bebas jadi query full-text yang aman, dengan pencocokan awalan:
 * "kalku casio" → kalku:* & casio:*
 */
export function toPrefixQuery(q: string) {
  const terms = q
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  return terms.length ? terms.map((t) => `${t}:*`).join(" & ") : null;
}

async function queryListings(where: SQL[], limit: number) {
  const rows = await getDb()
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      condition: listings.condition,
      meetupPoint: listings.meetupPoint,
      categorySlug: categories.slug,
      categoryName: categories.name,
      verifiedAt: profiles.verifiedAt,
      imagePath: sql<string | null>`(
        select li.path from listing_images li
        where li.listing_id = ${listings.id}
        order by li.position limit 1
      )`,
    })
    .from(listings)
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .innerJoin(profiles, eq(listings.sellerId, profiles.id))
    .where(
      and(eq(listings.status, "available"), isNull(profiles.blockedAt), ...where),
    )
    .orderBy(desc(listings.rankedAt))
    .limit(limit);

  return rows.map(
    ({ verifiedAt, imagePath, ...r }): ListingCardData => ({
      ...r,
      sellerVerified: Boolean(verifiedAt),
      imageUrl: imageUrl(imagePath),
    }),
  );
}

export async function getLatestListings(limit = 8): Promise<ListingResult> {
  await connection();
  if (isDemoMode() || !isDatabaseConfigured()) {
    const { items, sample } = offlineSource();
    return { items: items.slice(0, limit), sample };
  }
  return { items: await queryListings([], limit), sample: false };
}

export async function searchListings({
  q,
  category,
  limit = 24,
}: {
  q?: string;
  category?: string;
  limit?: number;
}): Promise<ListingResult> {
  await connection();
  const query = q ? toPrefixQuery(q) : null;

  if (isDemoMode() || !isDatabaseConfigured()) {
    const { items: all, sample } = offlineSource();
    const words = query ? query.replace(/:\*/g, "").split(" & ") : [];
    const items = all.filter(
      (l) =>
        (!category || l.categorySlug === category) &&
        words.every((w) => l.title.toLowerCase().includes(w)),
    );
    return { items, sample };
  }

  const where: SQL[] = [];
  if (category) where.push(eq(categories.slug, category));
  if (query) {
    where.push(
      sql`to_tsvector('simple', ${listings.title} || ' ' || ${listings.description}) @@ to_tsquery('simple', ${query})`,
    );
  }
  return { items: await queryListings(where, limit), sample: false };
}
