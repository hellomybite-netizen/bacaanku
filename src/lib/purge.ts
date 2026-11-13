import { SITE } from '../config/site';

export type PurgeTarget = { tags: string[]; urls: string[] };

export function purgeForArticle(input: {
  id: number;
  categorySlug: string;
  slug: string;
  authorSlug: string;
  tagSlugs: string[];
}): PurgeTarget {
  const origin = SITE.url.replace(/\/$/, '');
  const tags = [
    'home',
    'feed',
    'sitemap',
    'search',
    `article-${input.id}`,
    `cat-${input.categorySlug}`,
    `author-${input.authorSlug}`,
    ...input.tagSlugs.map((slug) => `tag-${slug}`),
  ];
  const urls = [
    `${origin}/`,
    `${origin}/${input.categorySlug}/`,
    `${origin}/${input.categorySlug}/${input.slug}/`,
    `${origin}/penulis/${input.authorSlug}/`,
    `${origin}/rss.xml`,
    `${origin}/rss/${input.categorySlug}.xml`,
    `${origin}/news-sitemap.xml`,
    `${origin}/sitemap.xml`,
    ...input.tagSlugs.map((slug) => `${origin}/tag/${slug}/`),
  ];
  return { tags, urls };
}

/** Purge tag Workers Cache (jika aktif) dan URL lewat Cache API + zona Cloudflare. */
export async function purgeContent(env: Env, target: PurgeTarget): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  try {
    const { cache } = await import('cloudflare:workers');
    if (target.tags.length) jobs.push(Promise.resolve(cache.purge({ tags: target.tags })));
  } catch (error) {
    console.error('cache.purge tidak tersedia', error);
  }
  const cacheStore = (globalThis.caches as { default?: { delete(request: string): Promise<boolean> } } | undefined)?.default;
  if (cacheStore) {
    for (const url of target.urls) jobs.push(cacheStore.delete(url).catch(() => false));
  }
  if (env.CF_PURGE_TOKEN && env.CF_ZONE_ID && target.urls.length) {
    jobs.push(
      fetch(`https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/purge_cache`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.CF_PURGE_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: target.urls.slice(0, 30) }),
      }),
    );
  }
  await Promise.all(jobs);
}
