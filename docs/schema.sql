-- =====================================================================
-- Bacaanku Network (bacaankunetwork.com) — skema Cloudflare D1 (SQLite)
-- Target: 30 artikel/hari (~900/bulan), 1.000 pengunjung/hari, paket Free.
--
-- Prinsip hemat "rows read" (D1 Free: 5 juta rows read/hari, 100 ribu rows written/hari):
--  * Setiap query publik HARUS memakai index (cek dengan EXPLAIN QUERY PLAN → "USING INDEX",
--    jangan sampai "SCAN articles").
--  * Selalu pakai LIMIT dan pagination keyset (published_at < ?), bukan OFFSET besar.
--  * Halaman daftar cukup SELECT kolom ringkas (tanpa body_html) → pakai covering index.
--  * body_html disimpan sudah jadi (dirender saat simpan di admin), supaya SSR hemat CPU (Free: 10 ms/request).
--
-- Jalankan:  npx wrangler d1 execute bacaanku-db --remote --file=docs/schema.sql
-- Tanggal disimpan sebagai INTEGER unix epoch detik (UTC) → index kecil & perbandingan cepat.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- Kategori (7 awal: news, teknologi, otomotif, sains, ekonomi, olahraga, hiburan)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id           INTEGER PRIMARY KEY,
  slug         TEXT    NOT NULL UNIQUE,          -- 'teknologi'
  name         TEXT    NOT NULL,                 -- 'Teknologi'
  description  TEXT    NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,       -- urutan menu
  is_active    INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ---------------------------------------------------------------------
-- Penulis / redaksi
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS authors (
  id            INTEGER PRIMARY KEY,
  slug          TEXT    NOT NULL UNIQUE,         -- 'redaksi'
  name          TEXT    NOT NULL,                -- 'Redaksi Bacaanku Network'
  role          TEXT    NOT NULL DEFAULT '',     -- 'Redaktur Pelaksana'
  bio           TEXT    NOT NULL DEFAULT '',
  email         TEXT    UNIQUE,                  -- untuk login/Cloudflare Access (opsional)
  avatar_r2_key TEXT,                            -- mis. 'authors/redaksi.webp'
  x_handle      TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ---------------------------------------------------------------------
-- Artikel
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles (
  id               INTEGER PRIMARY KEY,
  slug             TEXT    NOT NULL UNIQUE,      -- URL: /{kategori}/{slug}/
  title            TEXT    NOT NULL,
  excerpt          TEXT    NOT NULL DEFAULT '',  -- ringkasan/dek untuk kartu & lead
  body_markdown    TEXT    NOT NULL DEFAULT '',  -- sumber yang diedit penulis
  body_html        TEXT    NOT NULL DEFAULT '',  -- hasil render (disanitasi) saat simpan
  reading_minutes  INTEGER NOT NULL DEFAULT 1,   -- dihitung saat simpan
  category_id      INTEGER NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  author_id        INTEGER NOT NULL REFERENCES authors(id)    ON UPDATE CASCADE ON DELETE RESTRICT,
  status           TEXT    NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  -- Gambar utama. Satu kolom untuk tiga bentuk (R2 menyusul, belum wajib):
  --   * URL absolut  https://...
  --   * path situs   /media/articles/foto.jpg  atau /...
  --   * kunci R2     '2026/11/leonid' bila MEDIA_BASE dipasang nanti
  --     File R2: {key}-480.webp, {key}-960.webp, {key}-1600.webp
  hero_r2_key      TEXT,
  hero_width       INTEGER,                      -- dimensi asli → atribut width/height (anti-CLS)
  hero_height      INTEGER,
  hero_alt         TEXT    NOT NULL DEFAULT '',
  hero_caption     TEXT    NOT NULL DEFAULT '',
  hero_credit      TEXT    NOT NULL DEFAULT '',  -- 'Foto: Nama/Wikimedia Commons, CC BY-SA 4.0'
  hero_credit_url  TEXT,
  sources_json     TEXT    NOT NULL DEFAULT '[]' -- [{"name":"ANTARA","title":"...","url":"https://..."}]
                           CHECK (json_valid(sources_json)),
  seo_title        TEXT,                         -- ≤ 70 karakter; NULL = pakai title
  seo_description  TEXT,                         -- 50–170 karakter; NULL = pakai excerpt
  canonical_url    TEXT,
  is_headline      INTEGER NOT NULL DEFAULT 0 CHECK (is_headline IN (0, 1)),
  view_count       INTEGER NOT NULL DEFAULT 0,   -- opsional; JANGAN di-update per pageview (boros writes),
                                                 -- isi berkala dari analytics untuk "Terpopuler"
  published_at     INTEGER,                      -- wajib terisi saat status scheduled/published
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  CHECK (status NOT IN ('scheduled', 'published') OR published_at IS NOT NULL)
);

-- Daftar terbaru (beranda, RSS, sitemap): WHERE status='published' AND published_at <= now ORDER BY published_at DESC LIMIT n
-- Kolom tambahan di index = covering index untuk kartu (tanpa menyentuh body).
CREATE INDEX IF NOT EXISTS idx_articles_status_pub
  ON articles (status, published_at DESC, id, category_id, slug);

-- Halaman kategori + pagination keyset: WHERE category_id=? AND status='published' AND published_at < ? ORDER BY published_at DESC LIMIT 12
CREATE INDEX IF NOT EXISTS idx_articles_cat_status_pub
  ON articles (category_id, status, published_at DESC);

-- Halaman penulis
CREATE INDEX IF NOT EXISTS idx_articles_author_status_pub
  ON articles (author_id, status, published_at DESC);

-- Headline beranda: partial index kecil (hanya baris headline yang terbit)
CREATE INDEX IF NOT EXISTS idx_articles_headline
  ON articles (published_at DESC) WHERE is_headline = 1 AND status = 'published';

-- Penjadwal (cron tiap 5–15 menit): cari artikel scheduled yang waktunya tiba
CREATE INDEX IF NOT EXISTS idx_articles_scheduled
  ON articles (published_at) WHERE status = 'scheduled';

-- Admin: daftar draf/review terbaru diedit
CREATE INDEX IF NOT EXISTS idx_articles_status_updated
  ON articles (status, updated_at DESC);

-- ---------------------------------------------------------------------
-- Tag (many-to-many)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
  id         INTEGER PRIMARY KEY,
  slug       TEXT    NOT NULL UNIQUE,            -- 'hujan-meteor'
  name       TEXT    NOT NULL,                   -- 'hujan meteor'
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)               -- tag milik satu artikel (halaman artikel)
) WITHOUT ROWID;

-- Halaman tag: artikel untuk satu tag (lalu JOIN articles via PK)
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags (tag_id, article_id);

-- ---------------------------------------------------------------------
-- (Opsional) Pencarian full-text bawaan SQLite (FTS5) — pengganti Pagefind di mode SSR.
-- External-content: tidak menduplikasi teks; disinkron via trigger.
-- Hasil pencarian di-cache singkat (mis. 5 menit) agar hemat rows read.
-- ---------------------------------------------------------------------
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
  title, excerpt, body_markdown,
  content = 'articles', content_rowid = 'id',
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts (rowid, title, excerpt, body_markdown)
  VALUES (new.id, new.title, new.excerpt, new.body_markdown);
END;
CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
  INSERT INTO articles_fts (articles_fts, rowid, title, excerpt, body_markdown)
  VALUES ('delete', old.id, old.title, old.excerpt, old.body_markdown);
END;
CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE OF title, excerpt, body_markdown ON articles BEGIN
  INSERT INTO articles_fts (articles_fts, rowid, title, excerpt, body_markdown)
  VALUES ('delete', old.id, old.title, old.excerpt, old.body_markdown);
  INSERT INTO articles_fts (rowid, title, excerpt, body_markdown)
  VALUES (new.id, new.title, new.excerpt, new.body_markdown);
END;

-- ---------------------------------------------------------------------
-- (Opsional) Redirect slug lama → baru (kalau judul/slug diganti setelah terbit; jaga SEO)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slug_redirects (
  old_path   TEXT PRIMARY KEY,                   -- '/sains/judul-lama/'
  new_path   TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
) WITHOUT ROWID;

-- ---------------------------------------------------------------------
-- Data awal
-- ---------------------------------------------------------------------
INSERT OR IGNORE INTO categories (slug, name, description, sort_order) VALUES
  ('news',      'News',      'Berita terkini nasional dan internasional.',                1),
  ('teknologi', 'Teknologi', 'Gawai, internet, startup, dan dunia digital.',              2),
  ('otomotif',  'Otomotif',  'Mobil, motor, kendaraan listrik, dan tips berkendara.',     3),
  ('sains',     'Sains',     'Penemuan, riset, antariksa, dan lingkungan.',               4),
  ('ekonomi',   'Ekonomi',   'Bisnis, keuangan, pasar, dan UMKM.',                        5),
  ('olahraga',  'Olahraga',  'Sepak bola, bulu tangkis, MotoGP, dan olahraga lainnya.',   6),
  ('hiburan',   'Hiburan',   'Film, musik, selebritas, dan budaya pop.',                  7);

INSERT OR IGNORE INTO authors (slug, name, role, bio, email) VALUES
  ('redaksi', 'Redaksi Bacaanku Network', 'Tim Redaksi',
   'Tulisan tim redaksi bacaankunetwork.com, disusun dari sumber-sumber terbuka yang dicantumkan di setiap artikel.',
   'redaksi@bacaankunetwork.com'),
  ('rizal', 'Rizal', 'Editor',
   'Editor bacaankunetwork.com.',
   'rizal@bacaankunetwork.com'),
  ('jenny', 'Jenny', 'Editor',
   'Editor bacaankunetwork.com.',
   'jenny@bacaankunetwork.com'),
  ('rere', 'Rere', 'Editor',
   'Editor bacaankunetwork.com.',
   'rere@bacaankunetwork.com');

-- Database yang sudah pernah di-seed tanpa email/editor tetap dapat baris yang sama.
UPDATE authors SET email = 'redaksi@bacaankunetwork.com'
  WHERE slug = 'redaksi' AND (email IS NULL OR email = '');

-- ---------------------------------------------------------------------
-- Contoh query publik (semua memakai index di atas)
-- ---------------------------------------------------------------------
-- Beranda — 12 terbaru (kolom ringkas):
--   SELECT a.id, a.slug, a.title, a.excerpt, a.hero_r2_key, a.hero_alt, a.published_at, c.slug AS cat_slug, c.name AS cat_name
--   FROM articles a JOIN categories c ON c.id = a.category_id
--   WHERE a.status = 'published' AND a.published_at <= unixepoch()
--   ORDER BY a.published_at DESC LIMIT 12;
-- Kategori — halaman berikut (keyset):
--   ... WHERE a.category_id = ?1 AND a.status = 'published' AND a.published_at < ?2 ORDER BY a.published_at DESC LIMIT 12;
-- Artikel — satu baris via UNIQUE(slug):
--   SELECT a.*, c.slug AS cat_slug, c.name AS cat_name, au.slug AS author_slug, au.name AS author_name
--   FROM articles a JOIN categories c ON c.id = a.category_id JOIN authors au ON au.id = a.author_id
--   WHERE a.slug = ?1 AND a.status = 'published';
-- Tag artikel:
--   SELECT t.slug, t.name FROM article_tags at JOIN tags t ON t.id = at.tag_id WHERE at.article_id = ?1;
-- Google News sitemap (48 jam):
--   SELECT a.slug, a.title, a.published_at, c.slug FROM articles a JOIN categories c ON c.id = a.category_id
--   WHERE a.status = 'published' AND a.published_at >= unixepoch() - 172800 ORDER BY a.published_at DESC LIMIT 1000;
-- Penjadwal (cron):
--   UPDATE articles SET status = 'published', updated_at = unixepoch() WHERE status = 'scheduled' AND published_at <= unixepoch();
-- Pencarian:
--   SELECT a.slug, a.title, a.excerpt FROM articles_fts f JOIN articles a ON a.id = f.rowid
--   WHERE articles_fts MATCH ?1 AND a.status = 'published' ORDER BY rank LIMIT 20;
