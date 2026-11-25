-- =====================================================================
-- 0003 — Niche local wisdom (ulasan hotel, wisata, kuliner per daerah)
--
-- SIFAT: ADITIF. Hanya menambah kategori baru dan kolom OPSIONAL (boleh NULL).
--   * Tidak ada kolom lama yang diubah/dihapus, tidak ada data lama yang disentuh.
--   * Artikel berita lama tetap valid (semua kolom baru NULL / 0).
--   * Alur terbit Jenny & Rere (form /admin dan POST /api/admin/articles) tetap jalan
--     tanpa mengirim kolom baru.
--
-- STATUS: BELUM dijalankan di produksi. Jalankan HANYA setelah Rizal setuju (lihat
-- docs/panduan-konten-local-wisdom.md, bagian "Rencana go-live").
--
--   Lokal  : npx wrangler d1 execute bacaanku-db --local  --file=docs/migrations/0003_local_wisdom.sql
--   Produksi (nanti, setelah approve + backup):
--            npx wrangler d1 export  bacaanku-db --remote --output=backup-sebelum-0003.sql
--            npx wrangler d1 execute bacaanku-db --remote --file=docs/migrations/0003_local_wisdom.sql
--
-- Catatan: ALTER TABLE ... ADD COLUMN tidak bisa diulang (kolom sudah ada → error).
-- Jalankan satu kali saja per database.
-- =====================================================================

-- Rubrik baru. sort_order negatif supaya tampil paling atas di dropdown admin.
INSERT OR IGNORE INTO categories (slug, name, description, sort_order) VALUES
  ('hotel',   'Hotel',   'Ulasan hotel, homestay, dan penginapan lokal: harga, fasilitas, dan pengalaman menginap.', -3),
  ('wisata',  'Wisata',  'Ulasan tempat wisata, budaya, dan alam di berbagai daerah Nusantara.',                 -2),
  ('kuliner', 'Kuliner', 'Ulasan warung, rumah makan, dan jajanan khas daerah: rasa, harga, dan jam buka.',      -1);

-- Lokasi
ALTER TABLE articles ADD COLUMN province_slug   TEXT;     -- 'jawa-timur' (slug dari src/config/site.ts → regions)
ALTER TABLE articles ADD COLUMN city_name       TEXT;     -- 'Malang' (tampil di kartu)
ALTER TABLE articles ADD COLUMN city_slug       TEXT;     -- 'malang' (URL /daerah/jawa-timur/malang/)

-- Tempat yang diulas
ALTER TABLE articles ADD COLUMN place_name      TEXT;     -- 'Wisma Kenanga'
ALTER TABLE articles ADD COLUMN place_type      TEXT;     -- schema.org: Hotel, Resort, TouristAttraction, Beach, Restaurant, ...
ALTER TABLE articles ADD COLUMN address         TEXT;     -- alamat lengkap
ALTER TABLE articles ADD COLUMN latitude        REAL CHECK (latitude  IS NULL OR latitude  BETWEEN -90  AND 90);
ALTER TABLE articles ADD COLUMN longitude       REAL CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
ALTER TABLE articles ADD COLUMN maps_url        TEXT;     -- tautan Google Maps (https://maps.app.goo.gl/...)
ALTER TABLE articles ADD COLUMN phone           TEXT;
ALTER TABLE articles ADD COLUMN website         TEXT;

-- Harga & jam
ALTER TABLE articles ADD COLUMN price_min       INTEGER CHECK (price_min IS NULL OR price_min >= 0);  -- rupiah, tanpa titik
ALTER TABLE articles ADD COLUMN price_max       INTEGER CHECK (price_max IS NULL OR price_max >= 0);
ALTER TABLE articles ADD COLUMN price_unit      TEXT;     -- 'malam' | 'porsi' | 'orang' | 'tiket' | 'paket'
ALTER TABLE articles ADD COLUMN price_note      TEXT;     -- teks bebas, mis. 'Gratis, parkir Rp5.000'
ALTER TABLE articles ADD COLUMN opening_hours   TEXT;     -- 'Setiap hari 07.00–14.00' / hotel: 'Check-in 14.00 · check-out 12.00'

-- Penilaian
ALTER TABLE articles ADD COLUMN rating          REAL CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));  -- kelipatan 0,5
ALTER TABLE articles ADD COLUMN facilities_json TEXT CHECK (facilities_json IS NULL OR json_valid(facilities_json)); -- ["Wi-Fi","Parkir"]
ALTER TABLE articles ADD COLUMN visited_at      INTEGER;  -- tanggal kunjungan penulis (epoch detik)
ALTER TABLE articles ADD COLUMN is_sample       INTEGER DEFAULT 0 CHECK (is_sample IS NULL OR is_sample IN (0, 1)); -- 1 = CONTOH (noindex)

-- Index halaman daerah & kota (hemat rows read; tanpa SCAN articles).
-- Partial index: hanya baris yang punya lokasi, jadi artikel berita lama tidak menambah ukuran index.
CREATE INDEX IF NOT EXISTS idx_articles_province_pub
  ON articles (province_slug, status, published_at DESC) WHERE province_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_city_pub
  ON articles (province_slug, city_slug, status, published_at DESC) WHERE city_slug IS NOT NULL;
