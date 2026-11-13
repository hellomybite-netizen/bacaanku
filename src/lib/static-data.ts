import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { categories, trending as trendingSlugs } from '../config/site';
import { readingTime, slugify } from '../utils/articles';
import type { ArticleCard, ArticlePayload, ArticleView, CategoryPage, Cursor } from './content-types';

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
  };
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
  };
  const related = cards.filter((card) => card.categorySlug === category && card.id !== article.id).slice(0, 4);
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
