/**
 * Konfigurasi utama situs bacaankunetwork.com.
 * Untuk menambah kategori: cukup tambahkan satu objek di array `categories` di bawah
 * (lalu tambahkan juga opsinya di public/admin/config.yml agar muncul di CMS).
 */
export const SITE = {
  name: 'Bacaanku Network',
  domain: 'bacaankunetwork.com',
  url: 'https://bacaankunetwork.com',
  tagline: 'Bacaan jernih, setiap hari.',
  description:
    'bacaankunetwork.com — ulasan hotel, wisata, dan kuliner lokal Nusantara, dikelompokkan per daerah. Arsip berita tetap tersedia.',
  subline: 'Ulasan hotel, wisata & kuliner Nusantara',
  locale: 'id_ID',
  lang: 'id',
  hreflang: 'id-ID',
  timezone: 'Asia/Jakarta',
  twitter: '@bacaankunetwork', // TODO: ganti dengan akun X asli
  email: 'redaksi@bacaankunetwork.com',
  // Logo untuk JSON-LD Organization/publisher (file di /public)
  logo: '/brand/logo-organization-1200x400.png',
  logoWidth: 1200,
  logoHeight: 400,
  defaultOgImage: '/og-default.png',
  postsPerPage: 6,
} as const;

/**
 * Kategori. `group: 'lokal'` = niche baru (ulasan hotel, wisata, kuliner) → tampil di menu utama.
 * `group: 'arsip'` = kategori berita lama → tetap hidup di URL lama, tampil di halaman /arsip-berita/.
 */
export const categories = [
  { slug: 'hotel', name: 'Hotel', group: 'lokal', description: 'Ulasan hotel, homestay, dan penginapan lokal: harga, fasilitas, dan pengalaman menginap.' },
  { slug: 'wisata', name: 'Wisata', group: 'lokal', description: 'Ulasan tempat wisata, budaya, dan petualangan di berbagai daerah Nusantara.' },
  { slug: 'kuliner', name: 'Kuliner', group: 'lokal', description: 'Ulasan warung, resto, dan jajanan khas daerah: rasa, harga, dan jam buka.' },
  { slug: 'news', name: 'News', group: 'arsip', description: 'Berita terkini nasional dan internasional.' },
  { slug: 'teknologi', name: 'Teknologi', group: 'arsip', description: 'Gawai, internet, startup, dan dunia digital.' },
  { slug: 'otomotif', name: 'Otomotif', group: 'arsip', description: 'Mobil, motor, kendaraan listrik, dan tips berkendara.' },
  { slug: 'sains', name: 'Sains', group: 'arsip', description: 'Penemuan, riset, antariksa, dan lingkungan.' },
  { slug: 'ekonomi', name: 'Ekonomi', group: 'arsip', description: 'Bisnis, keuangan, pasar, dan UMKM.' },
  { slug: 'olahraga', name: 'Olahraga', group: 'arsip', description: 'Sepak bola, bulu tangkis, MotoGP, dan olahraga lainnya.' },
  { slug: 'hiburan', name: 'Hiburan', group: 'arsip', description: 'Film, musik, selebritas, dan budaya pop.' },
] as const;

export const localCategories = categories.filter((c) => c.group === 'lokal');
export const archiveCategories = categories.filter((c) => c.group === 'arsip');
export const localCategorySlugs = localCategories.map((c) => c.slug) as string[];
export const isLocalCategory = (slug: string) => localCategorySlugs.includes(slug);

/**
 * Daftar daerah (provinsi) untuk menu "Daerah".
 * - `slug` dipakai di kolom D1 `province_slug` / frontmatter `daerah:` dan URL /daerah/<slug>/.
 * - `cities` = kota/kabupaten yang disarankan. Slug kota dibuat otomatis (`citySlug('Kota Batu')` → 'kota-batu'),
 *   URL-nya /daerah/<provinsi>/<kota>/. Kota di luar daftar tetap boleh, asal konsisten penulisannya.
 * - `tone` = indeks warna aksen kartu (0–5), murni dekoratif.
 * Untuk membuka daerah baru: tambahkan satu objek di sini (lihat docs/panduan-konten-local-wisdom.md).
 */
export const regions = [
  { slug: 'jawa-timur', name: 'Jawa Timur', short: 'Jatim', cities: ['Malang', 'Batu', 'Surabaya', 'Banyuwangi', 'Probolinggo'], tone: 0 },
  { slug: 'di-yogyakarta', name: 'DI Yogyakarta', short: 'Jogja', cities: ['Yogyakarta', 'Sleman', 'Bantul', 'Gunungkidul'], tone: 1 },
  { slug: 'bali', name: 'Bali', short: 'Bali', cities: ['Ubud', 'Denpasar', 'Badung', 'Karangasem'], tone: 5 },
  { slug: 'jawa-tengah', name: 'Jawa Tengah', short: 'Jateng', cities: ['Semarang', 'Solo', 'Magelang', 'Wonosobo'], tone: 2 },
  { slug: 'jawa-barat', name: 'Jawa Barat', short: 'Jabar', cities: ['Bandung', 'Bogor', 'Garut', 'Cirebon'], tone: 3 },
  { slug: 'dki-jakarta', name: 'DKI Jakarta', short: 'Jakarta', cities: ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat'], tone: 4 },
  { slug: 'nusa-tenggara-barat', name: 'Nusa Tenggara Barat', short: 'NTB', cities: ['Mataram', 'Lombok Tengah', 'Lombok Utara'], tone: 2 },
  { slug: 'nusa-tenggara-timur', name: 'Nusa Tenggara Timur', short: 'NTT', cities: ['Labuan Bajo', 'Kupang', 'Ende'], tone: 0 },
  { slug: 'sumatera-utara', name: 'Sumatera Utara', short: 'Sumut', cities: ['Medan', 'Toba', 'Berastagi'], tone: 1 },
  { slug: 'sumatera-barat', name: 'Sumatera Barat', short: 'Sumbar', cities: ['Padang', 'Bukittinggi', 'Pariaman'], tone: 3 },
  { slug: 'sulawesi-selatan', name: 'Sulawesi Selatan', short: 'Sulsel', cities: ['Makassar', 'Toraja Utara', 'Bulukumba'], tone: 4 },
] as const;

export type RegionSlug = (typeof regions)[number]['slug'];
export const regionSlugs = regions.map((r) => r.slug) as [RegionSlug, ...RegionSlug[]];
export const getRegion = (slug: string) => regions.find((r) => r.slug === slug);

/** 'Kota Batu' → 'kota-batu'. Dipakai untuk kolom D1 `city_slug` dan URL /daerah/<provinsi>/<kota>/. */
export const citySlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Kota yang dikenal di config untuk satu provinsi (nama + slug). */
export const citiesOf = (regionSlug: string) =>
  (getRegion(regionSlug)?.cities ?? []).map((name) => ({ name, slug: citySlug(name) }));

/** Tipe tempat schema.org yang boleh dipakai di kolom `place_type`, per kategori. */
export const placeTypes = {
  hotel: ['Hotel', 'Resort', 'BedAndBreakfast', 'Hostel', 'LodgingBusiness'],
  wisata: ['TouristAttraction', 'Museum', 'Park', 'Beach', 'LandmarksOrHistoricalBuildings', 'PlaceOfWorship'],
  kuliner: ['Restaurant', 'CafeOrCoffeeShop', 'FoodEstablishment', 'Bakery'],
} as const;

/** Satuan harga yang dipakai di kolom `price_unit`. */
export const priceUnits = ['malam', 'porsi', 'orang', 'tiket', 'paket'] as const;

export type CategorySlug = (typeof categories)[number]['slug'];
export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

/**
 * Daftar "Terpopuler" (slug artikel, urut). Untuk prototipe diisi manual;
 * nanti bisa diganti otomatis dari data analitik (mis. Cloudflare Web Analytics / GA4).
 */
export const trending: string[] = [
  'hujan-meteor-leonid-2026-puncak-17-18-november',
  'gaikindo-auto-week-2026-ice-bsd-10-kota',
  'lp2b-nasional-87-98-persen-sawah-dilindungi',
];

export const footerLinks = [
  { href: '/tentang/', label: 'Tentang Kami' },
  { href: '/redaksi/', label: 'Redaksi' },
  { href: '/kontak/', label: 'Kontak' },
  { href: '/pedoman-media-siber/', label: 'Pedoman Media Siber' },
  { href: '/kebijakan-privasi/', label: 'Kebijakan Privasi' },
];
