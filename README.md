# bacaankunetwork.com — Prototipe Portal Berita (Astro)

Portal berita berbahasa Indonesia yang **ringan, cepat, mudah dikelola, dan kuat SEO-nya**.
Dibangun dengan [Astro](https://astro.build) (situs statis), konten berupa file Markdown, pencarian statis
[Pagefind](https://pagefind.app), dan dashboard penulis [Decap CMS](https://decapcms.org) (berbasis git, gratis).

> ⚠️ **Prototipe.** Semua artikel, tokoh, penulis, angka, dan gambar adalah **contoh fiktif**.
> Gambar dibuat lokal (`npm run images`) — bukan foto berhak cipta.

## Menjalankan

Butuh Node.js 22+ (diuji di Node 24).

```bash
npm install
npm run dev       # http://localhost:4321 (pencarian belum aktif di mode dev)
npm run build     # build ke dist/ + membuat indeks pencarian Pagefind
npm run preview   # melihat hasil build (termasuk pencarian)
npm run check     # cek tipe & error
```

## Struktur penting

| Lokasi | Isi |
|---|---|
| `src/config/site.ts` | Nama situs, URL, **daftar kategori**, daftar "Terpopuler", tautan footer |
| `src/content/articles/` | Artikel (`.md` / `.mdx`) |
| `src/content/authors/` | Profil penulis (`.json`) |
| `src/content.config.ts` | Skema artikel & penulis (validasi otomatis saat build) |
| `src/assets/articles/` | Gambar artikel (dikompres otomatis ke AVIF/WebP) |
| `src/components/AdSlot.astro` | **Placeholder iklan** (ukuran tetap, anti layout-shift) |
| `public/admin/` | Konfigurasi Decap CMS |
| `public/_headers` | Header keamanan & cache untuk Cloudflare Pages |

## Menambah artikel

Buat file baru di `src/content/articles/judul-artikel.md`:

```markdown
---
title: "Judul Berita"
slug: judul-berita                 # menjadi URL: /<kategori>/judul-berita/
description: "Ringkasan 50–170 karakter untuk Google dan media sosial."
category: teknologi                # salah satu slug di src/config/site.ts
tags: ["gawai", "ponsel"]
author: rina-pratiwi               # nama file di src/content/authors (tanpa .json)
publishDate: 2026-11-12T08:00:00+07:00
updatedDate: 2026-11-12T10:00:00+07:00   # opsional
heroImage: ../../assets/articles/judul-berita.jpg
heroAlt: "Deskripsi isi gambar"
heroCaption: "Keterangan foto (opsional)"
featured: false                    # true = jadi headline utama beranda
seoTitle: "Judul khusus SEO (opsional, maks 70 karakter)"
canonical: https://contoh.com/asli  # opsional, hanya jika artikel salinan
draft: false                       # true = tidak diterbitkan
---

Isi artikel dalam Markdown...
```

Jika ada field yang salah (mis. kategori tidak dikenal, deskripsi terlalu pendek), `npm run build` akan gagal
dengan pesan yang jelas — jadi kesalahan tertangkap sebelum tayang.

## Menambah kategori

1. Buka `src/config/site.ts`, tambahkan satu baris di array `categories`, mis.
   `{ slug: 'kesehatan', name: 'Kesehatan', description: 'Info kesehatan dan gaya hidup.' },`
2. Tambahkan opsi yang sama di `public/admin/config.yml` (field **Kategori**) agar muncul di dashboard CMS.

Menu, halaman `/kategori/kesehatan/`, RSS `/rss/kesehatan.xml`, sitemap, dan section di beranda dibuat otomatis.

## Fitur SEO yang sudah terpasang

- Judul, meta description, canonical, `hreflang="id-ID"` + `x-default`, `<html lang="id">` per halaman
- Open Graph + Twitter/X card (gambar 1200×675 dari gambar artikel)
- JSON-LD: `NewsArticle` + `BreadcrumbList` (artikel), `WebSite` + `SearchAction` + `NewsMediaOrganization` (beranda), `ProfilePage` (penulis)
- `sitemap-index.xml` (@astrojs/sitemap), **`news-sitemap.xml`** (Google News, artikel 48 jam terakhir saat build)
- RSS global `/rss.xml` dan per kategori `/rss/<kategori>.xml`
- `robots.txt`
- Gambar via `astro:assets`: AVIF/WebP, `width`/`height`, hero `fetchpriority="high"` (tidak lazy), lainnya `loading="lazy"`
- Font sistem (tanpa Google Fonts CDN), CSS di-inline, JS ±2 KB (menu, toggle tema, salin tautan)

> Catatan: `news-sitemap.xml` dihitung saat build. Karena situs statis, lakukan build ulang setiap ada artikel baru
> (otomatis bila memakai Cloudflare Pages + Decap CMS, karena setiap publikasi = commit baru) atau pasang build terjadwal.

## Deploy ke Cloudflare Pages

1. Push folder ini ke repo GitHub (privat juga boleh).
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pilih repo.
3. Pengaturan build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `NODE_VERSION=22` (atau lebih baru)
4. Setelah deploy pertama berhasil: **Custom domains → Set up a domain → bacaankunetwork.com** (dan `www.bacaankunetwork.com`
   sebagai redirect). Paling mudah jika DNS domain dipindah ke Cloudflare (ganti nameserver di registrar).
5. `public/_headers` otomatis dipakai Cloudflare Pages. CSP masih **Report-Only** — pantau dulu, baru ubah ke
   `Content-Security-Policy` setelah memastikan tidak ada yang terblokir (terutama jika memasang iklan/analitik).
6. Daftarkan situs di **Google Search Console** dan kirim `sitemap-index.xml` + `news-sitemap.xml`.
   Untuk Google News, daftarkan juga di **Google Publisher Center**.

## Menghubungkan Decap CMS (dashboard penulis)

Dashboard ada di `https://bacaankunetwork.com/admin/`. Setiap artikel yang diterbitkan lewat dashboard menjadi commit
di GitHub → Cloudflare Pages build ulang otomatis.

**Coba di lokal (tanpa GitHub):**

```bash
npx decap-server      # terminal 1
npm run dev           # terminal 2 → buka http://localhost:4321/admin/
```

**Untuk produksi (backend GitHub):**

1. Ganti `repo: GANTI-USERNAME/bacaanku` di `public/admin/config.yml` dengan repo Anda.
2. Buat **GitHub OAuth App** (GitHub → Settings → Developer settings → OAuth Apps). Callback URL mengikuti
   OAuth proxy yang dipakai.
3. Pasang **OAuth proxy** gratis, mis. Cloudflare Worker (contoh proyek: `sterlingwes/decap-proxy`), isi Client ID &
   Client Secret sebagai *secret* Worker (jangan di-commit).
4. Isi `base_url:` di `config.yml` dengan URL Worker tersebut, lalu deploy ulang.
5. Undang penulis sebagai collaborator repo GitHub. Mode `editorial_workflow` aktif: Draf → Ditinjau → Siap terbit.

## Ruang iklan

Placeholder iklan bertanda **"Ruang Iklan (placeholder)"** ada di beranda (leaderboard & sidebar), halaman kategori,
dan artikel (in-article & sidebar). Ukurannya tetap (728×90 / 320×100, 300×250, 336×280) agar tidak ada layout shift.
Ganti isi `src/components/AdSlot.astro` dengan kode iklan saat live, lalu perbarui CSP dan Kebijakan Privasi.

## Yang masih contoh / perlu diganti sebelum live

- Semua artikel, penulis, susunan redaksi, alamat & email kontak
- Teks lengkap Pedoman Pemberitaan Media Siber (dari Dewan Pers) dan Kebijakan Privasi (tinjau hukum)
- Logo (`public/logo-512.png`, `favicon.svg`, `og-default.png`) — saat ini logo teks sederhana
- Daftar "Terpopuler" di `src/config/site.ts` masih manual (bisa diotomatiskan dari analitik)
- Akun X `@bacaankunetwork` di `src/config/site.ts`

## Preview sementara (GitHub Pages)

`npm run build:preview` membuat build khusus preview di sub-path `/bacaanku/`
(skrip `scripts/preview-rewrite.mjs`): semua tautan diberi prefix base path, URL
`https://bacaankunetwork.com` diganti URL preview, dan seluruh halaman diberi `noindex,nofollow`
+ `robots.txt` `Disallow: /` agar situs contoh tidak diindeks Google.
Build produksi (`npm run build`) tidak terpengaruh.

Workflow `.github/workflows/deploy-preview.yml` men-deploy otomatis setiap push ke `main`.
Syarat sekali saja: **Settings → Pages → Source: GitHub Actions**.
