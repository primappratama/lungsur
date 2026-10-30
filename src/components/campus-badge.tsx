/** Badge bulat ala stiker: denim di atas denim-muda (kontras 6.1:1). */
export function CampusBadge({ domain }: { domain?: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-denim-muda px-2.5 py-1 text-[13px] leading-4 font-bold text-denim">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      terverifikasi kampus
      {domain ? <span className="font-normal">· {domain}</span> : null}
    </span>
  );
}
