import { Camera, Flag, MapPin, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CampusBadge } from "@/components/campus-badge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireProfile } from "@/lib/auth";
import { listingLimitFor } from "@/lib/campus";

export const metadata: Metadata = { title: "Lungsurin barang" };

export default function SellPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="font-display text-4xl leading-tight font-medium">
          Lungsurin barang<span className="text-stiker">.</span>
        </h1>
        <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-md bg-kardus" />}>
          <SellPanel />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function SellPanel() {
  const profile = await requireProfile("/jual");
  const limit = listingLimitFor(profile);

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-md border border-dashed border-garis-tegas p-5">
        <p className="font-bold">Form pasang barang lagi dibikin.</p>
        <p className="mt-1 text-tinta-pudar">
          Kamu bisa pasang sampai {limit} barang sekaligus.
          {profile.verifiedAt ? null : " Login pakai email .ac.id buat dapet 20 slot."}
        </p>
        {profile.verifiedAt ? (
          <div className="mt-3">
            <CampusBadge domain={profile.campusDomain} />
          </div>
        ) : null}
      </div>

      <section>
        <h2 className="text-xl leading-7 font-bold">Yang perlu disiapin</h2>
        <ul className="mt-3 space-y-3">
          {[
            { icon: Camera, text: "Foto asli barangnya, maksimal 5. Kalau ada minus, fotoin juga." },
            { icon: Tag, text: "Harga, kondisi (mulus, minus pemakaian, atau ada cacat), sama deskripsi singkat." },
            { icon: MapPin, text: "Titik temu COD, misalnya gerbang depan atau perpustakaan kampus." },
            { icon: Flag, text: "Bukan barang terlarang: obat-obatan, jasa joki tugas, akun digital, atau barang ilegal." },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3">
              <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-stiker-tua" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/akun" className="inline-block font-bold text-stiker-tua hover:underline">
        Lihat akun kamu
      </Link>
    </div>
  );
}
