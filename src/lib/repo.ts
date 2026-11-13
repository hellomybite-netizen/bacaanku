import { trending as trendingSlugs, categories as siteCategories } from '../config/site';
import { resolveHero } from './media';
import type { ArticleCard, ArticlePayload, ArticleView, CategoryPage, Cursor, HomeBundle, SourceItem } from './content-types';
import type { PreparedArticle } from './editorial';
import {
  sqlAdminByStatus,
  sqlArticle,
  sqlArticleTags,
  sqlAuthorBySlug,
  sqlByAuthor,
  sqlByCategory,
  sqlByCategoryBefore,
  sqlBySlug,
  sqlByTag,
  sqlCategoryBySlug,
  sqlHeadline,
  sqlLatest,
  sqlMonth,
  sqlNews,
  sqlPublishedBounds,
  sqlRedirect,
  sqlRelated,
  sqlSearch,
  sqlTagBySlug,
} from './sql.mjs';

type CardRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  hero_r2_key: string | null;
  hero_width: number | null;
  hero_height: number | null;
  hero_alt: string;
  published_at: number;
  is_headline: number;
  category_slug: string;
  category_name: string;
};

const now = () => Math.floor(Date.now() / 1000);

function mapCard(row: CardRow, mediaBase?: string): ArticleCard {
  const hero = resolveHero(row.hero_r2_key, mediaBase);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.published_at,
    heroSrc: hero.src,
    heroSrcset: hero.srcset,
    heroAlt: row.hero_alt || '',
    heroWidth: row.hero_width,
    heroHeight: row.hero_height,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    isHeadline: row.is_headline === 1,
  };
}

async function allCards(db: D1Database, sql: string, binds: unknown[], mediaBase?: string): Promise<ArticleCard[]> {
  const { results } = await db.prepare(sql).bind(...binds).all<CardRow>();
  return results.map((row) => mapCard(row, mediaBase));
}

export async function trendingCards(db: D1Database, mediaBase?: string): Promise<ArticleCard[]> {
  const slugs = trendingSlugs.slice(0, 5);
  const stamp = now();
  const found = new Map<string, ArticleCard>();
  if (slugs.length) {
    const batch = await db.batch<CardRow>(slugs.map((slug) => db.prepare(sqlBySlug).bind(slug, stamp)));
    batch.forEach((result, index) => {
      const row = result.results[0];
      if (row) found.set(slugs[index], mapCard(row, mediaBase));
    });
  }
  const ordered = slugs.map((slug) => found.get(slug)).filter((card): card is ArticleCard => Boolean(card));
  if (ordered.length >= 5) return ordered.slice(0, 5);
  const latest = await allCards(db, sqlLatest, [now(), 8], mediaBase);
  for (const card of latest) {
    if (ordered.length >= 5) break;
    if (!ordered.some((item) => item.id === card.id)) ordered.push(card);
  }
  return ordered;
}

export async function homeBundle(db: D1Database, mediaBase?: string): Promise<HomeBundle> {
  const stamp = now();
  const statements = [
    db.prepare(sqlHeadline).bind(stamp),
    db.prepare(sqlLatest).bind(stamp, 16),
    ...siteCategories.map((category) => db.prepare(`SELECT id FROM categories WHERE slug = ?`).bind(category.slug)),
  ];
  const first = await db.batch(statements);
  const headlineRow = (first[0] as D1Result<CardRow>).results[0];
  const latest = (first[1] as D1Result<CardRow>).results.map((row) => mapCard(row, mediaBase));
  const headline = headlineRow ? mapCard(headlineRow, mediaBase) : latest[0] ?? null;
  const rest = latest.filter((card) => card.id !== headline?.id);
  const categoryIds = siteCategories.map((_, index) => (first[index + 2] as D1Result<{ id: number }>).results[0]?.id);
  const categoryBatch = await db.batch<CardRow>(
    categoryIds.map((id) => db.prepare(sqlByCategory).bind(id ?? -1, stamp, 4)),
  );
  const byCategory = siteCategories
    .map((category, index) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      items: categoryBatch[index].results.map((row) => mapCard(row, mediaBase)),
    }))
    .filter((category) => category.items.length > 0);
  return {
    headline,
    secondary: rest.slice(0, 3),
    latest: rest.slice(3, 10),
    byCategory,
    trending: await trendingCards(db, mediaBase),
  };
}

export async function categoryPage(db: D1Database, slug: string, cursor: Cursor | null, mediaBase?: string): Promise<CategoryPage | null> {
  const category = await db.prepare(sqlCategoryBySlug).bind(slug).first<{ id: number; slug: string; name: string; description: string }>();
  if (!category) return null;
  const limit = 12;
  const stamp = now();
  const rows = cursor
    ? await allCards(db, sqlByCategoryBefore, [category.id, stamp, cursor.publishedAt, cursor.publishedAt, cursor.id, limit + 1], mediaBase)
    : await allCards(db, sqlByCategory, [category.id, stamp, limit + 1], mediaBase);
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    category: { slug: category.slug, name: category.name, description: category.description },
    items,
    next: rows.length > limit && last ? { publishedAt: last.publishedAt, id: last.id } : null,
    trending: await trendingCards(db, mediaBase),
  };
}

function parseSources(raw: string): SourceItem[] {
  try {
    const data = JSON.parse(raw) as SourceItem[];
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item && item.url && item.title);
  } catch {
    return [];
  }
}

export async function articlePage(db: D1Database, category: string, slug: string, mediaBase?: string): Promise<ArticlePayload | { redirect: string } | null> {
  const row = await db.prepare(sqlArticle).bind(slug, now()).first<Record<string, unknown>>();
  if (!row) {
    const redirect = await db.prepare(sqlRedirect).bind(`/${category}/${slug}/`).first<{ new_path: string }>();
    return redirect ? { redirect: redirect.new_path } : null;
  }
  if (row.category_slug !== category) return { redirect: `/${row.category_slug}/${row.slug}/` };
  const hero = resolveHero(row.hero_r2_key as string | null, mediaBase);
  const [tagsResult, relatedRows, trending] = await Promise.all([
    db.prepare(sqlArticleTags).bind(row.id).all<{ slug: string; name: string }>(),
    allCards(db, sqlRelated, [row.category_id, row.id, now(), 4], mediaBase),
    trendingCards(db, mediaBase),
  ]);
  const article: ArticleView = {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt),
    bodyHtml: String(row.body_html || ''),
    readingMinutes: Number(row.reading_minutes) || 1,
    publishedAt: Number(row.published_at),
    updatedAt: Number(row.updated_at),
    heroSrc: hero.src,
    heroSrcset: hero.srcset,
    heroAlt: String(row.hero_alt || ''),
    heroWidth: (row.hero_width as number | null) ?? null,
    heroHeight: (row.hero_height as number | null) ?? null,
    heroCaption: String(row.hero_caption || ''),
    heroCredit: String(row.hero_credit || ''),
    heroCreditUrl: (row.hero_credit_url as string | null) ?? null,
    categorySlug: String(row.category_slug),
    categoryName: String(row.category_name),
    authorSlug: String(row.author_slug),
    authorName: String(row.author_name),
    authorRole: String(row.author_role || ''),
    authorBio: String(row.author_bio || ''),
    tags: tagsResult.results,
    sources: parseSources(String(row.sources_json || '[]')),
    seoTitle: (row.seo_title as string | null) ?? null,
    canonicalUrl: (row.canonical_url as string | null) ?? null,
    isHeadline: row.is_headline === 1,
  };
  return { article, related: relatedRows, trending };
}

export async function tagPage(db: D1Database, slug: string, mediaBase?: string) {
  const tag = await db.prepare(sqlTagBySlug).bind(slug).first<{ id: number; slug: string; name: string }>();
  if (!tag) return null;
  const items = await allCards(db, sqlByTag, [tag.id, now(), 24], mediaBase);
  return { tag: { slug: tag.slug, name: tag.name }, items };
}

export async function authorPage(db: D1Database, slug: string, mediaBase?: string) {
  const author = await db.prepare(sqlAuthorBySlug).bind(slug).first<{ id: number; slug: string; name: string; role: string; bio: string; x_handle: string | null }>();
  if (!author) return null;
  const items = await allCards(db, sqlByAuthor, [author.id, now(), 24], mediaBase);
  return {
    author: { slug: author.slug, name: author.name, role: author.role, bio: author.bio, x: author.x_handle },
    items,
  };
}

export function ftsQuery(raw: string): string | null {
  const tokens = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2)
    .slice(0, 8);
  if (!tokens.length) return null;
  return tokens.map((token) => `"${token.replaceAll('"', '')}"*`).join(' AND ');
}

export async function searchArticles(db: D1Database, raw: string, mediaBase?: string): Promise<ArticleCard[]> {
  const query = ftsQuery(raw);
  if (!query) return [];
  try {
    return await allCards(db, sqlSearch, [query, 20], mediaBase);
  } catch (error) {
    console.error('fts', error);
    return [];
  }
}

export async function feedItems(db: D1Database, categorySlug: string | null, mediaBase?: string) {
  const stamp = now();
  if (!categorySlug) {
    const items = await allCards(db, sqlLatest, [stamp, 50], mediaBase);
    return { titleSuffix: 'Berita Terkini', description: '', items };
  }
  const category = await db.prepare(sqlCategoryBySlug).bind(categorySlug).first<{ id: number; name: string; description: string }>();
  if (!category) return null;
  const items = await allCards(db, sqlByCategory, [category.id, stamp, 50], mediaBase);
  return { titleSuffix: category.name, description: category.description, items };
}

export async function publishedBounds(db: D1Database): Promise<{ min: number; max: number } | null> {
  const row = await db.prepare(sqlPublishedBounds).first<{ min_at: number | null; max_at: number | null }>();
  if (!row?.min_at || !row.max_at) return null;
  return { min: row.min_at, max: row.max_at };
}

export function monthsBetween(min: number, max: number): string[] {
  const start = new Date(min * 1000);
  const end = new Date(max * 1000);
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  const months: string[] = [];
  while (cursor <= last && months.length < 240) {
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months.reverse();
}

export async function sitemapMonths(db: D1Database): Promise<string[]> {
  const bounds = await publishedBounds(db);
  if (!bounds) return [];
  return monthsBetween(bounds.min, bounds.max);
}

export async function monthEntries(db: D1Database, period: string) {
  if (!/^\d{4}-\d{2}$/.test(period)) return null;
  const [year, month] = period.split('-').map(Number);
  const start = Math.floor(Date.parse(`${period}-01T00:00:00+07:00`) / 1000);
  const next = new Date(Date.UTC(year, month, 1));
  const nextPeriod = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
  const end = Math.floor(Date.parse(`${nextPeriod}-01T00:00:00+07:00`) / 1000);
  const { results } = await db
    .prepare(sqlMonth)
    .bind(start, end)
    .all<{ slug: string; published_at: number; updated_at: number; category_slug: string }>();
  return results;
}

export async function newsEntries(db: D1Database) {
  const cutoff = now() - 48 * 60 * 60;
  const { results } = await db
    .prepare(sqlNews)
    .bind(cutoff, now())
    .all<{ slug: string; title: string; published_at: number; category_slug: string }>();
  return results;
}

export type AdminRow = {
  id: number;
  slug: string;
  title: string;
  status: string;
  updated_at: number;
  published_at: number | null;
  is_headline: number;
  category_slug: string;
  category_name: string;
  author_name: string;
};

export async function adminList(db: D1Database, filter: { status: string; category: string; q: string }): Promise<AdminRow[]> {
  const q = filter.q.trim();
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, '')}%`;
    const sql = filter.status
      ? `${sqlAdminByStatus.replace('WHERE a.status = ?', 'WHERE a.status = ? AND a.title LIKE ?')}`
      : `SELECT a.id, a.slug, a.title, a.status, a.updated_at, a.published_at, a.is_headline,
           c.slug AS category_slug, c.name AS category_name, au.name AS author_name
         FROM articles a
         JOIN categories c ON c.id = a.category_id
         JOIN authors au ON au.id = a.author_id
         WHERE a.title LIKE ?
         ORDER BY a.updated_at DESC
         LIMIT ?`;
    const binds = filter.status ? [filter.status, like, 50] : [like, 50];
    const { results } = await db.prepare(sql).bind(...binds).all<AdminRow>();
    return filter.category ? results.filter((row) => row.category_slug === filter.category) : results;
  }
  if (filter.status) {
    const { results } = await db.prepare(sqlAdminByStatus).bind(filter.status, 80).all<AdminRow>();
    return (filter.category ? results.filter((row) => row.category_slug === filter.category) : results).slice(0, 50);
  }
  const { results } = await db
    .prepare(
      `SELECT a.id, a.slug, a.title, a.status, a.updated_at, a.published_at, a.is_headline,
              c.slug AS category_slug, c.name AS category_name, au.name AS author_name
       FROM articles a
       JOIN categories c ON c.id = a.category_id
       JOIN authors au ON au.id = a.author_id
       ORDER BY a.updated_at DESC
       LIMIT 50`,
    )
    .all<AdminRow>();
  return filter.category ? results.filter((row) => row.category_slug === filter.category) : results;
}

export type EditorRecord = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  category_slug: string;
  author_slug: string;
  hero_r2_key: string | null;
  hero_alt: string;
  hero_caption: string;
  hero_credit: string;
  hero_credit_url: string | null;
  hero_width: number | null;
  hero_height: number | null;
  sources_json: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  is_headline: number;
  published_at: number | null;
  status: string;
  tags: { slug: string; name: string }[];
};

export async function adminArticle(db: D1Database, id: number): Promise<EditorRecord | null> {
  const row = await db
    .prepare(
      `SELECT a.id, a.slug, a.title, a.excerpt, a.body_markdown, a.hero_r2_key, a.hero_alt, a.hero_caption,
              a.hero_credit, a.hero_credit_url, a.hero_width, a.hero_height, a.sources_json,
              a.seo_title, a.seo_description, a.canonical_url, a.is_headline, a.published_at, a.status,
              c.slug AS category_slug, au.slug AS author_slug
       FROM articles a
       JOIN categories c ON c.id = a.category_id
       JOIN authors au ON au.id = a.author_id
       WHERE a.id = ?`,
    )
    .bind(id)
    .first<Omit<EditorRecord, 'tags'>>();
  if (!row) return null;
  const tags = await db.prepare(sqlArticleTags).bind(id).all<{ slug: string; name: string }>();
  return { ...row, tags: tags.results };
}

export async function listAuthors(db: D1Database) {
  const { results } = await db
    .prepare(`SELECT id, slug, name, role FROM authors WHERE is_active = 1 ORDER BY name`)
    .all<{ id: number; slug: string; name: string; role: string }>();
  return results;
}

export async function listCategories(db: D1Database) {
  const { results } = await db
    .prepare(`SELECT id, slug, name FROM categories WHERE is_active = 1 ORDER BY sort_order`)
    .all<{ id: number; slug: string; name: string }>();
  return results;
}

async function uniqueSlug(db: D1Database, base: string, selfId?: number): Promise<string> {
  let slug = base || 'berita';
  let n = 2;
  while (n < 40) {
    const row = await db.prepare(`SELECT id FROM articles WHERE slug = ?`).bind(slug).first<{ id: number }>();
    if (!row || row.id === selfId) return slug;
    slug = `${base}-${n++}`;
  }
  return `${base}-${Date.now()}`;
}

export async function saveArticle(db: D1Database, prepared: PreparedArticle, selfId?: number): Promise<{ id: number; oldPath: string | null; newPath: string }> {
  const category = await db.prepare(sqlCategoryBySlug).bind(prepared.values.category).first<{ id: number; slug: string }>();
  const author = await db.prepare(`SELECT id, slug FROM authors WHERE slug = ? AND is_active = 1`).bind(prepared.values.author).first<{ id: number; slug: string }>();
  if (!category) throw new Error('Kategori tidak ditemukan.');
  if (!author) throw new Error('Penulis tidak ditemukan.');
  const slug = await uniqueSlug(db, prepared.slug, selfId);
  const existing = selfId
    ? await db
        .prepare(
          `SELECT a.slug, c.slug AS category_slug FROM articles a JOIN categories c ON c.id = a.category_id WHERE a.id = ?`,
        )
        .bind(selfId)
        .first<{ slug: string; category_slug: string }>()
    : null;
  const hero = prepared.values.heroUrl || null;
  const binds = [
    slug,
    prepared.values.title,
    prepared.values.excerpt,
    prepared.values.body,
    prepared.bodyHtml,
    prepared.readingMinutes,
    category.id,
    author.id,
    prepared.status,
    hero,
    prepared.values.heroWidth ? Number(prepared.values.heroWidth) : null,
    prepared.values.heroHeight ? Number(prepared.values.heroHeight) : null,
    prepared.values.heroAlt,
    prepared.values.heroCaption,
    prepared.values.heroCredit,
    prepared.values.heroCreditUrl || null,
    JSON.stringify(prepared.sources),
    prepared.values.seoTitle || null,
    prepared.values.seoDescription || null,
    prepared.values.canonicalUrl || null,
    prepared.values.isHeadline ? 1 : 0,
    prepared.publishedAt,
  ];
  let id = selfId ?? 0;
  if (selfId) {
    await db
      .prepare(
        `UPDATE articles SET
           slug=?, title=?, excerpt=?, body_markdown=?, body_html=?, reading_minutes=?,
           category_id=?, author_id=?, status=?, hero_r2_key=?, hero_width=?, hero_height=?,
           hero_alt=?, hero_caption=?, hero_credit=?, hero_credit_url=?, sources_json=?,
           seo_title=?, seo_description=?, canonical_url=?, is_headline=?, published_at=?,
           updated_at=unixepoch()
         WHERE id=?`,
      )
      .bind(...binds, selfId)
      .run();
  } else {
    const inserted = await db
      .prepare(
        `INSERT INTO articles (
           slug, title, excerpt, body_markdown, body_html, reading_minutes,
           category_id, author_id, status, hero_r2_key, hero_width, hero_height,
           hero_alt, hero_caption, hero_credit, hero_credit_url, sources_json,
           seo_title, seo_description, canonical_url, is_headline, published_at
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .bind(...binds)
      .run();
    id = Number(inserted.meta.last_row_id);
  }
  const tagWrites = prepared.tagList.map((tag) =>
    db.prepare(`INSERT INTO tags (slug, name) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name RETURNING id`).bind(tag.slug, tag.name),
  );
  const tagResults = tagWrites.length ? await db.batch<{ id: number }>(tagWrites) : [];
  const tagIds = tagResults.map((result) => result.results[0]?.id).filter((value): value is number => Boolean(value));
  const linkWrites = [
    db.prepare(`DELETE FROM article_tags WHERE article_id = ?`).bind(id),
    ...tagIds.map((tagId) => db.prepare(`INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)`).bind(id, tagId)),
  ];
  const newPath = `/${category.slug}/${slug}/`;
  const oldPath = existing ? `/${existing.category_slug}/${existing.slug}/` : null;
  if (oldPath && oldPath !== newPath) {
    linkWrites.push(
      db.prepare(`INSERT INTO slug_redirects (old_path, new_path) VALUES (?, ?) ON CONFLICT(old_path) DO UPDATE SET new_path = excluded.new_path`).bind(oldPath, newPath),
      db.prepare(`UPDATE slug_redirects SET new_path = ? WHERE new_path = ?`).bind(newPath, oldPath),
    );
  }
  await db.batch(linkWrites);
  return { id, oldPath, newPath };
}
