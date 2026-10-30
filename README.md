# lungsur.

**lungsurin aja.** Marketplace barang bekas dengan rasa kampus. Siapa aja bisa lihat-lihat dan jual-beli, penjual mahasiswa dapet badge *terverifikasi kampus*, dan COD-nya di titik temu kampus.

> *lungsur* (KBBI): **melungsur** = meluncur turun; **lungsuran** = pakaian atau barang bekas. Barang di sini nggak dibuang, tapi diturunin ke pemilik berikutnya.

Status: **fondasi (minggu 1–3)**. Udah ada login Google, badge kampus otomatis, skema database, dan tampilan brand. Listing, chat realtime, dan moderasi menyusul.

## Stack

| Bagian | Pakai |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, `proxy.ts`) |
| Styling | Tailwind CSS 4, token dari design system lungsur. |
| Font | Fraunces (judul) dan Plus Jakarta Sans (UI), self-hosted lewat Fontsource |
| Auth | Supabase Auth, login Google |
| Database | Supabase Postgres + Drizzle ORM, migrasi SQL di `drizzle/` |

## Fitur yang udah jalan

- **Login pakai Google** lewat Supabase (PKCE). Sesi disegerin di tiap request lewat `src/proxy.ts`.
- **Badge terverifikasi kampus otomatis.** Kalau email Google-nya `.ac.id`, profil langsung dapet badge dan 20 slot listing (akun biasa 5 slot). Logikanya ada di `src/lib/profile.ts`.
- **Skema database lengkap buat MVP:** profil, verifikasi, kategori, listing, foto listing, percakapan, pesan, laporan. Search pakai index full-text Postgres.
- **RLS aktif di semua tabel**, jadi data nggak bisa diakses lewat API publik Supabase. Aplikasi baca dan tulis dari server lewat Drizzle.

## Jalanin di laptop

Butuh Node.js 20.9 atau lebih baru.

### 1. Install

```bash
git clone https://github.com/primappratama/lungsur.git
cd lungsur
npm install
cp .env.example .env.local
```

### 2. Bikin project Supabase

1. Buka [supabase.com](https://supabase.com), bikin project baru. Pilih region Singapore biar dekat.
2. Klik tombol **Connect** di dashboard project:
   - Salin **Project URL** sama **publishable key** ke `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - Di bagian connection string, salin **Transaction pooler** (port 6543) ke `DATABASE_URL`, terus **Session pooler** (port 5432) ke `DIRECT_URL`. Ganti `[YOUR-PASSWORD]` pakai password database kamu.

### 3. Sambungin login Google

1. Buka [Google Cloud Console](https://console.cloud.google.com), bikin project, terus atur **OAuth consent screen** (tipe External, isi nama aplikasi `lungsur.` dan email kamu).
2. **Credentials → Create credentials → OAuth client ID**, tipe *Web application*.
   - **Authorized redirect URIs**: `https://<project-ref>.supabase.co/auth/v1/callback` (ganti `<project-ref>` pakai ID project Supabase kamu).
3. Salin **Client ID** sama **Client secret**.
4. Di Supabase: **Authentication → Sign In / Providers → Google**, nyalain, tempel Client ID dan secret-nya.
5. Masih di Supabase: **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: tambahin `http://localhost:3000/auth/callback`

### 4. Bikin tabel database

```bash
npm run db:migrate
```

Ini bikin semua tabel, nyalain RLS, dan ngisi 8 kategori awal.

### 5. Jalanin

```bash
npm run dev
```

Buka [localhost:3000](http://localhost:3000), klik **Masuk pakai Google**. Coba pakai email kampus `.ac.id` buat lihat badge-nya muncul di halaman **Akun**.

## Script

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server development |
| `npm run build` | Build production |
| `npm run lint` | Cek kode pakai ESLint |
| `npm run db:generate` | Bikin file migrasi baru setelah `src/db/schema.ts` diubah |
| `npm run db:migrate` | Jalanin migrasi ke database |
| `npm run db:studio` | Buka Drizzle Studio buat lihat isi database |

## Struktur

```
src/
  app/
    page.tsx               beranda
    masuk/                 halaman masuk + server action login Google
    akun/                  halaman akun (wajib login)
    auth/callback/         tempat Google balik setelah login
    auth/keluar/           keluar (POST)
  components/              header, footer, badge
  db/
    schema.ts              skema database (Drizzle)
    index.ts               koneksi database
  lib/
    auth.ts                baca siapa yang login (Data Access Layer)
    profile.ts             sinkron profil + badge kampus otomatis
    campus.ts              aturan domain kampus dan kuota listing
    supabase/              client Supabase buat server dan proxy
  proxy.ts                 nyegerin sesi Supabase tiap request
drizzle/                   migrasi SQL
public/brand/              logo lungsur.
```

## Brand

Warna, font, dan aturan logo ikut design system **lungsur.**: latar `kertas` #F6F1E7, teks `tinta` #1F1B16, aksen `stiker` #E4572E. Token-nya ada di `src/app/globals.css`.

---

Dibuat oleh Prima Pratama Putra.
