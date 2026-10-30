import {
  Bike,
  BookOpen,
  Dumbbell,
  FlaskConical,
  LampDesk,
  Package,
  Shirt,
  Smartphone,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  "buku-modul": BookOpen,
  elektronik: Smartphone,
  "perlengkapan-kos": LampDesk,
  "alat-kuliah": FlaskConical,
  fashion: Shirt,
  hobi: Dumbbell,
  kendaraan: Bike,
  lainnya: Package,
} as const;

export function CategoryIcon({
  slug,
  ...props
}: { slug: string } & LucideProps) {
  const Icon = ICONS[slug as keyof typeof ICONS] ?? Package;
  return <Icon aria-hidden strokeWidth={1.75} {...props} />;
}
