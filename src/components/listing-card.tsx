import { BadgeCheck, MapPin } from "lucide-react";
import Image from "next/image";
import type { ListingCardData } from "@/lib/listings";
import { CONDITION_LABEL, formatRupiah } from "@/lib/format";
import { CategoryIcon } from "./category-icon";

export function ListingCard({
  item,
  sample,
}: {
  item: ListingCardData;
  sample?: boolean;
}) {
  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-md border border-garis bg-kertas-terang">
      <div className="relative aspect-square bg-kardus">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <CategoryIcon slug={item.categorySlug} className="size-12 text-tinta-pudar/60" />
          </div>
        )}
        {sample ? (
          <span className="absolute top-2 left-2 rounded-full bg-tinta px-2 py-0.5 text-[11px] leading-4 font-bold text-kertas-terang">
            contoh
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="w-fit rounded-full bg-kardus px-2 py-0.5 text-[12px] leading-4 font-bold">
          {CONDITION_LABEL[item.condition]}
        </span>
        <h3 className="line-clamp-2 text-[15px] leading-5 font-bold">{item.title}</h3>
        <p className="text-lg leading-6 font-extrabold">{formatRupiah(item.price)}</p>
        <div className="mt-auto space-y-1 pt-1 text-[13px] leading-4 text-tinta-pudar">
          <p className="flex items-center gap-1">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{item.meetupPoint}</span>
          </p>
          {item.sellerVerified ? (
            <p className="flex items-center gap-1 font-bold text-denim">
              <BadgeCheck aria-hidden className="size-3.5 shrink-0" />
              terverifikasi kampus
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ListingGrid({
  items,
  sample,
}: {
  items: ListingCardData[];
  sample?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="flex">
          <ListingCard item={item} sample={sample} />
        </li>
      ))}
    </ul>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Memuat barang"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-md border border-garis bg-kertas-terang">
          <div className="aspect-square animate-pulse bg-kardus" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-1/3 animate-pulse rounded-full bg-kardus" />
            <div className="h-4 w-full animate-pulse rounded bg-kardus" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-kardus" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SampleNotice() {
  return (
    <p className="mb-4 rounded-md border border-dashed border-garis-tegas px-4 py-3 text-sm text-tinta-pudar">
      Yang tampil di bawah ini <strong className="text-tinta">kartu contoh</strong>, karena
      database belum disambungin. Begitu <code>DATABASE_URL</code> diisi, isinya diganti
      barang beneran.
    </p>
  );
}
