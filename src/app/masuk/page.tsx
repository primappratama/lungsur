import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth";
import { signInWithGoogle } from "./actions";

export const metadata: Metadata = { title: "Masuk" };

const ERRORS: Record<string, string> = {
  google: "Gagal nyambung ke Google. Coba lagi sebentar.",
  callback: "Login-nya nggak selesai. Coba masuk lagi.",
  profil: "Akun kamu gagal disiapin. Coba lagi, atau kabarin kami kalau masih gagal.",
  diblokir: "Akun ini lagi diblokir karena laporan pelanggaran.",
  "belum-setup":
    "Login belum aktif karena Supabase belum disambungin. Isi file .env.local dulu, langkahnya ada di README.",
};

export default function SignInPage({ searchParams }: PageProps<"/masuk">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-md border border-garis bg-kertas-terang p-6 sm:p-8">
        <Link href="/" aria-label="Kembali ke beranda">
          <Image
            src="/brand/lungsur-simbol.svg"
            alt=""
            width={40}
            height={46}
          />
        </Link>
        <h1 className="mt-6 font-display text-3xl leading-[38px] font-medium">
          Masuk ke lungsur<span className="text-stiker">.</span>
        </h1>
        <p className="mt-3 text-tinta-pudar">
          Cukup pakai akun Google. Pakai email kampus (.ac.id) biar langsung
          dapet badge terverifikasi kampus.
        </p>
        <Suspense fallback={<GoogleButton next="/akun" />}>
          <SignInForm searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function SignInForm({
  searchParams,
}: {
  searchParams: PageProps<"/masuk">["searchParams"];
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const error = first(params.error);
  const next = safeNextPath(first(params.next));

  return (
    <>
      {error && ERRORS[error] ? (
        <p role="alert" className="mt-4 text-sm text-galat">
          {ERRORS[error]}
        </p>
      ) : null}
      <GoogleButton next={next} />
    </>
  );
}

function GoogleButton({ next }: { next: string }) {
  return (
    <form action={signInWithGoogle} className="mt-6">
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-3 rounded-sm bg-tinta px-4 py-3 font-bold text-kertas-terang hover:bg-tinta/90"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
          />
        </svg>
        Masuk pakai Google
      </button>
    </form>
  );
}
