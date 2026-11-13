import { purgeContent, purgeForArticle } from './purge';
import { sqlDue, sqlPublishOne, sqlTagSlugsForArticle } from './sql.mjs';

type DueRow = { id: number; slug: string; category_slug: string; author_slug: string };

/** Terbitkan artikel scheduled yang waktunya sudah lewat, lalu bersihkan cache. */
export async function publishDue(env: Env): Promise<{ published: number }> {
  const db = env.DB;
  if (!db) return { published: 0 };
  const stamp = Math.floor(Date.now() / 1000);
  const due = await db.prepare(sqlDue).bind(stamp).all<DueRow>();
  if (!due.results.length) return { published: 0 };
  await db.batch(due.results.map((row) => db.prepare(sqlPublishOne).bind(row.id)));
  const tagResults = await db.batch<{ slug: string }>(due.results.map((row) => db.prepare(sqlTagSlugsForArticle).bind(row.id)));
  const tags = new Set<string>(['home', 'feed', 'sitemap', 'search']);
  const urls = new Set<string>();
  due.results.forEach((row, index) => {
    const tagSlugs = tagResults[index]?.results.map((item) => item.slug) ?? [];
    const target = purgeForArticle({
      id: row.id,
      categorySlug: row.category_slug,
      slug: row.slug,
      authorSlug: row.author_slug,
      tagSlugs,
    });
    target.tags.forEach((tag) => tags.add(tag));
    target.urls.forEach((url) => urls.add(url));
  });
  try {
    await purgeContent(env, { tags: [...tags], urls: [...urls] });
  } catch (error) {
    console.error('purge jadwal', error);
  }
  return { published: due.results.length };
}
