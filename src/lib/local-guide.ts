// Konfigurasi & tipe "local wisdom" (desain GPT). Isi ulasan TIDAK lagi ditulis di kode:
// semuanya dari D1 (lihat src/lib/guide-repo.ts). File ini hanya berisi daftar kategori (tipe),
// provinsi, dan kota yang boleh dipakai di /admin & API terbit, plus helper path/gambar.

export const guideCategories = [
  { slug: 'hotel', name: 'Hotel', short: 'Temukan penginapan nyaman', description: 'Temukan penginapan setempat dan pilih lokasi yang pas untuk rencana perjalananmu.', image: 'hotel' },
  { slug: 'wisata', name: 'Wisata', short: 'Jelajahi destinasi menarik', description: 'Jelajahi lanskap alam, ruang budaya, dan tempat wisata untuk berbagai cara bepergian.', image: 'bromo' },
  { slug: 'kuliner', name: 'Kuliner', short: 'Cicipi rasa khas daerah', description: 'Temukan rekomendasi tempat makan dan cicipi sajian khas dari berbagai daerah Indonesia.', image: 'rawon' },
] as const;

export const guideProvinces = [
  { slug: 'jawa-timur', name: 'Jawa Timur', description: 'Dari kaldera Tengger di Probolinggo sampai kota sejuk Malang dan Batu: panduan hotel, wisata, dan kuliner Jawa Timur.', image: 'bromo' },
  { slug: 'di-yogyakarta', name: 'DI Yogyakarta', description: 'Kenali Yogyakarta lewat dapur gudeg, kampung lama, dan tempat singgah di sekitar Keraton.', image: 'gudeg' },
] as const;

/**
 * Daftar kota (field "kota" di /admin & API). Slug di sini = segmen URL /artikel/{kota}/.
 * Tambah kota baru di sini dulu (lewat programmer) supaya tidak ada halaman kota salah ketik.
 * `nav: true` = tampil di menu Daerah.
 */
export const guideCities = [
  { slug: 'malang', name: 'Malang', province: 'jawa-timur', description: 'Jelajahi sudut Kota Malang, dari hotel bersejarah di pusat kota sampai bakso di tepi rel.', image: 'malang', nav: true },
  { slug: 'batu', name: 'Batu', province: 'jawa-timur', description: 'Kota sejuk di kaki pegunungan: penginapan di Sisir dan wisata keluarga di Temas.', image: 'jatim', nav: true },
  { slug: 'probolinggo', name: 'Probolinggo', province: 'jawa-timur', description: 'Sisi timur Bromo Tengger Semeru dan rawon legendaris di jalur Pantura Tongas.', image: 'bromo', nav: true },
  { slug: 'surabaya', name: 'Surabaya', province: 'jawa-timur', description: 'Panduan hotel, wisata, dan kuliner di Kota Surabaya.', image: 'rawon', nav: false },
  { slug: 'yogyakarta', name: 'Yogyakarta', province: 'di-yogyakarta', description: 'Kenali kuliner Yogyakarta lewat dapur dan kedai gudeg di sekitar Wijilan.', image: 'gudeg', nav: true },
] as const;

export type GuideCategory = (typeof guideCategories)[number]['slug'];
export type GuideImage = 'bromo' | 'malang' | 'rawon' | 'rawon-kuah' | 'rawon-sajian' | 'hotel' | 'tugu' | 'bakso' | 'jatim' | 'gudeg';

/** Satu artikel local wisdom (ulasan/panduan) hasil baca D1. */
export type Guide = {
  id: number;
  slug: string;
  category: GuideCategory;
  categoryName: string;
  citySlug: string | null;
  cityName: string | null;
  provinceSlug: string | null;
  provinceName: string | null;
  name: string;
  title: string;
  description: string;
  location: string;
  heroSrc: string;
  cardSrc: string;
  imageAlt: string;
  heroCaption: string;
  heroCredit: string;
  heroCreditUrl: string | null;
  gallery: { src: string; cardSrc: string; alt: string }[];
  facts: { label: string; value: string }[];
  budget?: { label: string; value: string };
  mapQuery: string;
  action?: { label: string; url: string };
  sources: { label: string; url: string }[];
  bodyHtml: string;
  readingMinutes: number;
  publishedAt: number;
  updatedAt: number;
  authorName: string;
  authorSlug: string;
  seoTitle: string | null;
  canonicalUrl: string | null;
};

export const GUIDE_CATEGORY_SLUGS: readonly string[] = guideCategories.map((c) => c.slug);
export const isGuideCategory = (slug: string): slug is GuideCategory => GUIDE_CATEGORY_SLUGS.includes(slug);
export const guideCategory = (slug: string) => guideCategories.find((category) => category.slug === slug);
export const guideCity = (slug: string | null | undefined) => guideCities.find((city) => city.slug === slug);
export const guideProvince = (slug: string | null | undefined) => guideProvinces.find((province) => province.slug === slug);
export const guidePath = (guide: Pick<Guide, 'category' | 'slug'>) => `/${guide.category}/${guide.slug}/`;
/** Halaman kota = /artikel/{kota}/ (menu Artikel). */
export const cityPath = (slug: string) => `/artikel/${slug}/`;
export const cityTypePath = (city: string, type: string) => `/artikel/${city}/${type}/`;
/** Halaman provinsi = /daerah/{provinsi}/ (menu Daerah). */
export const provincePath = (slug: string) => `/daerah/${slug}/`;
/** Kompatibel dengan komponen GPT lama: "region" sekarang = kota. */
export const guideRegions = guideCities;
export const regionPath = cityPath;
export const guideImage = (image: GuideImage, size: 'card' | 'wide' = 'wide') => `/media/local-wisdom/${image}-${size}.webp`;
/** Versi kartu (640px) dari gambar *-wide.webp; gambar lain dipakai apa adanya. */
export const cardVariant = (src: string) => (/-wide\.webp$/.test(src) ? src.replace(/-wide\.webp$/, '-card.webp') : src);
/** Minimal artikel terbit supaya halaman kota / kota×tipe boleh diindeks Google. */
export const MIN_INDEXABLE = 3;
