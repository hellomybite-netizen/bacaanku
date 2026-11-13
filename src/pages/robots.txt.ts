import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/

Sitemap: ${SITE.url}/sitemap.xml
Sitemap: ${SITE.url}/news-sitemap.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
