-- 0004b — DATA: arsipkan 208 berita lama (jenis=arsip-berita di inventaris 27 Nov 2026).
-- Jalankan SETELAH 0004_arsip_noindex_harga.sql. URL, slug, kategori, dan status TIDAK berubah:
-- hanya archived_at diisi, sehingga halaman tetap 200 + banner arsip, tetapi keluar dari
-- beranda, menu, sitemap, news-sitemap, RSS, Terpopuler, dan blok terkait.
-- Idempoten: hanya baris yang belum diarsipkan (archived_at IS NULL) yang disentuh.
-- Rollback: docs/migrasi-0004-arsip-harga.md (UPDATE ... SET archived_at = NULL ...).
-- Sumber daftar: /workspace/bacaanku-arsip-artikel-2026-11-27/inventaris.csv (jenis = arsip-berita).
-- Jumlah per kategori: ekonomi 30, hiburan 31, news 37, olahraga 32, otomotif 27, sains 25, teknologi 26 = 208

-- ekonomi: 30 artikel
UPDATE articles SET archived_at = unixepoch()
WHERE archived_at IS NULL AND status = 'published'
  AND category_id = (SELECT id FROM categories WHERE slug = 'ekonomi')
  AND slug IN (
    'apbd-dki-jakarta-2027-disahkan-rp863-triliun-pinjaman-pt-smi-infrastruktur',
    'bei-gandeng-nasdaq-perkuat-pengawasan-saham-tim-khusus-berkantor-desember-2026',
    'bi-manfaatkan-data-transaksi-qris-bantu-umkm-dapat-kredit',
    'bi-naikkan-bi-rate-25-bps-menjadi-6-persen-gwm-dilonggarkan',
    'bi-resmikan-bank-kliring-renminbi-perkuat-transaksi-rupiah-yuan',
    'bitcoin-sempat-anjlok-ke-level-terendah-sejak-2024-lalu-rebound-ke-atas-60000-dolar-as',
    'danantara-bidik-laba-dim-rp5-6-triliun-2027-proyeksi-2026-dipangkas-rp800-miliar',
    'defisit-apbn-oktober-2026-rp379-triliun-menkeu-on-track',
    'ekspor-kulit-dan-alas-kaki-ri-tembus-usd722-miliar-hingga-september-2026',
    'ftse-russell-coret-14-saham-indonesia-dari-indeks-global-bris-hingga-mtel',
    'ieu-cepa-resmi-diteken-di-brussels-904-persen-pos-tarif-ekspor-ri-langsung-nol-persen',
    'ihsg-ditutup-melemah-102-persen-ke-519414-koreksi-empat-sesi-beruntun',
    'ihsg-ditutup-menguat-178-persen-ke-5344-13-november-2026',
    'lp2b-nasional-87-98-persen-sawah-dilindungi',
    'lps-batal-bangun-kantor-ikn-usulkan-rp146-triliun-gedung-jakarta-anggaran-2027',
    'menkeu-suahasil-apbn-2026-fleksibel-anggaran-bencana-rp5935-triliun',
    'ojk-luncurkan-dua-roadmap-pvml-2026-2031-syariah-dan-ekonomi-hijau',
    'ojk-perintahkan-pengembalian-untung-ilegal-rp2377-miliar-manipulasi-saham-homi-samf-smdm',
    'pemerintah-serap-rp10-triliun-dari-lelang-sukuk-17-november-2026',
    'pii-ungkap-porsi-jaminan-utang-whoosh-rp2-triliun-diberikan-ke-kai',
    'prabowo-ktt-asean-jepang-indonesia-produksi-bioetanol-besar-besaran-tekan-impor-bbm',
    'prabowo-minta-minimal-70-persen-hasil-tambang-dinikmati-negara',
    'prabowo-saksikan-kerja-sama-ri-tiongkok-senilai-usd718-miliar-di-shenzhen',
    'pt-dsi-perantara-tunggal-ekspor-batu-bara-cpo-ferroalloy-2027',
    'ri-uni-eropa-matangkan-implementasi-ieu-cepa-jelang-penandatanganan-di-brussels',
    'rupiah-melemah-ke-rp18270-ihsg-turun-092-persen-meski-bi-rate-naik-6-persen',
    'rupslb-bayan-ary-bastari-gantikan-low-tuck-kwong-budi-waseso-hatta-rajasa-komisaris',
    'setoran-pajak-kripto-rp223-triliun-pajak-ekonomi-digital-rp601-triliun-oktober-2026',
    'uang-beredar-m2-oktober-2026-rp10698-triliun-tumbuh-93-persen',
    'ump-jawa-tengah-2027-rp265-juta-naik-1410-persen-tertinggi-sedekade'
  );

-- hiburan: 31 artikel
UPDATE articles SET archived_at = unixepoch()
WHERE archived_at IS NULL AND status = 'published'
  AND category_id = (SELECT id FROM categories WHERE slug = 'hiburan')
  AND slug IN (
    'abimana-aryasatya-raih-piala-citra-pertama-lewat-ghost-in-the-cell',
    'ai-music-awards-perdana-digelar-di-los-angeles-xania-monet-borong-tiga-penghargaan',
    'akun-resmi-oscar-soroti-klip-jatuh-cinta-seperti-di-film-film',
    'ateez-raih-no-1-keempat-di-billboard-200-lewat-golden-hour-part-6-pecahkan-rekor-grup-dekade-ini',
    'bandung-world-cinema-2026-putar-204-film-dari-69-negara-hingga-21-november',
    'bebi-romeo-buka-the-rebloom-project-duet-bersama-putrinya-di-lagu-tiada-duanya',
    'bigbang-raih-music-visionary-of-the-year-mama-awards-2026-di-tahun-ke-20-debut',
    'bts-borong-lima-penghargaan-mama-awards-2026-termasuk-album-of-the-year-untuk-arirang',
    'cortis-raih-song-of-the-year-mama-awards-2026-lewat-redred-bawa-pulang-empat-trofi',
    'ebenezer-puncaki-box-office-amerika-utara-tandai-kembalinya-johnny-depp-ke-film-studio-besar',
    'empat-film-indonesia-tayang-12-november-2026-seporsi-mie-ayam',
    'empat-film-indonesia-tayang-19-november-dari-people-pleaser-hingga-hamka-vol-3',
    'hailee-steinfeld-kembali-jadi-kate-bishop-di-avengers-doomsday',
    'hamka-awal-mula-vol-3-tayang-19-november-vino-g-bastian-kembali-peran-sebagai-hamka',
    'imam-darto-bagian-ending-hungry-ghost-festival-paling-sulit-digarap',
    'iu-umumkan-konser-dua-hari-di-jis-pada-8-9-mei-2027-panggung-stadion-pertamanya-di-indonesia',
    'iwan-fals-acungkan-tiga-jari-saat-nyanyikan-bongkar-di-konser-laut-dalam-lagu',
    'jadwal-konser-jakarta-14-15-november-2026-5sos-bol4-gesrek',
    'japanese-film-festival-2026-hadir-di-sembilan-kota-surabaya-mulai-20-november',
    'jeongyeon-twice-debut-akting-layar-lebar-sebagai-perawat-militer-di-film-new-recruit',
    'joko-anwar-raih-sutradara-terbaik-ffi-2026-singgung-korupsi-dan-kebakaran-hutan',
    'kate-middleton-ungkap-tak-pernah-membunyikan-lonceng-usai-pengobatan-kanker-dalam-dokumenter-heal',
    'katon-bagaskara-produseri-single-debut-stihat-janji-yang-pudar',
    'meriam-bellina-raih-pemeran-utama-perempuan-terbaik-ffi-2026-lewat-senin-harga-naik',
    'miley-cyrus-resmi-menikah-dengan-maxx-morando-di-palm-springs',
    'my-chemical-romance-bawakan-the-black-parade-di-jis-penantian-18-tahun-penggemar-terbayar',
    'people-pleaser-tayang-19-november-mawar-de-jongh-perankan-karina-yang-sulit-menolak',
    'prilly-latuconsina-bebas-bicara-karhutla-ffi-2026-voting-vidio',
    'pulang-kampung-film-musikal-batak-imajinari-tayang-26-november-2026',
    'toto-gelar-konser-50-tahun-di-jakarta-pada-2-april-2027-harga-tiket-mulai-rp950-ribu',
    'trailer-film-zona-merah-dirilis-luna-maya-jadi-produser-eksekutif-dan-tayang-14-januari-2027'
  );

-- news: 37 artikel
UPDATE articles SET archived_at = unixepoch()
WHERE archived_at IS NULL AND status = 'published'
  AND category_id = (SELECT id FROM categories WHERE slug = 'news')
  AND slug IN (
    '139-wni-tersangka-online-scam-di-manila-dipulangkan-pakai-seragam-polisi-asli-untuk-menipu',
    'bareskrim-periksa-59-saksi-kasus-dugaan-makar-terhadap-prabowo-termasuk-listyo-sigit',
    'bmkg-gempa-laut-banda-maluku-tenggara-diperbarui-m68-tidak-berpotensi-tsunami',
    'bnpb-catat-283-titik-api-karhutla-764-hektare-kaltim-ntt-atensi',
    'dasco-dpr-segera-revisi-uu-perlindungan-anak-dan-uu-sppa-untuk-lawan-perundungan',
    'dpr-pemerintah-pangkas-sasaran-ruu-perampasan-aset-13-jadi-6',
    'dpr-sahkan-ruu-perampasan-aset-jadi-undang-undang-setelah-18-tahun-pembahasan',
    'fadli-zon-tegaskan-kecam-kekerasan-seksual-mei-1998-usai-dikritik-di-panggung-ffi-2026',
    'gunung-karangetang-di-sitaro-erupsi-semburkan-kolom-abu-setinggi-1000-meter',
    'gunung-karangetang-dua-kali-erupsi-guguran-lava-pijar-meluncur-hingga-500-meter',
    'gunung-semeru-dan-gunung-ibu-erupsi-beruntun-kolom-abu-hingga-400-meter',
    'icj-putuskan-myanmar-terbukti-lakukan-genosida-terhadap-rohingya-dalam-operasi-2017',
    'kapolri-suyudi-copot-tiga-jenderal-tersangka-penyadapan-enam-kapolda-ikut-diganti',
    'kemenag-siapkan-formasi-cpns-guru-2027-pppk-yang-memenuhi-syarat-bisa-mendaftar',
    'komdigi-siap-buka-data-temuan-moderasi-konten-karhutla-safenet',
    'kpk-kembali-periksa-sestama-bnpb-rustian-sebagai-saksi-kasus-dana-siap-pakai',
    'listyo-sigit-dan-lima-perwira-polri-jadi-tersangka-makar-diduga-demi-pertahankan-jabatan-kapolri',
    'maruf-amin-mundur-dari-ketua-dewan-pertimbangan-mui-mui-siapkan-rapat-cari-pengganti',
    'menko-polkam-dudung-siap-mundur-jika-terbukti-terlibat-kasus-km-50-dukung-kasus-dibuka-lagi',
    'mk-nyatakan-uu-polri-baru-cacat-formil-dpr-dan-pemerintah-diberi-waktu-satu-tahun-untuk-memperbaiki',
    'mpr-tetapkan-paripurna-wapres-pengganti-gibran-2-desember-2026',
    'pemerintah-minta-eks-menkeu-malaysia-tak-tuntut-ganti-rugi-kabut-asap',
    'polri-pecat-brigjen-tedjo-kusumo-listyo-sigit-diadili-lima-jenderal-bintang-tiga-di-sidang-etik',
    'prabowo-dan-dasco-bertemu-empat-mata-dua-jam-di-istana-merdeka-bahas-aspirasi-masyarakat',
    'prabowo-kumpulkan-elite-gerindra-di-hambalang-ketum-parpol-koalisi-segera-bahas-dua-nama-cawapres',
    'prabowo-pimpin-ratas-istana-bogor-ekonomi-tumbuh-547-persen',
    'prabowo-tiba-di-manila-ikuti-ktt-ke-49-asean-myanmar-dan-kabut-asap-jadi-sorotan',
    'prabowo-usulkan-amran-sulaiman-dan-sugiono-sebagai-cawapres-pengganti-gibran-ke-mpr',
    'pramono-nilai-ump-jakarta-2027-sudah-cukup-baik-kadin-dki-ajak-pengusaha-patuh',
    'pramono-targetkan-jlnt-pluit-rampung-maret-2027-nilai-proyek-rp600-miliar-tanpa-apbd',
    'puan-pdip-tak-usul-nama-cawapres-dua-nama-akan-diusulkan-presiden-25-november',
    'satgas-pkh-cabut-izin-pbph-pt-rapp-seluas-338536-hektare-di-riau',
    'syarat-usia-capres-cawapres-digugat-ke-mk-pemohon-usulkan-alternatif-19-tahun',
    'tni-ganti-sebutan-opm-jadi-kelompok-ekstremis-bersenjata-perpres-disiapkan',
    'tower-crane-ambruk-tewaskan-pekerja-di-mega-kuningan-pemprov-dki-periksa-k3-proyek',
    'yusril-bertemu-menhan-sjafrie-bahas-percepatan-revisi-uu-pertahanan-negara',
    'zulhas-pan-dukung-kader-gerindra-jadi-wapres-pendamping-prabowo'
  );

-- olahraga: 32 artikel
UPDATE articles SET archived_at = unixepoch()
WHERE archived_at IS NULL AND status = 'published'
  AND category_id = (SELECT id FROM categories WHERE slug = 'olahraga')
  AND slug IN (
    'alwi-farhan-lolos-semifinal-kumamoto-masters-2026',
    'alwi-farhan-terhenti-di-semifinal-kumamoto-masters-2026-indonesia-tanpa-wakil-di-final',
    'bezzecchi-menangi-sprint-motogp-portugal-2026-marc-marquez-jatuh-dan-tunda-pesta-gelar',
    'borobudur-marathon-2026-dihentikan-karena-panas-ekstrem-wilson-cheruiyot-dan-lemlem-girmay-juara',
    'brentford-gilas-everton-4-0-lewis-potter-cetak-dua-gol-dan-tarkowski-dikartu-merah',
    'carlos-alcaraz-juarai-atp-finals-untuk-pertama-kali-usai-tundukkan-zverev-di-turin',
    'cas-kembalikan-gelar-juara-piala-afrika-2025-kepada-senegal-kemenangan-wo-maroko-dibatalkan',
    'cherki-selamatkan-manchester-city-dari-kekalahan-ditahan-napoli-2-2-di-etihad',
    'debut-pahit-pochettino-manchester-united-dibantai-liverpool-0-4-di-anfield',
    'dejan-felisha-tembus-semifinal-hong-kong-open-2026-tanpa-kehilangan-gim',
    'fajar-fikri-dan-amri-nita-tersingkir-di-16-besar-hong-kong-open-2026',
    'ganda-putri-indonesia-tersingkir-perempat-final-kumamoto-masters-2026',
    'isyana-rinjani-juara-kaohsiung-masters-2026-mutiara-ayu-runner-up',
    'jadwal-pekan-ke-10-super-league-pss-vs-arema-persija-bertandang-ke-psm',
    'jadwal-perempat-final-hong-kong-open-2026-lima-wakil-indonesia-bertanding-jumat',
    'jadwal-timnas-u17-indonesia-vs-kamboja-kualifikasi-piala-asia-2027',
    'lamine-yamal-absen-lawan-sabah-di-liga-champions-karena-cedera-pergelangan-kaki',
    'lima-wakil-indonesia-lolos-ke-perempat-final-hong-kong-open-2026',
    'marc-marquez-juara-dunia-motogp-2026-meski-finis-kedelapan-di-portugal-samai-rekor-agostini',
    'max-verstappen-menangi-f1-gp-las-vegas-2026-duo-mclaren-lengkapi-podium',
    'mbappe-cetak-dua-gol-real-madrid-bangkit-dan-hajar-psv-5-1-untuk-puncaki-klasemen-liga-champions',
    'moh-zaki-ubaidillah-singkirkan-christo-popov-kumamoto-masters-2026',
    'mutiara-ayu-dan-isyana-rinjani-melaju-ke-final-kaohsiung-masters-2026',
    'persib-bandung-tekuk-shan-united-6-0-di-asean-club-championship',
    'pssi-klarifikasi-uji-coba-futsal-lawan-belanda-dan-china-undangan-belum-ada',
    'tim-tenis-putri-indonesia-hadapi-slovenia-di-playoff-billie-jean-king-cup',
    'timnas-indonesia-bertahan-di-peringkat-ke-116-fifa-meski-tak-main-di-jeda-november',
    'timnas-u17-gulung-afghanistan-4-0-lolos-piala-asia-u17-2027',
    'tiwi-fadia-kandas-di-semifinal-hong-kong-open-2026-tapi-amankan-tiket-world-tour-finals',
    'tiwi-fadia-singkirkan-unggulan-pertama-melaju-ke-semifinal-hong-kong-open-2026',
    'veda-ega-pratama-lolos-langsung-ke-q2-moto3-portugal-2026-usai-posisi-14-practice',
    'veda-ega-pratama-start-ke-16-di-moto3-portugal-2026-almansa-rebut-pole-dengan-rekor-lap'
  );

-- otomotif: 27 artikel
UPDATE articles SET archived_at = unixepoch()
WHERE archived_at IS NULL AND status = 'published'
  AND category_id = (SELECT id FROM categories WHERE slug = 'otomotif')
  AND slug IN (
    'baw-m8-mpv-listrik-premium-siap-hadir-di-gaw-2026',
    'byd-targetkan-100-stasiun-flash-charging-indonesia-akhir-2026',
    'byd-titan-7-dm-resmi-meluncur-di-gaw-2026-harga-mulai-rp639-juta',
    'chery-serahkan-3000-unit-chery-q-dalam-sebulan-pemesanan-tembus-12000-unit',
    'chery-umumkan-harga-j6t-csh-di-gaw-2026-suv-reev-mulai-rp5499-juta',
    'danza-new-d9-premium-meluncur-gaw-2026-mpv-listrik-awd-rp12-miliar',
    'ford-masih-kaji-lokalisasi-produksi-di-indonesia-siapkan-strategi-dua-pasar',
    'forkindo-keluhkan-ketidakpastian-tkdn-usulkan-enam-langkah',
    'gac-umumkan-harga-aion-i60-rp532-juta-untuk-2000-pembeli-pertama',
    'gaikindo-auto-week-2026-ice-bsd-10-kota',
    'geely-okavango-diduga-hadir-di-gaw-2026-suv-bensin-tujuh-penumpang',
    'geely-okavango-resmi-dijual-rp4399-juta-ada-harga-khusus-selama-gaw-2026',
    'hyundai-buka-pre-booking-neira-di-gaw-2026-dirakit-di-cikarang',
    'jaecoo-luncurkan-j7-shs-p-ardis-black-edition-rp5999-juta-di-gaw-2026',
    'kia-carens-ev-resmi-dijual-mulai-rp379-juta-dirakit-di-cikarang',
    'menperin-minta-byd-naikkan-tkdn-60-persen-pada-2027-pabrik-baterai-masih-dihitung',
    'pangsa-pasar-daihatsu-16-persen-oktober-2026-gran-max-sumbang-separuh-penjualan',
    'pemesanan-toyota-land-cruiser-fj-tembus-500-unit-harga-mulai-rp835-juta-gaw-2026',
    'penjualan-baic-naik-52-persen-empat-model-baru-sembilan-dealer-2027',
    'penjualan-sepeda-motor-502-juta-unit-september-2026-naik-371-persen',
    'pertamina-patra-niaga-dan-byd-jajaki-flash-charging-di-spbu-green-energy-station',
    'pindad-targetkan-pabrik-mobil-listrik-nasional-2028-menperin-minta-baterai-nikel',
    'toyota-rush-facelift-sudah-bisa-pre-book-sebelum-debut-di-gaw-2026',
    'volvo-ex90-six-seater-debut-gaw-2026-suv-listrik-captain-seat-rp26-miliar',
    'wuling-darion-terbaru-gaw-2026-ev-ce-turun-harga-rp395-juta',
    'xpeng-klaim-kewajiban-produksi-lokal-insentif-impor-mobil-listrik-terpenuhi',
    'yamaha-sebut-aldi-satya-mahendra-masuk-daftar-teratas-kandidat-moto2-musim-2028'
  );

-- sains: 25 artikel
UPDATE articles SET archived_at = unixepoch()
WHERE archived_at IS NULL AND status = 'published'
  AND category_id = (SELECT id FROM categories WHERE slug = 'sains')
  AND slug IN (
    'bmkg-awas-hujan-sangat-lebat-kalbar-20-22-november-2026',
    'bmkg-nmefc-china-perkuat-kerja-sama-prakiraan-laut-mitigasi-bahaya-maritim',
    'bmkg-peringatkan-hujan-lebat-13-15-november-2026-11-wilayah-siaga',
    'bmkg-uji-rantai-peringatan-dini-tsunami-pacwave26-simulasi-gempa-m88-mindanao',
    'bpom-bio-farma-kembangkan-ai-uji-mutu-vaksin-polio',
    'brin-gelar-brinafexs-2026-cibinong-percepat-hilirisasi-riset-pangan',
    'brin-kembangkan-pencacah-frekuensi-optik-ukur-laser-komunikasi-200-thz',
    'empat-sabuk-radiasi-terdeteksi-mengelilingi-bumi-usai-badai-geomagnetik-mei-2024',
    'gempa-m54-berkedalaman-465-km-guncang-barat-laut-gorontalo-utara-bmkg-tak-berpotensi-tsunami',
    'hujan-meteor-leonid-2026-puncak-17-18-november',
    'indonesia-resmi-jadi-negara-partisipan-iarc-merah-putih-berkibar-di-lyon',
    'indonesia-uea-sepakat-restorasi-mangrove-berbasis-ai-di-demak',
    'its-kenalkan-hi-vits-deteksi-korsleting-cegah-kebakaran',
    'kentang-tumbuh-di-tanah-simulasi-bulan-berkat-kompos-cacing-hasil-setara-bumi',
    'kkp-ykan-pasang-sensor-akustik-ai-sabu-raijua-pantau-paus-lumba-lumba-laut-sawu',
    'mendiktisaintek-dies-natalis-its-ke-66-kampus-majukan-sains',
    'misteri-suara-gemuruh-toba-pakar-duga-gelombang-akustik-bmkg-pastikan-bukan-gempa',
    'peneliti-brin-translokasi-badak-jawa-butuh-riset-panjang',
    'rs-kanker-dharmais-resmikan-laboratorium-ral-kembangkan-terapi-car-t-cell',
    'rscm-luncurkan-ciptoneotrition-nutrisi-parenteral-otomatis-bayi-prematur',
    'supermoon-24-november-2026-bmkg-peringatkan-banjir-rob-pesisir-bali-ntb',
    'tim-ui-itb-raih-medali-emas-igem-2026-paris-lewat-riset-terapi-berbasis-eksosom',
    'ugm-kirim-dua-peneliti-geologi-ke-antartika-bersama-brin-dan-nasc-ukraina',
    'voyager-1-jadi-benda-buatan-manusia-pertama-capai-jarak-satu-hari-cahaya-dari-bumi',
    'wahana-bepicolombo-masuk-orbit-merkurius-gangguan-perangkat-lunak'
  );

-- teknologi: 26 artikel
UPDATE articles SET archived_at = unixepoch()
WHERE archived_at IS NULL AND status = 'published'
  AND category_id = (SELECT id FROM categories WHERE slug = 'teknologi')
  AND slug IN (
    'asean-teken-defa-perjanjian-ekonomi-digital-mengikat-pertama-di-manila',
    'google-pensiunkan-aplikasi-nest-25-januari-2027-perangkat-dipindah-ke-google-home',
    'gopay-perluas-membership-gratis-gopay-next-ke-seluruh-indonesia',
    'huawei-divonis-bersalah-10-dari-12-dakwaan-as-konspirasi-curi-rahasia-dagang',
    'idpro-aturan-baru-ekspor-cip-ai-as-tambah-kompleksitas-pusat-data-indonesia',
    'indonesia-terpilih-kembali-anggota-dewan-itu-periode-2027-2030',
    'jensen-huang-kembali-jadi-ceo-nvidia-investigasi-independen-tetap-berjalan',
    'kemenko-polkam-telkom-siapkan-migrasi-kriptografi-pascakuantum-ancaman-komputer-kuantum',
    'komdigi-bssn-antisipasi-serangan-siber-berbasis-agentic-ai',
    'komdigi-minta-google-jelaskan-metodologi-penutupan-19389-kanal-youtube',
    'komdigi-registrasi-sim-biometrik-tak-bisa-diakali-deepfake',
    'komisi-i-dpr-usul-ruu-kecerdasan-artifisial-masuk-prolegnas-2027',
    'laba-xiaomi-anjlok-57-persen-kuartal-iii-2026-mobil-listrik-memori',
    'lg-electronics-indonesia-perkenalkan-pendinginan-chip-to-chiller-pusat-data-ai',
    'linknet-luncurkan-tautara-platform-cari-paket-internet-dari-13-isp',
    'menkomdigi-meutya-hafid-ruang-redaksi-tak-boleh-dikendalikan-algoritma-platform-global',
    'meta-rilis-aplikasi-forum-di-indonesia-wadah-mandiri-grup-facebook',
    'mulai-30-november-2026-whatsapp-hanya-dukung-iphone-ios-155-ke-atas',
    'pemerintah-siapkan-aturan-zonasi-pusat-data-industri-minta-kaji-ambang-3-mw',
    'peruri-kemdiktisaintek-digitalisasi-ijazah-kampus-surabaya',
    'presiden-microsoft-brad-smith-peringatkan-gangguan-teknologi-global-bisa-berlanjut',
    'telkomgroup-sovereign-ai-innovation-ecosystem-ksti-2026',
    'telkomsel-enterprise-dan-transjakarta-luncurkan-bundling-paket-tj-go',
    'telkomsel-luncurkan-octa-satu-saldo-token-akses-69-model-ai-mulai-rp100-ribu',
    'trump-ancam-pajak-besar-perusahaan-as-bangun-pusat-data-di-luar-negeri',
    'tsmc-dan-samsung-tahan-sebagian-pengiriman-cip-ke-china-usai-aturan-baru-ekspor-as'
  );
