import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CATEGORIES } from "@/lib/categories";
import { AuthStatus, SignInLink } from "./auth-status";
import { CategoryIcon } from "./category-icon";
import { MobileMenu } from "./mobile-menu";
import { SearchForm } from "./search-form";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-garis bg-kertas">
      {/* Baris utama */}
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:gap-6">
        <MobileMenu />
        <Link href="/" aria-label="lungsur. — beranda" className="shrink-0">
          <Image
            src="/brand/lungsur-wordmark.svg"
            alt="lungsur."
            width={112}
            height={32}
            priority
          />
        </Link>
        <SearchForm inputId="cari-header" className="hidden flex-1 md:block" />
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/jual"
            className="hidden items-center gap-1.5 rounded-sm border border-garis-tegas px-3.5 py-2 text-sm font-bold hover:bg-kardus sm:inline-flex"
          >
            <Plus aria-hidden className="size-4" strokeWidth={2.25} />
            Lungsurin barang
          </Link>
          <Suspense fallback={<SignInLink />}>
            <AuthStatus />
          </Suspense>
        </div>
      </div>

      {/* Baris kategori */}
      <nav aria-label="Kategori" className="border-t border-garis">
        <ul className="mx-auto flex max-w-6xl gap-0.5 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] lg:justify-between">
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link
                href={`/cari?kategori=${c.slug}`}
                className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[13px] font-bold whitespace-nowrap hover:bg-kardus"
              >
                <CategoryIcon slug={c.slug} className="size-4 text-tinta-pudar" />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
