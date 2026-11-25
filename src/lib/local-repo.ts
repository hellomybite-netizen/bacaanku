/**
 * Query D1 untuk niche local wisdom (beranda, daerah, kota, kotak info ulasan).
 *
 * AMAN SEBELUM MIGRASI: kolom baru (docs/migrations/0003_local_wisdom.sql) belum ada di D1 produksi.
 * Setiap query di sini dibungkus try/catch → kalau kolom/kategori belum ada, halaman tetap tampil
 * (kosong + noindex), dan query lama (berita, admin, API terbit) tidak tersentuh sama sekali.
 */
import { categories, citySlug, getRegion, localCategorySlugs } from '../config/site';
import { resolveHero } from './media';
import { formatPrice } from './local';
import type { ArticleCard, ReviewInfo } from './content-types';

const now = () => Math.floor(Date.now() / 1000);

const localCardSelect = `
  a.id, a.slug, a.title, a.excerpt,
  a.hero_r2_key, a.hero_width, a.hero_height, a.hero_alt,
  a.published_at, a.is_headline,
  c.slug AS category_slug, c.name AS category_name,
  a.province_slug, a.city_name, a.city_slug, a.rating,
  a.price_min, a.price_max, a.price_unit, a.price_note, a.is_sample
`;

type LocalRow = {
  id: number; slug: string; title: string; excerpt: string;
  hero_r2_key: string | null; hero_width: number | null; hero_height: number | null; hero_alt: string;
  published_at: number; is_headline: number; category_slug: string; category_name: string;
  province_slug: string | null; city_name: string | null; city_slug: string | null; rating: number | null;
  price_min: number | null; price_max: number | null; price_unit: string | null; price_note: string | null;
  is_sample: number | null;
};

function mapLocal(row: LocalRow, mediaBase?: string): ArticleCard {
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
    daerahSlug: row.province_slug ?? undefined,
    daerahName: row.province_slug ? getRegion(row.province_slug)?.name ?? row.province_slug : undefined,
    kota: row.city_name ?? undefined,
    kotaSlug: row.city_slug ?? undefined,
    rating: row.rating ?? undefined,
    priceRange: formatPrice(row.price_min, row.price_max, row.price_unit, row.price_note),
    isSample: row.is_sample === 1,
  };
}

async function safe<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    // "no such column" sebelum migrasi 0003 → tampilkan kosong, jangan 500.
    console.warn('local-repo fallback:', (error as Error)?.message);
    return fallback;
  }
}

const localIn = localCategorySlugs.map(() => '?').join(',');

export async function localHome(db: D1Database, mediaBase?: string) {
  return safe({ latest: [] as ArticleCard[], byCategory: [] as { slug: string; items: ArticleCard[] }[], regionCounts: {} as Record<string, number> }, async () => {
    const stamp = now();
    const [latest, ...rest] = await db.batch<LocalRow>([
      db.prepare(`SELECT ${localCardSelect} FROM articles a JOIN categories c ON c.id = a.category_id
        WHERE c.slug IN (${localIn}) AND a.status = 'published' AND a.published_at <= ?
        ORDER BY a.published_at DESC LIMIT 6`).bind(...localCategorySlugs, stamp),
      ...localCategorySlugs.map((slug) =>
        db.prepare(`SELECT ${localCardSelect} FROM articles a JOIN categories c ON c.id = a.category_id
          WHERE c.slug = ? AND a.status = 'published' AND a.published_at <= ?
          ORDER BY a.published_at DESC LIMIT 3`).bind(slug, stamp),
      ),
      db.prepare(`SELECT province_slug AS slug, COUNT(*) AS n, 0 AS x FROM articles
        WHERE province_slug IS NOT NULL AND status = 'published' AND published_at <= ?
        GROUP BY province_slug`).bind(stamp) as unknown as D1PreparedStatement,
    ]);
    const countsRows = rest.pop() as unknown as D1Result<{ slug: string; n: number }>;
    const regionCounts: Record<string, number> = {};
    for (const row of countsRows.results) regionCounts[row.slug] = row.n;
    return {
      latest: latest.results.map((row) => mapLocal(row, mediaBase)),
      byCategory: localCategorySlugs.map((slug, i) => ({ slug, items: rest[i].results.map((row) => mapLocal(row, mediaBase)) })),
      regionCounts,
    };
  });
}

export async function regionListing(
  db: D1Database,
  regionSlug: string,
  opts: { categorySlug?: string | null; citySlug?: string | null },
  mediaBase?: string,
) {
  const empty = { items: [] as ArticleCard[], counts: {} as Record<string, number>, cities: [] as { name: string; slug: string; count: number }[] };
  return safe(empty, async () => {
    const stamp = now();
    const cityClause = opts.citySlug ? 'AND a.city_slug = ?' : '';
    const catClause = opts.categorySlug ? 'AND c.slug = ?' : '';
    const binds: unknown[] = [regionSlug];
    if (opts.citySlug) binds.push(opts.citySlug);
    binds.push(stamp);
    if (opts.categorySlug) binds.push(opts.categorySlug);
    const [items, counts, cities] = await db.batch<Record<string, unknown>>([
      db.prepare(`SELECT ${localCardSelect} FROM articles a JOIN categories c ON c.id = a.category_id
        WHERE a.province_slug = ? ${cityClause} AND a.status = 'published' AND a.published_at <= ? ${catClause}
        ORDER BY a.published_at DESC LIMIT 48`).bind(...binds),
      db.prepare(`SELECT c.slug AS slug, COUNT(*) AS n FROM articles a JOIN categories c ON c.id = a.category_id
        WHERE a.province_slug = ? ${cityClause} AND a.status = 'published' AND a.published_at <= ?
        GROUP BY c.slug`).bind(...binds.slice(0, opts.citySlug ? 3 : 2)),
      db.prepare(`SELECT a.city_slug AS slug, MAX(a.city_name) AS name, COUNT(*) AS n FROM articles a
        WHERE a.province_slug = ? AND a.city_slug IS NOT NULL AND a.status = 'published' AND a.published_at <= ?
        GROUP BY a.city_slug ORDER BY n DESC`).bind(regionSlug, stamp),
    ]);
    const countMap: Record<string, number> = {};
    for (const row of counts.results as { slug: string; n: number }[]) countMap[row.slug] = row.n;
    return {
      items: (items.results as LocalRow[]).map((row) => mapLocal(row, mediaBase)),
      counts: countMap,
      cities: (cities.results as { slug: string; name: string; n: number }[]).map((row) => ({ slug: row.slug, name: row.name, count: row.n })),
    };
  });
}

export async function categoryRegionCounts(db: D1Database, categorySlug: string): Promise<Record<string, number>> {
  return safe({}, async () => {
    const { results } = await db
      .prepare(`SELECT a.province_slug AS slug, COUNT(*) AS n FROM articles a JOIN categories c ON c.id = a.category_id
        WHERE a.province_slug IS NOT NULL AND c.slug = ? AND a.status = 'published' AND a.published_at <= ?
        GROUP BY a.province_slug`)
      .bind(categorySlug, now())
      .all<{ slug: string; n: number }>();
    return Object.fromEntries(results.map((row) => [row.slug, row.n]));
  });
}

/** Tambahan untuk kartu kategori lokal (kota + rating) — dipanggil setelah query kategori lama. */
export async function decorateCards(db: D1Database, cards: ArticleCard[]): Promise<ArticleCard[]> {
  if (!cards.length) return cards;
  return safe(cards, async () => {
    const ids = cards.map((card) => card.id);
    const { results } = await db
      .prepare(`SELECT id, province_slug, city_name, city_slug, rating, price_min, price_max, price_unit, price_note, is_sample
        FROM articles WHERE id IN (${ids.map(() => '?').join(',')})`)
      .bind(...ids)
      .all<LocalRow>();
    const byId = new Map(results.map((row) => [row.id, row]));
    return cards.map((card) => {
      const row = byId.get(card.id);
      if (!row) return card;
      return {
        ...card,
        daerahSlug: row.province_slug ?? undefined,
        daerahName: row.province_slug ? getRegion(row.province_slug)?.name ?? row.province_slug : undefined,
        kota: row.city_name ?? undefined,
        kotaSlug: row.city_slug ?? undefined,
        rating: row.rating ?? undefined,
        priceRange: formatPrice(row.price_min, row.price_max, row.price_unit, row.price_note),
        isSample: row.is_sample === 1,
      };
    });
  });
}

type ReviewRow = {
  province_slug: string | null; city_name: string | null; city_slug: string | null;
  place_name: string | null; place_type: string | null; address: string | null;
  latitude: number | null; longitude: number | null; maps_url: string | null; phone: string | null; website: string | null;
  price_min: number | null; price_max: number | null; price_unit: string | null; price_note: string | null;
  opening_hours: string | null; rating: number | null; facilities_json: string | null; visited_at: number | null; is_sample: number | null;
};

/** Kotak info + lokasi satu artikel. null jika artikel tidak punya data lokasi (berita lama) atau sebelum migrasi. */
export async function articlePlace(db: D1Database, id: number) {
  return safe(null, async () => {
    const row = await db
      .prepare(`SELECT province_slug, city_name, city_slug, place_name, place_type, address, latitude, longitude, maps_url,
        phone, website, price_min, price_max, price_unit, price_note, opening_hours, rating, facilities_json, visited_at, is_sample
        FROM articles WHERE id = ?`)
      .bind(id)
      .first<ReviewRow>();
    if (!row || (!row.province_slug && !row.address)) return null;
    let facilities: string[] = [];
    try {
      const parsed = row.facilities_json ? JSON.parse(row.facilities_json) : [];
      if (Array.isArray(parsed)) facilities = parsed.map(String);
    } catch {
      facilities = [];
    }
    const review: ReviewInfo | undefined = row.address
      ? {
          placeName: row.place_name ?? undefined,
          placeType: row.place_type ?? undefined,
          priceRange: formatPrice(row.price_min, row.price_max, row.price_unit, row.price_note),
          priceMin: row.price_min ?? undefined,
          priceMax: row.price_max ?? undefined,
          priceUnit: row.price_unit ?? undefined,
          address: row.address,
          rating: row.rating ?? undefined,
          openingHours: row.opening_hours ?? undefined,
          mapUrl: row.maps_url ?? undefined,
          latitude: row.latitude ?? undefined,
          longitude: row.longitude ?? undefined,
          phone: row.phone ?? undefined,
          website: row.website ?? undefined,
          facilities,
          visitedAt: row.visited_at ?? undefined,
        }
      : undefined;
    return {
      daerahSlug: row.province_slug ?? undefined,
      daerahName: row.province_slug ? getRegion(row.province_slug)?.name ?? row.province_slug : undefined,
      kota: row.city_name ?? undefined,
      kotaSlug: row.city_slug ?? (row.city_name ? citySlug(row.city_name) : undefined),
      isSample: row.is_sample === 1,
      review,
    };
  });
}

export const LOCAL_CATEGORY_META = categories.filter((c) => c.group === 'lokal');

/** Jumlah artikel terbit per kategori (halaman /arsip-berita/). */
export async function categoryCounts(db: D1Database): Promise<Record<string, number>> {
  return safe({}, async () => {
    const { results } = await db
      .prepare(`SELECT c.slug AS slug, COUNT(*) AS n FROM articles a JOIN categories c ON c.id = a.category_id
        WHERE a.status = 'published' AND a.published_at <= ? GROUP BY c.slug`)
      .bind(now())
      .all<{ slug: string; n: number }>();
    return Object.fromEntries(results.map((row) => [row.slug, row.n]));
  });
}

/**
 * URL halaman daerah untuk sitemap: hanya yang punya ulasan NYATA (is_sample = 0).
 * Halaman kosong/CONTOH tetap noindex dan tidak masuk sitemap.
 */
export async function sitemapRegionEntries(db: D1Database): Promise<{ path: string; lastAt: number }[]> {
  return safe([], async () => {
    const { results } = await db
      .prepare(`SELECT a.province_slug AS p, a.city_slug AS k, c.slug AS c, MAX(a.published_at) AS last
        FROM articles a JOIN categories c ON c.id = a.category_id
        WHERE a.province_slug IS NOT NULL AND a.status = 'published' AND a.published_at <= ? AND COALESCE(a.is_sample, 0) = 0
        GROUP BY a.province_slug, a.city_slug, c.slug`)
      .bind(now())
      .all<{ p: string; k: string | null; c: string; last: number }>();
    const out = new Map<string, number>();
    const add = (path: string, last: number) => out.set(path, Math.max(out.get(path) ?? 0, last));
    for (const row of results) {
      if (!getRegion(row.p) || !localCategorySlugs.includes(row.c)) continue;
      add(`/daerah/${row.p}/`, row.last);
      add(`/daerah/${row.p}/${row.c}/`, row.last);
      if (row.k) {
        add(`/daerah/${row.p}/${row.k}/`, row.last);
        add(`/daerah/${row.p}/${row.k}/${row.c}/`, row.last);
      }
    }
    return [...out.entries()].map(([path, lastAt]) => ({ path, lastAt }));
  });
}
