import type { APIRoute } from 'astro';

/**
 * URL indeks lama (Cloudflare Pages). Endpoint `.xml` memakai trailingSlash
 * `never`, jadi `/sitemap-index.xml` (tanpa garis miring) cocok apa adanya.
 * Pratinjau statis ikut di-prerender; produksi SSR mengembalikan 301 sungguhan.
 */
export const prerender = __BUILD_MODE__ === 'static';

export const GET: APIRoute = ({ redirect }) => redirect('/sitemap.xml', 301);
