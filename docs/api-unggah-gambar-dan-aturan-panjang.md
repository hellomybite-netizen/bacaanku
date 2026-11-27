# Unggah gambar (R2) & aturan panjang artikel — untuk Jenny, Rere, dan skrip API

Keputusan Rizal 27 Nov 2026: (5) aturan panjang isi, (6) unggah gambar ke Cloudflare R2.

## 1. Aturan panjang isi

| Jenis | Kategori | Kata | Subjudul `## ` | FAQ |
|---|---|---|---|---|
| Berita | semua kategori selain di bawah (news, teknologi, otomotif, sains, ekonomi, olahraga, hiburan, …) | **450–900** | bebas | tidak wajib |
| Panduan | `hotel`, `wisata`, `kuliner` | **600–1.800** | **4–10** (FAQ ikut dihitung) | **wajib**: subjudul `## FAQ` (atau `## Pertanyaan yang Sering Diajukan` / `## Tanya Jawab`) berisi **≥2 pertanyaan** (baris yang memuat `?`, mis. `### Jam berapa buka?`) |

Cara menghitung kata: teks yang tampil saja — sintaks Markdown, URL, gambar, HTML, dan blok kode tidak dihitung.
Angka seperti `Rp22.000` atau `1.800` = 1 kata; tanda pisah `–` memisahkan kata. Form `/admin` menampilkan penghitung langsung
di bawah kolom Isi (✓/✗) memakai rumus yang sama dengan server (`src/lib/length-rules.ts`).

Kapan dicek:
- **Dicek** saat `action=review`, `schedule`, atau `publish` (ditolak HTTP 400 bila `LENGTH_RULES=enforce`, lihat masa transisi di bawah).
- **Tidak dicek** saat `draft` dan `archive` (draf boleh pendek).
- **Artikel lama**: saat mengedit artikel yang sudah ada, aturan hanya berlaku bila **isi (body) diubah**.
  Mengganti judul SEO, gambar, tag, kredit, dsb. tanpa menyentuh isi tetap boleh walau artikelnya lebih pendek dari aturan baru
  (perbandingan mengabaikan spasi di akhir baris & baris kosong ganda). Begitu isinya diedit, artikel harus memenuhi aturan.
- Jadwal terbit otomatis (cron) tidak mengecek ulang artikel yang sudah dijadwalkan.

Respons bila melanggar (HTTP 400), kunci error:

```json
{ "errors": {
  "body": "Isi berita harus 450–900 kata (sekarang 300 kata). Tambah sekitar 150 kata.",
  "bodyHeadings": "Panduan perlu 4–10 subjudul \"## \" (sekarang 3). Bagian FAQ ikut dihitung.",
  "bodyFaq": "Panduan wajib punya bagian FAQ: subjudul \"## FAQ\" … berisi minimal 2 pertanyaan …"
} }
```

**Masa transisi (default)**: selama variabel Worker `LENGTH_RULES` belum bernilai `enforce`, artikel tetap tersimpan/terbit
(HTTP 200) dan pelanggaran dikembalikan sebagai `"warnings": { … }` dengan kunci yang sama; form menampilkan
"Tersimpan, tetapi isi belum memenuhi aturan panjang". Set `LENGTH_RULES=enforce` (binding plain_text di skrip deploy
`mkworker.mjs`, atau `vars` di `wrangler.jsonc`) untuk menegakkan dengan HTTP 400.
Alasan: per 25 Nov artikel Jenny 230–435 kata, jadi langsung ditegakkan = semua kiriman Jenny ditolak.

## 2. Unggah gambar ke R2

Gambar disimpan di bucket R2 `bacaanku-media` (binding `MEDIA`) dan disajikan Worker di
`https://bacaankunetwork.com/media/r2/<kunci>` dengan `Cache-Control: public, max-age=31536000, immutable` + ETag.
Kunci: `articles/YYYY/MM/{slug-atau-nama-berkas}-{hash10}.{webp|jpg|png|avif}` (hash = isi berkas, jadi aman di-cache selamanya).

### Di form /admin
- **Gambar utama**: tombol "Unggah gambar utama". Browser memperkecil ke sisi terpanjang **1.600 px** dan mengubah ke **WebP kualitas 0,8**
  (browser lama tanpa encoder WebP → JPEG 0,82), lalu mengisi otomatis `URL gambar utama`, `Lebar`, `Tinggi`. Teks alternatif tetap wajib.
- **Galeri** (panel Artikel lokal): tiap foto punya baris sendiri — URL, **Teks alternatif** (wajib, ≥5 karakter), tombol unggah,
  dan tombol hapus. Maks. 6 foto.
- URL eksternal (`https://…`) dan path situs (`/media/…`) **tetap diterima** seperti sebelumnya.
- Jika R2 belum aktif: tombol unggah nonaktif dengan catatan "Unggah belum aktif…".

### API: `POST /api/admin/media/`

Autentikasi sama dengan API artikel: cookie sesi dari `POST /api/admin/login/` + header `Origin: https://bacaankunetwork.com`
+ token `csrf` (dari halaman `/admin/artikel/baru/`, input `name="csrf"`).

Permintaan: `multipart/form-data`

| Field | Wajib | Keterangan |
|---|---|---|
| `file` | ya | 1 berkas gambar. WebP/JPEG/PNG/AVIF (dicek dari isi berkas, bukan nama). Maks **5 MB**, sisi terpanjang maks **2.400 px** (disarankan 1.600 px, WebP q≈80). Server **tidak** mengompres. |
| `csrf` | ya* | *atau header `X-CSRF-Token: <csrf>` |
| `slug` | tidak | slug artikel → dipakai di nama kunci. Kosong = nama berkas. |
| `alt` | tidak | dikembalikan apa adanya (alt tetap dikirim di artikel: `hero_alt` / galeri). Maks 200 karakter. |

Contoh:

```bash
curl -s -b cookies.txt -H "Origin: https://bacaankunetwork.com" \
  -F "csrf=$CSRF" -F "slug=rawon-nguling" -F "alt=Semangkuk rawon berkuah hitam" \
  -F "file=@rawon-1600.webp" https://bacaankunetwork.com/api/admin/media/
```

Respons **201**:

```json
{ "url": "/media/r2/articles/2026/11/rawon-nguling-eaa7d3f720.webp",
  "key": "articles/2026/11/rawon-nguling-eaa7d3f720.webp",
  "contentType": "image/webp", "bytes": 182344, "width": 1600, "height": 900,
  "alt": "Semangkuk rawon berkuah hitam" }
```

Lalu kirim artikel seperti biasa dengan `hero_url=<url>`, `hero_width=<width>`, `hero_height=<height>`, `hero_alt=…`; untuk galeri
`gallery_json=[{"src":"<url>","alt":"…"}]` (atau `gallery` teks "URL | alt" per baris, atau `gallery_src`/`gallery_alt` berulang).

Error (selalu JSON `{ "error": "<kode>", "message": "<pesan Indonesia>" }`):

| HTTP | `error` | Arti |
|---|---|---|
| 400 | `bad_request` | bukan multipart / tanpa `file` |
| 400 | `empty` | berkas kosong |
| 400 | `too_big_dimensions` | sisi > 2.400 px |
| 400 | `alt_too_long` | alt > 200 karakter |
| 401 | `unauthorized` | belum login |
| 403 | `csrf` | token csrf salah/kosong |
| 403 | (teks) `Permintaan ditolak (origin).` | header `Origin` tidak dikirim/beda |
| 413 | `too_large` | > 5 MB |
| 415 | `unsupported_type` | bukan WebP/JPEG/PNG/AVIF (mis. SVG, GIF, HEIC) |
| 503 | `r2_unavailable` | R2 belum diaktifkan (header `Retry-After`). Pakai URL eksternal dulu. |

`GET /api/admin/media/` (login) → `{ "enabled": true|false, "maxBytes": 5242880, "maxSide": 2400, "types": [...] }` untuk cek status.

## 3. Aktivasi R2 (sekali, oleh Rizal/admin)

1. Dashboard Cloudflare → akun Bacaanku → **R2 Object Storage** → **Purchase R2 / Enable R2** (verifikasi kartu; gratis s.d. 10 GB,
   1 juta operasi tulis & 10 juta operasi baca per bulan).
2. Buat bucket **`bacaanku-media`** (lokasi otomatis). Tidak perlu akses publik / custom domain — gambar disajikan lewat Worker.
3. Di `wrangler.jsonc`, buka komentar `"r2_buckets": [{ "binding": "MEDIA", "bucket_name": "bacaanku-media" }]`. Deploy via
   `/workspace/deploy-v5/mkworker.mjs` menulis binding sendiri, jadi tambahkan juga
   `{ type: 'r2_bucket', name: 'MEDIA', bucket_name: 'bacaanku-media' }` ke `bindings` di skrip itu, lalu deploy.
4. Cek: login `/admin/artikel/baru/` → tombol unggah aktif; `GET /api/admin/media/` → `"enabled": true`.
