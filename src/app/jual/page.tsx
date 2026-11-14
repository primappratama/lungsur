import { and, count, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import { listingLimitFor } from "@/lib/campus";
import { CATEGORIES } from "@/lib/categories";
import { formatWhatsapp } from "@/lib/listing-input";
import { SellForm } from "./sell-form";

export const metadata: Metadata = { title: "Lungsurin barang" };

export default function SellPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-display text-4xl leading-tight font-medium">
          Lungsurin barang<span className="text-stiker">.</span>
        </h1>
        <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-md bg-kardus" />}>
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
  const [{ active }] = await getDb()
    .select({ active: count() })
    .from(listings)
    .where(and(eq(listings.sellerId, profile.id), inArray(listings.status, ["available", "reserved"])));
  const left = Math.max(0, limit - active);

  if (left === 0) {
    return (
      <div className="mt-6 rounded-md border border-garis bg-kertas-terang p-5">
        <p className="font-bold">Slot kamu udah penuh ({limit} barang aktif).</p>
        <p className="mt-1 text-tinta-pudar">
          Tandai barang yang udah laku dulu, nanti slotnya kebuka lagi.
          {profile.verifiedAt ? null : " Masuk pakai email .ac.id buat dapet 20 slot."}
        </p>
        <Link href="/akun" className="mt-3 inline-block font-bold text-stiker-tua hover:underline">
          Lihat barang kamu
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mt-2 text-tinta-pudar">
        Sisa slot kamu: <strong className="text-tinta">{left} dari {limit}</strong>.
        {profile.verifiedAt ? null : " Masuk pakai email .ac.id buat dapet 20 slot."}
      </p>
      <SellForm
        userId={profile.id}
        categories={CATEGORIES.map(({ slug, name }) => ({ slug, name }))}
        defaultWhatsapp={profile.whatsapp ? formatWhatsapp(profile.whatsapp) : ""}
      />
    </>
  );
}
