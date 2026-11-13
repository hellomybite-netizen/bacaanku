# Rencana Migrasi: Astro Statis (GitHub Pages) → Astro SSR di Cloudflare Workers + D1 + R2

> Proyek: **Bacaanku Network** — `bacaankunetwork.com`
> Dokumen ini hanya rencana teknis (tidak ikut build Astro; folder `docs/` di luar `src/` dan `public/`).
> Angka limit dicek dari dokumentasi resmi Cloudflare per 12 Nov 2026 — cek ulang sebelum eksekusi.
>
> **Penyesuaian saat implementasi:** Cloudflare R2 ditunda supaya situs bisa tayang tanpa verifikasi kartu/tagihan. `wrangler.jsonc` belum memasang `r2_buckets`. Gambar artikel memakai URL `https://…` atau path situs `/…` yang disimpan di kolom `hero_r2_key`. Jika nanti `MEDIA_BASE` (dan binding `MEDIA`) diisi, kunci R2 seperti `2026/11/slug` ikut terselesaikan. Pratinjau GitHub Pages tetap build statis lewat `BUILD_MODE=static` (`npm run build:preview`).

## 0. Target & ringkasan keputusan

| Target | Nilai |
| --- | --- |
| Produksi konten | 30 artikel/hari (~900/bulan, ~11.000/tahun) |
| Trafik | 1.000 kunjungan/hari (anggap ±3–5 halaman/kunjungan → 3.000–5.000 pageview/hari) |
| Biaya | **Rp 0/bulan** (Workers Free + D1 Free + R2 Free); nama domain dibayar terpisah |

Keputusan:

1. **Astro SSR** dengan `@astrojs/cloudflare` (v14.x, kompatibel Astro 7) di **Cloudflare Workers** (adapter tidak lagi mendukung Cloudflare Pages).
2. **D1** menyimpan semua konten & metadata (skema: [`docs/schema.sql`](./schema.sql)).
3. **R2** menyimpan gambar (WebP, opsional AVIF) — disajikan lewat custom domain `media.bacaankunetwork.com`.
4. **Edge cache** di depan Worker → mayoritas request tidak menjalankan Worker/D1 sama sekali.
5. **Admin `/admin` SSR** sendiri (dilindungi Cloudflare Access) menggantikan Decap CMS berbasis Git → publish instan, tanpa build ulang.

## 1. Kenapa migrasi (masalah setup sekarang)

- Tiap artikel = 1 commit + build penuh. 900 artikel/bulan → build makin lama (Pagefind + optimasi gambar), dan GitHub Pages punya batas soft 10 build/jam & 1 GB ukuran situs.
- Gambar disimpan di repo Git → repo membengkak cepat (900 hero/bulan).
- Decap CMS butuh akun GitHub per penulis dan alur PR/commit — lambat untuk newsroom.

## 2. Anggaran limit paket Free (dan pemakaian perkiraan)

| Layanan | Limit Free | Perkiraan pemakaian kita | Status |
| --- | --- | --- | --- |
| Workers – request | 100.000/hari (reset 00:00 UTC = 07:00 WIB) | ≤ 5.000 pageview + aset statis (aset statis Workers **tidak dihitung** sebagai invocation) + bot ≈ 5–15 rb/hari | aman (≤ 15%) |
| Workers – CPU | 10 ms/request | Render template + HTML siap pakai dari D1 ≈ 2–6 ms; markdown **tidak** dirender saat request | perlu dijaga |
| Workers – subrequest | 50/request | 2–4 query D1 per halaman (pakai `db.batch()`) | aman |
| D1 – rows read | 5 juta/hari | Lihat §5: worst case tanpa cache ±0,5 juta; dengan cache < 100 rb | aman |
| D1 – rows written | 100.000/hari | 30 artikel × (1 baris + ±5 tag + index + FTS) ≈ 30 × 20 = ±600/hari, + edit ≈ < 2.000 | aman |
| D1 – storage | 500 MB/database (5 GB/akun) | ±15–25 KB/artikel (markdown + html + FTS) → ±250 MB/tahun | aman ±2 tahun, lalu arsip/DB kedua |
| R2 – storage | 10 GB-bulan | 3 ukuran WebP ≈ 250 KB/artikel → ±225 MB/bulan → ±2,7 GB/tahun | aman ±3 tahun |
| R2 – Class A (tulis) | 1 juta/bulan | ±900 × 3–4 file ≈ 3.600/bulan | aman |
| R2 – Class B (baca) | 10 juta/bulan | Gambar di-cache CDN; miss ke R2 ≈ < 200 rb/bulan | aman |
| Images transformations (opsional) | 5.000 transformasi unik/bulan | 900 hero × 3 lebar = 2.700 (format AVIF/WebP tidak dihitung terpisah) | aman, tapi jadi opsi cadangan |
| Cron Triggers | 5/akun | 1 (penjadwal artikel) | aman |

Catatan penting:
- Saat limit harian D1/Workers Free habis, request **gagal** (bukan ditagih). Mitigasi: cache agresif (§6) + alarm Notification di dashboard + set route Worker ke *fail open* hanya jika aman.
- R2 perlu verifikasi kartu saat aktivasi (tetap Rp 0 selama di bawah kuota).
- Kalau suatu saat butuh lebih: Workers Paid $5/bulan (≈ Rp 80–85 rb) sudah termasuk D1 25 miliar rows read & 50 juta rows written per bulan.

## 3. Arsitektur

```
Pembaca ──► Cloudflare edge (bacaankunetwork.com)
              ├─ /_astro/*, /fonts/*, favicon, robots.txt  → Workers Static Assets (gratis, tidak dihitung invocation)
              ├─ halaman publik (/, /{kategori}/, /{kategori}/{slug}/, /tag/*, /penulis/*, RSS, sitemap)
              │     └─ Edge cache HIT? → kirim langsung (Worker tidak jalan)
              │        MISS → Worker (Astro SSR) → D1 (1–3 query, index) → HTML + Cache-Control + Cache-Tag
              ├─ /tentang/, /pedoman-media-siber/, /privasi/, /kontak/, /redaksi/, 404  → prerender (statis, build time)
              └─ /admin/*, /api/admin/*  → Cloudflare Access (Zero Trust) → Worker SSR, no-store
media.bacaankunetwork.com ──► R2 bucket "bacaanku-media" (custom domain, cache CDN, Cache-Control immutable)
Cron (*/5 menit) ──► Worker scheduled(): publikasikan artikel 'scheduled' + purge cache
```

### 3.1 Konfigurasi Astro

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap'; // hanya untuk halaman statis; sitemap artikel dibuat dinamis

export default defineConfig({
  site: 'https://bacaankunetwork.com',
  output: 'server',            // default SSR; halaman statis pakai `export const prerender = true`
  adapter: cloudflare({
    imageService: 'compile',   // gambar lokal (logo, ilustrasi) dioptimasi saat build;
                               // gambar artikel sudah WebP siap pakai dari R2 → tidak perlu transformasi runtime
  }),
  session: false,              // tidak pakai Astro Sessions → tidak perlu KV
});
```

Halaman statis (`src/pages/tentang.astro`, `pedoman-media-siber.astro`, `privasi.astro`, `kontak.astro`, `redaksi.astro`, `404.astro`):

```astro
---
export const prerender = true;
---
```

Akses binding (Astro 6+/7: `Astro.locals.runtime` sudah dihapus):

```ts
// src/lib/db.ts
import { env } from 'cloudflare:workers';
export const db = () => env.DB;           // D1Database
export const media = () => env.MEDIA;     // R2Bucket
```

### 3.2 `wrangler.jsonc`

```jsonc
{
  "name": "bacaankunetwork",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-11-12",
  "compatibility_flags": ["nodejs_compat"],
  "routes": [{ "pattern": "bacaankunetwork.com", "custom_domain": true }],
  "d1_databases": [{ "binding": "DB", "database_name": "bacaanku-db", "database_id": "<ISI-SETELAH-CREATE>" }],
  "r2_buckets": [{ "binding": "MEDIA", "bucket_name": "bacaanku-media" }],
  "triggers": { "crons": ["*/5 * * * *"] },
  "vars": { "MEDIA_BASE": "https://media.bacaankunetwork.com" }
  // Secret (JANGAN di file ini): npx wrangler secret put CF_PURGE_TOKEN / ADMIN_TOKEN
}
```

Cron butuh custom entrypoint (`src/worker.ts`) yang meneruskan `fetch` ke `handle()` dari `@astrojs/cloudflare/handler` dan menambah `scheduled()`.

## 4. Data di D1

Skema lengkap: [`docs/schema.sql`](./schema.sql). Tabel: `categories`, `authors`, `articles`, `tags`, `article_tags` (+ opsional `articles_fts` untuk pencarian FTS5 dan `slug_redirects`).

Poin desain:
- `articles.status`: `draft` → `review` → `scheduled`/`published` (→ `archived`). Constraint memastikan `published_at` terisi saat scheduled/published.
- `body_markdown` = sumber yang diedit; `body_html` = hasil render + sanitasi **saat disimpan** di admin → SSR tinggal menempel HTML (hemat CPU 10 ms).
- `sources_json` = daftar sumber `[{name,title,url}]` → dirender jadi blok "Sumber" di akhir artikel (aturan: 3–5 sumber/artikel).
- `hero_r2_key` + `hero_width/height` + `hero_alt` + `hero_credit(_url)` → `<picture>` dengan srcset dan kredit foto wajib.
- Waktu = INTEGER unix epoch (UTC); tampilan dikonversi ke WIB di template.
- `view_count` **tidak** di-update per pageview (itu bisa ribuan rows written/hari). "Terpopuler" diisi berkala (mis. harian) dari Cloudflare Web Analytics, atau dihitung dari artikel terbaru.

### 4.1 Index & strategi hemat rows read

| Query | Index | Rows read kira-kira |
| --- | --- | --- |
| Beranda 12–20 terbaru | `idx_articles_status_pub` (covering) | ±20 |
| Headline | partial `idx_articles_headline` | 1–5 |
| Kategori (keyset `published_at < ?`) | `idx_articles_cat_status_pub` | ±12 |
| Detail artikel | `UNIQUE(slug)` + PK join | ±3 + jumlah tag |
| Halaman tag | `idx_article_tags_tag` | ±12–24 |
| Sitemap berita 48 jam | `idx_articles_status_pub` | ±60 |
| Penjadwal cron | partial `idx_articles_scheduled` | 0–beberapa |

Aturan: tidak ada `SELECT *` di daftar; tidak ada `OFFSET` besar; tidak ada `COUNT(*)` per request (simpan total per kategori di cache atau tampilkan "Berikutnya" saja); verifikasi tiap query baru dengan `EXPLAIN QUERY PLAN` (harus `SEARCH ... USING INDEX`, bukan `SCAN articles`). Pantau `meta.rows_read` di log saat pengembangan.

## 5. Hitungan rows read (worst case)

- Rata-rata halaman ±40 rows read (beranda ±60 termasuk headline + blok kategori; artikel ±10).
- **Tanpa cache sama sekali**: 5.000 pageview × 40 + bot/crawler 5.000 × 40 ≈ **400 rb/hari** = 8% dari 5 juta.
- **Dengan cache** (TTL 5–10 menit + purge saat publish): Worker hanya jalan saat MISS → ±1.000–2.000 miss/hari × 40 ≈ **< 100 rb/hari**.
- Sitemap besar (arsip bulanan) & RSS di-cache 15–60 menit.

## 6. Caching di edge

Tujuan: halaman publik disajikan dari cache; Worker + D1 hanya jalan saat cache MISS.

**Header standar halaman publik (SSR):**

```
Cache-Control: public, max-age=60, s-maxage=600, stale-while-revalidate=300
Cache-Tag: home,cat-sains,article-123,author-redaksi,tag-hujan-meteor
```

| Rute | Browser (`max-age`) | Edge (`s-maxage`) |
| --- | --- | --- |
| Beranda, kategori | 60 dtk | 300–600 dtk |
| Artikel | 300 dtk | 1 hari (purge saat edit) |
| RSS, news-sitemap | 300 dtk | 900 dtk |
| Sitemap arsip bulanan | 1 jam | 1 hari |
| Pencarian `/cari?q=` | 0 | 300 dtk (key termasuk query) |
| `/admin`, `/api/admin` | `no-store, private` | tidak di-cache |
| Gambar R2 (nama file versi-unik) | `public, max-age=31536000, immutable` | sama |

**Mekanisme (pilih sesuai ketersediaan di akun saat setup):**

1. **Workers Cache** (`"cache": { "enabled": true }` di wrangler) — cache bawaan di depan Worker: saat HIT, Worker tidak dieksekusi (tidak makan CPU). Purge dari kode lewat `ctx.cache.purge()`/`invalidate()` dengan tag. Adapter `@astrojs/cloudflare` v14 juga sudah punya cache provider yang otomatis memberi `Cloudflare-CDN-Cache-Control` dan `Cache-Tag` per path. **Opsi utama** — verifikasi ketersediaan & kuota di paket Free saat implementasi.
2. **Fallback: Cache API** (`caches.default.match/put`) di middleware Astro — hanya berfungsi di custom domain (bukan `*.workers.dev`), cache per-data center, dan tidak tersedia di rute yang di belakang Cloudflare Access (aman, admin memang tidak di-cache). Request tetap menghitung 1 invocation Worker tapi tanpa query D1.
3. **Purge saat publish/update/unpublish** (dipanggil dari endpoint admin & cron, via `ctx.waitUntil`):
   - tag: `article-{id}`, `home`, `cat-{slug}`, `author-{slug}`, `tag-{slug}` (tiap tag artikel), `feed`, `sitemap`;
   - atau purge per URL lewat Cloudflare API (`POST /zones/{zone_id}/purge_cache` dengan `files: [...]`, token ber-scope *Cache Purge* saja, disimpan sebagai secret).

Dengan ini jumlah invocation Worker tetap jauh di bawah 100 rb/hari, walau trafik naik 10×.

## 7. Gambar di R2 (WebP/AVIF)

Kendala: Worker Free (CPU 10 ms, tanpa Sharp/native) tidak bisa resize gambar di server. Solusi:

**Opsi utama — resize di browser admin (biaya 0, tanpa kuota transformasi):**
1. Editor memilih foto di `/admin` → JS di browser (`createImageBitmap` + `OffscreenCanvas.convertToBlob({ type: 'image/webp', quality: 0.8 })`) membuat 3 lebar: **480, 960, 1600 px**. AVIF opsional bila browser editor mendukung encode AVIF (cek `convertToBlob` hasilnya benar `image/avif`; kalau tidak, WebP saja).
2. Upload ke `POST /api/admin/upload` (multipart, dilindungi Access) → Worker validasi tipe (magic bytes), ukuran ≤ 2 MB/file, lalu `env.MEDIA.put('2026/11/{slug}-{hash}-960.webp', body, { httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' } })`.
3. Simpan `hero_r2_key`, `hero_width`, `hero_height`, alt, kredit ke D1.
4. Template merender:

```html
<picture>
  <source type="image/avif" srcset="…-480.avif 480w, …-960.avif 960w, …-1600.avif 1600w" sizes="(min-width: 1024px) 760px, 100vw"><!-- jika ada -->
  <img src="https://media.bacaankunetwork.com/2026/11/slug-ab12-960.webp"
       srcset="…-480.webp 480w, …-960.webp 960w, …-1600.webp 1600w"
       sizes="(min-width: 1024px) 760px, 100vw" width="1600" height="900"
       alt="…" fetchpriority="high" decoding="async">
</picture>
<figcaption>… · Foto: Nama / Sumber (lisensi)</figcaption>
```

**Opsi cadangan — Cloudflare Images transformations** di atas R2 (`/cdn-cgi/image/width=960,format=auto/…`): 5.000 transformasi unik/bulan gratis; 900 hero × 3 lebar = 2.700/bulan masih muat. Lewat kuota → transformasi baru error 9422 (tidak ditagih), jadi tetap simpan file WebP asli sebagai fallback.

**Skrip migrasi/batch** (`scripts/upload-media.mjs`, dijalankan di laptop/CI dengan Node + Sharp): baca folder gambar → hasilkan 480/960/1600 WebP+AVIF → upload ke R2 via S3 API (kredensial R2 token *Object Read & Write* untuk bucket itu saja, dari env var, jangan di-commit) → cetak `hero_r2_key` untuk dimasukkan ke D1. Dipakai untuk memindahkan gambar lama di `src/assets/` dan `public/`.

Aturan konten tetap: hanya foto berlisensi bebas (CC0/CC BY/CC BY-SA/domain publik/foto resmi press kit) atau ilustrasi orisinal, kredit + tautan lisensi wajib.

## 8. Admin panel (pengganti Decap CMS)

| Opsi | Kelebihan | Kekurangan |
| --- | --- | --- |
| **A. `/admin` SSR + Cloudflare Access (rekomendasi)** | Login email OTP/Google tanpa kode auth sendiri; gratis s.d. 50 user; Worker cukup verifikasi JWT header `Cf-Access-Jwt-Assertion` (cek `aud` & signature dari `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`) dan ambil email → map ke `authors.email`/peran | Perlu setup Zero Trust (sekali) |
| B. `/admin` + token sederhana | Paling cepat dibuat | Token dibagi-bagi, tanpa identitas per penulis, rawan bocor; hanya untuk tahap uji |
| C. Tetap Decap (Git) | Sudah ada | Tiap publish = commit + build; tidak cocok untuk 30 artikel/hari di SSR |

Fitur admin minimum:
- Daftar artikel per status (draf/review/terjadwal/terbit), filter kategori, cari judul.
- Editor **Markdown** dengan pratinjau (mis. komponen editor ringan seperti EasyMDE/Milkdown/TipTap mode markdown); saat simpan: render markdown → HTML, **sanitasi** (allowlist tag), hitung waktu baca, buat slug unik.
- Form wajib: judul, ringkasan, kategori, penulis, tag, hero (upload + alt + kredit + URL kredit), **min. 3 sumber** (`sources_json`), SEO title/description dengan penghitung karakter, toggle headline, jadwal tayang (WIB → disimpan UTC).
- Tombol Publish/Jadwalkan/Unpublish → tulis D1 dalam `db.batch()` (artikel + tag) → purge cache tag terkait.
- Peran sederhana: `penulis` (draf/review), `editor` (publish). Log perubahan opsional (tabel `article_revisions`) bila dibutuhkan.
- Semua respons admin: `Cache-Control: no-store`, `X-Robots-Tag: noindex`, cek CSRF (Origin header) untuk POST.

## 9. SEO & fitur yang harus tetap sama

- URL sama persis: `/{kategori}/{slug}/` (trailing slash) → tidak ada link rusak; `slug_redirects` untuk slug yang diganti.
- JSON-LD `NewsArticle`, `BreadcrumbList`, `WebSite`+`SearchAction`, `NewsMediaOrganization` dirender dari data D1.
- `/sitemap.xml` (index) + sitemap per bulan dinamis, `/news-sitemap.xml` (48 jam), `/rss.xml` & RSS per kategori — semuanya endpoint SSR ber-cache.
- `robots.txt` & halaman statis prerender. Canonical ke `https://bacaankunetwork.com`.
- Pencarian: Pagefind (statis) diganti FTS5 D1 (`articles_fts`) di `/cari?q=`, hasil di-cache 5 menit.
- Performa: HTML kecil, CSS kritis inline, hero `fetchpriority="high"`, `content-visibility` untuk blok bawah — sama seperti prototipe.

## 10. Rencana bertahap menuju produksi

### Step 1 — Fondasi Cloudflare (±1–2 hari)
- Beli/arahkan domain `bacaankunetwork.com` ke Cloudflare (nameserver), aktifkan R2 (verifikasi kartu, tetap gratis).
- `npx wrangler d1 create bacaanku-db` → `npx wrangler d1 execute bacaanku-db --remote --file=docs/schema.sql`.
- `npx wrangler r2 bucket create bacaanku-media` → hubungkan custom domain `media.bacaankunetwork.com`.
- Pasang `@astrojs/cloudflare`, buat `wrangler.jsonc`, `output: 'server'`, prerender halaman statis. Deploy dulu ke `*.workers.dev` / subdomain `beta.` dengan `noindex`.
- GitHub Pages preview tetap jalan sebagai cadangan selama transisi.

### Step 2 — Data layer & migrasi konten (±2–3 hari)
- Buat `src/lib/repo.ts` (query D1 ber-index, `db.batch()`), ganti `getCollection()` di semua halaman dengan query D1.
- Skrip `scripts/migrate-content.mjs`: baca `src/content/articles/*.md(x)` + `authors/*.json` → INSERT ke D1 (render markdown → `body_html`); komponen MDX khusus (`<Figure>`) dikonversi ke HTML.
- Skrip `scripts/upload-media.mjs`: gambar lama → WebP/AVIF 3 ukuran → R2.
- Endpoint dinamis RSS/sitemap/news-sitemap; pencarian FTS5.
- Uji: semua URL lama 200, JSON-LD valid (Rich Results Test), Lighthouse ≥ 90, `EXPLAIN QUERY PLAN` semua query.

### Step 3 — Admin & alur redaksi (±3–5 hari)
- Setup Cloudflare Access untuk `/admin*` dan `/api/admin*` (allowlist email tim).
- Bangun editor Markdown, upload gambar (resize di browser → R2), form sumber & kredit wajib, jadwal tayang + cron, purge cache otomatis.
- Matikan Decap CMS (`public/admin/` lama) setelah admin baru stabil.

### Step 4 — Go-live di `bacaankunetwork.com` (±1 hari + pemantauan)
- Aktifkan cache (Workers Cache / Cache API) + verifikasi `cf-cache-status: HIT` pada request kedua; uji purge saat publish.
- Pasang custom domain produksi, hapus `noindex`, submit sitemap & news-sitemap ke Google Search Console, daftar Google News Publisher Center.
- Pantau 2 minggu: dashboard Workers (request, CPU p99 < 10 ms), D1 (rows read/written harian), R2 (storage/ops); pasang notifikasi usage. Batas aman: kalau rows read > 2 juta/hari atau request > 60 rb/hari secara konsisten → naikkan TTL atau pertimbangkan Workers Paid $5/bulan.
- Backup: D1 Time Travel (7 hari di Free) + ekspor mingguan `npx wrangler d1 export bacaanku-db --remote --output=backup.sql` disimpan di luar Cloudflare.

## 11. Risiko & mitigasi

| Risiko | Mitigasi |
| --- | --- |
| CPU > 10 ms per request (error 1102) | HTML artikel sudah dirender saat simpan; hindari library berat di runtime; cache; pantau CPU p99 |
| Lonjakan bot/crawler | Cache edge; aturan WAF/Bot Fight Mode gratis; rate limit `/cari` |
| Limit harian habis | Cache + alarm usage; upgrade $5/bulan bila tren naik |
| D1 500 MB penuh (±2 tahun) | Arsipkan artikel > 2 tahun ke DB kedua (Free boleh 10 DB) atau upgrade |
| Kebocoran token | Semua secret via `wrangler secret`; token API ber-scope minimum; tidak ada secret di repo |
| Konten tidak akurat/plagiat | Form admin mewajibkan ≥ 3 sumber + kredit gambar; alur review editor |
