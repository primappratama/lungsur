import { Search } from "lucide-react";

/** Form GET biasa ke /cari, jalan tanpa JavaScript. */
export function SearchForm({
  defaultValue,
  category,
  className = "",
  autoFocus,
}: {
  defaultValue?: string;
  category?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/cari" role="search" className={`relative ${className}`}>
      <label htmlFor="cari-q" className="sr-only">
        Cari barang
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-tinta-pudar"
      />
      <input
        id="cari-q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Cari barang, misalnya “kalkulator”"
        className="h-11 w-full rounded-full border border-garis-tegas bg-kertas-terang pr-4 pl-10 text-[15px] placeholder:text-tinta-pudar focus:border-tinta focus:outline-none"
      />
      {category ? <input type="hidden" name="kategori" value={category} /> : null}
    </form>
  );
}
