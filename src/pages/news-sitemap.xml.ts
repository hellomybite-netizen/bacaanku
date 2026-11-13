import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { getArticles, articleUrl, absUrl } from '../utils/articles';

/**
 * Google News sitemap: hanya artikel 48 jam terakhir (dihitung saat build).
 * Karena situs statis, lakukan build ulang berkala (mis. tiap publikasi / cron) agar daftar ini segar.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const items = (await getArticles()).filter((a) => a.data.publishDate.valueOf() >= cutoff).slice(0, 1000);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items
  .map(
    (a) => `  <url>
    <loc>${absUrl(articleUrl(a))}</loc>
    <news:news>
      <news:publication><news:name>${esc(SITE.name)}</news:name><news:language>id</news:language></news:publication>
      <news:publication_date>${a.data.publishDate.toISOString()}</news:publication_date>
      <news:title>${esc(a.data.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
