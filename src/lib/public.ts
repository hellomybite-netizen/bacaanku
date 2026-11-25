import { IS_STATIC } from './mode';
import type { ArticlePayload, CategoryPage, Cursor, HomeBundle, LocalHome, RegionPage } from './content-types';
import { citiesOf, getRegion, isLocalCategory, localCategories } from '../config/site';

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

export async function loadSitemapPageMeta() {
  if (IS_STATIC) return null;
  const { sitemapPageMeta } = await import('./repo');
  const { db } = await serverDb();
  return sitemapPageMeta(db);
}

/**
 * Beranda niche local wisdom.
 * Build statis (preview GitHub Pages): dari frontmatter Markdown.
 * SSR (D1): dari kolom lokasi/ulasan (docs/migrations/0003_local_wisdom.sql). Sebelum migrasi dijalankan,
 * bagian ulasan kosong dan beranda tetap tampil dengan arsip berita.
 */
export async function loadLocalHome(): Promise<LocalHome> {
  if (IS_STATIC) return (await import('./static-data')).localHome();
  const { localHome } = await import('./local-repo');
  const { db, mediaBase } = await serverDb();
  const [local, bundle] = await Promise.all([localHome(db, mediaBase), loadHome()]);
  return {
    latest: local.latest,
    byCategory: localCategories.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      items: local.byCategory.find((x) => x.slug === c.slug)?.items ?? [],
    })),
    regionCounts: local.regionCounts,
    archive: [bundle.headline, ...bundle.secondary, ...bundle.latest]
      .filter((a): a is NonNullable<typeof a> => Boolean(a) && !isLocalCategory(a!.categorySlug))
      .slice(0, 4),
  };
}

export async function loadRegion(
  regionSlug: string,
  categorySlug: string | null,
  citySlugParam: string | null = null,
): Promise<RegionPage | null> {
  if (IS_STATIC) return (await import('./static-data')).regionPage(regionSlug, categorySlug, citySlugParam);
  const region = getRegion(regionSlug);
  if (!region) return null;
  const category = categorySlug ? localCategories.find((c) => c.slug === categorySlug) ?? null : null;
  if (categorySlug && !category) return null;
  const { regionListing } = await import('./local-repo');
  const { db, mediaBase } = await serverDb();
  const listing = await regionListing(db, region.slug, { categorySlug: category?.slug, citySlug: citySlugParam }, mediaBase);
  let city: { name: string; slug: string } | null = null;
  if (citySlugParam) {
    const known = citiesOf(region.slug).find((c) => c.slug === citySlugParam);
    const fromDb = listing.cities.find((c) => c.slug === citySlugParam);
    city = known ?? (fromDb ? { name: fromDb.name, slug: fromDb.slug } : null);
    if (!city) return null;
  }
  return { region, category, city, items: listing.items, counts: listing.counts, cities: listing.cities };
}

export async function loadCategoryRegionCounts(categorySlug: string): Promise<Record<string, number>> {
  if (IS_STATIC) return (await import('./static-data')).categoryRegionCounts(categorySlug);
  const { categoryRegionCounts } = await import('./local-repo');
  const { db } = await serverDb();
  return categoryRegionCounts(db, categorySlug);
}

export async function loadArchiveCounts(): Promise<Record<string, number>> {
  if (IS_STATIC) return (await import('./static-data')).archiveCounts();
  const { categoryCounts } = await import('./local-repo');
  const { db } = await serverDb();
  return categoryCounts(db);
}

export async function loadSitemapRegions(): Promise<{ path: string; lastAt: number }[]> {
  if (IS_STATIC) return [];
  const { sitemapRegionEntries } = await import('./local-repo');
  const { db } = await serverDb();
  return sitemapRegionEntries(db);
}
