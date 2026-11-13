import type { APIRoute } from 'astro';
import { SITE, categories } from '../../config/site';
import { feed } from '../../utils/feed';
import { applyResponseCache } from '../../lib/cache-headers';
import { loadFeed } from '../../lib/public';

export const prerender = __BUILD_MODE__ === 'static';

export function getStaticPaths() {
  if (__BUILD_MODE__ !== 'static') return [];
  return categories.map((category) => ({ params: { category: category.slug } }));
}

export const GET: APIRoute = async (context) => {
  const slug = context.params.category ?? '';
  const data = await loadFeed(slug);
  if (!data) return new Response('Kategori tidak ditemukan', { status: 404 });
  const response = await feed(data.items, `${SITE.name} — ${data.titleSuffix}`, data.description);
  return applyResponseCache(response, context.cache, 'feed', ['feed', `cat-${slug}`]);
};
