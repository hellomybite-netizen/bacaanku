# Panduan Konten Local Wisdom: Hotel, Wisata, Kuliner

Untuk: **Jenny, Rere**, dan siapa pun yang menulis di Bacaanku.
Isi: cara menulis ulasan tempat di Nusantara supaya pembaca bisa memakainya: tahu tempatnya di mana, berapa harganya, dan apa yang dirasakan penulis.

---

## 1. Tiga rubrik baru

| Rubrik | Alamat | Isinya | Contoh judul |
|---|---|---|---|
| **Hotel** | `/hotel/` | Hotel, homestay, guest house, villa, glamping | "Menginap di Omah Joglo X, Yogyakarta: Sepi, Dekat Malioboro" |
| **Wisata** | `/wisata/` | Alam, pantai, gunung, museum, desa wisata, situs budaya | "Pantai Y di Gunungkidul: Tiket, Akses, dan Waktu Terbaik" |
| **Kuliner** | `/kuliner/` | Warung, depot, resto, jajanan pasar, kopi lokal | "Rawon Z di Surabaya: Kuah Hitam Pekat Sejak 1950-an" |

Berita lama (Teknologi, Otomotif, Sains, dll.) **tetap ada** dan alamatnya tidak berubah. Di menu, berita lama dikumpulkan di **Arsip Berita** (`/arsip-berita/`).

## 2. Menu per daerah

Setiap ulasan wajib punya **provinsi** dan **kota/kabupaten**. Dari situ situs otomatis membuat halaman:

| Halaman | Alamat contoh |
|---|---|
| Semua daerah | `/daerah/` |
| Satu provinsi | `/daerah/jawa-timur/` |
| Provinsi × rubrik | `/daerah/jawa-timur/kuliner/` |
| Satu kota | `/daerah/jawa-timur/malang/` |
| Kota × rubrik | `/daerah/jawa-timur/malang/kuliner/` |

Alamat artikel tetap bentuk lama: `/kuliner/judul-artikel/`. Tidak perlu menulis alamat daerah sendiri.

Halaman daerah yang **belum ada ulasannya** tetap tampil (tulisan "segera hadir") tapi diberi tanda `noindex`, supaya Google tidak menganggapnya halaman kosong.

### Provinsi yang tersedia (kode = yang tersimpan di database)

| Provinsi | Kode | Kota yang sudah disiapkan |
|---|---|---|
| Jawa Timur | `jawa-timur` | Malang, Batu, Surabaya, Banyuwangi, Probolinggo |
| DI Yogyakarta | `di-yogyakarta` | Yogyakarta, Sleman, Bantul, Gunungkidul |
| Bali | `bali` | Ubud, Denpasar, Badung, Karangasem |
| Jawa Tengah | `jawa-tengah` | Semarang, Solo, Magelang, Wonosobo |
| Jawa Barat | `jawa-barat` | Bandung, Bogor, Garut, Cirebon |
| DKI Jakarta | `dki-jakarta` | Jakarta Pusat, Jakarta Selatan, Jakarta Barat |
| Nusa Tenggara Barat | `nusa-tenggara-barat` | Mataram, Lombok Tengah, Lombok Utara |
| Nusa Tenggara Timur | `nusa-tenggara-timur` | Labuan Bajo, Kupang, Ende |
| Sumatera Utara | `sumatera-utara` | Medan, Toba, Berastagi |
| Sumatera Barat | `sumatera-barat` | Padang, Bukittinggi, Pariaman |
| Sulawesi Selatan | `sulawesi-selatan` | Makassar, Toraja Utara, Bulukumba |

Daftar lengkapnya ada di `src/config/site.ts` (bagian `regions`). Daftar ini **usulan awal** dan masih menunggu keputusan Rizal.

**Kota:** ketik nama kota seperti biasa ("Malang", "Gunungkidul"). Kode kota dibuat otomatis: huruf kecil, spasi jadi tanda hubung (`Labuan Bajo` → `labuan-bajo`). Pakai ejaan yang sama setiap kali. Kalau ejaannya beda ("Gunung Kidul" dan "Gunungkidul"), artikelnya akan terpecah ke dua halaman kota.

## 3. Mengisi formulir di /admin

Pilih kategori **Hotel**, **Wisata**, atau **Kuliner**, lalu isi kotak **"Info ulasan"**. Untuk berita biasa, kotak ini dikosongkan saja.

| Kolom di formulir | Wajib saat terbit? | Cara isi |
|---|---|---|
| Provinsi | Ya | Pilih dari daftar |
| Kota/kabupaten | Ya | Ketik, atau pilih saran yang muncul |
| Nama tempat | Ya | Nama resmi, mis. "Depot Rawon Setan" |
| Jenis tempat (schema) | Tidak | Biarkan "otomatis" kecuali yakin (mis. Museum, Pantai, Kafe) |
| Alamat lengkap | Ya | Jalan, nomor, kelurahan/desa |
| Harga min / maks (Rp) | Ya, **atau** catatan harga | Angka saja tanpa titik: `25000`, `45000` |
| Satuan harga | Tidak | per malam (hotel), per porsi (kuliner), per orang / per tiket (wisata), per paket |
| Catatan harga | Pengganti harga | Pakai bila tidak ada angka: "Gratis", "Donasi sukarela", "Parkir Rp5.000" |
| Jam buka / check-in | Disarankan | "Setiap hari 07.00–21.00" atau "Check-in 14.00, check-out 12.00" |
| Rating redaksi (1–5) | Tidak | Boleh desimal: `4,5` |
| Fasilitas | Disarankan | Pisahkan dengan koma: `Wi-Fi, Parkir, Musala, Sarapan` |
| Tautan Google Maps | Disarankan | Tautan "Bagikan" dari Google Maps |
| Tanggal kunjungan | Disarankan | Kapan penulis datang. Penting untuk pembaca. |
| Latitude / Longitude | Tidak | Untuk peta yang tepat. Klik kanan di Google Maps lalu salin angkanya. |
| Telepon, situs resmi | Tidak | Hanya kontak resmi tempat itu |

Kalau kolom wajib belum diisi, tombol **Terbit / Jadwalkan / Kirim ke review** akan menolak dan menandai kolom yang kurang. **Simpan draf** tetap bisa kapan saja.

Kolom lain (judul, ringkasan 50–170 karakter, gambar utama + kredit, tag, minimal 3 sumber) aturannya **sama dengan berita**. Untuk ulasan, sumber bisa berupa situs resmi tempat, halaman Google Maps, akun resmi, atau rilis dinas pariwisata.

## 4. Aturan isi

1. **Pernah datang sendiri.** Ulasan menceritakan pengalaman langsung. Kalau belum pernah datang, tulis sebagai *panduan* dan sebutkan itu di paragraf pertama.
2. **Harga dan jam bisa berubah.** Tulis harga yang dilihat saat berkunjung, isi tanggal kunjungan, dan cek ulang sebelum terbit.
3. **Rating jujur.** Rating adalah penilaian redaksi, bukan rata-rata dari Google. Bila ragu, kosongkan.
4. **Tidak ada ulasan berbayar terselubung.** Kalau menginap/makan gratis dari tempat itu, tulis jelas: "Redaksi diundang oleh …".
5. **Local wisdom:** ceritakan yang khas. Asal-usul nama, bahan lokal, cara makan, adat setempat, bahasa daerah (beri arti), dan siapa pemilik atau peraciknya. Hindari promosi kosong ("terbaik se-Indonesia").
6. **Struktur yang disarankan:** pembuka 2–3 kalimat (tempat apa, di mana, cocok untuk siapa), Kesan pertama, Menu/Kamar/Atraksi, Harga & lokasi, Cocok untuk siapa, Info praktis.

## 5. Foto dan lisensi

- **Paling aman: foto sendiri.** Tulis kredit "Foto: Jenny/Bacaanku".
- Foto dari orang lain hanya boleh bila **berlisensi terbuka** (mis. Wikimedia Commons CC BY / CC BY-SA) atau ada **izin tertulis**. Kredit dan tautan lisensi wajib diisi.
- **Jangan** mengambil foto dari Google Maps, Instagram, TripAdvisor, atau situs hotel tanpa izin.
- Ukuran maksimal 1.600 piksel, maksimal 1,5 MB. Teks alternatif harus menggambarkan isi foto ("Semangkuk rawon dengan tauge dan telur asin").

## 6. Artikel CONTOH (bukan ulasan sungguhan)

Saat pratinjau desain, situs memakai **9 ulasan CONTOH** yang fiktif (Malang, Batu, Surabaya, Yogyakarta, Gunungkidul, Ubud, Karangasem).

- Judulnya diawali "CONTOH:", ada label CONTOH di kartu dan di halaman, dan gambarnya ilustrasi buatan sendiri bertuliskan "ILUSTRASI CONTOH" (bukan foto tempat asli).
- Halamannya `noindex`, tidak masuk sitemap, dan tidak diberi data Review untuk Google.
- **Hanya ada di komputer pratinjau.** Tidak pernah dimasukkan ke database produksi.
- Saat situs baru tayang, semua file contoh dihapus (lihat bagian 8).

Nama tempat, alamat, dan harga di contoh **tidak boleh** dikutip sebagai informasi.

## 7. Menambah daerah atau kota baru (untuk pengembang)

1. Buka `src/config/site.ts`, bagian `regions`.
2. Tambah satu objek: `slug` (huruf kecil-tanda-hubung), `name`, `short` (singkatan untuk ubin, mis. "Kalbar"), `cities` (daftar nama kota), dan `tone` (angka 0–5 untuk warna ubin).
3. Build dan cek `/daerah/<slug>/`. Tidak perlu mengubah database: provinsi disimpan sebagai teks di kolom `province_slug`.
4. Kode kota **tidak boleh** sama dengan `hotel`, `wisata`, atau `kuliner` (kode itu dipakai untuk halaman rubrik).

## 8. Database dan rencana tayang (untuk pengembang / Rizal)

### Kolom baru

File: `docs/migrations/0003_local_wisdom.sql`. Semua kolom **opsional** (boleh kosong), sehingga 400-an berita lama tidak berubah sama sekali:

`province_slug, city_name, city_slug, place_name, place_type, address, latitude, longitude, maps_url, phone, website, price_min, price_max, price_unit, price_note, opening_hours, rating, facilities_json, visited_at, is_sample`

File yang sama juga menambah kategori `hotel`, `wisata`, dan `kuliner`, serta dua indeks untuk halaman daerah.

### Urutan tayang (butuh persetujuan Rizal di setiap langkah)

1. **Cadangkan** database produksi: `npx wrangler d1 export bacaanku-db --remote --output backup-sebelum-0003.sql`.
2. **Jalankan migrasi sekali saja:** `npx wrangler d1 execute bacaanku-db --remote --file docs/migrations/0003_local_wisdom.sql`.
   Migrasi ini hanya menambah, dan kode lama tetap berjalan normal setelahnya. Karena itu migrasi **didahulukan** sebelum deploy. Kalau kode baru dipasang duluan, menu Hotel/Wisata/Kuliner akan 404 sampai kategorinya ada.
3. **Hapus file contoh** dari branch: `src/content/articles/contoh-*.md`, `public/media/articles/contoh-*.jpg`, `src/assets/articles/contoh-*`.
4. Merge PR ke `main`, lalu deploy Worker.
5. Cek: beranda, `/daerah/`, satu berita lama, `/rss.xml`, `/sitemap.xml`, `/ads.txt`, `/admin/login/`.
6. Purge cache Cloudflare (beranda + halaman kategori).
7. Tulis 2–3 ulasan sungguhan per rubrik di daerah awal **sebelum** menu dipromosikan.

**Pratinjau lokal** (tidak menyentuh produksi):

```bash
npm run preview:db -- --apply   # D1 lokal: skema + berita + 0003 + contoh
npm run build
npx wrangler dev --local --local-upstream 127.0.0.1:8788 --persist-to .wrangler/state --port 8788
```
