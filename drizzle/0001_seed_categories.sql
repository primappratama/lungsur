-- Kategori awal lungsur. Urutan = urutan tampil.
INSERT INTO "categories" ("slug", "name", "position") VALUES
  ('buku-modul', 'Buku & modul', 1),
  ('elektronik', 'Elektronik & gadget', 2),
  ('perlengkapan-kos', 'Perlengkapan kos', 3),
  ('alat-kuliah', 'Alat kuliah & praktikum', 4),
  ('fashion', 'Fashion', 5),
  ('hobi', 'Hobi & olahraga', 6),
  ('kendaraan', 'Aksesoris kendaraan', 7),
  ('lainnya', 'Lainnya', 8)
ON CONFLICT ("slug") DO NOTHING;
