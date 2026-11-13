type Kind = 'home' | 'list' | 'article' | 'feed' | 'sitemap' | 'search';

const EDGE: Record<Kind, number> = { home: 600, list: 600, article: 86400, feed: 900, sitemap: 86400, search: 300 };
const BROWSER: Record<Kind, number> = { home: 60, list: 60, article: 300, feed: 300, sitemap: 3600, search: 0 };
const SWR: Record<Kind, number> = { home: 300, list: 300, article: 600, feed: 300, sitemap: 3600, search: 60 };

type CacheApi = { enabled?: boolean; set: (input: object | false) => void };

function browserCacheControl(kind: Kind): string {
  const edge = EDGE[kind];
  const browser = BROWSER[kind];
  const swr = SWR[kind];
  return `public, max-age=${browser}, s-maxage=${edge}, stale-while-revalidate=${swr}`;
}

export function applyPublicCache(astro: { cache?: CacheApi; response: { headers: Headers } }, kind: Kind, tags: string[]) {
  const edge = EDGE[kind];
  const swr = SWR[kind];
  try {
    astro.cache?.set({ maxAge: edge, swr, tags });
  } catch {
    /* pratinjau statis tidak punya provider cache */
  }
  astro.response.headers.set('Cache-Control', browserCacheControl(kind));
  if (!astro.cache?.enabled) astro.response.headers.set('Cache-Tag', tags.join(','));
}

export function applyResponseCache(response: Response, cache: CacheApi | undefined, kind: Kind, tags: string[]) {
  try {
    cache?.set({ maxAge: EDGE[kind], swr: SWR[kind], tags });
  } catch {
    /* abaikan */
  }
  response.headers.set('Cache-Control', browserCacheControl(kind));
  response.headers.set('Content-Type', response.headers.get('Content-Type') || 'application/xml; charset=utf-8');
  if (!cache?.enabled) response.headers.set('Cache-Tag', tags.join(','));
  return response;
}
