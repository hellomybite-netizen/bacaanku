import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { categories, regions, getRegion, citySlug, citiesOf, isLocalCategory, localCategories, trending as trendingSlugs } from '../config/site';
import { formatPrice } from './local';
import { readingTime, slugify } from '../utils/articles';
import type { ArticleCard, ArticlePayload, ArticleView, CategoryPage, Cursor, LocalHome, RegionPage } from './content-types';

type Entry = CollectionEntry<'articles'>;

let pending: Promise<{ entries: Entry[]; cards: ArticleCard[] }> | null = null;

async function load() {
  if (!pending) pending = loadFresh();
  return pending;
}

async function loadFresh() {
  const entries = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
  const cards = entries.map((entry, index) => toCard(entry, index + 1));
  return { entries, cards };
}

function toCard(entry: Entry, id: number): ArticleCard {
  const category = categories.find((item) => item.slug === entry.data.category);
  return {
    id,
    slug: entry.data.slug,
    title: entry.data.title,
    excerpt: entry.data.description,
    publishedAt: Math.floor(entry.data.publishDate.valueOf() / 1000),
    heroSrc: '',
    heroAlt: entry.data.heroAlt,
    heroWidth: entry.data.heroImage.width,
    heroHeight: entry.data.heroImage.height,
    categorySlug: entry.data.category,
    categoryName: category?.name ?? entry.data.category,
    isHeadline: entry.data.featured,
    heroImage: entry.data.heroImage,
    daerahSlug: entry.data.daerah,
    daerahName: entry.data.daerah ? getRegion(entry.data.daerah)?.name : undefined,
    kota: entry.data.kota,
    kotaSlug: entry.data.kota ? citySlug(entry.data.kota) : undefined,
    rating: entry.data.review?.rating,
    priceRange: entry.data.review ? priceOf(entry.data.review) : undefined,
    isSample: entry.data.contoh,
  };
}

function priceOf(review: NonNullable<Entry['data']['review']>) {
  return formatPrice(review.priceMin, review.priceMax, review.priceUnit, review.priceRange);
}

function tagsOf(entry: Entry) {
  return entry.data.tags.map((name) => ({ name, slug: slugify(name) }));
}

export async function homeBundle() {
  const { cards } = await load();
  const headline = cards.find((card) => card.isHeadline) ?? cards[0] ?? null;
  const rest = cards.filter((card) => card.id !== headline?.id);
  return {
    headline,
    secondary: rest.slice(0, 3),
    latest: rest.slice(3, 10),
    byCategory: categories
      .map((category) => ({ ...category, items: cards.filter((card) => card.categorySlug === category.slug).slice(0, 4) }))
      .filter((category) => category.items.length > 0),
    trending: await trendingFrom(cards),
  };
}

async function trendingFrom(cards: ArticleCard[]) {
  const picked = trendingSlugs.map((slug) => cards.find((card) => card.slug === slug)).filter((card): card is ArticleCard => Boolean(card));
  for (const card of cards) {
    if (picked.length >= 5) break;
    if (!picked.some((item) => item.id === card.id)) picked.push(card);
  }
  return picked.slice(0, 5);
}

export async function categoryPage(slug: string, _cursor: Cursor | null): Promise<CategoryPage | null> {
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;
  const { cards } = await load();
  const items = cards.filter((card) => card.categorySlug === slug).slice(0, 24);
  return { category, items, next: null, trending: await trendingFrom(cards) };
}

export async function articlePage(category: string, slug: string): Promise<ArticlePayload | { redirect: string } | null> {
  const { entries, cards } = await load();
  const index = entries.findIndex((entry) => entry.data.slug === slug);
  if (index < 0) return null;
  const entry = entries[index];
  if (entry.data.category !== category) return { redirect: `/${entry.data.category}/${entry.data.slug}/` };
  const author = await getEntry(entry.data.author);
  const og = await getImage({ src: entry.data.heroImage, width: 1200, height: 675, format: 'jpg', quality: 75 });
  const { Content } = await render(entry);
  const body = 'body' in entry ? String((entry as { body?: string }).body ?? '') : '';
  const publishedAt = Math.floor(entry.data.publishDate.valueOf() / 1000);
  const updatedAt = Math.floor((entry.data.updatedDate ?? entry.data.publishDate).valueOf() / 1000);
  const article: ArticleView = {
    ...cards[index],
    heroSrc: og.src,
    bodyHtml: null,
    readingMinutes: readingTime(body),
    publishedAt,
    updatedAt,
    heroCaption: entry.data.heroCaption ?? '',
    heroCredit: entry.data.heroCredit ?? '',
    heroCreditUrl: entry.data.heroCreditUrl ?? null,
    authorSlug: author?.data.slug ?? author?.id ?? 'redaksi',
    authorName: author?.data.name ?? 'Redaksi',
    authorRole: author?.data.role ?? '',
    authorBio: author?.data.bio ?? '',
    tags: tagsOf(entry),
    sources: [],
    seoTitle: entry.data.seoTitle ?? null,
    canonicalUrl: entry.data.canonical ?? null,
    review: entry.data.review
      ? {
          ...entry.data.review,
          priceRange: priceOf(entry.data.review),
          visitedAt: entry.data.review.visitedAt ? Math.floor(entry.data.review.visitedAt.valueOf() / 1000) : undefined,
        }
      : undefined,
  };
  const sameRegion = (card: ArticleCard) => !article.daerahSlug || card.daerahSlug === article.daerahSlug;
  const related = [
    ...cards.filter((card) => card.categorySlug === category && card.id !== article.id && sameRegion(card)),
    ...cards.filter((card) => card.categorySlug === category && card.id !== article.id && !sameRegion(card)),
  ].slice(0, 4);
  return { article, related, trending: await trendingFrom(cards), Content: Content as ArticlePayload['Content'] };
}

export async function tagPage(slug: string) {
  const { entries, cards } = await load();
  const items = cards.filter((_, index) => tagsOf(entries[index]).some((tag) => tag.slug === slug));
  const name = entries.flatMap((entry) => entry.data.tags).find((tag) => slugify(tag) === slug);
  if (!name) return null;
  return { tag: { slug, name }, items };
}

export async function authorPage(slug: string) {
  const authors = await getCollection('authors');
  const author = authors.find((item) => item.data.slug === slug || item.id === slug);
  if (!author) return null;
  const { entries, cards } = await load();
  const items: ArticleCard[] = [];
  for (let index = 0; index < entries.length; index++) {
    const ref = entries[index].data.author;
    const id = typeof ref === 'string' ? ref : ref.id;
    if (id === author.id) items.push(cards[index]);
  }
  return {
    author: { slug: author.data.slug, name: author.data.name, role: author.data.role, bio: author.data.bio, x: author.data.x ?? null },
    items,
  };
}

export async function searchPage(_q: string): Promise<ArticleCard[]> {
  return [];
}

export async function feedItems(category: string | null) {
  const { cards } = await load();
  if (!category) return { titleSuffix: 'Berita Terkini', description: '', items: cards.slice(0, 50) };
  const known = categories.find((item) => item.slug === category);
  if (!known) return null;
  return {
    titleSuffix: known.name,
    description: known.description,
    items: cards.filter((card) => card.categorySlug === category).slice(0, 50),
  };
}

function periodOf(epoch: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(new Date(epoch * 1000));
  return parts.slice(0, 7);
}

export async function sitemapMonths(): Promise<string[]> {
  const { cards } = await load();
  return [...new Set(cards.map((card) => periodOf(card.publishedAt)))].sort().reverse();
}

export async function monthEntries(period: string) {
  if (!/^\d{4}-\d{2}$/.test(period)) return null;
  const { cards } = await load();
  return cards
    .filter((card) => periodOf(card.publishedAt) === period)
    .map((card) => ({ slug: card.slug, published_at: card.publishedAt, updated_at: card.publishedAt, category_slug: card.categorySlug }));
}

export async function newsEntries() {
  const cutoff = Math.floor(Date.now() / 1000) - 48 * 60 * 60;
  const { cards } = await load();
  return cards
    .filter((card) => card.publishedAt >= cutoff)
    .slice(0, 1000)
    .map((card) => ({ slug: card.slug, title: card.title, published_at: card.publishedAt, category_slug: card.categorySlug }));
}

export async function articlePaths() {
  const { entries } = await load();
  return entries.map((entry) => ({ params: { category: entry.data.category, slug: entry.data.slug } }));
}

export async function categoryPaths() {
  return categories.map((category) => ({ params: { category: category.slug } }));
}

export async function tagPaths() {
  const { entries } = await load();
  const tags = new Map<string, string>();
  entries.forEach((entry) => entry.data.tags.forEach((tag) => tags.set(slugify(tag), tag)));
  return [...tags.keys()].map((tag) => ({ params: { tag } }));
}

export async function authorPaths() {
  const authors = await getCollection('authors');
  return authors.map((author) => ({ params: { slug: author.data.slug } }));
}

// ---------------------------------------------------------------------------
// Niche local wisdom: beranda, daerah, daerah × kategori
// ---------------------------------------------------------------------------
export async function localHome(): Promise<LocalHome> {
  const { cards } = await load();
  const local = cards.filter((card) => isLocalCategory(card.categorySlug));
  const regionCounts: Record<string, number> = {};
  for (const card of local) if (card.daerahSlug) regionCounts[card.daerahSlug] = (regionCounts[card.daerahSlug] ?? 0) + 1;
  return {
    latest: local.slice(0, 6),
    byCategory: localCategories.map((category) => ({ ...category, items: local.filter((card) => card.categorySlug === category.slug).slice(0, 3) })),
    regionCounts,
    archive: cards.filter((card) => !isLocalCategory(card.categorySlug)).slice(0, 4),
  };
}

export async function regionPage(regionSlug: string, categorySlug: string | null, citySlugParam: string | null = null): Promise<RegionPage | null> {
  const region = getRegion(regionSlug);
  if (!region) return null;
  const category = categorySlug ? localCategories.find((item) => item.slug === categorySlug) ?? null : null;
  if (categorySlug && !category) return null;
  const { cards } = await load();
  const inRegion = cards.filter((card) => card.daerahSlug === regionSlug);
  const cityCount = new Map<string, { name: string; slug: string; count: number }>();
  for (const card of inRegion) {
    if (!card.kota || !card.kotaSlug) continue;
    const hit = cityCount.get(card.kotaSlug) ?? { name: card.kota, slug: card.kotaSlug, count: 0 };
    hit.count++;
    cityCount.set(card.kotaSlug, hit);
  }
  let city: { name: string; slug: string } | null = null;
  if (citySlugParam) {
    city = citiesOf(regionSlug).find((c) => c.slug === citySlugParam) ?? (cityCount.get(citySlugParam) ? { name: cityCount.get(citySlugParam)!.name, slug: citySlugParam } : null);
    if (!city) return null;
  }
  const scoped = city ? inRegion.filter((card) => card.kotaSlug === city!.slug) : inRegion;
  const counts: Record<string, number> = {};
  for (const card of scoped) counts[card.categorySlug] = (counts[card.categorySlug] ?? 0) + 1;
  const items = category ? scoped.filter((card) => card.categorySlug === category.slug) : scoped;
  return {
    region,
    category,
    city,
    items,
    counts,
    cities: [...cityCount.values()].sort((a, b) => b.count - a.count),
  };
}

export async function categoryRegionCounts(categorySlug: string): Promise<Record<string, number>> {
  const { cards } = await load();
  const out: Record<string, number> = {};
  for (const card of cards) if (card.categorySlug === categorySlug && card.daerahSlug) out[card.daerahSlug] = (out[card.daerahSlug] ?? 0) + 1;
  return out;
}

export async function regionPaths() {
  return regions.map((region) => ({ params: { region: region.slug } }));
}

/** /daerah/<provinsi>/<rubrik>/ dan /daerah/<provinsi>/<kota>/ (segmen kedua berbagi satu rute). */
export async function regionSubPaths() {
  const { cards } = await load();
  const out = new Map<string, { params: { region: string; sub: string } }>();
  for (const region of regions) {
    for (const category of localCategories) out.set(`${region.slug}/${category.slug}`, { params: { region: region.slug, sub: category.slug } });
    for (const city of citiesOf(region.slug)) out.set(`${region.slug}/${city.slug}`, { params: { region: region.slug, sub: city.slug } });
  }
  for (const card of cards) {
    if (card.daerahSlug && card.kotaSlug) out.set(`${card.daerahSlug}/${card.kotaSlug}`, { params: { region: card.daerahSlug, sub: card.kotaSlug } });
  }
  return [...out.values()];
}

/** /daerah/<provinsi>/<kota>/<rubrik>/ — hanya kombinasi yang punya isi. */
export async function regionCityCategoryPaths() {
  const { cards } = await load();
  const out = new Map<string, { params: { region: string; sub: string; category: string } }>();
  for (const card of cards) {
    if (!card.daerahSlug || !card.kotaSlug || !isLocalCategory(card.categorySlug)) continue;
    out.set(`${card.daerahSlug}/${card.kotaSlug}/${card.categorySlug}`, { params: { region: card.daerahSlug, sub: card.kotaSlug, category: card.categorySlug } });
  }
  return [...out.values()];
}

export async function archiveCounts(): Promise<Record<string, number>> {
  const { cards } = await load();
  const out: Record<string, number> = {};
  for (const card of cards) out[card.categorySlug] = (out[card.categorySlug] ?? 0) + 1;
  return out;
}
