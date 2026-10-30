import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/category-icon";
import {
  ListingGrid,
  ListingGridSkeleton,
  SampleNotice,
} from "@/components/listing-card";
import { SearchForm } from "@/components/search-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CATEGORIES } from "@/lib/categories";
import { searchListings } from "@/lib/listings";

export const metadata: Metadata = { title: "Cari barang" };

type SearchParams = PageProps<"/cari">["searchParams"];

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function SearchPage({ searchParams }: PageProps<"/cari">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q)?.trim().slice(0, 80) || undefined;
  const slug = first(params.kategori);
  const category = CATEGORIES.find((c) => c.slug === slug);
  const { items, sample } = await searchListings({ q, category: category?.slug });

  const heading = q
    ? `Hasil buat “${q}”`
    : category
      ? category.name
      : "Semua barang";

  return (
    <>
      <SearchForm defaultValue={q} category={category?.slug} className="md:hidden" />
      <h1 className="mt-6 font-display text-3xl leading-[38px] font-medium md:mt-0">
        {heading}
      </h1>
      {q && category ? (
        <p className="mt-1 text-tinta-pudar">di kategori {category.name}</p>
      ) : null}

      <nav aria-label="Saring kategori" className="mt-5">
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <li className="shrink-0">
            <FilterChip href={q ? `/cari?q=${encodeURIComponent(q)}` : "/cari"} active={!category}>
              Semua
            </FilterChip>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="shrink-0">
              <FilterChip
                href={`/cari?${new URLSearchParams({ ...(q ? { q } : {}), kategori: c.slug })}`}
                active={category?.slug === c.slug}
              >
                <CategoryIcon slug={c.slug} className="size-4" />
                {c.name}
              </FilterChip>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        {items.length > 0 ? (
          <>
            {sample ? <SampleNotice /> : null}
            <p className="mb-3 text-sm text-tinta-pudar">{items.length} barang</p>
            <ListingGrid items={items} sample={sample} />
          </>
        ) : (
          <div className="rounded-md border border-dashed border-garis-tegas px-6 py-14 text-center">
            <p className="font-display text-2xl">
              Belum ada yang ngelungsurin ini<span className="text-stiker">.</span>
            </p>
            <p className="mt-2 text-tinta-pudar">Coba kata lain, atau cek lagi besok.</p>
            <Link href="/cari" className="mt-5 inline-block font-bold text-stiker-tua hover:underline">
              Lihat semua barang
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold whitespace-nowrap ${
        active ? "bg-tinta text-kertas-terang" : "bg-kardus hover:bg-garis"
      }`}
    >
      {children}
    </Link>
  );
}

function SearchSkeleton() {
  return (
    <>
      <div className="h-9 w-56 animate-pulse rounded bg-kardus" />
      <div className="mt-5 h-9 w-full animate-pulse rounded-full bg-kardus" />
      <div className="mt-6">
        <ListingGridSkeleton />
      </div>
    </>
  );
}
