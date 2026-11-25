import type { ImageMetadata } from 'astro';

/** Kotak info ulasan (hotel/wisata/kuliner). Semua opsional kecuali alamat. */
export type ReviewInfo = {
  placeName?: string;
  /** schema.org: Hotel, Resort, TouristAttraction, Beach, Restaurant, ... */
  placeType?: string;
  /** Label harga siap tampil, mis. "Rp350.000–Rp600.000 per malam". */
  priceRange?: string;
  priceMin?: number;
  priceMax?: number;
  priceUnit?: string;
  address: string;
  rating?: number;
  openingHours?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  facilities?: string[];
  visitedAt?: number; // epoch detik
};

/** Penanda lokasi artikel local-wisdom. Kosong untuk artikel berita lama. */
export type PlaceInfo = {
  daerahSlug?: string;
  daerahName?: string;
  kota?: string;
  kotaSlug?: string;
  /** true = artikel CONTOH (placeholder tata letak, noindex) */
  isSample?: boolean;
};

export type ArticleCard = PlaceInfo & {
  rating?: number;
  priceRange?: string;
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: number;
  heroSrc: string;
  heroSrcset?: string;
  heroAlt: string;
  heroWidth: number | null;
  heroHeight: number | null;
  categorySlug: string;
  categoryName: string;
  isHeadline: boolean;
  heroImage?: ImageMetadata;
};

export type SourceItem = { name: string; title: string; url: string };

export type ArticleView = PlaceInfo & {
  review?: ReviewInfo;
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string | null;
  readingMinutes: number;
  publishedAt: number;
  updatedAt: number;
  heroSrc: string;
  heroSrcset?: string;
  heroAlt: string;
  heroWidth: number | null;
  heroHeight: number | null;
  heroCaption: string;
  heroCredit: string;
  heroCreditUrl: string | null;
  heroImage?: ImageMetadata;
  categorySlug: string;
  categoryName: string;
  authorSlug: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  tags: { slug: string; name: string }[];
  sources: SourceItem[];
  seoTitle: string | null;
  canonicalUrl: string | null;
  isHeadline: boolean;
};

export type Cursor = { publishedAt: number; id: number };

export type HomeBundle = {
  headline: ArticleCard | null;
  secondary: ArticleCard[];
  latest: ArticleCard[];
  byCategory: { slug: string; name: string; description: string; items: ArticleCard[] }[];
  trending: ArticleCard[];
};

export type CategoryPage = {
  category: { slug: string; name: string; description: string };
  items: ArticleCard[];
  next: Cursor | null;
  trending: ArticleCard[];
};

export type ArticlePayload = {
  article: ArticleView;
  related: ArticleCard[];
  trending: ArticleCard[];
  /** Komponen MDX dari `render()`; hanya terisi di build statis. */
  Content?: (props: Record<string, unknown>) => unknown;
};

export type RegionPage = {
  region: { slug: string; name: string; short: string; cities: readonly string[] };
  /** Jika diisi, daftar sudah difilter ke kategori ini. */
  category: { slug: string; name: string; description: string } | null;
  items: ArticleCard[];
  /** Jumlah artikel per kategori lokal di daerah ini. */
  counts: Record<string, number>;
  /** Kota -> jumlah artikel (untuk chip kota). */
  cities: { name: string; slug: string; count: number }[];
  /** Jika diisi, daftar sudah difilter ke kota ini. */
  city?: { name: string; slug: string } | null;
};

export type LocalHome = {
  latest: ArticleCard[];
  byCategory: { slug: string; name: string; description: string; items: ArticleCard[] }[];
  /** Jumlah artikel per daerah (slug -> n). */
  regionCounts: Record<string, number>;
  /** Beberapa artikel arsip berita (kategori lama). */
  archive: ArticleCard[];
};
