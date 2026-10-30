import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

export function SignInLink() {
  return (
    <Link
      href="/masuk"
      className="rounded-sm bg-tinta px-4 py-2 text-sm font-bold text-kertas-terang hover:bg-tinta/90"
    >
      Masuk
    </Link>
  );
}

/** Baca sesi, jadi wajib di dalam <Suspense>. */
export async function AuthStatus() {
  const profile = await getCurrentProfile();
  if (!profile) return <SignInLink />;

  return (
    <Link
      href="/akun"
      className="flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-bold hover:bg-kardus"
    >
      {profile.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt=""
          width={28}
          height={28}
          className="rounded-full"
        />
      ) : (
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-full bg-kardus text-xs"
        >
          {profile.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="max-w-32 truncate">{profile.name.split(" ")[0]}</span>
    </Link>
  );
}
