"use server";

import { and, count, eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { categories, listingImages, listings, profiles } from "@/db/schema";
import { getActionProfile } from "@/lib/auth";
import { listingLimitFor } from "@/lib/campus";
import { CATEGORIES } from "@/lib/categories";
import {
  LISTING_IMAGE_BUCKET,
  LISTING_RULES,
  type FieldErrors,
  type ListingDraft,
  isOwnImagePath,
  normalizeWhatsapp,
  parsePrice,
  validateDraft,
} from "@/lib/listing-input";

export type UploadedPhoto = { path: string; width: number; height: number };

export type CreateListingResult = {
  errors?: FieldErrors;
  /** Pesan buat seluruh form, misalnya kuota penuh atau sesi habis. */
  message?: string;
};

const SLUGS = CATEGORIES.map((c) => c.slug);
const tidy = (s: string) => s.trim().replace(/[ \t]+/g, " ");

/**
 * Simpan barang baru. Foto udah di-upload langsung dari browser ke Storage;
 * di sini cuma dicek: path-nya milik user ini dan filenya beneran ada.
 * Kalau berhasil, langsung pindah ke halaman akun.
 */
export async function createListing(input: {
  draft: ListingDraft;
  photos: UploadedPhoto[];
}): Promise<CreateListingResult> {
  const profile = await getActionProfile();
  if (!profile) return { message: "Sesi kamu habis. Masuk lagi, terus coba pasang ulang." };
  if (profile.blockedAt) return { message: "Akun kamu diblokir, jadi nggak bisa pasang barang." };

  const { draft, photos } = input;
  const errors = validateDraft(draft, SLUGS);

  const { min, max } = LISTING_RULES.photos;
  if (photos.length < min) errors.photos = "Tambahin minimal 1 foto.";
  else if (photos.length > max) errors.photos = `Maksimal ${max} foto.`;
  else if (!photos.every((p) => isOwnImagePath(p.path, profile.id))) {
    errors.photos = "Fotonya nggak valid. Coba upload ulang.";
  }
  if (Object.keys(errors).length > 0) return { errors };

  const price = parsePrice(draft.price)!;
  const whatsapp = normalizeWhatsapp(draft.whatsapp)!;
  const limit = listingLimitFor(profile);
  const paths = photos.map((p) => p.path);

  let outcome: CreateListingResult | null = null;
  try {
    outcome = await getDb().transaction(async (tx) => {
      // Kunci baris profil biar dua tab yang submit barengan nggak bisa nembus kuota.
      await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, profile.id)).for("update");

      const [{ active }] = await tx
        .select({ active: count() })
        .from(listings)
        .where(and(eq(listings.sellerId, profile.id), inArray(listings.status, ["available", "reserved"])));
      if (active >= limit) {
        return {
          message: profile.verifiedAt
            ? `Slot kamu udah penuh (${limit} barang aktif). Tandai yang udah laku dulu.`
            : `Slot kamu udah penuh (${limit} barang aktif). Masuk pakai email .ac.id buat dapet 20 slot.`,
        };
      }

      const [category] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, draft.category))
        .limit(1);
      if (!category) return { errors: { category: "Kategorinya nggak ketemu." } };

      const stored = await tx.execute<{ name: string }>(
        sql`select name from storage.objects where bucket_id = ${LISTING_IMAGE_BUCKET} and name in ${paths}`,
      );
      if (stored.length !== paths.length) {
        return { errors: { photos: "Ada foto yang belum ke-upload. Coba pasang ulang." } };
      }

      const [listing] = await tx
        .insert(listings)
        .values({
          sellerId: profile.id,
          categoryId: category.id,
          title: tidy(draft.title),
          description: draft.description.trim(),
          price,
          condition: draft.condition as "like_new" | "used" | "defect",
          conditionNote: draft.condition === "like_new" ? null : draft.conditionNote.trim(),
          meetupPoint: tidy(draft.meetupPoint),
        })
        .returning({ id: listings.id });

      await tx.insert(listingImages).values(
        photos.map((p, position) => ({
          listingId: listing.id,
          path: p.path,
          position,
          width: p.width,
          height: p.height,
        })),
      );

      if (profile.whatsapp !== whatsapp) {
        await tx.update(profiles).set({ whatsapp }).where(eq(profiles.id, profile.id));
      }
      return null;
    });
  } catch (error) {
    console.error("createListing gagal", error);
    return { message: "Barangnya gagal disimpan. Coba lagi sebentar." };
  }

  if (outcome) return outcome;
  redirect("/akun?baru=1");
}
