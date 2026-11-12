/**
 * Konfigurasi utama situs bacaanku.com.
 * Untuk menambah kategori: cukup tambahkan satu objek di array `categories` di bawah
 * (lalu tambahkan juga opsinya di public/admin/config.yml agar muncul di CMS).
 */
export const SITE = {
  name: 'bacaanku',
  domain: 'bacaanku.com',
  url: 'https://bacaanku.com',
  tagline: 'Bacaan jernih, setiap hari.',
  description:
    'bacaanku.com — portal berita Indonesia yang ringkas dan jernih: news, teknologi, otomotif, sains, ekonomi, olahraga, dan hiburan.',
  locale: 'id_ID',
  lang: 'id',
  hreflang: 'id-ID',
  timezone: 'Asia/Jakarta',
  twitter: '@bacaanku',
  email: 'redaksi@bacaanku.com',
  // Logo untuk JSON-LD Organization/publisher (file di /public)
  logo: '/logo-512.png',
  defaultOgImage: '/og-default.png',
  postsPerPage: 6,
} as const;

export const categories = [
  { slug: 'news', name: 'News', description: 'Berita terkini nasional dan internasional.' },
  { slug: 'teknologi', name: 'Teknologi', description: 'Gawai, internet, startup, dan dunia digital.' },
  { slug: 'otomotif', name: 'Otomotif', description: 'Mobil, motor, kendaraan listrik, dan tips berkendara.' },
  { slug: 'sains', name: 'Sains', description: 'Penemuan, riset, antariksa, dan lingkungan.' },
  { slug: 'ekonomi', name: 'Ekonomi', description: 'Bisnis, keuangan, pasar, dan UMKM.' },
  { slug: 'olahraga', name: 'Olahraga', description: 'Sepak bola, bulu tangkis, MotoGP, dan olahraga lainnya.' },
  { slug: 'hiburan', name: 'Hiburan', description: 'Film, musik, selebritas, dan budaya pop.' },
] as const;

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
  'mobil-listrik-mungil-uji-jalan-tanjakan-bandung',
  'timnas-futsal-contoh-melaju-ke-final',
];

export const footerLinks = [
  { href: '/tentang/', label: 'Tentang Kami' },
  { href: '/redaksi/', label: 'Redaksi' },
  { href: '/kontak/', label: 'Kontak' },
  { href: '/pedoman-media-siber/', label: 'Pedoman Media Siber' },
  { href: '/kebijakan-privasi/', label: 'Kebijakan Privasi' },
];
