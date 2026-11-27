-- 0004 — Arsip tanpa ganti URL, noindex per artikel, dan harga terstruktur (panduan).
-- ADITIF SAJA: hanya ADD COLUMN (semua NULL/0 default) + index parsial. Tidak ada baris yang diubah.
-- Kode lama tetap berjalan normal setelah migrasi ini (kode lama tidak membaca kolom baru),
-- jadi urutannya: 1) backup  2) 0004  3) 0004b (data arsip)  4) deploy kode cabang arsip-dan-harga.
-- PERHATIAN: ALTER TABLE ... ADD COLUMN tidak bisa dijalankan dua kali (error "duplicate column").
-- Cek dulu: SELECT name FROM pragma_table_info('articles') WHERE name = 'archived_at';
-- Rencana lengkap + rollback: docs/migrasi-0004-arsip-harga.md

-- Arsip: status tetap 'published' (URL tetap 200); archived_at diisi = keluar dari daftar/feed/sitemap.
ALTER TABLE articles ADD COLUMN archived_at INTEGER;

-- noindex per artikel (0 = normal). Belum dipakai untuk artikel mana pun; keputusan Des 2026–Jan 2027.
ALTER TABLE articles ADD COLUMN robots_noindex INTEGER NOT NULL DEFAULT 0;

-- Harga utama (wajib untuk hotel/wisata/kuliner saat terbit) + tanggal cek + sumber.
ALTER TABLE articles ADD COLUMN price_label TEXT;        -- 'Tiket masuk' | 'Tarif kamar' | 'Harga per porsi' …
ALTER TABLE articles ADD COLUMN price_value TEXT;        -- 'Rp20.000 per orang' | 'Gratis'
ALTER TABLE articles ADD COLUMN price_free INTEGER NOT NULL DEFAULT 0; -- 1 = gratis (alun-alun, masjid)
ALTER TABLE articles ADD COLUMN price_min INTEGER;       -- rupiah, diturunkan otomatis dari price_value (untuk filter nanti)
ALTER TABLE articles ADD COLUMN price_max INTEGER;
ALTER TABLE articles ADD COLUMN price_checked_at TEXT;   -- 'YYYY-MM-DD' (tanggal cek, WIB)
ALTER TABLE articles ADD COLUMN price_source_name TEXT;
ALTER TABLE articles ADD COLUMN price_source_url TEXT;
-- Harga tambahan: [{"label":"Parkir motor","value":"Rp5.000","source_url":"https://…"|null,"verified":false}]
ALTER TABLE articles ADD COLUMN price_extra_json TEXT;

-- Daftar /arsip-berita/ (keyset, terbaru dulu) tanpa SCAN articles.
CREATE INDEX IF NOT EXISTS idx_articles_archived_pub
  ON articles (published_at DESC, id DESC) WHERE archived_at IS NOT NULL;
