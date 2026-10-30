import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthStatus, SignInLink } from "./auth-status";

export function SiteHeader() {
  return (
    <header className="border-b border-garis">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" aria-label="lungsur. — beranda" className="shrink-0">
          <Image
            src="/brand/lungsur-wordmark.svg"
            alt="lungsur."
            width={112}
            height={32}
            priority
          />
        </Link>
        <Suspense fallback={<SignInLink />}>
          <AuthStatus />
        </Suspense>
      </div>
    </header>
  );
}
