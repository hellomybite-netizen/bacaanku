import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { articlePath, absUrl } from '../utils/articles';
import { xmlEscape } from '../utils/xml';
import { applyResponseCache } from '../lib/cache-headers';
import { loadNewsEntries } from '../lib/public';

export const prerender = __BUILD_MODE__ === 'static';

export const GET: APIRoute = async (context) => {
  const items = await loadNewsEntries();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items
  .map(
    (article) => `  <url>
    <loc>${xmlEscape(absUrl(articlePath(article.category_slug, article.slug)))}</loc>
    <news:news>
      <news:publication><news:name>${xmlEscape(SITE.name)}</news:name><news:language>id</news:language></news:publication>
      <news:publication_date>${new Date(article.published_at * 1000).toISOString()}</news:publication_date>
      <news:title>${xmlEscape(article.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  const response = new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  return applyResponseCache(response, context.cache, 'feed', ['sitemap', 'feed']);
};
