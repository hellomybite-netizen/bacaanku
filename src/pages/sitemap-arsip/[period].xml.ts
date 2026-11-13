import type { APIRoute } from 'astro';
import { SITE } from '../../config/site';
import { articlePath } from '../../utils/articles';
import { xmlEscape } from '../../utils/xml';
import { applyResponseCache } from '../../lib/cache-headers';
import { loadMonthEntries, loadSitemapMonths } from '../../lib/public';

export const prerender = __BUILD_MODE__ === 'static';

export async function getStaticPaths() {
  if (__BUILD_MODE__ !== 'static') return [];
  const months = await loadSitemapMonths();
  return months.map((period) => ({ params: { period } }));
}

export const GET: APIRoute = async (context) => {
  const period = context.params.period ?? '';
  const rows = await loadMonthEntries(period);
  if (!rows) return new Response('Periode tidak valid', { status: 404 });
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows
  .map((row) => {
    const lastmod = new Date((row.updated_at || row.published_at) * 1000).toISOString();
    return `  <url><loc>${xmlEscape(new URL(articlePath(row.category_slug, row.slug), SITE.url).href)}</loc><lastmod>${lastmod}</lastmod></url>`;
  })
  .join('\n')}
</urlset>
`;
  const response = new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  return applyResponseCache(response, context.cache, 'sitemap', ['sitemap']);
};
