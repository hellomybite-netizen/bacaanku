# Panduan konten Local Wisdom (Hotel, Wisata, Kuliner) — untuk Jenny & Rere

Desain: port desain GPT dari repo `bacaanku-local-wisdom` (branch `redesign-gpt-local-wisdom`).
Isi panduan sekarang **diambil dari D1**, diterbitkan dengan cara yang sama seperti berita:
riset/ambil sumber → isi lewat `/admin` **atau** kirim lewat API terbit (`POST /api/admin/articles/`).

> Berita biasa (News, Teknologi, Otomotif, Sains, Ekonomi, Olahraga, Hiburan) **tidak berubah**.
> Semua field baru di bawah ini **opsional** dan hanya dipakai untuk kategori Hotel/Wisata/Kuliner.

## 1. Kategori = tipe wisata, kota = kategori kota

| Konsep | Field form / API | Nilai |
|---|---|---|
| Tipe wisata | `category` (atau alias `tipe`) | `hotel`, `wisata`, `kuliner` |
| Kota | `kota` (alias `city_slug`) | slug kota terdaftar (tabel di bawah) |

Provinsi diisi otomatis dari kota. Contoh: **Rawon Nguling → kota `probolinggo`, tipe `kuliner`**.

Kota terdaftar (`src/lib/local-guide.ts`, minta admin bila perlu kota baru):

| slug | Kota | Provinsi |
|---|---|---|
| `malang` | Malang | Jawa Timur |
| `batu` | Batu | Jawa Timur |
| `probolinggo` | Probolinggo | Jawa Timur |
| `surabaya` | Surabaya | Jawa Timur |
| `yogyakarta` | Yogyakarta | DI Yogyakarta |

## 2. Di mana artikel muncul (struktur URL)

| URL | Isi | Catatan SEO |
|---|---|---|
| `/{tipe}/{slug}/` mis. `/kuliner/rawon-nguling/` | Halaman artikel (satu-satunya URL kanonis) | tetap di pola lama `/{kategori}/{slug}/` |
| `/hotel/`, `/wisata/`, `/kuliner/` | Semua artikel satu tipe, semua kota | diindeks |
| `/daerah/` · `/daerah/jawa-timur/` | Ringkasan provinsi → kota | provinsi < 3 artikel = `noindex, follow` |
| `/artikel/` | Semua artikel lokal + tautan per kota & per tipe | diindeks |
| `/artikel/{kota}/` mis. `/artikel/probolinggo/` | Semua tipe di satu kota | < 3 artikel = `noindex, follow`; 0 artikel = 404 |
| `/artikel/{kota}/{tipe}/` mis. `/artikel/malang/kuliner/` | Satu tipe di satu kota | < 3 artikel **atau** isinya sama dengan halaman kota = `noindex, follow` |

Halaman yang layak diindeks otomatis masuk `sitemap-halaman.xml`. Filter di halaman (tab, urutkan, cari)
tidak membuat URL baru, jadi tidak ada halaman duplikat. `/daerah/{kota}/` lama (desain GPT) → 301 ke `/artikel/{kota}/`.

## 3. Field tambahan di /admin (panel "Artikel lokal: kota & info panduan")

| Field | Nama API | Wajib saat terbit? | Contoh |
|---|---|---|---|
| Kota | `kota` | **ya** (untuk Hotel/Wisata/Kuliner) | `probolinggo` |
| Nama tempat | `place_name` | tidak (default judul) | `Rawon Nguling` |
| Lokasi singkat (pil lokasi) | `location_label` | **ya** | `Tongas, Kab. Probolinggo` |
| Info Singkat | `facts` (baris "Label: nilai") atau `facts_json` | tidak, maks 8 baris | `Jam buka: Setiap hari 05.30–21.00 WIB` |
| Anggaran | `budget_label` + `budget_value` | tidak (isi berdua) | `Kisaran harga` / `Rp22.000–Rp60.000` |
| Kata kunci peta | `map_query` | tidak | `Rawon Nguling Tambakrejo Tongas Probolinggo` |
| Tombol aksi | `action_label` + `action_url` (https) | tidak | `Lihat Situs Resmi` / `https://…` |
| Galeri tambahan | `gallery` (baris "URL \| alt") atau `gallery_json` | tidak, maks 6 | `/media/local-wisdom/rawon-detail-wide.webp \| Semangkuk rawon` |

Aturan lain sama dengan berita (ringkasan 50–170 karakter, gambar + alt + keterangan + kredit + URL kredit https, ≥1 tag),
**kecuali sumber: minimal 2** untuk Hotel/Wisata/Kuliner (berita tetap minimal 3).
Isi artikel ditulis Markdown; pakai `## Subjudul` untuk tiap bagian (tampil seperti desain GPT).

Validasi yang menolak (HTTP 400 + pesan): kota tidak terdaftar; `tipe` berbeda dengan `category`; field kota/panduan
dikirim untuk kategori berita biasa; `action_url` bukan https; terbit tanpa kota/lokasi.

## 4. Contoh payload API (sama dengan alur Jenny/Rere sekarang)

Login dulu (`POST /api/admin/login/` dengan `slug` + `password`, header `Origin`), ambil `csrf` dari halaman `/admin/artikel/baru/`,
lalu kirim form (`application/x-www-form-urlencoded`) ke `POST /api/admin/articles/` (pakai garis miring di akhir):

```text
csrf=<token dari halaman admin>
action=publish                       # atau draft / review / schedule
title=Rawon Nguling: Sarapan Rawon Legendaris di Tongas, Probolinggo
slug=rawon-nguling
tipe=kuliner                         # = category=kuliner
kota=probolinggo
author=jenny
tags=rawon, kuliner probolinggo
excerpt=Rawon Nguling di Tongas, Probolinggo, dibuka sejak 1942. Cek jam buka, cabang, dan tips memesan sebelum mampir.
place_name=Rawon Nguling
location_label=Tongas, Kab. Probolinggo
facts=Alamat: Jl. Raya Tambakrejo No.75, Wringinan, Tambakrejo, Tongas, Kab. Probolinggo
      Jam buka: Setiap hari 05.30–21.00 WIB
      Berdiri: 1942
map_query=Rawon Nguling Tambakrejo Tongas Probolinggo
action_label=Buka di Google Maps
action_url=https://www.google.com/maps/search/?api=1&query=Rawon+Nguling+Tongas
hero_url=/media/local-wisdom/rawon-wide.webp
hero_alt=Semangkuk rawon berkuah hitam dengan tauge dan telur asin
hero_caption=Ilustrasi visual
hero_credit=Ilustrasi dibuat dengan AI (GPT) untuk Bacaanku
hero_credit_url=https://bacaankunetwork.com/tentang/
source_name=Kemendikbud (WBTb)   source_title=Penetapan WBTb 2018: Rawon Nguling   source_url=https://…
source_name=Liputan6               source_title=Jam buka Rawon Nguling             source_url=https://www.liputan6.com/…
body=## Kenapa Rawon Nguling terkenal
...
```

(`facts` = satu fakta per baris; `source_*` diulang sekali per sumber, urutannya berpasangan.)
Versi JSON untuk skrip: `facts_json=[{"label":"Jam buka","value":"Setiap hari 05.30–21.00 WIB"}]`.
Hasil: artikel tayang di `/kuliner/rawon-nguling/`, `/kuliner/`, `/artikel/`, `/artikel/probolinggo/`, dan `/daerah/jawa-timur/`.

## 5. Gambar

- Gambar di `public/media/local-wisdom/*.webp` **dibuat oleh GPT (AI)** — dikonfirmasi Rizal, 25 Nov 2026.
  Isi keterangan `Ilustrasi visual` dan kredit `Ilustrasi dibuat dengan AI (GPT) untuk Bacaanku`.
  Jangan menyebutnya foto asli tempat itu.
- Untuk artikel baru: pakai foto berlisensi (mis. Wikimedia Commons, kredit + URL lisensi) atau ilustrasi dengan label yang sama.
  Ukuran ≤1.600 px, ≤1,5 MB. Kartu otomatis memakai varian `-card.webp` bila nama file berakhiran `-wide.webp`.

## 6. Cek fakta (wajib sebelum terbit)

Alamat, jam buka, harga, tiket, dan tautan resmi wajib dicek ke situs resmi/pemerintah/media kredibel, dan dicantumkan di sumber.
Log koreksi untuk 7 panduan awal (dicek 25 Nov 2026):

| Panduan | Koreksi | Sumber |
|---|---|---|
| Rawon Nguling | Bukan "khas Surabaya, Pasar Besar". Asli di Jl. Raya Tambakrejo No.75, Tongas, Kab. Probolinggo; sejak 1942; WBTb 2018; buka 05.30–21.00. Kota → `probolinggo` | Katalog WBTb 2018 (Kemendikbud), Kompas 2013, Liputan6 2025, Radar Bromo 2026, WartaBromo 2019 |
| The Batu Villas | Nama resmi "The Batu Hotel & Villas", Jl. Sultan Agung No.29, Sisir, **Kota Batu** (bukan Malang) | thebatuvillas.com (beranda + kontak) |
| Gunung Bromo | Tiket wajib daring, tidak bisa refund/reschedule; layanan 00.00–17.00 WIB; masuk Laut Pasir/Savana **wajib** jip 4WD jasa lokal | SOP Balai Besar TNBTS (bromotenggersemeru.id), indonesia.travel |
| Jatim Park 2 | Kota → `batu`; jam 08.30–16.30 (masuk tutup 1 jam sebelumnya, Ramadan 09.00–17.00); tombol aksi ke jtp.id (ticket.jtp.id tak bisa diverifikasi) | jtp.id (Batu Secret Zoo, Museum Satwa, FAQ) |
| Bakso President | Nomor alamat berbeda antar sumber (No.3 situs resmi, No.5 Pemkot) — keduanya disebut; sejak 1977; 08.00–21.30; Rp22rb–60rb | baksopresident.com, malangkota.go.id 2022 |
| Gudeg Yu Djum | Situs gudegyudjum.com tak bisa diakses → tombol ke gudegyudjumpusat.com; ada beberapa gerai "Yu Djum" di Wijilan; dapur asal di Karangasem/Mbarek, Sleman; tahan ±2 hari | gudegyudjumpusat.com, Dinas Pariwisata DIY, visitingjogja |
| Hotel Tugu Malang | Jl. Tugu 3 — sesuai | tuguhotels.com |

## 7. Go-live (untuk Rizal/admin — BELUM dijalankan di produksi)

1. Backup D1 produksi: `wrangler d1 export bacaanku-db --remote --output backup-YYYYMMDD.sql`.
2. Jalankan migrasi **sebelum** deploy: `wrangler d1 execute bacaanku-db --remote --file=docs/migrations/0003_local_wisdom.sql`.
3. Deploy kode. (Kode tahan bila migrasi belum jalan: berita & /admin tetap normal, daftar panduan kosong.)
4. Terbitkan 7 panduan awal lewat /admin atau API (isi siap di `scripts/preview/local-wisdom-seed.mjs`).
   `.data/seed-local-wisdom.sql` hanya untuk D1 lokal.
