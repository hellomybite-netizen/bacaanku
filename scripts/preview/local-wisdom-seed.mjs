// Data awal 7 panduan local wisdom (desain GPT, fakta sudah dicek 25 Nov 2026).
// HANYA untuk D1 LOKAL / pratinjau. Di produksi, panduan diterbitkan lewat /admin atau API.
// Gambar /media/local-wisdom/*.webp = foto berlisensi Wikimedia Commons (26 Nov 2026), menggantikan ilustrasi AI.
// Kredit per foto: src/lib/photo-credits.ts (sampul) dan field caption/credit/creditUrl di bawah (artikel).
const credit = {};
const img = (key) => `/media/local-wisdom/${key}-wide.webp`;

export const guides = [
  {
    slug: 'gunung-bromo', category: 'wisata', city: 'probolinggo', name: 'Gunung Bromo', hoursAgo: 1,
    title: 'Gunung Bromo: Menyambut Matahari Terbit di Dataran Tengger',
    excerpt: 'Panduan memilih titik pandang, membeli tiket daring, dan menyusun perjalanan pertama ke Gunung Bromo dari sisi Probolinggo.',
    location: 'Cemorolawang, Kab. Probolinggo', hero: img('bromo'), heroAlt: "Kaldera Tengger dengan Gunung Bromo, Gunung Batok, dan Gunung Semeru", caption: "Kaldera Tengger dengan Gunung Bromo (berasap), Batok, dan Semeru di kejauhan", credit: "Foto: Jakub Hałun / Wikimedia Commons, CC BY-SA 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Bromo,_Semeru,_Batok_-_view_of_Tengger_caldera,_East_Java,_Indonesia,_20220820_0709_9507.jpg",
    facts: [
      { label: 'Pintu masuk', value: 'Cemorolawang, Ngadisari, Sukapura, Kab. Probolinggo' },
      { label: 'Tiket', value: 'Wajib dibeli daring di situs resmi TNBTS; tidak bisa refund atau jadwal ulang' },
      { label: 'Jam layanan', value: '00.00–17.00 WIB (tamu penginapan di dalam kawasan dikecualikan)' },
      { label: 'Sorotan', value: 'Matahari terbit, kaldera, dan Laut Pasir' },
    ],
    mapQuery: 'Cemorolawang Ngadisari Sukapura Probolinggo', action: { label: 'Beli tiket resmi Bromo', url: 'https://bromotenggersemeru.id/' },
    sources: [
      { name: 'Balai Besar TNBTS', title: 'SOP kunjungan wisata alam Bromo', url: 'https://bromotenggersemeru.id/peraturan/bromo' },
      { name: 'Wonderful Indonesia', title: 'Ide aktivitas di Bromo Tengger Semeru', url: 'https://www.indonesia.travel/id/id/travel-ideas/adventure/ide-aktivitas-bromo-tengger-semeru' },
    ],
    body: `## Pilih satu titik pandang untuk pagi pertama

Mentigen bisa dipertimbangkan bila kamu bermalam di sekitar Cemorolawang. Pilihan lain yang diperkenalkan Wonderful Indonesia antara lain Bukit Cinta dan Penanjakan. Cek peta serta waktu tempuh dari penginapan sebelum memesan kendaraan, karena titik pandang dan gerbang masuk berada di lokasi berbeda.

Siapkan jaket, sepatu tertutup, dan air minum sebelum berangkat. Sisakan waktu untuk antrean dan perubahan cuaca. Kalau pemandangan tertutup kabut, jangan mengejar spot lain dengan terburu-buru.

## Beli tiket daring dan pisahkan biaya transportasi

Menurut SOP Balai Besar TNBTS, tiket masuk wajib dibeli secara daring di situs resmi dan bukti pemesanan (kode QR) ditunjukkan di pintu masuk. Tiket yang sudah dibayar tidak bisa dikembalikan atau dijadwal ulang, jadi pastikan tanggal sebelum membayar.

Untuk masuk ke Laut Pasir dan Savana, pengunjung wajib memakai kendaraan roda empat dari jasa transportasi masyarakat setempat. Tanyakan titik jemput, titik berhenti, dan komponen yang sudah masuk harga jip sebelum membayar. Ikuti petunjuk petugas, khususnya bila kawasan dibatasi untuk keselamatan, konservasi, atau kegiatan adat masyarakat Tengger.`,
  },
  {
    slug: 'the-batu-villas', category: 'hotel', city: 'batu', name: 'The Batu Villas', hoursAgo: 2,
    title: 'The Batu Villas: Menginap di Sisir untuk Menjelajahi Kota Batu',
    excerpt: 'Cara menilai pilihan kamar, lokasi, dan biaya menginap di The Batu Hotel & Villas sebelum menyusun agenda liburan di Kota Batu.',
    location: 'Sisir, Kota Batu', hero: img('batu'), heroAlt: "Pemandangan atap rumah dan pegunungan di Kota Batu", caption: "Pemandangan Kota Batu dari Museum Angkut (foto kawasan, bukan foto hotel)", credit: "Foto: Ya, saya inBaliTimur / Wikimedia Commons, CC BY-SA 2.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Kota_Batu_Panorama_(35062670326).jpg",
    facts: [
      { label: 'Nama resmi', value: 'The Batu Hotel & Villas' },
      { label: 'Alamat', value: 'Jl. Sultan Agung No.29, Sisir, Kec. Batu, Kota Batu 65314' },
      { label: 'Tarif kamar', value: 'Cek berdasarkan tanggal dan tipe kamar' },
    ],
    mapQuery: 'The Batu Hotel & Villas Jl. Sultan Agung 29 Kota Batu', action: { label: 'Cek kamar di situs hotel', url: 'https://www.thebatuvillas.com/en/' },
    sources: [
      { name: 'The Batu Hotel & Villas', title: 'Situs resmi penginapan', url: 'https://www.thebatuvillas.com/en/' },
      { name: 'The Batu Hotel & Villas', title: 'Kontak dan alamat', url: 'https://www.thebatuvillas.com/contact-us-hubungi-kami-sms-telepon-alamat-bbm-facebook-instagram-twitter-line-email/' },
    ],
    body: `## Gunakan alamat hotel sebagai patokan rute

The Batu Hotel & Villas mencantumkan alamat di Jalan Sultan Agung No.29, Sisir, Kota Batu. Situs hotel menyebut lokasinya bisa dijangkau jalan kaki ke Jatim Park, Klub Bunga, dan Museum Angkut. Cek rute dari alamat ini ke destinasi harianmu. Untuk perjalanan dengan kereta, hitung juga waktu dan biaya perjalanan lanjutan dari Stasiun Malang.

Buat daftar kebutuhan sebelum membandingkan tipe kamar, misalnya jumlah tempat tidur, akses tanpa tangga, dan parkir. Nama kategori kamar saja belum cukup untuk memastikan tata letak atau fasilitas yang kamu butuhkan.

## Bandingkan total untuk tanggal yang sama

Periksa harga akhir, kebijakan pembatalan, dan apakah sarapan termasuk. Gunakan tanggal dan jumlah tamu yang sama saat membandingkan dua kanal pemesanan karena harga yang terlihat di awal bisa memakai asumsi berbeda.

Jika tiba malam atau membawa kebutuhan khusus, hubungi penginapan melalui kontak resmi sebelum berangkat. Konfirmasi waktu check-in dan simpan alamat lengkap untuk pengemudi.`,
  },
  {
    slug: 'rawon-nguling', category: 'kuliner', city: 'probolinggo', name: 'Rawon Nguling', hoursAgo: 3,
    title: 'Rawon Nguling, Kuliner Legendaris dari Tongas, Probolinggo',
    excerpt: 'Kenali rawon berkuah keluak yang dirintis sejak 1942 di jalur Pantura Tongas, Probolinggo, lalu rencanakan persinggahanmu.',
    location: 'Tongas, Kab. Probolinggo', hero: img('rawon'), heroAlt: "Seporsi nasi rawon berkuah hitam di Rawon Nguling, Probolinggo", caption: "Nasi rawon di Rawon Nguling, Probolinggo", credit: "Foto: ESCapade / Wikimedia Commons, CC BY-SA 3.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Nasi_Rawon_B.JPG",
    facts: [
      { label: 'Alamat', value: 'Jl. Raya Tambakrejo No.75, Wringinan, Tambakrejo, Tongas, Kab. Probolinggo' },
      { label: 'Berdiri', value: '1942, dirintis Mbah Karyodirejo dan Mbah Marni' },
      { label: 'Jam buka', value: 'Setiap hari 05.30–21.00 WIB (Liputan6, Januari 2025)' },
      { label: 'Menu utama', value: 'Rawon daging sapi dengan kuah keluak' },
    ],
    mapQuery: 'Rawon Nguling Jl. Raya Tambakrejo No.75 Tongas Probolinggo',
    sources: [
      { name: 'Kemendikbud', title: 'Katalog Warisan Budaya Takbenda Indonesia 2018 — Rawon Nguling Probolinggo', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Katalog_Warisan_Budaya_Takbenda_Indonesia_2018_%28Buku_1%29.pdf' },
      { name: 'Kompas.com', title: 'Ragam Rawon di Kandang Rawon (2013)', url: 'https://travel.kompas.com/read/2013/10/02/0800309/Ragam.Rawon.di.Kandang.Rawon' },
      { name: 'Liputan6', title: 'Mengenal Rawon Nguling, Kuliner Legendaris di Probolinggo (2025)', url: 'https://www.liputan6.com/regional/read/5874623/mengenal-rawon-nguling-kuliner-legendaris-di-probolinggo' },
      { name: 'Radar Bromo', title: 'Jadi Warisan Budaya Takbenda, Cita Rasa Rawon Nguling Tak Lekang oleh Waktu (2026)', url: 'https://radarbromo.jawapos.com/probolinggo/2606300056/jadi-warisan-budaya-takbenda-cita-rasa-rawon-nguling-tak-lekang-oleh-waktu' },
    ],
    body: `## Apa yang membuat kuahnya hitam?

Warna khas rawon berasal dari keluak. Dalam semangkuk rawon, bumbu itu memberi kuah warna gelap dan rasa yang berbeda dari kaldu sapi bening. Coba sesendok kuah sebelum menambahkan sambal agar karakter bumbunya lebih mudah dikenali.

Nasi putih dan tauge pendek memberi tekstur yang berbeda dari daging serta kuah. Bila tersedia, telur asin atau kerupuk bisa dipesan terpisah. Tanyakan apa yang sudah termasuk dalam satu porsi sebelum menambah lauk.

## Rumah makan asalnya ada di Tongas

Rawon Nguling dirintis pada 1942 oleh Mbah Karyodirejo dan Mbah Marni di Desa Tambakrejo, Kecamatan Tongas, Kabupaten Probolinggo, di tepi jalur Pantura. Rawon Nguling Probolinggo tercatat sebagai Warisan Budaya Takbenda Indonesia pada 2018. Katalog WBTb menyebut warung ini sudah membuka cabang di Malang, Jakarta, dan daerah lain.

Nama serupa muncul di banyak kota, jadi pakai alamat Jalan Raya Tambakrejo saat membuka peta bila ingin ke rumah makan asalnya. Cek jam buka terbaru dan siapkan pilihan cadangan bila antreannya panjang.`,
  },
  {
    slug: 'hotel-tugu-malang', category: 'hotel', city: 'malang', name: 'Hotel Tugu Malang', hoursAgo: 4,
    title: 'Hotel Tugu Malang: Menginap di Jantung Kota Lama',
    excerpt: 'Panduan menimbang lokasi dan tipe kamar di Hotel Tugu untuk perjalanan singkat di pusat Kota Malang.',
    location: 'Klojen, Kota Malang', hero: img('tugu'), heroAlt: "Taman dan Monumen Tugu di Alun-Alun Tugu Malang", caption: "Kawasan Alun-Alun Tugu Malang, lokasi Hotel Tugu (foto kawasan, bukan foto hotel)", credit: "Foto: Christophe95 / Wikimedia Commons, CC BY-SA 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Alun-Alun_Tugu_1.jpg",
    facts: [
      { label: 'Alamat', value: 'Jl. Tugu No.3, Klojen, Kota Malang' },
      { label: 'Tarif kamar', value: 'Cek berdasarkan tanggal dan tipe kamar' },
      { label: 'Area', value: 'Pusat kota, dekat Alun-Alun Tugu' },
    ],
    mapQuery: 'Hotel Tugu Malang Jalan Tugu 3', action: { label: 'Cek kamar di situs hotel', url: 'https://tuguhotels.com/hotels/malang/booking/' },
    sources: [
      { name: 'Tugu Hotels', title: 'Hotel Tugu Malang', url: 'https://tuguhotels.com/hotels/malang/' },
      { name: 'Tugu Hotels', title: 'Pemesanan Hotel Tugu Malang', url: 'https://tuguhotels.com/hotels/malang/booking/' },
    ],
    body: `## Mulai dari pusat kota

Hotel Tugu berada di Jalan Tugu No.3, kawasan pusat Kota Malang dekat Alun-Alun Tugu. Lokasinya praktis untuk menyusun agenda yang banyak berlangsung di pusat kota. Simpan lokasi hotel dan pastikan rute jalan kaki dari tempat yang ingin kamu kunjungi sebelum memutuskan transportasi.

Luangkan waktu untuk melihat koleksi dan dekorasi yang ditonjolkan hotel. Jika pengalaman ini penting untuk perjalananmu, tanyakan kepada pihak hotel area mana yang bisa dikunjungi dan apakah perlu reservasi.

## Periksa detail kamar sebelum memesan

Bandingkan tipe kamar berdasarkan kapasitas, kebutuhan akses, dan paket sarapan. Jika bepergian bertiga, tanyakan apakah extra bed tersedia pada tipe kamar yang dipilih dan berapa biaya tambahannya.

Cek tarif untuk tanggal pasti dan baca tenggat pembatalan di halaman resmi. Konfirmasi detail kedatangan langsung bila perjalanan bergantung pada jadwal kereta atau penerbangan malam.`,
  },
  {
    slug: 'jatim-park-2', category: 'wisata', city: 'batu', name: 'Jatim Park 2', hoursAgo: 5,
    title: 'Jatim Park 2: Menyusun Kunjungan ke Batu Secret Zoo dan Museum Satwa',
    excerpt: 'Panduan sehari untuk memilih area, memeriksa tiket, dan menyesuaikan agenda keluarga di Jatim Park 2, Kota Batu.',
    location: 'Temas, Kota Batu', hero: img('jatim'), heroAlt: "Paviliun pintu masuk Batu Secret Zoo berwarna merah di Jatim Park 2", caption: "Paviliun pintu masuk Batu Secret Zoo, Jatim Park 2", credit: "Foto: Rochelimit / Wikimedia Commons, CC BY-SA 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Batu_Secret_Zoo_entrance_pavilion.jpg",
    facts: [
      { label: 'Alamat', value: 'Jl. Oro-Oro Ombo No.9, Temas, Kec. Batu, Kota Batu 65315' },
      { label: 'Jam Batu Secret Zoo', value: '08.30–16.30 WIB setiap hari; pintu masuk tutup 1 jam lebih awal' },
      { label: 'Tiket', value: 'Cek paket dan jadwal di situs pengelola' },
    ],
    mapQuery: 'Jawa Timur Park 2 Batu Secret Zoo', action: { label: 'Info resmi Batu Secret Zoo', url: 'https://jtp.id/batusecretzoo/' },
    sources: [
      { name: 'Jawa Timur Park Group', title: 'Batu Secret Zoo', url: 'https://jtp.id/batusecretzoo/' },
      { name: 'Jawa Timur Park Group', title: 'FAQ Batu Secret Zoo', url: 'https://www.jtp.id/batusecretzoo/faq/index.html' },
      { name: 'Jawa Timur Park Group', title: 'Museum Satwa', url: 'https://jtp.id/museumsatwa/index.html' },
    ],
    body: `## Pilih area utama untuk rombonganmu

Batu Secret Zoo menawarkan rute jalan kaki untuk melihat beragam satwa, sedangkan Museum Satwa menyajikan koleksi dan diorama. Mulai dari bagian yang paling ditunggu anak atau anggota rombongan, lalu sisakan waktu untuk area lain.

Cek peta pengelola sebelum tiba. Pilih titik temu yang jelas bila rombongan berpencar dan rencanakan jeda makan agar kunjungan tetap nyaman.

## Periksa aturan tiket dan waktu masuk

Lihat apakah tiket yang dipilih mencakup kedua area. Menurut FAQ pengelola, Batu Secret Zoo buka 08.30–16.30 WIB dan pintu masuk ditutup satu jam sebelum jam tutup; selama Ramadan jamnya 09.00–17.00 WIB. Periksa juga kebijakan tinggi badan anak pada informasi pengunjung.

Kenakan sepatu nyaman dan ikuti petunjuk di dekat kandang. Jangan memberi makan satwa kecuali melalui kegiatan yang diawasi pengelola.`,
  },
  {
    slug: 'bakso-president', category: 'kuliner', city: 'malang', name: 'Bakso President', hoursAgo: 6,
    title: 'Bakso President: Mampir ke Kedai Bakso di Tepi Rel Malang',
    excerpt: 'Panduan makan di cabang pusat Bakso President, dari memilih isian dalam semangkuk bakso sampai mengecek lokasi.',
    location: 'Rampal Celaket, Kota Malang', hero: img('bakso'), heroAlt: "Semangkuk bakso Malang dengan pangsit goreng dan tahu", caption: "Bakso Malang dengan pangsit goreng (foto ilustrasi menu, bukan di Bakso President)", credit: "Foto: Gunawan Kartapranata / Wikimedia Commons, CC BY-SA 3.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Baso_Malang_Karapitan.JPG",
    budget: { label: 'Kisaran per orang', value: 'Rp22.000–Rp60.000' },
    facts: [
      { label: 'Lokasi', value: 'Jl. Batanghari No.3, Rampal Celaket, Klojen, Kota Malang' },
      { label: 'Jam buka', value: '08.00–21.30 WIB menurut situs kedai' },
      { label: 'Kisaran per orang', value: 'Rp22.000–Rp60.000 menurut situs kedai' },
      { label: 'Berdiri', value: '1977 (Pemerintah Kota Malang)' },
    ],
    mapQuery: 'Bakso President Pusat Jalan Batanghari Malang', action: { label: 'Lihat menu dan cabang', url: 'https://baksopresident.com/' },
    sources: [
      { name: 'Bakso President Malang', title: 'Menu, jam buka, dan lokasi cabang', url: 'https://baksopresident.com/' },
      { name: 'Pemerintah Kota Malang', title: 'Merasakan Sensasi Makan Bakso di Pinggir Rel Kereta Api (2022)', url: 'https://malangkota.go.id/2022/04/02/merasakan-sensasi-makan-bakso-di-pinggir-rel-kereta-api/' },
    ],
    body: `## Pilih isi mangkuk sesuai selera

Mulai dari bakso daging bila kamu ingin mencoba versi yang sederhana. Untuk lebih banyak variasi tekstur, lihat pilihan bakso urat, siomay, dan bakso goreng pada menu. Cicipi kuah sebelum menambahkan sambal agar bisa menyesuaikan tingkat pedas.

Kisaran harga yang dicantumkan kedai bergantung pada menu. Periksa harga per porsi dan biaya tambahan ketika memesan, terutama jika beberapa orang ingin berbagi lauk.

## Tuju cabang pusat untuk suasana tepi rel

Cabang pusat berada di Jalan Batanghari, Rampal Celaket, tepat di samping rel kereta api. Situs kedai menulis nomor 3, sedangkan artikel Pemerintah Kota Malang (2022) menulis nomor 5, jadi pakai nama cabang "Bakso President Pusat" saat membuka peta karena kedai memiliki beberapa lokasi di Malang.

Nikmati suasana dari area kedai dan tetap di area yang diizinkan. Bila datang saat jam makan, siapkan waktu untuk antre atau pertimbangkan cabang lain.`,
  },
  {
    slug: 'gudeg-yu-djum', category: 'kuliner', city: 'yogyakarta', name: 'Gudeg Yu Djum', hoursAgo: 7,
    title: 'Gudeg Yu Djum: Seporsi Gudeg dan Pilihan Oleh-Oleh dari Wijilan',
    excerpt: 'Kenali pilihan nasi gudeg, besek, dan kendil sebelum mampir ke sentra kuliner Wijilan di Yogyakarta.',
    location: 'Wijilan, Kota Yogyakarta', hero: img('gudeg'), heroAlt: "Deretan warung gudeg di Sentra Gudeg Wijilan, Yogyakarta", caption: "Sentra Gudeg Wijilan, Yogyakarta (foto kawasan)", credit: "Foto: Dietrich Ayala from Portland, USA / Wikimedia Commons, CC BY 2.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Sentra_Gudeg_Wijilan.jpg",
    facts: [
      { label: 'Lokasi', value: 'Sentra Gudeg Wijilan, Panembahan, Kraton, Kota Yogyakarta' },
      { label: 'Dapur asal', value: 'Karangasem, Mbarek (Jl. Kaliurang Km 4,5), Sleman' },
      { label: 'Menu utama', value: 'Nasi gudeg, gudeg besek, dan gudeg kendil' },
      { label: 'Harga', value: 'Cek menu sesuai pilihan lauk dan kemasan' },
    ],
    mapQuery: 'Gudeg Yu Djum Wijilan Yogyakarta', action: { label: 'Lihat pilihan kemasan', url: 'https://gudegyudjumpusat.com/services/' },
    sources: [
      { name: 'Dinas Pariwisata DIY', title: 'Gudeg Yu Djum', url: 'https://visitingjogja.jogjaprov.go.id/7946/gudeg-yu-djum/' },
      { name: 'Dinas Kebudayaan Kota Yogyakarta', title: 'Gudeg', url: 'https://kebudayaan.jogjakota.go.id/page/index/gudeg' },
      { name: 'Gudeg Yu Djum Pusat', title: 'Menu dan daftar cabang', url: 'https://gudegyudjumpusat.com/services/' },
    ],
    body: `## Pesan satu porsi untuk mengenali rasanya

Mulai dari nasi gudeg bila kamu makan di tempat. Nangka muda yang dimasak lama menjadi bagian utama, sedangkan areh, sambal goreng krecek, dan lauk seperti telur atau ayam memberi variasi rasa. Tanyakan lauk yang sudah termasuk karena tiap paket bisa berbeda.

Wijilan dikenal sebagai sentra gudeg dan di sana ada lebih dari satu kedai yang memakai nama Yu Djum, misalnya di Jalan Wijilan No.31 dan No.167. Dapur asal Yu Djum sendiri berada di Karangasem, Mbarek, Sleman. Cek nama cabang di peta sebelum berangkat.

## Pilih kemasan sesuai rencana perjalanan

Besek memakai wadah anyaman bambu, sedangkan kendil menggunakan wadah tanah liat. Pertimbangkan jumlah orang, ukuran bawaan, dan jarak perjalanan sebelum memilih kemasan.

Dinas Pariwisata DIY mencatat paket gudeg untuk buah tangan bisa bertahan sekitar dua hari, lebih lama bila disimpan di lemari es. Tetap tanyakan petunjuk penyimpanan kepada penjual, terutama untuk perjalanan panjang.`,
  },
].map((g) => ({ ...credit, ...g }));
