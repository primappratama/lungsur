import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CATEGORIES } from "@/lib/categories";
import { LISTING_LIMIT } from "@/lib/campus";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <section className="py-16 sm:py-24">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-kardus px-3 py-1 text-[13px] leading-4 font-bold">
            <span aria-hidden className="size-2 rounded-full bg-stiker" />
            lagi dibangun, beta tertutup segera
          </p>
          <h1 className="max-w-2xl font-display text-5xl leading-[1.05] font-medium tracking-tight sm:text-6xl">
            Barangmu masih ada umurnya
            <span className="text-stiker">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-tinta-pudar">
            lungsur. tempat jual-beli barang bekas dengan rasa kampus. Siapa aja
            bisa lihat-lihat, penjual mahasiswa dapet badge terverifikasi, dan
            COD-nya di titik temu kampus.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/masuk"
              className="rounded-sm bg-tinta px-5 py-3 font-bold text-kertas-terang hover:bg-tinta/90"
            >
              Masuk pakai Google
            </Link>
            <a
              href="#kategori"
              className="rounded-sm border border-garis-tegas px-5 py-3 font-bold hover:bg-kardus"
            >
              Lihat kategori
            </a>
          </div>
        </section>

        <section
          aria-labelledby="cara-kerja"
          className="grid gap-4 border-t border-garis py-12 sm:grid-cols-3"
        >
          <h2 id="cara-kerja" className="sr-only">
            Cara kerja
          </h2>
          {[
            {
              title: "Jujur soal kondisi",
              body: "Tiap barang ditandai mulus, minus pemakaian, atau ada cacat, lengkap sama fotonya.",
            },
            {
              title: "Chat dulu, COD di kampus",
              body: "Nego lewat chat di aplikasi. Nomor WA kamu nggak dipajang.",
            },
            {
              title: "Badge terverifikasi kampus",
              body: `Masuk pakai email .ac.id, langsung dapet badge dan ${LISTING_LIMIT.verified} slot listing.`,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-md border border-garis bg-kertas-terang p-5"
            >
              <h3 className="text-xl leading-7 font-bold">{item.title}</h3>
              <p className="mt-2 text-tinta-pudar">{item.body}</p>
            </div>
          ))}
        </section>

        <section
          id="kategori"
          aria-labelledby="judul-kategori"
          className="border-t border-garis py-12"
        >
          <h2
            id="judul-kategori"
            className="font-display text-3xl leading-[38px] font-medium"
          >
            Kategori
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <li
                key={c.slug}
                className="rounded-full bg-kardus px-4 py-2 text-sm font-bold"
              >
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
