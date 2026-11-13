import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { feed } from '../utils/feed';
import { applyResponseCache } from '../lib/cache-headers';
import { loadFeed } from '../lib/public';

export const prerender = __BUILD_MODE__ === 'static';

export const GET: APIRoute = async (context) => {
  const data = await loadFeed(null);
  const response = await feed(data?.items ?? [], `${SITE.name} — Berita Terkini`, SITE.description);
  return applyResponseCache(response, context.cache, 'feed', ['feed']);
};
