import { IS_STATIC } from './mode';
import type { ArticlePayload, CategoryPage, Cursor, HomeBundle } from './content-types';

async function serverDb() {
  const { getDb, getEnv } = await import('./db');
  return { db: getDb(), mediaBase: getEnv().MEDIA_BASE };
}

export async function loadHome(): Promise<HomeBundle> {
  if (IS_STATIC) return (await import('./static-data')).homeBundle();
  const { homeBundle } = await import('./repo');
  const { db, mediaBase } = await serverDb();
  return homeBundle(db, mediaBase);
}

export async function loadCategory(slug: string, cursor: Cursor | null): Promise<CategoryPage | null> {
  if (IS_STATIC) return (await import('./static-data')).categoryPage(slug, cursor);
  const { categoryPage } = await import('./repo');
  const { db, mediaBase } = await serverDb();
  return categoryPage(db, slug, cursor, mediaBase);
}

export async function loadArticle(category: string, slug: string): Promise<ArticlePayload | { redirect: string } | null> {
  if (IS_STATIC) return (await import('./static-data')).articlePage(category, slug);
  const { articlePage } = await import('./repo');
  const { db, mediaBase } = await serverDb();
  return articlePage(db, category, slug, mediaBase);
}

export async function loadTag(slug: string) {
  if (IS_STATIC) return (await import('./static-data')).tagPage(slug);
  const { tagPage } = await import('./repo');
  const { db, mediaBase } = await serverDb();
  return tagPage(db, slug, mediaBase);
}

export async function loadAuthor(slug: string) {
  if (IS_STATIC) return (await import('./static-data')).authorPage(slug);
  const { authorPage } = await import('./repo');
  const { db, mediaBase } = await serverDb();
  return authorPage(db, slug, mediaBase);
}

export async function loadSearch(q: string) {
  if (IS_STATIC) return (await import('./static-data')).searchPage(q);
  const { searchArticles } = await import('./repo');
  const { db, mediaBase } = await serverDb();
  return searchArticles(db, q, mediaBase);
}

export async function loadFeed(category: string | null) {
  if (IS_STATIC) return (await import('./static-data')).feedItems(category);
  const { feedItems } = await import('./repo');
  const { db, mediaBase } = await serverDb();
  return feedItems(db, category, mediaBase);
}

export async function loadSitemapMonths(): Promise<string[]> {
  if (IS_STATIC) return (await import('./static-data')).sitemapMonths();
  const { sitemapMonths } = await import('./repo');
  const { db } = await serverDb();
  return sitemapMonths(db);
}

export async function loadMonthEntries(period: string) {
  if (IS_STATIC) return (await import('./static-data')).monthEntries(period);
  const { monthEntries } = await import('./repo');
  const { db } = await serverDb();
  return monthEntries(db, period);
}

export async function loadNewsEntries() {
  if (IS_STATIC) return (await import('./static-data')).newsEntries();
  const { newsEntries } = await import('./repo');
  const { db } = await serverDb();
  return newsEntries(db);
}
