import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/*
 * Semua tabel di schema `public` pakai RLS tanpa policy. Artinya tabel ini
 * nggak bisa dibaca atau ditulis lewat API Supabase pakai publishable key.
 * Aplikasi akses database dari server lewat Drizzle (role postgres), yang
 * nggak kena RLS. Policy buat Realtime chat ditambah nanti di minggu 5.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);

// mulus · minus pemakaian · ada cacat (dijelasin)
export const conditionEnum = pgEnum("listing_condition", [
  "like_new",
  "used",
  "defect",
]);

// tersedia · lagi dipesan · udah pindah tangan · disembunyikan moderator
export const listingStatusEnum = pgEnum("listing_status", [
  "available",
  "reserved",
  "sold",
  "hidden",
]);

export const verificationMethodEnum = pgEnum("verification_method", [
  "campus_email",
  "student_card",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "approved",
  "rejected",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Satu baris per akun. `id` sama dengan `auth.users.id` di Supabase. */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    role: roleEnum("role").notNull().default("user"),
    /** Domain kampus yang lolos verifikasi, misalnya `ummi.ac.id`. */
    campusDomain: text("campus_domain"),
    /** Terisi = badge "terverifikasi kampus" aktif. */
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    blockedAt: timestamp("blocked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("profiles_email_key").on(t.email)],
).enableRLS();

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    method: verificationMethodEnum("method").notNull(),
    status: verificationStatusEnum("status").notNull().default("pending"),
    campusEmail: text("campus_email"),
    /** Path foto KTM di Storage. Dikosongin lagi setelah ditinjau. */
    cardImagePath: text("card_image_path"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("verifications_profile_id_idx").on(t.profileId)],
).enableRLS();

export const categories = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [uniqueIndex("categories_slug_key").on(t.slug)],
).enableRLS();

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    /** Harga dalam rupiah, tanpa desimal. */
    price: integer("price").notNull(),
    condition: conditionEnum("condition").notNull(),
    /** Penjelasan minus atau cacat. Wajib diisi kalau kondisinya bukan mulus. */
    conditionNote: text("condition_note"),
    /** Titik temu COD, misalnya "Gerbang depan UMMI". */
    meetupPoint: text("meetup_point").notNull(),
    status: listingStatusEnum("status").notNull().default("available"),
    /**
     * Dipakai buat urutan "terbaru". Diisi waktu posting, terus diperbarui
     * tiap kali penjual naikkan listing.
     */
    rankedAt: timestamp("ranked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("listings_feed_idx").on(t.status, t.rankedAt.desc()),
    index("listings_seller_id_idx").on(t.sellerId),
    index("listings_category_id_idx").on(t.categoryId),
    // Search judul + deskripsi pakai full-text search Postgres (konfigurasi "simple"
    // biar kata bahasa Indonesia nggak dipotong pakai aturan bahasa Inggris).
    index("listings_search_idx").using(
      "gin",
      sql`to_tsvector('simple', ${t.title} || ' ' || ${t.description})`,
    ),
  ],
).enableRLS();

export const listingImages = pgTable(
  "listing_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    /** Path file di Supabase Storage (WebP, udah dikompres di browser). */
    path: text("path").notNull(),
    position: integer("position").notNull().default(0),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("listing_images_listing_id_idx").on(t.listingId)],
).enableRLS();

/** Satu percakapan per pasangan barang + pembeli. Penjual = pemilik listing. */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    uniqueIndex("conversations_listing_buyer_key").on(t.listingId, t.buyerId),
    index("conversations_buyer_id_idx").on(t.buyerId),
  ],
).enableRLS();

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    index("messages_conversation_created_idx").on(
      t.conversationId,
      t.createdAt,
    ),
  ],
).enableRLS();

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").notNull().default("open"),
    moderatorNote: text("moderator_note"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("reports_status_idx").on(t.status)],
).enableRLS();

export type Profile = typeof profiles.$inferSelect;
export type Listing = typeof listings.$inferSelect;
