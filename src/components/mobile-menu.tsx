"use client";

import { Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchForm } from "./search-form";

/** Menu hamburger buat layar kecil: kolom cari + link utama. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="menu-hp"
        onClick={() => setOpen((v) => !v)}
        className="-ml-2 grid size-10 place-items-center rounded-sm hover:bg-kardus"
      >
        {open ? <X className="size-5.5" /> : <Menu className="size-5.5" />}
      </button>

      {open ? (
        <div
          id="menu-hp"
          className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-garis bg-kertas px-4 py-5"
        >
          <SearchForm autoFocus />
          <nav aria-label="Menu" className="mt-6 flex flex-col gap-1 text-lg font-bold">
            <Link
              href="/jual"
              onClick={close}
              className="flex items-center gap-2 rounded-sm bg-tinta px-4 py-3 text-kertas-terang"
            >
              <Plus aria-hidden className="size-5" /> Lungsurin barang
            </Link>
            <Link href="/cari" onClick={close} className="rounded-sm px-4 py-3 hover:bg-kardus">
              Semua barang
            </Link>
            <Link href="/#cara-kerja" onClick={close} className="rounded-sm px-4 py-3 hover:bg-kardus">
              Cara kerja
            </Link>
            <Link href="/#aman" onClick={close} className="rounded-sm px-4 py-3 hover:bg-kardus">
              Aturan barang
            </Link>
            <Link href="/akun" onClick={close} className="rounded-sm px-4 py-3 hover:bg-kardus">
              Akun kamu
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
