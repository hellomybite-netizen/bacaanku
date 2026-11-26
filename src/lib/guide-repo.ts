import { publicAuthor } from './authors';
// Baca artikel local wisdom (tipe Hotel/Wisata/Kuliner + kota) dari D1.
// Semua query memakai index (kategori / kota / provinsi / slug), tanpa SCAN articles.
// Mode statis (pratinjau GitHub Pages) memakai data awal scripts/preview/local-wisdom-seed.mjs.
import { IS_STATIC } from './mode';
import { resolveHero } from './media';
import { cardVariant, guideCategory, guideCities, guideCity, guideProvince, isGuideCategory, GUIDE_CATEGORY_SLUGS, type Guide, type GuideCategory } from './local-guide';

const GUIDE_IN = GUIDE_CATEGORY_SLUGS.map((slug) => `'${slug}'`).join(', ');
const CITY_IN = guideCities.map((city) => `'${city.slug}'`).join(', ');

const cardCols = `
  a.id, a.slug, a.title, a.excerpt, a.hero_r2_key, a.hero_alt, a.published_at, a.updated_at,
  a.city_slug, a.province_slug, a.place_name, a.location_label, a.budget_label, a.budget_value,
  c.slug AS category_slug, c.name AS category_name`;

const fullCols = `${cardCols},
  a.body_html, a.reading_minutes, a.hero_caption, a.hero_credit, a.hero_credit_url, a.sources_json,
  a.facts_json, a.map_query, a.action_label, a.action_url, a.gallery_json, a.seo_title, a.canonical_url,
  au.slug AS author_slug, au.name AS author_name`;

const base = `FROM articles a JOIN categories c ON c.id = a.category_id`;
const live = `a.status = 'published' AND a.published_at <= ?`;

export const sqlGuidesAll = `SELECT ${cardCols} ${base}
  WHERE a.category_id IN (SELECT id FROM categories WHERE slug IN (${GUIDE_IN})) AND ${live}
  ORDER BY a.published_at DESC LIMIT ?`;
export const sqlGuidesByCategory = `SELECT ${cardCols} ${base}
  WHERE a.category_id = (SELECT id FROM categories WHERE slug = ?) AND ${live}
  ORDER BY a.published_at DESC LIMIT ?`;
export const sqlGuidesByCity = `SELECT ${cardCols} ${base}
  WHERE a.city_slug = ? AND ${live} AND c.slug IN (${GUIDE_IN})
  ORDER BY a.published_at DESC LIMIT ?`;
export const sqlGuidesByProvince = `SELECT ${cardCols} ${base}
  WHERE a.province_slug = ? AND ${live} AND c.slug IN (${GUIDE_IN})
  ORDER BY a.published_at DESC LIMIT ?`;
export const sqlGuideBySlug = `SELECT ${fullCols} ${base} JOIN authors au ON au.id = a.author_id
  WHERE a.slug = ? AND ${live}`;
export const sqlGuideCityCounts = `SELECT a.city_slug AS city, c.slug AS category, COUNT(*) AS n ${base}
  WHERE a.city_slug IN (${CITY_IN}) AND ${live} AND c.slug IN (${GUIDE_IN})
  GROUP BY a.city_slug, c.slug`;

type Row = Record<string, unknown>;
const str = (v: unknown) => (v == null ? '' : String(v));
const json = <T>(raw: unknown, fallback: T): T => {
  if (typeof raw !== 'string' || !raw) return fallback;
  try { const parsed = JSON.parse(raw); return (parsed ?? fallback) as T; } catch { return fallback; }
};

export function mapGuide(row: Row, mediaBase?: string): Guide {
  const category = str(row.category_slug) as GuideCategory;
  const city = guideCity(str(row.city_slug));
  const province = guideProvince(str(row.province_slug) || city?.province);
  const hero = resolveHero(row.hero_r2_key as string | null, mediaBase).src;
  const sources = json<{ name?: string; title?: string; url?: string }[]>(row.sources_json, [])
    .filter((s) => s && s.url)
    .map((s) => ({ label: [s.name, s.title].filter(Boolean).join(' — ') || String(s.url), url: String(s.url) }));
  const facts = json<{ label?: string; value?: string }[]>(row.facts_json, [])
    .filter((f) => f && f.label && f.value).map((f) => ({ label: String(f.label), value: String(f.value) }));
  const gallery = json<{ src?: string; alt?: string }[]>(row.gallery_json, [])
    .filter((g) => g && g.src).map((g) => {
      const src = resolveHero(String(g.src), mediaBase).src;
      return { src, cardSrc: cardVariant(src), alt: String(g.alt || '') };
    });
  const budget = row.budget_label && row.budget_value ? { label: str(row.budget_label), value: str(row.budget_value) } : undefined;
  const action = row.action_url ? { label: str(row.action_label) || 'Kunjungi situs resmi', url: str(row.action_url) } : undefined;
  return {
    id: Number(row.id),
    slug: str(row.slug),
    category,
    categoryName: str(row.category_name) || guideCategory(category)?.name || category,
    citySlug: city?.slug ?? (str(row.city_slug) || null),
    cityName: city?.name ?? null,
    provinceSlug: province?.slug ?? null,
    provinceName: province?.name ?? null,
    name: str(row.place_name) || str(row.title),
    title: str(row.title),
    description: str(row.excerpt),
    location: str(row.location_label) || [city?.name, province?.name].filter(Boolean).join(', ') || 'Indonesia',
    heroSrc: hero,
    cardSrc: cardVariant(hero),
    imageAlt: str(row.hero_alt),
    heroCaption: str(row.hero_caption),
    heroCredit: str(row.hero_credit),
    heroCreditUrl: (row.hero_credit_url as string | null) ?? null,
    gallery,
    facts,
    budget,
    mapQuery: str(row.map_query) || [str(row.place_name), str(row.location_label)].filter(Boolean).join(' '),
    action,
    sources,
    bodyHtml: str(row.body_html),
    readingMinutes: Number(row.reading_minutes) || 1,
    publishedAt: Number(row.published_at) || 0,
    updatedAt: Number(row.updated_at) || Number(row.published_at) || 0,
    authorName: publicAuthor(str(row.author_slug), str(row.author_name)).name,
    authorSlug: publicAuthor(str(row.author_slug), str(row.author_name)).slug,
    seoTitle: (row.seo_title as string | null) || null,
    canonicalUrl: (row.canonical_url as string | null) || null,
  };
}

const now = () => Math.floor(Date.now() / 1000);

async function db() {
  const { getDb, getEnv } = await import('./db');
  return { db: getDb(), mediaBase: getEnv().MEDIA_BASE };
}

async function staticGuides(): Promise<Guide[]> {
  const [{ guides }, { renderMarkdown }] = await Promise.all([
    import('../../scripts/preview/local-wisdom-seed.mjs'),
    import('./markdown.mjs'),
  ]);
  const t = Math.floor(Date.parse('2026-11-25T12:00:00+07:00') / 1000);
  return (guides as Row[]).map((g, i) => {
    const rendered = renderMarkdown(String(g.body));
    const city = guideCity(String(g.city));
    return mapGuide({
      id: i + 1, slug: g.slug, title: g.title, excerpt: g.excerpt, hero_r2_key: g.hero, hero_alt: g.heroAlt,
      published_at: t - Number(g.hoursAgo) * 3600, updated_at: t - Number(g.hoursAgo) * 3600,
      city_slug: g.city, province_slug: city?.province, place_name: g.name, location_label: g.location,
      budget_label: (g.budget as Row | undefined)?.label, budget_value: (g.budget as Row | undefined)?.value,
      category_slug: g.category, category_name: guideCategory(String(g.category))?.name,
      body_html: rendered.html, reading_minutes: rendered.minutes, hero_caption: g.caption, hero_credit: g.credit,
      hero_credit_url: g.creditUrl, sources_json: JSON.stringify(g.sources), facts_json: JSON.stringify(g.facts),
      map_query: g.mapQuery, action_label: (g.action as Row | undefined)?.label, action_url: (g.action as Row | undefined)?.url,
      gallery_json: JSON.stringify(g.gallery ?? []), author_slug: 'redaksi', author_name: 'Redaksi Bacaanku Network',
    });
  });
}

async function list(sql: string, binds: unknown[], filter: (g: Guide) => boolean): Promise<Guide[]> {
  if (IS_STATIC) return (await staticGuides()).filter(filter);
  const { db: d1, mediaBase } = await db();
  try {
    const { results } = await d1.prepare(sql).bind(...binds).all<Row>();
    return results.map((row) => mapGuide(row, mediaBase));
  } catch (error) {
    // Migrasi 0003 belum dijalankan → kolom lokal belum ada. Situs berita tetap jalan, daftar panduan kosong.
    console.error('guide-repo: query panduan gagal (migrasi 0003?)', error);
    return [];
  }
}

export const LIST_LIMIT = 60;

export function loadAllGuides(limit = LIST_LIMIT) {
  return list(sqlGuidesAll, [now(), limit], () => true).then((items) => items.slice(0, limit));
}
export function loadGuidesByCategory(category: string, limit = LIST_LIMIT) {
  return list(sqlGuidesByCategory, [category, now(), limit], (g) => g.category === category);
}
export function loadGuidesByCity(city: string, limit = LIST_LIMIT) {
  return list(sqlGuidesByCity, [city, now(), limit], (g) => g.citySlug === city);
}
export function loadGuidesByProvince(province: string, limit = LIST_LIMIT) {
  return list(sqlGuidesByProvince, [province, now(), limit], (g) => g.provinceSlug === province);
}

/** Artikel local wisdom penuh, atau null bila slug bukan panduan (biar alur berita lama yang menangani). */
export async function loadGuide(category: string, slug: string): Promise<Guide | null> {
  if (!isGuideCategory(category)) return null;
  if (IS_STATIC) return (await staticGuides()).find((g) => g.slug === slug && g.category === category) ?? null;
  const { db: d1, mediaBase } = await db();
  let row: Row | null = null;
  try {
    row = await d1.prepare(sqlGuideBySlug).bind(slug, now()).first<Row>();
  } catch (error) {
    console.error('guide-repo: query panduan gagal (migrasi 0003?)', error);
    return null;
  }
  if (!row || row.category_slug !== category) return null;
  return mapGuide(row, mediaBase);
}

/** Jumlah artikel terbit per kota × tipe (untuk menu Artikel, aturan noindex, dan sitemap). */
export async function loadCityCounts(): Promise<Map<string, Record<string, number>>> {
  const out = new Map<string, Record<string, number>>();
  const add = (city: string, category: string, n: number) => {
    const entry = out.get(city) ?? {};
    entry[category] = (entry[category] ?? 0) + n;
    entry._all = (entry._all ?? 0) + n;
    out.set(city, entry);
  };
  if (IS_STATIC) {
    for (const g of await staticGuides()) if (g.citySlug) add(g.citySlug, g.category, 1);
    return out;
  }
  const { db: d1 } = await db();
  try {
    const { results } = await d1.prepare(sqlGuideCityCounts).bind(now()).all<{ city: string; category: string; n: number }>();
    for (const row of results) add(row.city, row.category, Number(row.n));
  } catch (error) {
    console.error('guide-repo: hitung kota gagal (migrasi 0003?)', error);
  }
  return out;
}
