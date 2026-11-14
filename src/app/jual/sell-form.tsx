"use client";

import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { compressImage, ImageReadError, type CompressedImage } from "@/lib/compress-image";
import { CONDITION_LABEL } from "@/lib/format";
import {
  CONDITIONS,
  LISTING_IMAGE_BUCKET,
  LISTING_RULES,
  type FieldErrors,
  type ListingDraft,
  validateDraft,
} from "@/lib/listing-input";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "./actions";

type Photo = CompressedImage & { key: string; previewUrl: string };
type Category = { slug: string; name: string };

const MEETUP_SUGGESTIONS = [
  "Gerbang depan UMMI",
  "Perpustakaan UMMI",
  "Masjid kampus",
  "Kantin kampus",
];

const CONDITION_HINT: Record<(typeof CONDITIONS)[number], string> = {
  like_new: "Kayak baru, nggak ada minus.",
  used: "Ada bekas pakai yang wajar.",
  defect: "Ada yang rusak atau kurang.",
};

/** Urutan kolom = urutan di ringkasan error dan urutan fokus. */
const FIELD_ORDER = [
  "photos",
  "title",
  "category",
  "price",
  "condition",
  "conditionNote",
  "description",
  "meetupPoint",
  "whatsapp",
] as const;

const FIELD_LABEL: Record<(typeof FIELD_ORDER)[number], string> = {
  photos: "Foto",
  title: "Judul",
  category: "Kategori",
  price: "Harga",
  condition: "Kondisi",
  conditionNote: "Penjelasan kondisi",
  description: "Deskripsi",
  meetupPoint: "Titik temu",
  whatsapp: "Nomor WhatsApp",
};

const formatThousands = (digits: string) =>
  digits ? Number(digits).toLocaleString("id-ID") : "";

export function SellForm({
  userId,
  categories,
  defaultWhatsapp,
}: {
  userId: string;
  categories: Category[];
  defaultWhatsapp: string;
}) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const slugs = categories.map((c) => c.slug);

  const [draft, setDraft] = useState<ListingDraft>({
    title: "",
    category: "",
    price: "",
    condition: "",
    conditionNote: "",
    description: "",
    meetupPoint: "",
    whatsapp: defaultWhatsapp,
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [summary, setSummary] = useState<(typeof FIELD_ORDER)[number][]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const busy = stage !== null;

  const dirty =
    photos.length > 0 ||
    Object.entries(draft).some(([k, v]) => k !== "whatsapp" && v.trim() !== "");

  // Jangan sampai isian hilang karena ketutup nggak sengaja.
  useEffect(() => {
    if (!dirty || busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);

  // Bersihin URL preview biar memori nggak bocor.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)), []);

  function set<K extends keyof ListingDraft>(key: K, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
    // Selama ngetik cuma ngilangin error yang udah tampil, nggak nambah error baru.
    if (errors[key]) {
      const next = validateDraft({ ...draft, [key]: value }, slugs);
      if (!next[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  /** Cek satu kolom waktu ditinggalin. */
  function blur(key: keyof ListingDraft) {
    if (!draft[key].trim() && !errors[key]) return; // kolom kosong yang belum disentuh: diem dulu
    const next = validateDraft(draft, slugs);
    setErrors((e) => ({ ...e, [key]: next[key] }));
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = LISTING_RULES.photos.max - photos.length;
    const picked = Array.from(files).slice(0, room);
    setCompressing(true);
    const added: Photo[] = [];
    let problem: string | undefined;
    for (const file of picked) {
      try {
        const img = await compressImage(file);
        added.push({ ...img, key: crypto.randomUUID(), previewUrl: URL.createObjectURL(img.blob) });
      } catch (err) {
        problem = err instanceof ImageReadError ? err.message : `${file.name} gagal diproses.`;
      }
    }
    if (files.length > room) {
      problem = `Maksimal ${LISTING_RULES.photos.max} foto. Sisanya nggak dimasukin.`;
    }
    setPhotos((p) => [...p, ...added]);
    setErrors((e) => ({ ...e, photos: problem }));
    setCompressing(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removePhoto(key: string) {
    setPhotos((list) => {
      const gone = list.find((p) => p.key === key);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return list.filter((p) => p.key !== key);
    });
  }

  function makeCover(key: string) {
    setPhotos((list) => [...list.filter((p) => p.key === key), ...list.filter((p) => p.key !== key)]);
  }

  function showErrors(next: FieldErrors) {
    setErrors(next);
    const keys = FIELD_ORDER.filter((k) => next[k]);
    setSummary(keys);
    if (keys.length) requestAnimationFrame(() => summaryRef.current?.focus());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMessage(null);

    const next = validateDraft(draft, slugs);
    if (photos.length < LISTING_RULES.photos.min) next.photos = "Tambahin minimal 1 foto. Foto pertama jadi sampul.";
    if (Object.keys(next).some((k) => next[k as keyof FieldErrors])) {
      showErrors(next);
      return;
    }
    setSummary([]);

    const draftId = crypto.randomUUID();
    const uploaded: { path: string; width: number; height: number }[] = [];
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
      for (const [i, photo] of photos.entries()) {
        setStage(`Upload foto ${i + 1} dari ${photos.length}…`);
        const path = `${userId}/${draftId}/${i}.${photo.ext}`;
        const { error } = await supabase.storage
          .from(LISTING_IMAGE_BUCKET)
          .upload(path, photo.blob, { contentType: photo.blob.type, cacheControl: "31536000" });
        if (error) throw error;
        uploaded.push({ path, width: photo.width, height: photo.height });
      }
    } catch (err) {
      console.error(err);
      await cleanup(uploaded.map((u) => u.path));
      setStage(null);
      setMessage("Fotonya gagal di-upload. Cek koneksi kamu, terus coba lagi.");
      return;
    }

    setStage("Nyimpen barang…");
    startTransition(async () => {
      const result = await createListing({ draft, photos: uploaded });
      // Berhasil = server langsung pindahin ke halaman akun, nggak ada hasil yang dibalikin.
      // Foto cuma dihapus kalau server jelas-jelas nolak.
      if (!result || (!result.message && !result.errors)) return;
      await cleanup(uploaded.map((u) => u.path));
      setStage(null);
      if (result.message) setMessage(result.message);
      if (result.errors) showErrors(result.errors);
    });

    async function cleanup(paths: string[]) {
      if (supabase && paths.length) await supabase.storage.from(LISTING_IMAGE_BUCKET).remove(paths);
    }
  }

  // Ringkasan cuma nampilin error yang belum dibenerin; hilang sendiri kalau udah beres semua.
  const openSummary = summary.filter((k) => errors[k]);
  const invalid = (key: keyof FieldErrors) =>
    errors[key] ? { "aria-invalid": true, "aria-describedby": id(`${key}-error`) } : {};
  const needsNote = draft.condition === "used" || draft.condition === "defect";
  const input =
    "w-full rounded-sm border border-garis-tegas bg-kertas-terang px-3 py-2.5 text-[15px] placeholder:text-tinta-pudar/70 focus:border-tinta focus:outline-2 focus:outline-offset-1 focus:outline-denim aria-[invalid=true]:border-galat";

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-7">
      {openSummary.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-galat/40 bg-galat/5 p-4 focus:outline-2 focus:outline-galat"
        >
          <p className="font-bold text-galat">Ada {openSummary.length} isian yang perlu dibenerin:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {openSummary.map((k) => (
              <li key={k}>
                <a href={`#${id(k)}`} className="underline">
                  {FIELD_LABEL[k]}
                </a>
                : {errors[k]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Foto */}
      <fieldset aria-describedby={id("photos-help")}>
        <legend className="font-bold">Foto barang</legend>
        <p id={id("photos-help")} className="mt-0.5 text-sm text-tinta-pudar">
          1–{LISTING_RULES.photos.max} foto asli. Foto pertama jadi sampul. Kalau ada minus, fotoin juga.
        </p>
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((p, i) => (
            <li key={p.key} className="group relative aspect-square overflow-hidden rounded-md border border-garis bg-kardus">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview lokal dari blob */}
              <img src={p.previewUrl} alt={`Foto ${i + 1}`} className="size-full object-cover" />
              {i === 0 ? (
                <span className="absolute bottom-1 left-1 rounded-full bg-tinta px-2 py-0.5 text-[11px] font-bold text-kertas-terang">
                  sampul
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(p.key)}
                  disabled={busy}
                  className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-kertas-terang/90 px-2 py-0.5 text-[11px] font-bold"
                >
                  <Star aria-hidden className="size-3" /> jadiin sampul
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(p.key)}
                disabled={busy}
                aria-label={`Hapus foto ${i + 1}`}
                className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-tinta/80 text-kertas-terang hover:bg-tinta"
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
          {photos.length < LISTING_RULES.photos.max ? (
            <li>
              <button
                id={id("photos")}
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busy || compressing}
                aria-describedby={errors.photos ? id("photos-error") : undefined}
                className={`grid aspect-square w-full place-items-center rounded-md border-2 border-dashed text-tinta-pudar hover:border-tinta hover:text-tinta ${errors.photos ? "border-galat" : "border-garis-tegas"}`}
              >
                <span className="flex flex-col items-center gap-1 text-sm font-bold">
                  {compressing ? (
                    <Loader2 aria-hidden className="size-6 animate-spin" />
                  ) : (
                    <ImagePlus aria-hidden className="size-6" />
                  )}
                  {compressing ? "Ngolah…" : "Tambah foto"}
                </span>
              </button>
            </li>
          ) : null}
        </ul>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => addFiles(e.target.files)}
        />
        <FieldError id={id("photos-error")} text={errors.photos} />
      </fieldset>

      {/* Judul */}
      <Field label="Judul" htmlFor={id("title")} error={errors.title} errorId={id("title-error")}>
        <input
          id={id("title")}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          onBlur={() => blur("title")}
          maxLength={LISTING_RULES.title.max}
          placeholder="Misalnya: Kalkulator Casio fx-991ID Plus"
          className={input}
          {...invalid("title")}
        />
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Kategori" htmlFor={id("category")} error={errors.category} errorId={id("category-error")}>
          <select
            id={id("category")}
            value={draft.category}
            onChange={(e) => {
              set("category", e.target.value);
              setErrors((x) => ({ ...x, category: undefined }));
            }}
            className={input}
            {...invalid("category")}
          >
            <option value="" disabled>
              Pilih kategori
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Harga" htmlFor={id("price")} error={errors.price} errorId={id("price-error")}>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-bold text-tinta-pudar">
              Rp
            </span>
            <input
              id={id("price")}
              inputMode="numeric"
              value={formatThousands(draft.price)}
              onChange={(e) => set("price", e.target.value.replace(/\D/g, "").slice(0, 9))}
              onBlur={() => blur("price")}
              placeholder="85.000"
              className={`${input} pl-10`}
              {...invalid("price")}
            />
          </div>
        </Field>
      </div>

      {/* Kondisi */}
      <fieldset aria-describedby={errors.condition ? id("condition-error") : undefined}>
        <legend id={id("condition")} className="font-bold">
          Kondisi
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {CONDITIONS.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer gap-3 rounded-md border border-garis-tegas bg-kertas-terang p-3 has-checked:border-tinta has-checked:bg-kardus/60 has-focus-visible:outline-2 has-focus-visible:outline-denim"
            >
              <input
                type="radio"
                name="condition"
                value={c}
                checked={draft.condition === c}
                onChange={() => {
                  set("condition", c);
                  setErrors((x) => ({ ...x, condition: undefined, conditionNote: undefined }));
                }}
                className="mt-1 accent-tinta"
              />
              <span>
                <span className="block font-bold">{CONDITION_LABEL[c]}</span>
                <span className="block text-sm text-tinta-pudar">{CONDITION_HINT[c]}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id={id("condition-error")} text={errors.condition} />
      </fieldset>

      {needsNote ? (
        <Field
          label={draft.condition === "defect" ? "Apa yang rusak atau kurang?" : "Minusnya apa aja?"}
          htmlFor={id("conditionNote")}
          error={errors.conditionNote}
          errorId={id("conditionNote-error")}
        >
          <textarea
            id={id("conditionNote")}
            value={draft.conditionNote}
            onChange={(e) => set("conditionNote", e.target.value)}
            onBlur={() => blur("conditionNote")}
            rows={2}
            maxLength={LISTING_RULES.conditionNote.max}
            placeholder="Misalnya: ada goresan halus di layar, tombol ON agak keras."
            className={input}
            {...invalid("conditionNote")}
          />
        </Field>
      ) : null}

      <Field
        label="Deskripsi"
        htmlFor={id("description")}
        error={errors.description}
        errorId={id("description-error")}
        hint={`${draft.description.trim().length}/${LISTING_RULES.description.max}`}
      >
        <textarea
          id={id("description")}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          onBlur={() => blur("description")}
          rows={5}
          maxLength={LISTING_RULES.description.max}
          placeholder="Ceritain barangnya: udah dipakai berapa lama, kelengkapannya apa aja, kenapa dijual."
          className={input}
          {...invalid("description")}
        />
      </Field>

      <Field
        label="Titik temu COD"
        htmlFor={id("meetupPoint")}
        error={errors.meetupPoint}
        errorId={id("meetupPoint-error")}
      >
        <input
          id={id("meetupPoint")}
          value={draft.meetupPoint}
          onChange={(e) => set("meetupPoint", e.target.value)}
          onBlur={() => blur("meetupPoint")}
          list={id("meetup-list")}
          maxLength={LISTING_RULES.meetupPoint.max}
          placeholder="Misalnya: Gerbang depan UMMI"
          className={input}
          {...invalid("meetupPoint")}
        />
        <datalist id={id("meetup-list")}>
          {MEETUP_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <Field
        label="Nomor WhatsApp"
        htmlFor={id("whatsapp")}
        error={errors.whatsapp}
        errorId={id("whatsapp-error")}
        help="Pembeli yang udah login bisa langsung chat kamu lewat tombol WhatsApp. Nomor ini disimpan buat barang-barangmu berikutnya."
        helpId={id("whatsapp-help")}
      >
        <input
          id={id("whatsapp")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={draft.whatsapp}
          onChange={(e) => set("whatsapp", e.target.value)}
          onBlur={() => blur("whatsapp")}
          placeholder="0812-3456-7890"
          className={input}
          aria-describedby={[id("whatsapp-help"), errors.whatsapp ? id("whatsapp-error") : ""].join(" ").trim()}
          aria-invalid={errors.whatsapp ? true : undefined}
        />
      </Field>

      <div className="space-y-3 border-t border-garis pt-6">
        {message ? (
          <p role="alert" className="rounded-md border border-galat/40 bg-galat/5 p-3 text-sm font-bold text-galat">
            {message}
          </p>
        ) : null}
        <p className="text-sm text-tinta-pudar">
          Dengan masang barang ini, kamu mastiin barangnya bukan barang terlarang: obat-obatan,
          jasa joki tugas, akun digital, atau barang ilegal.
        </p>
        <button
          type="submit"
          aria-disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-tinta px-5 py-3 font-bold text-kertas-terang hover:bg-tinta/90 aria-disabled:cursor-wait aria-disabled:opacity-80 sm:w-auto"
        >
          {busy ? <Loader2 aria-hidden className="size-4.5 animate-spin" /> : null}
          {stage ?? "Pasang barang"}
        </button>
        <p aria-live="polite" className="sr-only">
          {stage ?? ""}
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  errorId,
  hint,
  help,
  helpId,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  hint?: string;
  help?: string;
  helpId?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="font-bold">
          {label}
        </label>
        {hint ? <span className="text-xs text-tinta-pudar tabular-nums">{hint}</span> : null}
      </div>
      {help ? (
        <p id={helpId} className="mt-0.5 text-sm text-tinta-pudar">
          {help}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      <FieldError id={errorId} text={error} />
    </div>
  );
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-bold text-galat">
      {text}
    </p>
  );
}
