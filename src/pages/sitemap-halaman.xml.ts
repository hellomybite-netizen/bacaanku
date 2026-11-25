import type { APIRoute } from 'astro';
import { SITE, categories } from '../config/site';
import { applyResponseCache } from '../lib/cache-headers';
import { IS_STATIC } from '../lib/mode';
import { loadSitemapPageMeta, loadSitemapRegions } from '../lib/public';
import { xmlEscape } from '../utils/xml';

export const prerender = IS_STATIC;

const BUILD_LASTMOD = new Date().toISOString();
const staticPages = ['/daerah/', '/arsip-berita/', '/tentang/', '/pedoman-media-siber/', '/kebijakan-privasi/', '/kontak/', '/redaksi/'];

function isoOrFallback(epoch: number | null | undefined, fallback: string): string {
  return epoch && Number.isFinite(epoch) ? new Date(epoch * 1000).toISOString() : fallback;
}

export const GET: APIRoute = async (context) => {
  const [meta, regionEntries] = await Promise.all([loadSitemapPageMeta(), loadSitemapRegions()]);
  const fallback = isoOrFallback(meta?.latestAt, BUILD_LASTMOD);
  const entries: { path: string; lastmod: string }[] = [
    { path: '/', lastmod: fallback },
    ...staticPages.map((path) => ({ path, lastmod: fallback })),
    ...categories.map((category) => ({
      path: `/${category.slug}/`,
      lastmod: isoOrFallback(meta?.categoriesLastMod.get(category.slug), fallback),
    })),
    ...(meta?.authors ?? []).map((author) => ({
      path: `/penulis/${author.slug}/`,
      lastmod: isoOrFallback(author.lastAt, fallback),
    })),
    // Halaman daerah/kota yang punya ulasan nyata (bukan CONTOH).
    ...regionEntries.map((entry) => ({ path: entry.path, lastmod: isoOrFallback(entry.lastAt, fallback) })),
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
