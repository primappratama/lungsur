import type { Metadata } from "next";
import Image from "next/image";
import { and, count, eq, inArray } from "drizzle-orm";
import { Suspense } from "react";
import { CampusBadge } from "@/components/campus-badge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import { listingLimitFor } from "@/lib/campus";

export const metadata: Metadata = { title: "Akun kamu" };

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="font-display text-3xl leading-[38px] font-medium">
          Akun kamu
        </h1>
        <Suspense fallback={<AccountSkeleton />}>
          <AccountPanel />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function AccountPanel() {
  const profile = await requireProfile("/akun");
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

function AccountSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-busy="true" aria-label="Memuat akun">
      <div className="h-28 animate-pulse rounded-md bg-kardus" />
      <div className="h-24 animate-pulse rounded-md bg-kardus" />
    </div>
  );
}
