import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { and, count, eq, inArray } from "drizzle-orm";
import { Suspense } from "react";
import { CampusBadge } from "@/components/campus-badge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import { listingLimitFor } from "@/lib/campus";
import { formatRupiah } from "@/lib/format";
import { getMyListings, type MyListing } from "@/lib/listings";

export const metadata: Metadata = { title: "Akun kamu" };

export default function AccountPage({ searchParams }: PageProps<"/akun">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="font-display text-3xl leading-[38px] font-medium">
          Akun kamu
        </h1>
        <Suspense fallback={<AccountSkeleton />}>
          <AccountPanel searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function AccountPanel({
  searchParams,
}: {
  searchParams: PageProps<"/akun">["searchParams"];
}) {
  const profile = await requireProfile("/akun");
  const justPosted = (await searchParams).baru === "1";
  const mine = await getMyListings(profile.id);
  const [{ active }] = await getDb()
    .select({ active: count() })
    .from(listings)
    .where(
      and(
        eq(listings.sellerId, profile.id),
        inArray(listings.status, ["available", "reserved"]),
      ),
    );
  const limit = listingLimitFor(profile);

  return (
    <div className="mt-6 space-y-4">
      {justPosted ? (
        <p role="status" className="rounded-md border border-denim/30 bg-denim-muda p-4 font-bold text-denim">
          Barang kamu udah tayang. Sekarang tinggal nunggu pembeli chat lewat WhatsApp.
        </p>
      ) : null}

      <section className="flex items-center gap-4 rounded-md border border-garis bg-kertas-terang p-5">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt=""
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-xl leading-7 font-bold">{profile.name}</p>
          <p className="truncate text-sm text-tinta-pudar">{profile.email}</p>
          <div className="mt-2">
            {profile.verifiedAt ? (
              <CampusBadge domain={profile.campusDomain} />
            ) : (
              <p className="text-sm text-tinta-pudar">
                Belum terverifikasi kampus. Masuk pakai email .ac.id buat
                dapet badge.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-garis bg-kertas-terang p-5">
        <h2 className="text-xl leading-7 font-bold">Slot listing</h2>
        <p className="mt-1 text-tinta-pudar">
          <span className="text-lg font-extrabold text-tinta">
            {active} / {limit}
          </span>{" "}
          barang aktif
          {profile.verifiedAt
            ? ""
            : ". Mahasiswa terverifikasi dapet 20 slot plus naikkan listing gratis."}
        </p>
      </section>

      <MyListings items={mine} />

      <form action="/auth/keluar" method="post">
        <button
          type="submit"
          className="rounded-sm border border-garis-tegas px-4 py-2 font-bold hover:bg-kardus"
        >
          Keluar
        </button>
      </form>
    </div>
  );
}

const STATUS_LABEL: Record<MyListing["status"], string> = {
  available: "tayang",
  reserved: "lagi dipesan",
  sold: "udah laku",
  hidden: "diturunin moderator",
};

function MyListings({ items }: { items: MyListing[] }) {
  return (
    <section className="rounded-md border border-garis bg-kertas-terang p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl leading-7 font-bold">Barang kamu</h2>
        <Link href="/jual" className="text-sm font-bold text-stiker-tua hover:underline">
          Pasang barang
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-tinta-pudar">Belum ada barang yang kamu pasang.</p>
      ) : (
        <ul className="mt-3 divide-y divide-garis">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-kardus">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{item.title}</p>
                <p className="text-sm text-tinta-pudar">{formatRupiah(item.price)}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  item.status === "available" ? "bg-denim-muda text-denim" : "bg-kardus text-tinta-pudar"
                }`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AccountSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-busy="true" aria-label="Memuat akun">
      <div className="h-28 animate-pulse rounded-md bg-kardus" />
      <div className="h-24 animate-pulse rounded-md bg-kardus" />
    </div>
  );
}
