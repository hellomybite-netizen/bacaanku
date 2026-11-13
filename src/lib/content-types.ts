import type { ImageMetadata } from 'astro';

export type ArticleCard = {
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

export type ArticleView = {
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
