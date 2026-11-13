import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { applyResponseCache } from '../lib/cache-headers';
import { loadSitemapMonths } from '../lib/public';
import { xmlEscape } from '../utils/xml';

export const prerender = __BUILD_MODE__ === 'static';

export const GET: APIRoute = async (context) => {
  const months = await loadSitemapMonths();
  const locs = [`${SITE.url}/sitemap-halaman.xml`, ...months.map((period) => `${SITE.url}/sitemap-arsip/${period}.xml`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap><loc>${xmlEscape(loc)}</loc></sitemap>`).join('\n')}
</sitemapindex>
`;
  const response = new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  return applyResponseCache(response, context.cache, 'sitemap', ['sitemap']);
};
