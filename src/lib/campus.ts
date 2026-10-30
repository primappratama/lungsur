/** Kuota listing aktif. Mahasiswa terverifikasi dapet slot lebih banyak. */
export const LISTING_LIMIT = { basic: 5, verified: 20 } as const;

/**
 * Domain kampus yang diterima buat badge "terverifikasi kampus".
 * Semua domain .ac.id (kampus di Indonesia), termasuk subdomain
 * seperti student.kampus.ac.id. Dosen dan staf ikut lolos, makanya
 * label badge-nya "terverifikasi kampus", bukan "mahasiswa".
 */
export function campusDomainOf(email: string | null | undefined): string | null {
  if (!email) return null;
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain || !domain.endsWith(".ac.id")) return null;
  return domain;
}

export function listingLimitFor(profile: { verifiedAt: Date | null }) {
  return profile.verifiedAt ? LISTING_LIMIT.verified : LISTING_LIMIT.basic;
}
