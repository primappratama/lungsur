/**
 * Aturan isian form jual. Dipakai di browser (biar error langsung kelihatan)
 * dan di server (yang beneran nentuin). Jangan import apa pun yang server-only.
 */

export const LISTING_RULES = {
  title: { min: 5, max: 80 },
  description: { min: 10, max: 2000 },
  conditionNote: { min: 5, max: 300 },
  meetupPoint: { min: 3, max: 80 },
  price: { min: 1_000, max: 100_000_000 },
  photos: { min: 1, max: 5 },
} as const;

export const CONDITIONS = ["like_new", "used", "defect"] as const;
export type ConditionValue = (typeof CONDITIONS)[number];

export const LISTING_IMAGE_BUCKET = "listing-images";

/** "Rp 85.000", "85000", "85.000" → 85000. Selain angka dibuang. */
export function parsePrice(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * Nomor WA Indonesia ke format 628xxxx (yang dipakai link wa.me).
 * Terima 0812..., 812..., 62812..., +62 812-...; selain itu null.
 */
export function normalizeWhatsapp(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return /^628\d{7,11}$/.test(digits) ? digits : null;
}

/** 6281234567890 → 0812-3456-7890, buat ditampilin di form. */
export function formatWhatsapp(normalized: string): string {
  const local = `0${normalized.slice(2)}`;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}

/**
 * Path foto di Storage: <user id>/<draft id>/<urutan>.<webp|jpg>.
 * Folder pertama wajib id pemiliknya, sama kayak policy Storage-nya.
 */
export function isOwnImagePath(path: string, userId: string): boolean {
  const pattern = new RegExp(
    `^${userId}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-4]\\.(webp|jpg)$`,
  );
  return pattern.test(path);
}

export type ListingDraft = {
  title: string;
  category: string;
  price: string;
  condition: string;
  conditionNote: string;
  description: string;
  meetupPoint: string;
  whatsapp: string;
};

export type FieldErrors = Partial<Record<keyof ListingDraft | "photos", string>>;

/** Cek isian teks. Foto dicek terpisah karena bentuknya beda di browser dan server. */
export function validateDraft(
  draft: ListingDraft,
  categorySlugs: readonly string[],
): FieldErrors {
  const errors: FieldErrors = {};
  const r = LISTING_RULES;
  const len = (s: string) => s.trim().length;

  if (len(draft.title) < r.title.min) errors.title = `Judul minimal ${r.title.min} huruf.`;
  else if (len(draft.title) > r.title.max) errors.title = `Judul maksimal ${r.title.max} huruf.`;

  if (!categorySlugs.includes(draft.category)) errors.category = "Pilih kategorinya.";

  const price = parsePrice(draft.price);
  if (price === null) errors.price = "Isi harganya.";
  else if (price < r.price.min) errors.price = "Harga minimal Rp 1.000.";
  else if (price > r.price.max) errors.price = "Harga maksimal Rp 100.000.000.";

  if (!CONDITIONS.includes(draft.condition as ConditionValue)) {
    errors.condition = "Pilih kondisinya.";
  } else if (draft.condition !== "like_new") {
    if (len(draft.conditionNote) < r.conditionNote.min) {
      errors.conditionNote = "Jelasin minus atau cacatnya, biar pembeli nggak kaget.";
    } else if (len(draft.conditionNote) > r.conditionNote.max) {
      errors.conditionNote = `Maksimal ${r.conditionNote.max} huruf.`;
    }
  }

  if (len(draft.description) < r.description.min) {
    errors.description = `Deskripsi minimal ${r.description.min} huruf.`;
  } else if (len(draft.description) > r.description.max) {
    errors.description = `Deskripsi maksimal ${r.description.max} huruf.`;
  }

  if (len(draft.meetupPoint) < r.meetupPoint.min) errors.meetupPoint = "Isi titik temunya.";
  else if (len(draft.meetupPoint) > r.meetupPoint.max) {
    errors.meetupPoint = `Maksimal ${r.meetupPoint.max} huruf.`;
  }

  if (!normalizeWhatsapp(draft.whatsapp)) {
    errors.whatsapp = "Nomor WA-nya belum bener. Contoh: 0812-3456-7890.";
  }

  return errors;
}
