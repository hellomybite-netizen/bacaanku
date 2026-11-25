// DATA CONTOH (FIKTIF) untuk pratinjau desain local wisdom.
// - Semua nama tempat, alamat, harga, jam buka, dan rating DIKARANG. Jangan dipakai sebagai informasi.
// - Hanya untuk build statis (src/content/articles/contoh-*.md) dan D1 LOKAL (wrangler --local).
// - JANGAN dijalankan ke D1 produksi.
export const contoh = [
  {
    slug: 'contoh-hotel-malang', category: 'hotel', province: 'jawa-timur', city: 'Malang',
    placeName: 'Wisma Kenanga (contoh)', placeType: 'Hotel',
    title: 'CONTOH: Menginap di Wisma Kenanga Malang, Rumah Lama yang Jadi Penginapan',
    excerpt: 'Ulasan contoh untuk memperlihatkan tata letak rubrik Hotel: kotak info harga, alamat, jam check-in, rating, dan fasilitas. Semua data fiktif.',
    address: 'Jl. Contoh Kenanga No. 1, Klojen (alamat fiktif)', priceMin: 350000, priceMax: 600000, priceUnit: 'malam',
    rating: 4.5, hours: 'Check-in 14.00 · check-out 12.00', facilities: ['Sarapan', 'Wi-Fi', 'Parkir motor', 'Taman dalam'],
    headline: true, hoursAgo: 2,
    sections: ['Kesan pertama', 'Kamar dan fasilitas', 'Sarapan dan lokasi', 'Cocok untuk siapa'],
  },
  {
    slug: 'contoh-kuliner-malang', category: 'kuliner', province: 'jawa-timur', city: 'Malang',
    placeName: 'Depot Bakwan Pak Contoh', placeType: 'Restaurant',
    title: 'CONTOH: Bakwan Malang di Depot Pak Contoh, Kuah Bening Sejak Pagi',
    excerpt: 'Ulasan contoh rubrik Kuliner: porsi, harga per porsi, jam buka, dan tautan peta tampil di kotak info. Nama depot dan datanya fiktif.',
    address: 'Jl. Contoh Pasar No. 7, Blimbing (alamat fiktif)', priceMin: 15000, priceMax: 35000, priceUnit: 'porsi',
    rating: 4, hours: 'Setiap hari 07.00–14.00', facilities: ['Makan di tempat', 'Bungkus', 'Bayar QRIS'],
    hoursAgo: 5, sections: ['Menu andalan', 'Rasa dan porsi', 'Suasana', 'Tips datang'],
  },
  {
    slug: 'contoh-wisata-batu', category: 'wisata', province: 'jawa-timur', city: 'Batu',
    placeName: 'Bukit Teh Contoh', placeType: 'TouristAttraction',
    title: 'CONTOH: Jalan Pagi di Bukit Teh Contoh, Kota Batu',
    excerpt: 'Ulasan contoh rubrik Wisata: harga tiket, jam buka, akses, dan fasilitas. Tempat ini tidak ada; semua data hanya pengisi tata letak.',
    address: 'Desa Contoh, Kec. Bumiaji (alamat fiktif)', priceMin: 15000, priceMax: 25000, priceUnit: 'orang',
    rating: 4.5, hours: 'Setiap hari 06.00–17.00', facilities: ['Parkir', 'Toilet', 'Musala', 'Warung'],
    hoursAgo: 9, sections: ['Rute dan akses', 'Yang bisa dilakukan', 'Waktu terbaik', 'Biaya'],
  },
  {
    slug: 'contoh-kuliner-surabaya', category: 'kuliner', province: 'jawa-timur', city: 'Surabaya',
    placeName: 'Warung Rawon Contoh', placeType: 'Restaurant',
    title: 'CONTOH: Rawon Hitam Warung Contoh di Surabaya',
    excerpt: 'Ulasan contoh rubrik Kuliner di Surabaya. Kotak info memuat kisaran harga, jam buka, dan alamat. Seluruh isinya fiktif.',
    address: 'Jl. Contoh Genteng No. 12 (alamat fiktif)', priceMin: 20000, priceMax: 45000, priceUnit: 'porsi',
    rating: 4, hours: 'Senin–Sabtu 06.00–15.00', facilities: ['Makan di tempat', 'Parkir terbatas'],
    hoursAgo: 26, sections: ['Menu andalan', 'Rasa dan porsi', 'Harga', 'Tips datang'],
  },
  {
    slug: 'contoh-hotel-yogyakarta', category: 'hotel', province: 'di-yogyakarta', city: 'Yogyakarta',
    placeName: 'Omah Joglo Contoh', placeType: 'BedAndBreakfast',
    title: 'CONTOH: Omah Joglo Contoh, Penginapan Kayu Dekat Prawirotaman',
    excerpt: 'Ulasan contoh rubrik Hotel di Yogyakarta: tata letak foto, kotak info, rating, dan fasilitas. Nama penginapan dan datanya fiktif.',
    address: 'Jl. Contoh Prawiro No. 3, Mergangsan (alamat fiktif)', priceMin: 280000, priceMax: 450000, priceUnit: 'malam',
    rating: 4.5, hours: 'Check-in 14.00 · check-out 11.00', facilities: ['Sarapan', 'Wi-Fi', 'Kolam kecil', 'Sewa sepeda'],
    hoursAgo: 30, sections: ['Kesan pertama', 'Kamar', 'Sarapan', 'Cocok untuk siapa'],
  },
  {
    slug: 'contoh-kuliner-yogyakarta', category: 'kuliner', province: 'di-yogyakarta', city: 'Yogyakarta',
    placeName: 'Gudeg Mbok Contoh', placeType: 'Restaurant',
    title: 'CONTOH: Gudeg Mbok Contoh, Sarapan Manis di Yogyakarta',
    excerpt: 'Ulasan contoh rubrik Kuliner di Yogyakarta. Harga per porsi, jam buka, dan alamat di kotak info semuanya fiktif.',
    address: 'Jl. Contoh Wijilan No. 9 (alamat fiktif)', priceMin: 18000, priceMax: 40000, priceUnit: 'porsi',
    rating: 4, hours: 'Setiap hari 05.30–11.00', facilities: ['Makan di tempat', 'Bungkus', 'Kendil oleh-oleh'],
    hoursAgo: 50, sections: ['Menu andalan', 'Rasa', 'Harga', 'Tips datang'],
  },
  {
    slug: 'contoh-wisata-gunungkidul', category: 'wisata', province: 'di-yogyakarta', city: 'Gunungkidul',
    placeName: 'Pantai Karang Contoh', placeType: 'Beach',
    title: 'CONTOH: Pantai Karang Contoh di Gunungkidul, Pasir Putih dan Tebing Kapur',
    excerpt: 'Ulasan contoh rubrik Wisata di Gunungkidul: tiket, parkir, jam buka, dan fasilitas. Pantai ini fiktif, hanya untuk tata letak.',
    address: 'Desa Contoh, Kec. Tanjungsari (alamat fiktif)', priceMin: 10000, priceMax: 10000, priceUnit: 'orang',
    rating: 4.5, hours: 'Setiap hari 24 jam (loket 06.00–18.00)', facilities: ['Parkir', 'Toilet bilas', 'Warung ikan', 'Gazebo sewa'],
    hoursAgo: 74, sections: ['Rute dan akses', 'Yang bisa dilakukan', 'Waktu terbaik', 'Biaya'],
  },
  {
    slug: 'contoh-hotel-ubud', category: 'hotel', province: 'bali', city: 'Ubud',
    placeName: 'Pondok Sawah Contoh', placeType: 'Resort',
    title: 'CONTOH: Pondok Sawah Contoh di Ubud, Bangun Pagi Menghadap Sawah',
    excerpt: 'Ulasan contoh rubrik Hotel di Bali. Kotak info memuat harga per malam, jam check-in, fasilitas, dan rating fiktif.',
    address: 'Jl. Contoh Subak, Ubud, Gianyar (alamat fiktif)', priceMin: 650000, priceMax: 1200000, priceUnit: 'malam',
    rating: 5, hours: 'Check-in 14.00 · check-out 12.00', facilities: ['Sarapan', 'Kolam renang', 'Wi-Fi', 'Antar-jemput'],
    hoursAgo: 98, sections: ['Kesan pertama', 'Kamar dan pemandangan', 'Sarapan', 'Cocok untuk siapa'],
  },
  {
    slug: 'contoh-wisata-karangasem', category: 'wisata', province: 'bali', city: 'Karangasem',
    placeName: 'Taman Air Contoh', placeType: 'TouristAttraction',
    title: 'CONTOH: Taman Air Contoh di Karangasem, Kolam Bertingkat dan Patung Batu',
    excerpt: 'Ulasan contoh rubrik Wisata di Karangasem. Tiket, jam buka, dan alamat di kotak info dikarang untuk memperlihatkan tata letak.',
    address: 'Desa Contoh, Kec. Karangasem (alamat fiktif)', priceMin: 30000, priceMax: 50000, priceUnit: 'orang',
    rating: 4, hours: 'Setiap hari 07.00–18.00', facilities: ['Parkir', 'Toilet', 'Sewa kain', 'Kafe'],
    hoursAgo: 120, sections: ['Rute dan akses', 'Yang bisa dilakukan', 'Waktu terbaik', 'Biaya'],
  },
];

export const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

export function bodyMarkdown(item) {
  const filler =
    'Paragraf ini hanya pengisi tata letak. Pada ulasan sungguhan, bagian ini berisi pengalaman langsung penulis: apa yang dilihat, dirasakan, dan dibayar, dengan detail yang bisa dicek pembaca.';
  return [
    '> **CONTOH — bukan ulasan nyata.** Nama tempat, alamat, harga, jam buka, dan rating di halaman ini fiktif dan tidak boleh dipakai sebagai informasi.',
    '',
    'Paragraf pembuka menjawab tiga hal sekaligus: tempat apa ini, di mana, dan cocok untuk siapa. Ringkas, dua sampai tiga kalimat.',
    '',
    ...item.sections.flatMap((s) => [`## ${s}`, '', filler, '']),
    '## Info praktis',
    '',
    'Kisaran harga, alamat, jam buka, fasilitas, dan tautan peta ada di kotak **Info singkat** di atas.',
  ].join('\n');
}
