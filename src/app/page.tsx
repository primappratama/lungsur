import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  ListingGrid,
  ListingGridSkeleton,
  SampleNotice,
} from "@/components/listing-card";
import { SearchForm } from "@/components/search-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LISTING_LIMIT } from "@/lib/campus";
import { getLatestListings } from "@/lib/listings";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <LatestListings />
        <HowItWorks />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden border-b border-garis">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-8 md:grid-cols-[1.4fr_1fr] md:py-14">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] font-medium tracking-tight sm:text-5xl lg:text-6xl">
            Barangmu masih ada umurnya<span className="text-stiker">.</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-7 text-tinta-pudar">
            Jual-beli barang bekas dengan rasa kampus. Pasangnya gratis, COD di
            titik temu.
          </p>
          {/* Di HP kolom cari header disembunyiin, jadi taruh di sini. */}
          <SearchForm inputId="cari-hero" className="mt-6 md:hidden" />
          <Link
            href="/jual"
            className="mt-4 inline-flex items-center gap-2 rounded-sm bg-tinta px-5 py-3 font-bold text-kertas-terang hover:bg-tinta/90 md:mt-7"
          >
            <Plus aria-hidden className="size-4.5" strokeWidth={2.25} />
            Lungsurin barang
          </Link>
        </div>
        <HeroArt />
      </div>
    </section>
  );
}

/** Satu kardus + satu stiker. Cuma tampil di layar lebar. */
function HeroArt() {
  return (
    <div aria-hidden className="relative hidden aspect-[6/5] w-full max-w-sm justify-self-end md:block">
      <div className="absolute inset-y-[4%] left-0 w-[78%] rounded-md bg-kardus" />
      <span className="absolute top-[12%] left-[10%] size-[7%] rounded-full bg-tinta" />
      <span className="absolute top-[12%] left-[21%] size-[7%] rounded-full bg-tinta" />
      <div className="absolute right-0 bottom-0 grid aspect-square w-[46%] -rotate-12 place-items-center rounded-full bg-stiker p-4 text-center font-display text-[22px] leading-tight text-tinta italic shadow-[0_2px_0_rgba(31,27,22,0.15)]">
        dari tangan ke tangan.
      </div>
    </div>
  );
}

function LatestListings() {
  return (
    <section aria-labelledby="judul-terbaru" className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <h2 id="judul-terbaru" className="font-display text-3xl leading-[38px] font-medium">
          Barang terbaru
        </h2>
        <Link
          href="/cari"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-stiker-tua hover:underline"
        >
          Lihat semua <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
      <div className="mt-6">
        <Suspense fallback={<ListingGridSkeleton />}>
          <LatestListingsGrid />
        </Suspense>
      </div>
    </section>
  );
}

async function LatestListingsGrid() {
  const { items, sample } = await getLatestListings(8);
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-garis-tegas px-6 py-12 text-center">
        <p className="font-display text-2xl">Belum ada barang di sini.</p>
        <p className="mt-2 text-tinta-pudar">Jadi yang pertama ngelungsurin.</p>
        <Link
          href="/jual"
          className="mt-5 inline-block rounded-sm bg-tinta px-5 py-3 font-bold text-kertas-terang"
        >
          Lungsurin barang
        </Link>
      </div>
    );
  }
  return (
    <>
      {sample ? <SampleNotice /> : null}
      <ListingGrid items={items} sample={sample} />
    </>
  );
}

/** Cara kerja + aturan main jadi satu section, biar pesannya nggak diulang. */
function HowItWorks() {
  const steps = [
    {
      title: "Pasang barangnya",
      body: "Foto, tulis kondisinya jujur (mulus, minus pemakaian, atau ada cacat), terus pilih titik temu di kampus.",
    },
    {
      title: "Ngobrol lewat chat",
      body: `Nego lewat chat lungsur, nomor WA kamu nggak dipajang. Login pakai email .ac.id dapet badge terverifikasi, ${LISTING_LIMIT.verified} slot listing, dan naikin listing gratis.`,
    },
    {
      title: "Ketemu, COD, beres",
      body: "Cek barangnya di titik temu, bayar di tempat, terus tandai barangnya udah pindah tangan.",
    },
  ];
  return (
    <section
      id="cara-kerja"
      aria-labelledby="judul-cara-kerja"
      className="scroll-mt-28 border-t border-garis bg-kertas-terang"
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 id="judul-cara-kerja" className="font-display text-3xl leading-[38px] font-medium">
          Cara kerjanya
        </h2>
        <ol className="mt-7 grid gap-7 sm:grid-cols-3">
          {steps.map(({ title, body }, i) => (
            <li key={title}>
              <span className="font-display text-2xl font-medium text-stiker-tua">{i + 1}.</span>
              <h3 className="mt-1 text-lg leading-6 font-bold">{title}</h3>
              <p className="mt-1.5 text-tinta-pudar">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-5 border-t border-garis pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p id="aman" className="max-w-2xl scroll-mt-28 text-sm leading-6 text-tinta-pudar">
            <strong className="text-tinta">Nggak boleh dijual:</strong> obat-obatan, jasa
            joki tugas, akun digital, dan barang ilegal. Barang begini bakal diturunin dan
            akunnya bisa diblokir. Lihat yang aneh? Laporin aja.
          </p>
          <Link
            href="/jual"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-sm border border-garis-tegas px-5 py-3 font-bold hover:bg-kardus"
          >
            Lungsurin barang <ArrowRight aria-hidden className="size-4.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
