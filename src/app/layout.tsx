import type { Metadata } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "lungsur. — lungsurin aja.",
    template: "%s · lungsur.",
  },
  description:
    "Marketplace barang bekas dengan rasa kampus. Penjual mahasiswa dapet badge terverifikasi, COD di titik temu kampus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-kertas text-tinta">
        {children}
      </body>
    </html>
  );
}
