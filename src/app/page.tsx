import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Flag,
  Handshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/category-icon";
import {
  ListingGrid,
  ListingGridSkeleton,
  SampleNotice,
} from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LISTING_LIMIT } from "@/lib/campus";
import { CATEGORIES } from "@/lib/categories";
import { getLatestListings } from "@/lib/listings";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Categories />
        <LatestListings />
        <HowItWorks />
        <Safety />
        <SellCta />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden border-b border-garis">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div>
          <h1 className="font-display text-5xl leading-[1.02] font-medium tracking-tight sm:text-6xl">
            Barangmu masih ada umurnya<span className="text-stiker">.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-7 text-tinta-pudar">
            Jual-beli barang bekas dengan rasa kampus. Cari kebutuhan kuliah dan
            kos yang murah, atau lungsurin barang yang udah nggak kepakai.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cari"
              className="inline-flex items-center gap-2 rounded-sm bg-tinta px-5 py-3 font-bold text-kertas-terang hover:bg-tinta/90"
            >
              Mulai cari barang <ArrowRight aria-hidden className="size-4.5" />
            </Link>
            <Link
              href="/jual"
              className="rounded-sm border border-garis-tegas px-5 py-3 font-bold hover:bg-kardus"
            >
              Lungsurin barang
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 text-sm font-bold sm:grid-cols-3">
            {[
              { icon: Handshake, text: "Gratis pasang barang" },
              { icon: MessageCircle, text: "Chat di aplikasi, nomor aman" },
              { icon: MapPin, text: "COD di titik temu kampus" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon aria-hidden className="size-5 shrink-0 text-stiker-tua" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <HeroArt />
      </div>
    </section>
  );
}

/** Komposisi kotak kardus + stiker, turunan dari cover design system. */
function HeroArt() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[5/4] w-full max-w-md md:max-w-none">
      <div className="absolute top-[6%] left-[4%] h-[62%] w-[42%] rounded-md bg-kardus" />
      <div className="absolute top-[28%] left-[36%] h-[56%] w-[40%] rounded-md bg-stiker" />
      <div className="absolute top-[50%] left-[66%] h-[50%] w-[38%] rounded-md bg-tinta" />
      {[
        ["10%", "2%"],
        ["16%", "2%"],
        ["31%", "22%"],
        ["38%", "22%"],
        ["70%", "44%"],
        ["76%", "44%"],
        ["82%", "44%"],
      ].map(([left, top], i) => (
        <span
          key={i}
          className={`absolute size-[5%] rounded-full ${i >= 2 && i <= 3 ? "bg-tinta" : "bg-stiker"}`}
          style={{ left, top }}
        />
      ))}
      <div className="absolute top-[56%] left-[6%] grid aspect-square w-[34%] -rotate-12 place-items-center rounded-full bg-stiker p-3 text-center font-display text-[clamp(14px,2.2vw,22px)] leading-tight text-tinta italic shadow-[0_2px_0_rgba(31,27,22,0.15)]">
        dari tangan ke tangan.
      </div>
      <div className="absolute top-[8%] right-[2%] flex items-center gap-1.5 rounded-full bg-denim-muda px-3 py-1.5 text-[13px] font-bold text-denim">
        <BadgeCheck className="size-4" /> terverifikasi kampus
      </div>
    </div>
  );
}

function Categories() {
  return (
    <section aria-labelledby="judul-kategori" className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading id="judul-kategori" title="Cari per kategori" href="/cari" />
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/cari?kategori=${c.slug}`}
              className="flex items-center gap-3 rounded-md border border-garis bg-kertas-terang p-4 font-bold hover:border-garis-tegas hover:bg-kardus/50"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-kardus">
                <CategoryIcon slug={c.slug} className="size-5" />
              </span>
              <span className="text-[15px] leading-5">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LatestListings() {
  return (
    <section aria-labelledby="judul-terbaru" className="mx-auto max-w-6xl px-4 pb-12">
      <SectionHeading id="judul-terbaru" title="Barang terbaru" href="/cari" />
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

function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: "Pasang barangnya",
      body: "Foto barangnya, tulis kondisinya jujur, terus pilih titik temu di kampus.",
    },
    {
      icon: MessageCircle,
      title: "Ngobrol lewat chat",
      body: "Pembeli nanya dan nego lewat chat di lungsur. Nomor WA kamu nggak dipajang.",
    },
    {
      icon: MapPin,
      title: "Ketemu, COD, beres",
      body: "Ketemuan di titik temu, cek barangnya, bayar di tempat. Tandai barangnya udah pindah tangan.",
    },
  ];
  return (
    <section id="cara-kerja" className="scroll-mt-32 border-y border-garis bg-kertas-terang">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-3xl leading-[38px] font-medium sm:text-4xl">
          Cara kerjanya
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-stiker font-display text-lg font-medium text-tinta">
                {i + 1}
              </span>
              <div>
                <h3 className="flex items-center gap-2 text-xl leading-7 font-bold">
                  {title}
                  <Icon aria-hidden className="size-5 text-tinta-pudar" />
                </h3>
                <p className="mt-1 text-tinta-pudar">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Safety() {
  const points = [
    {
      icon: BadgeCheck,
      title: "Badge terverifikasi kampus",
      body: `Penjual yang login pakai email .ac.id dapet badge, plus ${LISTING_LIMIT.verified} slot listing dan naikkan listing gratis.`,
    },
    {
      icon: ShieldCheck,
      title: "Jujur soal kondisi",
      body: "Tiap barang ditandai mulus, minus pemakaian, atau ada cacat. Kalau ada minus, wajib dijelasin dan difoto.",
    },
    {
      icon: Flag,
      title: "Bisa dilaporin",
      body: "Barang terlarang, kayak obat-obatan, jasa joki tugas, akun digital, atau barang ilegal, bakal diturunin dan akunnya bisa diblokir.",
    },
  ];
  return (
    <section id="aman" aria-labelledby="judul-aman" className="scroll-mt-32 mx-auto max-w-6xl px-4 py-14">
      <h2 id="judul-aman" className="font-display text-3xl leading-[38px] font-medium sm:text-4xl">
        Aman, karena kenal
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {points.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-md border border-garis bg-kertas-terang p-5">
            <Icon aria-hidden className="size-6 text-denim" />
            <h3 className="mt-3 text-xl leading-7 font-bold">{title}</h3>
            <p className="mt-2 text-tinta-pudar">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SellCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="flex flex-col items-start gap-6 rounded-md bg-stiker px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <h2 className="font-display text-3xl leading-[38px] font-medium text-tinta sm:text-4xl">
            Punya barang nganggur?
          </h2>
          <p className="mt-2 max-w-md text-tinta">
            Daripada numpuk di kosan, lungsurin aja. Pasangnya gratis, ketemunya di kampus.
          </p>
        </div>
        <Link
          href="/jual"
          className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-tinta px-5 py-3 font-bold text-kertas-terang hover:bg-tinta/90"
        >
          Lungsurin barang <ArrowRight aria-hidden className="size-4.5" />
        </Link>
      </div>
    </section>
  );
}

function SectionHeading({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="font-display text-3xl leading-[38px] font-medium">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-stiker-tua hover:underline"
      >
        Lihat semua <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
