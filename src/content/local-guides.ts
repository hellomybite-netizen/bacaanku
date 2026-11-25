import type { Guide } from '../lib/local-guide';

export const guideDate = '2026-11-25';

export const localGuides: Guide[] = [
  {
    slug: 'gunung-bromo', category: 'wisata', region: 'probolinggo', name: 'Gunung Bromo',
    title: 'Gunung Bromo: Menyambut Matahari Terbit di Dataran Tengger',
    description: 'Panduan memilih titik pandang, menyiapkan tiket, dan menyusun perjalanan pertama ke Gunung Bromo dari sisi Probolinggo.',
    location: 'Cemorolawang, Probolinggo', image: 'bromo', imageAlt: 'Ilustrasi lanskap gunung dan kabut pagi di kaldera Tengger',
    facts: [{ label: 'Pintu masuk', value: 'Cemorolawang, Probolinggo' }, { label: 'Tiket', value: 'Pemesanan daring melalui pengelola' }, { label: 'Sorotan', value: 'Matahari terbit, kaldera, dan Laut Pasir' }],
    mapQuery: 'Cemorolawang Ngadisari Probolinggo', action: { label: 'Cek tiket resmi Bromo', url: 'https://bromotenggersemeru.id/' },
    sources: [{ label: 'Balai Besar TNBTS — ketentuan kunjungan Bromo', url: 'https://bromotenggersemeru.id/peraturan/bromo' }, { label: 'Wonderful Indonesia — kegiatan di Bromo Tengger Semeru', url: 'https://www.indonesia.travel/id/id/travel-ideas/adventure/ide-aktivitas-bromo-tengger-semeru' }],
    sections: [
      { title: 'Pilih satu titik pandang untuk pagi pertama', paragraphs: ['Mentigen bisa dipertimbangkan bila kamu bermalam di sekitar Cemorolawang. Pilihan lain yang diperkenalkan Wonderful Indonesia antara lain Bukit Cinta dan Penanjakan. Cek peta serta waktu tempuh dari penginapan sebelum memesan kendaraan, karena titik pandang dan gerbang masuk berada di lokasi berbeda.', 'Siapkan jaket, sepatu tertutup, dan air minum sebelum berangkat. Sisakan waktu untuk antrean dan perubahan cuaca. Kalau pemandangan tertutup kabut, jangan mengejar spot lain dengan terburu-buru.'] },
      { title: 'Pisahkan biaya tiket dan transportasi', paragraphs: ['Cek aturan, akses yang sedang dibuka, dan ketersediaan tiket di situs Balai Besar TNBTS menjelang kunjungan. Bila menggunakan jasa jip, tanyakan titik jemput, titik berhenti, dan komponen yang sudah masuk harga sebelum membayar.', 'Susun rute berdasar kondisi hari itu. Ikuti petunjuk petugas, khususnya bila kawasan dibatasi untuk keselamatan, konservasi, atau kegiatan adat masyarakat Tengger.'] },
    ],
  },
  {
    slug: 'the-batu-villas', category: 'hotel', region: 'malang', name: 'The Batu Villas',
    title: 'The Batu Villas: Menginap di Sisir untuk Menjelajahi Kota Batu',
    description: 'Cara menilai pilihan kamar, lokasi, dan biaya menginap di The Batu Villas sebelum menyusun agenda liburan di Batu.',
    location: 'Sisir, Kota Batu', image: 'hotel', imageAlt: 'Ilustrasi suasana penginapan dengan paviliun dan taman tropis',
    facts: [{ label: 'Alamat', value: 'Jl. Sultan Agung No.29, Sisir, Kota Batu' }, { label: 'Tarif kamar', value: 'Cek berdasarkan tanggal dan tipe kamar' }, { label: 'Area', value: 'Sisir, Kota Batu' }],
    mapQuery: 'The Batu Villas Sultan Agung 29 Kota Batu', action: { label: 'Cek kamar di situs hotel', url: 'https://www.thebatuvillas.com/en/' },
    sources: [{ label: 'The Batu Villas — situs resmi penginapan', url: 'https://www.thebatuvillas.com/en/' }],
    sections: [
      { title: 'Gunakan alamat hotel sebagai patokan rute', paragraphs: ['The Batu Villas mencantumkan alamat di Jalan Sultan Agung, Sisir, Kota Batu. Bila sebagian besar agenda ada di Batu, cek rute dari alamat ini ke destinasi harianmu. Untuk perjalanan dengan kereta, hitung juga waktu dan biaya perjalanan lanjutan dari stasiun tujuan.', 'Buat daftar kebutuhan sebelum membandingkan tipe kamar, misalnya jumlah tempat tidur, akses tanpa tangga, dan parkir. Nama kategori kamar saja belum cukup untuk memastikan tata letak atau fasilitas yang kamu butuhkan.'] },
      { title: 'Bandingkan total untuk tanggal yang sama', paragraphs: ['Periksa harga akhir, kebijakan pembatalan, dan apakah sarapan termasuk. Gunakan tanggal dan jumlah tamu yang sama saat membandingkan dua kanal pemesanan karena harga yang terlihat di awal bisa memakai asumsi berbeda.', 'Jika tiba malam atau membawa kebutuhan khusus, hubungi penginapan melalui kontak resmi sebelum berangkat. Konfirmasi waktu check-in dan simpan alamat lengkap untuk pengemudi.'] },
    ],
  },
  {
    slug: 'rawon-nguling', category: 'kuliner', region: 'surabaya', name: 'Rawon Nguling',
    title: 'Rawon Nguling, Kuliner Legendaris Khas Surabaya',
    description: 'Kenali rawon berkuah keluak dan rencanakan persinggahan di sekitar Pasar Besar saat menjelajahi Surabaya.',
    location: 'Pasar Besar, Surabaya', image: 'rawon', imageAlt: 'Ilustrasi rawon khas Jawa Timur dengan daging sapi dan tauge',
    gallery: [
      { image: 'rawon-kuah', alt: 'Ilustrasi tekstur kuah keluak dan potongan daging dari atas' },
      { image: 'rawon-sajian', alt: 'Ilustrasi rawon disajikan dengan nasi, sambal, dan telur asin' },
    ],
    facts: [{ label: 'Lokasi', value: 'Kawasan Pasar Besar, Surabaya' }, { label: 'Menu utama', value: 'Rawon daging sapi dengan kuah keluak' }, { label: 'Harga dan jam buka', value: 'Cek menu dan jam terbaru di lokasi' }],
    mapQuery: 'Rawon Nguling Pasar Besar Wetan Surabaya',
    sources: [{ label: 'Katalog Warisan Budaya Takbenda Indonesia 2018 — Rawon Nguling', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Katalog_Warisan_Budaya_Takbenda_Indonesia_2018_%28Buku_1%29.pdf' }, { label: 'Surabaya Tourism — direktori kuliner', url: 'https://www.surabayatourism.com/det_resto.php?ID=2&lang=1' }, { label: 'Portal cagar budaya Kota Surabaya — Kampung Kraton dan Pasar Besar', url: 'https://disbudporapar.surabaya.go.id/adinda/portaldata/cagarbudaya/detail/kampung-kraton-situs' }],
    sections: [
      { title: 'Apa yang membuat kuahnya hitam?', paragraphs: ['Warna khas rawon berasal dari keluak. Dalam semangkuk rawon, bumbu itu memberi kuah warna gelap dan rasa yang berbeda dari kaldu sapi bening. Coba sesendok kuah sebelum menambahkan sambal agar karakter bumbunya lebih mudah dikenali.', 'Nasi putih dan tauge pendek memberi tekstur yang berbeda dari daging serta kuah. Bila tersedia, telur asin atau kerupuk bisa dipesan terpisah. Tanyakan apa yang sudah termasuk dalam satu porsi sebelum menambah lauk.'] },
      { title: 'Pastikan cabang sebelum berangkat', paragraphs: ['Rawon Nguling punya jejak kuliner di Jawa Timur dan nama yang serupa muncul di sejumlah lokasi. Saat mencari tempat di Surabaya, pakai kata kunci Pasar Besar agar rute tidak tertukar dengan cabang atau kedai lain.', 'Jadikan kunjungan sebagai jeda makan ketika menjelajahi kawasan lama Surabaya. Cek jam operasional terbaru dan siapkan pilihan cadangan bila kedai tutup atau antreannya panjang.'] },
    ],
  },
  {
    slug: 'hotel-tugu-malang', category: 'hotel', region: 'malang', name: 'Hotel Tugu Malang',
    title: 'Hotel Tugu Malang: Menginap di Jantung Kota Lama',
    description: 'Panduan menimbang lokasi dan tipe kamar di Hotel Tugu untuk perjalanan singkat di pusat Kota Malang.',
    location: 'Klojen, Kota Malang', image: 'tugu', imageAlt: 'Ilustrasi penginapan bergaya kolonial dengan taman tropis',
    facts: [{ label: 'Alamat', value: 'Jl. Tugu No.3, Klojen, Kota Malang' }, { label: 'Tarif kamar', value: 'Cek berdasarkan tanggal dan tipe kamar' }, { label: 'Area', value: 'Pusat kota, dekat Alun-Alun Tugu' }],
    mapQuery: 'Hotel Tugu Malang Jalan Tugu 3', action: { label: 'Cek kamar di situs hotel', url: 'https://tuguhotels.com/hotels/malang/booking/' },
    sources: [{ label: 'Tugu Hotels — Hotel Tugu Malang', url: 'https://tuguhotels.com/hotels/malang/' }],
    sections: [
      { title: 'Mulai dari pusat kota', paragraphs: ['Hotel Tugu berada di kawasan pusat Kota Malang, menghadap Alun-Alun Tugu. Lokasinya praktis untuk menyusun agenda yang banyak berlangsung di pusat kota. Simpan lokasi hotel dan pastikan rute jalan kaki dari tempat yang ingin kamu kunjungi sebelum memutuskan transportasi.', 'Luangkan waktu untuk melihat koleksi dan dekorasi yang ditonjolkan hotel. Jika pengalaman ini penting untuk perjalananmu, tanyakan kepada pihak hotel area mana yang bisa dikunjungi dan apakah perlu reservasi.'] },
      { title: 'Periksa detail kamar sebelum memesan', paragraphs: ['Bandingkan tipe kamar berdasarkan kapasitas, kebutuhan akses, dan paket sarapan. Jika bepergian bertiga, tanyakan apakah extra bed tersedia pada tipe kamar yang dipilih dan berapa biaya tambahannya.', 'Cek tarif untuk tanggal pasti dan baca tenggat pembatalan di halaman resmi. Konfirmasi detail kedatangan langsung bila perjalanan bergantung pada jadwal kereta atau penerbangan malam.'] },
    ],
  },
  {
    slug: 'jatim-park-2', category: 'wisata', region: 'malang', name: 'Jatim Park 2',
    title: 'Jatim Park 2: Menyusun Kunjungan ke Batu Secret Zoo dan Museum Satwa',
    description: 'Panduan sehari untuk memilih area, memeriksa tiket, dan menyesuaikan agenda keluarga di Jatim Park 2, Kota Batu.',
    location: 'Temas, Kota Batu', image: 'jatim', imageAlt: 'Ilustrasi jalur pejalan kaki di taman wisata satwa tropis',
    facts: [{ label: 'Alamat', value: 'Jl. Oro-Oro Ombo No.9, Temas, Kota Batu' }, { label: 'Jam Batu Secret Zoo', value: '08.30–16.30 WIB pada jadwal reguler' }, { label: 'Tiket', value: 'Cek paket dan jadwal di situs pengelola' }],
    mapQuery: 'Jawa Timur Park 2 Batu Secret Zoo', action: { label: 'Cek tiket Jatim Park 2', url: 'https://ticket.jtp.id/' },
    sources: [{ label: 'Jawa Timur Park Group — Batu Secret Zoo', url: 'https://jtp.id/batusecretzoo/' }, { label: 'Jawa Timur Park Group — Museum Satwa', url: 'https://jtp.id/museumsatwa/index.html' }],
    sections: [
      { title: 'Pilih area utama untuk rombonganmu', paragraphs: ['Batu Secret Zoo menawarkan rute jalan kaki untuk melihat beragam satwa, sedangkan Museum Satwa menyajikan koleksi dan diorama. Mulai dari bagian yang paling ditunggu anak atau anggota rombongan, lalu sisakan waktu untuk area lain.', 'Cek peta pengelola sebelum tiba. Pilih titik temu yang jelas bila rombongan berpencar dan rencanakan jeda makan agar kunjungan tetap nyaman.'] },
      { title: 'Periksa aturan tiket dan waktu masuk', paragraphs: ['Lihat apakah tiket yang dipilih mencakup kedua area. Periksa juga kebijakan tinggi badan anak dan batas akhir masuk yang tercantum pada informasi pengunjung, terutama pada hari libur dan Ramadan.', 'Kenakan sepatu nyaman dan ikuti petunjuk di dekat kandang. Jangan memberi makan satwa kecuali melalui kegiatan yang diawasi pengelola.'] },
    ],
  },
  {
    slug: 'bakso-president', category: 'kuliner', region: 'malang', name: 'Bakso President',
    title: 'Bakso President: Mampir ke Kedai Bakso di Tepi Rel Malang',
    description: 'Panduan makan di cabang pusat Bakso President, dari memilih isian dalam semangkuk bakso sampai mengecek lokasi.',
    location: 'Rampal Celaket, Kota Malang', image: 'bakso', imageAlt: 'Ilustrasi semangkuk bakso Malang dengan pangsit goreng dan kuah bening',
    budget: { label: 'Kisaran per orang', value: 'Rp22.000–Rp60.000' },
    facts: [{ label: 'Lokasi', value: 'Jl. Batanghari, Rampal Celaket, Klojen' }, { label: 'Jam buka', value: '08.00–21.30 WIB menurut situs kedai' }, { label: 'Kisaran per orang', value: 'Rp22.000–Rp60.000 menurut situs kedai' }],
    mapQuery: 'Bakso President Pusat Jalan Batanghari Malang', action: { label: 'Lihat menu dan cabang', url: 'https://baksopresident.com/' },
    sources: [{ label: 'Bakso President Malang — menu dan lokasi', url: 'https://baksopresident.com/' }, { label: 'Pemerintah Kota Malang — Bakso President di pinggir rel', url: 'https://malangkota.go.id/2022/04/02/merasakan-sensasi-makan-bakso-di-pinggir-rel-kereta-api/' }],
    sections: [
      { title: 'Pilih isi mangkuk sesuai selera', paragraphs: ['Mulai dari bakso daging bila kamu ingin mencoba versi yang sederhana. Untuk lebih banyak variasi tekstur, lihat pilihan bakso urat, siomay, dan bakso goreng pada menu. Cicipi kuah sebelum menambahkan sambal agar bisa menyesuaikan tingkat pedas.', 'Kisaran harga yang dicantumkan kedai bergantung pada menu. Periksa harga per porsi dan biaya tambahan ketika memesan, terutama jika beberapa orang ingin berbagi lauk.'] },
      { title: 'Tuju cabang pusat untuk suasana tepi rel', paragraphs: ['Cabang pusat berada di Jalan Batanghari, Rampal Celaket. Gunakan nama cabang lengkap saat membuka peta karena kedai memiliki beberapa lokasi di Malang.', 'Nikmati suasana dari area kedai dan tetap di area yang diizinkan. Bila datang saat jam makan, siapkan waktu untuk antre atau pertimbangkan cabang lain.'] },
    ],
  },
  {
    slug: 'gudeg-yu-djum', category: 'kuliner', region: 'yogyakarta', name: 'Gudeg Yu Djum',
    title: 'Gudeg Yu Djum: Seporsi Gudeg dan Pilihan Oleh-Oleh dari Wijilan',
    description: 'Kenali pilihan nasi gudeg, besek, dan kendil sebelum mampir ke sentra kuliner Wijilan di Yogyakarta.',
    location: 'Wijilan, Kota Yogyakarta', image: 'gudeg', imageAlt: 'Ilustrasi nasi gudeg dengan nangka muda, telur, ayam, dan krecek',
    facts: [{ label: 'Lokasi', value: 'Kawasan Wijilan, Kota Yogyakarta' }, { label: 'Menu utama', value: 'Nasi gudeg, gudeg besek, dan gudeg kendil' }, { label: 'Harga', value: 'Cek menu sesuai pilihan lauk dan kemasan' }],
    mapQuery: 'Gudeg Yu Djum Wijilan Yogyakarta', action: { label: 'Lihat pilihan menu', url: 'https://gudegyudjum.com/' },
    sources: [{ label: 'Gudeg Yu Djum — situs resmi dan pilihan menu', url: 'https://gudegyudjum.com/' }, { label: 'Dinas Kebudayaan Kota Yogyakarta — Gudeg', url: 'https://kebudayaan.jogjakota.go.id/page/index/gudeg' }],
    sections: [
      { title: 'Pesan satu porsi untuk mengenali rasanya', paragraphs: ['Mulai dari nasi gudeg bila kamu makan di tempat. Nangka muda yang dimasak lama menjadi bagian utama, sedangkan areh, sambal goreng krecek, dan lauk seperti telur atau ayam memberi variasi rasa. Tanyakan lauk yang sudah termasuk karena tiap paket bisa berbeda.', 'Wijilan dikenal sebagai sentra gudeg. Jika agenda kamu juga mencakup kawasan Keraton, cek rute jalan kaki antara kedua titik dan sisihkan waktu untuk makan di sekitar Wijilan.'] },
      { title: 'Pilih kemasan sesuai rencana perjalanan', paragraphs: ['Besek memakai wadah anyaman, sedangkan kendil menggunakan wadah tanah liat. Pertimbangkan jumlah orang, ukuran bawaan, dan jarak perjalanan sebelum memilih kemasan.', 'Tanyakan petunjuk penyimpanan serta batas waktu konsumsi langsung kepada penjual. Untuk perjalanan panjang, konfirmasi apakah produk yang dipilih cocok dibawa sampai tujuan.'] },
    ],
  },
];

export const featuredGuides = localGuides.slice(0, 3);
