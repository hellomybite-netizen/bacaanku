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
| `mojokerto` | Mojokerto | Jawa Timur |
| `pasuruan` | Pasuruan (Kota) | Jawa Timur |
| `bangil` | Bangil, Kab. Pasuruan | Jawa Timur |
| `blitar` | Blitar | Jawa Timur |
| `kediri` | Kediri | Jawa Timur |
| `lumajang` | Lumajang | Jawa Timur |
| `jember` | Jember | Jawa Timur |
| `solo` | Solo (Surakarta) | Jawa Tengah |
| `magelang` | Magelang (Kota & Kab., termasuk Borobudur) | Jawa Tengah |
| `bandung` | Bandung | Jawa Barat |
| `jakarta` | Jakarta | DKI Jakarta |

Halaman kota `/artikel/{kota}/` dan provinsi `/daerah/{provinsi}/` baru muncul (200) setelah ada minimal 1 artikel terbit,
dan baru boleh diindeks Google setelah ≥3 artikel. Sebelum itu 404 — tidak ada halaman kosong/tipis.
Provinsi terdaftar: Jawa Timur, Jawa Tengah, DI Yogyakarta, **Jawa Barat**, **DKI Jakarta** (baru, 27 Nov 2026).

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
| Galeri tambahan | form: baris URL + **teks alternatif per foto** + tombol unggah · API: `gallery` (baris "URL \| alt"), `gallery_json`, atau `gallery_src`+`gallery_alt` berulang | tidak, maks 6; alt wajib ≥5 karakter | `/media/r2/articles/2026/11/rawon-…webp \| Semangkuk rawon` |

Aturan lain sama dengan berita (ringkasan 50–170 karakter, gambar + alt + keterangan + kredit + URL kredit https, ≥1 tag),
termasuk **sumber minimal 3** (keputusan Rizal 27 Nov; sebelumnya 2). Dua panduan lama yang baru punya 2 sumber
(id 269 dan 274) perlu sumber ketiga saat berikutnya disunting.
Isi artikel ditulis Markdown; pakai `## Subjudul` untuk tiap bagian (tampil seperti desain GPT).

**Aturan panjang (keputusan Rizal 27 Nov 2026)** — detail: `docs/api-unggah-gambar-dan-aturan-panjang.md`:
- Panduan Hotel/Wisata/Kuliner: **600–1.800 kata**, **4–10 subjudul `## `**, dan **bagian `## FAQ`** berisi minimal 2 pertanyaan
  (mis. `### Jam berapa buka?`). FAQ ikut dihitung sebagai subjudul.
- Berita: **450–900 kata**.
- Dicek saat review/jadwal/terbit; draf bebas. Artikel lama boleh diedit tanpa mengubah isi (mis. ganti foto) walau lebih pendek.

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
price_label=Harga per porsi            # opsional; default per tipe (lihat bagian Harga)
price_value=Rp25.000–Rp45.000 per porsi
price_checked_at=2026-11-27           # YYYY-MM-DD, tanggal Anda mengecek
price_source_name=Menu resmi di Instagram pengelola
price_source_url=https://…
price_extra=Es teh: Rp5.000 | https://…
            Parkir motor: Rp3.000     # tanpa URL → tampil "Belum terverifikasi"
body=## Kenapa Rawon Nguling terkenal
...
```

Tempat tanpa tiket: kirim `price_free=1` (atau `price_value=Gratis`) + `price_checked_at`; URL sumber boleh kosong.
Versi JSON harga tambahan: `price_extra_json=[{"label":"Parkir motor","value":"Rp3.000","source_url":"https://…"}]`.
Opsional `robots_noindex=1` (default mati — jangan dipakai tanpa izin Rizal). Bila field ini tidak dikirim, nilai tersimpan tidak berubah.

(`facts` = satu fakta per baris; `source_*` diulang sekali per sumber, urutannya berpasangan.)
Versi JSON untuk skrip: `facts_json=[{"label":"Jam buka","value":"Setiap hari 05.30–21.00 WIB"}]`.
Hasil: artikel tayang di `/kuliner/rawon-nguling/`, `/kuliner/`, `/artikel/`, `/artikel/probolinggo/`, dan `/daerah/jawa-timur/`.

## 5. Gambar (wajib foto berlisensi — keputusan Rizal 26 Nov 2026, diperketat 27 Nov 2026)

**Aturan utama: foto harus menampilkan tempat yang PERSIS sama dengan yang diulas** (hotelnya sendiri, kedainya sendiri,
objek wisatanya sendiri). Berlaku untuk semua sumber di bawah, termasuk Unsplash/Pexels.

Sumber yang boleh (urutan prioritas):

| Sumber | Syarat | Format kredit (`hero_credit`) | `hero_credit_url` |
|---|---|---|---|
| Situs resmi / pengelola / pers kit | Ada izin tertulis atau halaman media/pers yang mengizinkan pemakaian redaksional; simpan buktinya (email/URL) | `Foto: {Nama pengelola}` atau `Foto: {Pembuat} / {Pengelola}` | halaman sumber foto |
| Wikimedia Commons | Lisensi **CC BY, CC BY-SA, CC0, atau domain publik** (bukan NC/ND, bukan "fair use") | `Foto: {Pembuat} / Wikimedia Commons, {Lisensi}` | halaman file Commons (`commons.wikimedia.org/wiki/File:…`) |
| Unsplash | Lokasi foto terverifikasi sama (judul/lokasi foto + ciri bangunan cocok). Lisensi Unsplash | `Foto: {Fotografer} / Unsplash` | halaman foto di unsplash.com |
| Pexels | Sama seperti Unsplash. Lisensi Pexels | `Foto: {Fotografer} / Pexels` | halaman foto di pexels.com |
| Foto sendiri (redaksi/penulis) | Diambil di tempatnya | `Foto: {Nama} / Bacaanku` | `https://bacaankunetwork.com/redaksi/` |

Dilarang: gambar AI yang meniru tempat nyata; foto dari Google Maps/Google Images, Instagram, TikTok, TripAdvisor, OTA
(Traveloka/Tiket/Agoda/Booking) atau situs berita lain tanpa izin; foto NC/ND; foto tempat lain yang mirip.

- Ukuran: unggah ≤1.600 px sisi panjang, ≤1,5 MB (tombol unggah di `/admin` otomatis mengecilkan + WebP). Jangan hotlink
  `upload.wikimedia.org` atau file asli Commons — unduh thumbnail, lalu unggah.
- `hero_caption` = apa yang benar-benar tampak di foto, jujur (mis. `Fasad Hotel Tugu Malang di Jl. Tugu`).
- Teks alternatif (`hero_alt`, alt galeri) wajib ≥5 karakter, menjelaskan isi foto, bukan mengulang judul.
- Catat lisensi: Wikimedia/Unsplash/Pexels → simpan URL halaman foto di `hero_credit_url`. Untuk izin pengelola, simpan
  bukti izin di folder redaksi dan sebut di kredit.
- Tidak ada foto yang memenuhi syarat? **Jangan terbitkan dengan foto lain**: simpan draf dan minta foto ke pengelola,
  atau pakai foto sendiri. (Panduan lama yang memakai "foto kawasan/ilustrasi" — 17 artikel per 27 Nov 2026 — menunggu
  keputusan Rizal: diganti bertahap atau dibiarkan dengan label jujur.)
- **Unggah ke R2**: tombol unggah di `/admin` atau `POST /api/admin/media/` → pakai `url` hasilnya di `hero_url` / galeri.
  Kontrak API lengkap: `docs/api-unggah-gambar-dan-aturan-panjang.md`.
- Sampul kota/provinsi/kategori di repo: `public/media/local-wisdom/{nama}-wide.webp` (1.600×900) + `{nama}-card.webp`
  (640×360), dikreditkan di `src/lib/photo-credits.ts` dan `/kredit-foto/`. Sampul baru 27 Nov 2026: Magelang (Candi
  Borobudur, Gunawan Kartapranata, domain publik), Bandung (Gedung Sate, Gunawan Kartapranata, CC BY-SA 3.0), Jakarta
  (Monas, Ramayoni, CC BY-SA 4.0) — semuanya Wikimedia Commons.
- Alat bantu: `/workspace/bacaanku-photos/photos.py` (cari + unduh + konversi + catat kredit).

## 5a. Harga (wajib untuk Hotel/Wisata/Kuliner — keputusan Rizal 27 Nov 2026)

Field harga ada di panel "Artikel lokal" (`/admin`) dan di API (`price_*`). Tampil paling atas di **Info Singkat**,
lengkap dengan "Dicek {tanggal} · Sumber: {nama}".

| Field | Form / API | Wajib saat terbit | Contoh |
|---|---|---|---|
| Label harga | `price_label` | tidak (default: hotel `Tarif kamar per malam`, wisata `Tiket masuk per orang`, kuliner `Harga per porsi`) | `Tiket masuk dewasa` |
| Harga utama | `price_value` | **ya**, atau centang Gratis | `Rp20.000 per orang` · `Rp450.000–Rp700.000 per malam` |
| Gratis | `price_free=1` (atau `price_value=Gratis`) | pengganti harga utama untuk tempat tanpa tiket (alun-alun, masjid, makam, monumen) | |
| Tanggal cek | `price_checked_at` (YYYY-MM-DD, tidak boleh di masa depan) | **ya** | `2026-11-27` |
| Nama sumber | `price_source_name` | disarankan | `Disparbud Lumajang` |
| URL sumber | `price_source_url` (https) | **ya untuk harga berbayar**; boleh kosong untuk Gratis | `https://…` |
| Harga tambahan | `price_extra` (baris `Label: nilai \| URL`) atau `price_extra_json` | tidak, maks 6 | `Parkir motor: Rp5.000` |

Aturan isi:

1. **Jangan mengarang harga.** Harga utama hanya nominal yang Anda cek sendiri hari itu di sumber yang bisa dibuka.
2. "Cek situs resmi", "bervariasi", "hubungi pengelola" **bukan harga** — ditolak sistem. Kalau tidak ada nominal yang bisa
   dicek, artikel belum siap terbit (simpan draf).
3. Sumber berbeda? Tulis rentang (`Rp7.500–Rp15.000`) dan pakai sumber paling resmi/terbaru sebagai URL sumber.
4. Format per tipe: hotel = tarif kamar **per malam** "mulai dari" (sebut tipe kamar/tanggal bila perlu); wisata = tiket **per
   orang** (sebut hari kerja/akhir pekan, lokal/mancanegara bila beda); kuliner = harga **per porsi** atau kisaran per orang.
5. Harga tambahan yang belum bisa dicek (parkir, sewa jip, menu lain) boleh ditulis **tanpa URL** — tampil dengan label
   "Belum terverifikasi, cek situs resmi". Dengan URL sumber → tampil tautan "Sumber".
6. Cek ulang harga minimal setiap 6 bulan atau saat ada kabar kenaikan; perbarui `price_checked_at`.

Penegakan (keputusan Rizal 27 Nov: "Wajib harga langsung berlaku"): harga utama (atau Gratis) + tanggal cek (+ URL sumber
untuk harga berbayar) **wajib saat Ke review, Jadwalkan, atau Terbitkan** untuk SEMUA panduan, termasuk 52 panduan lama.
Tanpa itu simpan ditolak (API: HTTP 400 `errors.priceValue` / `priceCheckedAt` / `priceSourceUrl`). Tidak ada masa transisi.
Simpan draf dan Arsipkan tidak dicek. Artikel lama yang tampil di situs tetap tayang apa adanya; harganya wajib dilengkapi
saat berikutnya disunting. Daftar per artikel: `docs/data-harga-panduan-2026-11-27.csv`.

## 5b. Arsip & noindex (keputusan Rizal 27 Nov 2026)

- **Arsip tidak menghapus apa pun.** Tombol **Arsipkan** di `/admin` (atau `action=archive` di API) pada artikel yang sudah
  tayang: URL tetap sama dan tetap 200, muncul banner "Arsip berita", tetapi artikel keluar dari beranda, menu, sitemap,
  news-sitemap, RSS, Terpopuler, dan blok artikel terkait. Arsip berita tercantum di `/arsip-berita/` (berhalaman; **hanya berita**, panduan yang diarsipkan tidak ikut tampil di sana) dan
  tetap ada di halaman kategori lama, tag, penulis, dan pencarian. Tidak ada redirect 301.
- Draf yang belum pernah tayang lalu diarsipkan tetap tersembunyi (perilaku lama).
- Mengedit artikel arsip: pakai **Simpan arsip** (tetap arsip). **Terbitkan** = aktif lagi (keluar dari arsip).
  Simpan draf = artikel turun dari situs (404) — hindari untuk arsip.
- Rencana: seluruh 208 berita lama (7 kategori lama, daftar dari inventaris 27 Nov 2026) diarsipkan sekaligus lewat
  migrasi data `0004b` setelah disetujui Rizal. Berita baru yang ditulis sesudahnya tetap tayang normal sampai diarsipkan.
- **noindex** per artikel (centang "Jangan diindeks", API `robots_noindex=1`): halaman tetap terbuka, diberi meta robots
  `noindex, follow` + header `X-Robots-Tag`, dan keluar dari sitemap. Default mati dan **belum dipakai** untuk artikel mana
  pun. Keputusan noindex/410 untuk arsip berita bertraffic nol baru diambil sekitar akhir Des 2026–Jan 2027 (setelah usia
  1–2 bulan), oleh Rizal/SEO.

## 6. Cek fakta (wajib sebelum terbit)

Alamat, jam buka, harga, tiket, dan tautan resmi wajib dicek ke situs resmi/pemerintah/media kredibel, dan dicantumkan di sumber.
Log koreksi untuk 7 panduan awal (dicek 25 Nov 2026; foto diganti foto berlisensi 26 Nov 2026):

| Panduan | Koreksi | Sumber |
|---|---|---|
| Rawon Nguling | Bukan "khas Surabaya, Pasar Besar". Asli di Jl. Raya Tambakrejo No.75, Tongas, Kab. Probolinggo; sejak 1942; WBTb 2018; buka 05.30–21.00. Kota → `probolinggo` | Katalog WBTb 2018 (Kemendikbud), Kompas 2013, Liputan6 2025, Radar Bromo 2026, WartaBromo 2019 |
| The Batu Villas | Nama resmi "The Batu Hotel & Villas", Jl. Sultan Agung No.29, Sisir, **Kota Batu** (bukan Malang) | thebatuvillas.com (beranda + kontak) |
| Gunung Bromo | Tiket wajib daring, tidak bisa refund/reschedule; layanan 00.00–17.00 WIB; masuk Laut Pasir/Savana **wajib** jip 4WD jasa lokal | SOP Balai Besar TNBTS (bromotenggersemeru.id), indonesia.travel |
| Jatim Park 2 | Kota → `batu`; jam 08.30–16.30 (masuk tutup 1 jam sebelumnya, Ramadan 09.00–17.00); tombol aksi ke jtp.id (ticket.jtp.id tak bisa diverifikasi) | jtp.id (Batu Secret Zoo, Museum Satwa, FAQ) |
| Bakso President | Nomor alamat berbeda antar sumber (No.3 situs resmi, No.5 Pemkot) — keduanya disebut; sejak 1977; 08.00–21.30; Rp22rb–60rb | baksopresident.com, malangkota.go.id 2022 |
| Gudeg Yu Djum | Situs gudegyudjum.com tak bisa diakses → tombol ke gudegyudjumpusat.com; ada beberapa gerai "Yu Djum" di Wijilan; dapur asal di Karangasem/Mbarek, Sleman; tahan ±2 hari | gudegyudjumpusat.com, Dinas Pariwisata DIY, visitingjogja |
| Hotel Tugu Malang | Jl. Tugu 3 — sesuai | tuguhotels.com |

## 7. Go-live (untuk Rizal/admin)

Arsip + harga + noindex (migrasi 0004, cabang `arsip-dan-harga`): **ikuti `docs/migrasi-0004-arsip-harga.md`**
(backup → 0004 → 0004b → deploy → verifikasi). Belum dijalankan di produksi.

Riwayat 0003 (sudah dijalankan 26 Nov 2026):

1. Backup D1 produksi: `wrangler d1 export bacaanku-db --remote --output backup-YYYYMMDD.sql`.
2. Jalankan migrasi **sebelum** deploy: `wrangler d1 execute bacaanku-db --remote --file=docs/migrations/0003_local_wisdom.sql`.
3. Deploy kode. (Kode tahan bila migrasi belum jalan: berita & /admin tetap normal, daftar panduan kosong.)
4. Terbitkan 7 panduan awal lewat /admin atau API (isi siap di `scripts/preview/local-wisdom-seed.mjs`).
   `.data/seed-local-wisdom.sql` hanya untuk D1 lokal.
