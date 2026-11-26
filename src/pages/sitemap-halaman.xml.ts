import type { APIRoute } from 'astro';
import { SITE, categories } from '../config/site';
import { applyResponseCache } from '../lib/cache-headers';
import { IS_STATIC } from '../lib/mode';
import { loadSitemapPageMeta } from '../lib/public';
import { xmlEscape } from '../utils/xml';
import { loadCityCounts } from '../lib/guide-repo';
import { guideCategories, guideCity, MIN_INDEXABLE } from '../lib/local-guide';

/** Halaman daftar local wisdom yang layak diindeks (aturan sama dengan noindex di halamannya). */
async function guideListPaths(): Promise<string[]> {
  let counts: Map<string, Record<string, number>>;
  try {
    counts = await loadCityCounts();
  } catch {
    return []; // migrasi 0003 belum jalan → sitemap tetap berfungsi seperti sebelumnya
  }
  if (!counts.size) return [];
  const paths = new Set<string>(['/artikel/', '/daerah/']);
  const perType = new Map<string, number>();
  const perProvince = new Map<string, number>();
  for (const [slug, entry] of counts) {
    const city = guideCity(slug);
    if (!city) continue;
    perProvince.set(city.province, (perProvince.get(city.province) ?? 0) + (entry._all ?? 0));
    if ((entry._all ?? 0) >= MIN_INDEXABLE) paths.add(`/artikel/${slug}/`);
    for (const type of guideCategories) {
      const n = entry[type.slug] ?? 0;
      perType.set(type.slug, (perType.get(type.slug) ?? 0) + n);
      if (n >= MIN_INDEXABLE && n < (entry._all ?? 0)) paths.add(`/artikel/${slug}/${type.slug}/`);
    }
  }
  for (const [slug, n] of perType) if (n > 0) paths.add(`/${slug}/`);
  for (const [slug, n] of perProvince) if (n >= MIN_INDEXABLE) paths.add(`/daerah/${slug}/`);
  return [...paths];
}

export const prerender = IS_STATIC;

const BUILD_LASTMOD = new Date().toISOString();
const staticPages = ['/tentang/', '/pedoman-media-siber/', '/kebijakan-privasi/', '/kontak/', '/redaksi/', '/arsip-berita/', '/kredit-foto/'];

function isoOrFallback(epoch: number | null | undefined, fallback: string): string {
  return epoch && Number.isFinite(epoch) ? new Date(epoch * 1000).toISOString() : fallback;
}

export const GET: APIRoute = async (context) => {
  const meta = await loadSitemapPageMeta();
  const fallback = isoOrFallback(meta?.latestAt, BUILD_LASTMOD);
  const entries: { path: string; lastmod: string }[] = [
    { path: '/', lastmod: fallback },
    ...staticPages.map((path) => ({ path, lastmod: fallback })),
    ...categories.map((category) => ({
      path: `/${category.slug}/`,
      lastmod: isoOrFallback(meta?.categoriesLastMod.get(category.slug), fallback),
    })),
    ...(await guideListPaths())
      .filter((path) => !categories.some((category) => path === `/${category.slug}/`))
      .map((path) => ({ path, lastmod: fallback })),
    ...(meta?.authors ?? []).map((author) => ({
      path: `/penulis/${author.slug}/`,
      lastmod: isoOrFallback(author.lastAt, fallback),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((entry) => `  <url><loc>${xmlEscape(new URL(entry.path, SITE.url).href)}</loc><lastmod>${entry.lastmod}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
  const response = new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  return applyResponseCache(response, context.cache, 'sitemap', ['sitemap']);
};
