/**
 * Kecilin foto di browser sebelum di-upload: sisi terpanjang maksimal 1600px,
 * WebP kualitas 0,82. Foto HP 4–8 MB biasanya jadi 150–400 KB.
 * Browser yang belum bisa bikin WebP (Safari lama) dapet JPEG.
 */

const MAX_SIDE = 1600;
const QUALITY = 0.82;

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  /** "webp" atau "jpg", buat nama file di Storage. */
  ext: "webp" | "jpg";
};

export class ImageReadError extends Error {}

export async function compressImage(file: File): Promise<CompressedImage> {
  let bitmap: ImageBitmap;
  try {
    // Rotasi dari EXIF ikut dipakai, jadi foto portrait dari HP nggak miring.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageReadError(
      `${file.name} nggak bisa dibuka. Coba pakai foto JPG atau PNG.`,
    );
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageReadError("Browser kamu nggak bisa ngolah foto.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await toBlob(canvas, "image/webp");
  if (webp && webp.type === "image/webp") return { blob: webp, width, height, ext: "webp" };

  const jpeg = await toBlob(canvas, "image/jpeg");
  if (!jpeg) throw new ImageReadError(`${file.name} gagal dikompres.`);
  return { blob: jpeg, width, height, ext: "jpg" };
}

function toBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
}
