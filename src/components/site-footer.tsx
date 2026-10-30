import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-tinta text-kertas">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/brand/lungsur-wordmark-terang.svg"
            alt="lungsur."
            width={120}
            height={34}
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-kertas/80">
            Marketplace barang bekas dengan rasa kampus. Dari tangan ke tangan,
            di titik temu yang sama.
          </p>
          <p className="mt-4 font-display text-lg">
            lungsurin aja<span className="text-stiker">.</span>
          </p>
        </div>

        <FooterColumn title="Kategori">
          {CATEGORIES.slice(0, 5).map((c) => (
            <FooterLink key={c.slug} href={`/cari?kategori=${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Jelajahi">
          <FooterLink href="/cari">Semua barang</FooterLink>
          <FooterLink href="/jual">Lungsurin barang</FooterLink>
          <FooterLink href="/#cara-kerja">Cara kerja</FooterLink>
          <FooterLink href="/#aman">Aturan barang</FooterLink>
        </FooterColumn>

        <FooterColumn title="Akun">
          <FooterLink href="/masuk">Masuk</FooterLink>
          <FooterLink href="/akun">Akun kamu</FooterLink>
          <li className="text-sm text-kertas/60">Kebijakan privasi · segera</li>
          <li className="text-sm text-kertas/60">Syarat &amp; ketentuan · segera</li>
        </FooterColumn>
      </div>
      <div className="border-t border-kertas/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-[13px] text-kertas/60">
          © 2026 lungsur. · dibikin di Sukabumi
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[13px] leading-4 font-bold tracking-wide text-kertas/60">{title}</h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm hover:underline">
        {children}
      </Link>
    </li>
  );
}
