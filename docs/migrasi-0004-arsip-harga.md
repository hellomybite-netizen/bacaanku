# Migrasi 0004 — arsip tanpa ganti URL, noindex per artikel, harga terstruktur

Cabang `arsip-dan-harga` (draft PR). **Belum dijalankan di produksi.** Semua langkah di bawah butuh persetujuan Rizal.

## Ringkasan

| File | Isi | Mengubah baris? |
|---|---|---|
| `docs/migrations/0004_arsip_noindex_harga.sql` | 11 `ALTER TABLE articles ADD COLUMN` (archived_at, robots_noindex, price_*) + 1 index parsial `idx_articles_archived_pub` | Tidak (kolom baru NULL / 0) |
| `docs/migrations/0004b_arsip_data_2026-11-27.sql` | 7 `UPDATE` (satu per kategori lama) mengisi `archived_at` untuk 208 slug `jenis=arsip-berita` di inventaris | Ya, hanya `archived_at` |

URL tidak berubah: `slug`, `category_id`, `status` (tetap `published`), dan `published_at` tidak disentuh. Tidak ada
redirect, tidak ada 410, tidak ada noindex. Hasilnya: 208 halaman tetap 200 + banner arsip; keluar dari beranda, menu,
sitemap (`sitemap-halaman`, `sitemap-arsip/*`), `news-sitemap.xml`, RSS (`/rss.xml`, `/rss/{kategori}.xml`), Terpopuler,
dan "Artikel Terkait"; tampil di `/arsip-berita/` (24 per halaman, keyset `?before=&id=`).

Kenapa kolom `archived_at` (bukan `status='archived'`): semua query publik mensyaratkan `status='published'`, jadi status
arsip = 404 (itulah bug tombol "Arsipkan" sekarang). Dengan kolom terpisah, halaman tunggal tetap memakai query lama
(200), dan hanya daftar/feed/sitemap yang menambah `AND a.archived_at IS NULL`.

Artikel yang diarsipkan (208, dari `/workspace/bacaanku-arsip-artikel-2026-11-27/inventaris.csv`, kolom `jenis`):
news 37, olahraga 32, hiburan 31, ekonomi 30, otomotif 27, teknologi 26, sains 25 — seluruh berita lama terbit 12–25 Nov
2026. Tidak termasuk: 47+5 panduan (`baru-niche`) dan 14 URL yang sudah 410 (`sudah-dihapus`). Daftar slug lengkap ada di
file `0004b`. Cek silang 27 Nov 2026 (query baca-saja produksi): produksi punya tepat 208 artikel di 7 kategori lama, semua
`published` — cocok dengan inventaris.

## Urutan (WAJIB: migrasi dulu, baru kode)

Kode cabang ini membaca kolom baru di query publik (`archived_at`, `robots_noindex`, `price_*`). Kalau kode dideploy
sebelum 0004, halaman berita & daftar panduan akan error. Sebaliknya, 0004 + 0004b aman dijalankan dengan kode lama yang
sedang live (kode lama tidak membaca kolom baru; arsip belum berefek sampai kode baru live).

0. **Jangan** jalankan di jam terbit Jenny (~07.00 WIB) atau Rere (~09.00 WIB). Waktu aman: 10.00–17.00 WIB.
   PR #12 (`fitur-upload-r2`) di-merge dulu ke `main`, lalu PR ini di-retarget ke `main`.
1. **Backup** (D1 export API menolak DB ber-FTS5, jadi pakai Time Travel + dump):
   - Catat bookmark Time Travel: `wrangler d1 time-travel info bacaanku-db` (simpan bookmark + waktu WIB).
   - Dump JSON baca-saja tabel `articles`, `article_tags`, `tags`, `slug_redirects` seperti backup 26 Nov
     (`/workspace/backups/bacaanku-db-sebelum-0004-YYYYMMDD-HHMMWIB.json`).
2. **Cek belum pernah jalan**: `SELECT name FROM pragma_table_info('articles') WHERE name='archived_at';` → harus kosong.
   (`ADD COLUMN` tidak bisa diulang.)
3. **0004** (skema): `wrangler d1 execute bacaanku-db --remote --file=docs/migrations/0004_arsip_noindex_harga.sql`
   (atau lewat Cloudflare API `/d1/database/{id}/query`). Verifikasi: 11 kolom baru ada, `idx_articles_archived_pub` ada,
   `SELECT COUNT(*) FROM articles WHERE archived_at IS NOT NULL` = 0. Situs tetap normal (kode lama).
4. **0004b** (data arsip): `wrangler d1 execute bacaanku-db --remote --file=docs/migrations/0004b_arsip_data_2026-11-27.sql`.
   Verifikasi: `SELECT COUNT(*) FROM articles WHERE archived_at IS NOT NULL` = **208**; `SELECT COUNT(*) FROM articles
   WHERE archived_at IS NOT NULL AND category_id IN (SELECT id FROM categories WHERE slug IN ('hotel','wisata','kuliner'))` = 0.
5. **Deploy kode** dari `main` setelah merge (bukan dari cabang lama `fcc5525`): `npm run build` →
   `/workspace/deploy-v5/mkworker.mjs` → upload via Cloudflare API → purge.
   Catatan mkworker: skrip ini membaca `dist/server` dari `/workspace/bacaanku-gpt` (arahkan ke worktree hasil merge),
   menulis binding manual (DB, ASSETS, CF_ZONE_ID, inherit ADMIN_PASSWORD/ADMIN_TOKEN) dan **tidak** membaca `vars`
   `wrangler.jsonc` — fitur ini tidak butuh var/binding baru. `run_worker_first` tidak perlu diubah (`/arsip-berita/`
   sudah ditangani Worker karena bukan file statis).
6. **Purge** cache: beranda, `/arsip-berita/`, `/rss.xml`, `/rss/*.xml`, `/news-sitemap.xml`, `/sitemap.xml`,
   `/sitemap-halaman.xml`, `/sitemap-arsip/2026-11.xml`, 7 halaman kategori lama, dan 208 URL artikel (atau purge
   everything sekali di luar jam terbit).
7. **Verifikasi** (skrip lokal bisa diarahkan ke produksi untuk GET saja): 208 URL lama = 200 + banner; RSS/sitemap/
   news-sitemap tidak memuat satu pun dari 208; `/arsip-berita/` menampilkan "208 berita tersimpan"; 52 panduan tetap 200;
   Search Console: kirim ulang `sitemap.xml`.

## Rollback

| Masalah | Tindakan | Efek |
|---|---|---|
| Arsip salah artikel / ingin batal arsip semua | `UPDATE articles SET archived_at = NULL WHERE archived_at IS NOT NULL;` (atau per slug) | Langsung kembali tampil di daftar/feed/sitemap (setelah purge). URL tidak pernah berubah. |
| Kode baru bermasalah | Rollback Worker ke versi sebelumnya (`c664cac2` atau versi live terakhir) lewat Cloudflare → Workers → Deployments | Kode lama mengabaikan kolom baru; situs kembali seperti sebelum deploy (arsip tidak berefek). |
| Kolom baru ingin dibuang | Tidak perlu. Bila wajib: `ALTER TABLE articles DROP COLUMN …` per kolom (hapus index `idx_articles_archived_pub` dulu), hanya setelah rollback kode | — |
| Data rusak | Time Travel restore ke bookmark langkah 1 (`wrangler d1 time-travel restore bacaanku-db --bookmark=…`) | Mengembalikan seluruh DB ke titik backup (artikel yang terbit sesudahnya ikut hilang — terbitkan ulang). |

## Dampak ke alur Jenny/Rere

- **Berita** (`category` 7 kategori lama): API tidak berubah, tidak ada field baru wajib. Berita baru tayang normal (tidak
  otomatis arsip). Diuji lokal: `POST /api/admin/articles/` → 200.
- **Panduan** (`hotel`/`wisata`/`kuliner`): mulai deploy, `action=publish|review|schedule` **ditolak (400, `errors.priceValue`
  / `priceCheckedAt` / `priceSourceUrl`) bila harga utama/Gratis + tanggal cek (+ URL sumber bila berbayar) tidak dikirim.**
  Skrip/prompt Jenny & Rere harus mengirim field `price_*` SEBELUM kode ini live, kalau tidak terbit pagi berikutnya gagal.
  (Panduan lama yang sudah tayang tetap bisa diedit tanpa harga selama masa transisi — hanya peringatan.)
- `action=archive` lewat API kini mempertahankan URL (sebelumnya artikel hilang/404).

## Dampak ke 52 panduan yang sudah tayang (harga)

Tidak ada yang rusak: semua tetap tayang, Info Singkat lama (facts) tetap tampil; harga terstruktur baru muncul setelah
diisi. **Tidak ada satu pun yang sudah memenuhi aturan baru** (0 punya tanggal cek). Klasifikasi (Info Singkat produksi,
dicek baca-saja 27 Nov 2026), rincian per artikel di `docs/data-harga-panduan-2026-11-27.csv`:

| Status | Jumlah | ID | Pekerjaan |
|---|---|---|---|
| Sudah ada nominal rupiah + sumber disebut di fakta | 10 | 228, 230, 231, 232, 233, 251, 260, 265, 266, 267 | Pindahkan ke `price_value`, isi URL sumber + tanggal cek (cek ulang nominal) |
| Gratis / tanpa tiket | 8 | 235, 241, 242, 245, 246, 248, 250, 270 | Centang Gratis + tanggal cek (248 Pantai Serang: "sempat digratiskan 2026" perlu dicek ulang) |
| Hanya "cek situs resmi" | 7 | 224, 226, 238, 274 (hotel), 227, 237 (wisata), 229 (kuliner) | Riset nominal (tarif mulai-dari / tiket / harga menu) |
| Tanpa harga sama sekali | 27 | 223, 225, 234, 236, 239, 240, 243, 244, 247, 249, 252–259, 261, 262, 263, 264, 268, 269, 271, 272, 273 | Riset dari nol; beberapa mungkin Gratis (kelenteng, gereja, pasar, stasiun) atau tidak relevan (272 upacara Yadnya Kasada) |

Total yang butuh riset harga baru: 34 (7 + 27). Yang cukup dipindahkan + diberi tanggal cek: 18 (10 + 8).
Perkiraan: 18 artikel × ±5 menit, 34 artikel × ±15–20 menit.

## Uji lokal (27 Nov 2026)

D1 lokal = backup 26 Nov (208 berita) + 0003 + 52 panduan produksi (dari snapshot `/workspace/lw-thicken` + query
baca-saja kolom pendek) + 0004 + 0004b. Hasil: `/workspace/bacaanku-arsip-notes/` (api-test.py, api-test-hasil.txt,
arsip-208-hasil.txt). Tidak ada yang ditulis ke D1 produksi.
