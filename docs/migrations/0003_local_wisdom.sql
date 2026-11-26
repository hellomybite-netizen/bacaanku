-- =====================================================================
-- 0003 — Local wisdom (desain GPT): tipe Hotel/Wisata/Kuliner + kota + info panduan
--
-- Diadaptasi dari 0003 di PR #10, disesuaikan dengan field Guide desain GPT.
-- SIFAT: ADITIF. Hanya menambah 3 kategori dan kolom OPSIONAL (boleh NULL).
--   * Kolom lama tidak diubah/dihapus; data berita lama tidak disentuh (kolom baru = NULL).
--   * Alur terbit Jenny & Rere (form /admin dan POST /api/admin/articles/) tetap jalan tanpa
--     mengirim kolom baru: kolom baru hanya ditulis bila artikel memakai field kota/panduan.
--
-- STATUS: BELUM dijalankan di produksi. Jalankan HANYA setelah Rizal setuju + backup.
--   Lokal   : npx wrangler d1 execute bacaanku-db --local --file=docs/migrations/0003_local_wisdom.sql
--   Produksi (nanti, setelah approve):
--             npx wrangler d1 export  bacaanku-db --remote --output=backup-sebelum-0003.sql
--             npx wrangler d1 execute bacaanku-db --remote --file=docs/migrations/0003_local_wisdom.sql
--   Urutan go-live: migrasi DULU, baru deploy kode (kode baru membaca kolom ini).
--   ALTER TABLE ... ADD COLUMN tidak bisa diulang (kolom sudah ada → error). Jalankan sekali.
-- =====================================================================

-- Tipe wisata = kategori. sort_order negatif supaya tampil paling atas di dropdown admin.
INSERT OR IGNORE INTO categories (slug, name, description, sort_order) VALUES
  ('hotel',   'Hotel',   'Temukan penginapan setempat dan pilih lokasi yang pas untuk rencana perjalananmu.', -3),
  ('wisata',  'Wisata',  'Jelajahi lanskap alam, ruang budaya, dan tempat wisata untuk berbagai cara bepergian.', -2),
  ('kuliner', 'Kuliner', 'Temukan rekomendasi tempat makan dan cicipi sajian khas dari berbagai daerah Indonesia.', -1);

-- Kota & provinsi (slug dari src/lib/local-guide.ts → guideCities / guideProvinces)
ALTER TABLE articles ADD COLUMN city_slug      TEXT;   -- 'probolinggo'  → /artikel/probolinggo/
ALTER TABLE articles ADD COLUMN province_slug  TEXT;   -- 'jawa-timur'   → /daerah/jawa-timur/ (diisi otomatis dari kota)

-- Tempat yang diulas (kartu & kepala artikel)
ALTER TABLE articles ADD COLUMN place_name     TEXT;   -- 'Rawon Nguling' (judul kartu)
ALTER TABLE articles ADD COLUMN location_label TEXT;   -- 'Tongas, Kab. Probolinggo' (baris lokasi)

-- Kotak "Info Singkat", anggaran, peta, tombol aksi, galeri
ALTER TABLE articles ADD COLUMN facts_json     TEXT CHECK (facts_json   IS NULL OR json_valid(facts_json));   -- [{"label":"Alamat","value":"..."}]
ALTER TABLE articles ADD COLUMN budget_label   TEXT;   -- 'Kisaran per orang'
ALTER TABLE articles ADD COLUMN budget_value   TEXT;   -- 'Rp22.000–Rp60.000'
ALTER TABLE articles ADD COLUMN map_query      TEXT;   -- teks pencarian Google Maps
ALTER TABLE articles ADD COLUMN action_label   TEXT;   -- 'Cek tiket resmi'
ALTER TABLE articles ADD COLUMN action_url     TEXT CHECK (action_url  IS NULL OR action_url LIKE 'https://%');
ALTER TABLE articles ADD COLUMN gallery_json   TEXT CHECK (gallery_json IS NULL OR json_valid(gallery_json)); -- [{"src":"/media/...","alt":"..."}]
-- Catatan: "sections" desain GPT = isi Markdown (## Subjudul + paragraf). "sources" = sources_json lama.

-- Index halaman kota & provinsi (tanpa SCAN articles). Partial: berita lama (kota NULL) tidak menambah ukuran index.
CREATE INDEX IF NOT EXISTS idx_articles_city_pub
  ON articles (city_slug, status, published_at DESC) WHERE city_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_province_pub
  ON articles (province_slug, status, published_at DESC) WHERE province_slug IS NOT NULL;
