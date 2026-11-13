import type { APIRoute } from 'astro';
import { SITE, categories } from '../config/site';
import { xmlEscape } from '../utils/xml';

export const prerender = true;

const paths = ['/', '/tentang/', '/pedoman-media-siber/', '/kebijakan-privasi/', '/kontak/', '/redaksi/', ...categories.map((category) => `/${category.slug}/`)];

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${xmlEscape(new URL(path, SITE.url).href)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
