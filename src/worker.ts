import { handle } from '@astrojs/cloudflare/handler';
import { publishDue } from './lib/schedule';

type CronContext = { waitUntil(promise: Promise<unknown>): void };

const HSTS_HEADER = 'max-age=31536000; includeSubDomains';

function withHsts(response: Response, isHttps: boolean): Response {
  if (!isHttps) return response;
  if (response.headers.get('Strict-Transport-Security') === HSTS_HEADER) return response;
  try {
    response.headers.set('Strict-Transport-Security', HSTS_HEADER);
    return response;
  } catch {
    const cloned = new Response(response.body, response);
    cloned.headers.set('Strict-Transport-Security', HSTS_HEADER);
    return cloned;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const cfVisitor = request.headers.get('cf-visitor');
    const isHttp =
      url.protocol === 'http:' ||
      forwardedProto === 'http' ||
      (cfVisitor?.includes('"scheme":"http"') ?? false);
    const isProductionHost =
      url.hostname === 'bacaankunetwork.com' || url.hostname === 'www.bacaankunetwork.com';

    if (isProductionHost && (isHttp || url.hostname === 'www.bacaankunetwork.com')) {
      url.protocol = 'https:';
      url.hostname = 'bacaankunetwork.com';
      const headers = new Headers({
        Location: url.toString(),
        'Cache-Control': 'private, no-store',
      });
      if (!isHttp) headers.set('Strict-Transport-Security', HSTS_HEADER);
      return new Response(null, { status: 301, headers });
    }

    if (request.method === 'GET' || request.method === 'HEAD') {
      if (url.pathname === '/privasi' || url.pathname === '/privasi/') {
        url.pathname = '/kebijakan-privasi/';
        return new Response(null, {
          status: 301,
          headers: {
            Location: url.toString(),
            'Cache-Control': 'public, max-age=3600',
            ...(!isHttp ? { 'Strict-Transport-Security': HSTS_HEADER } : {}),
          },
        });
      }
      if (
        url.pathname === '/rss' ||
        url.pathname === '/rss/' ||
        url.pathname === '/feed' ||
        url.pathname === '/feed/'
      ) {
        url.pathname = '/rss.xml';
        return new Response(null, {
          status: 301,
          headers: {
            Location: url.toString(),
            'Cache-Control': 'private, no-store',
            ...(!isHttp ? { 'Strict-Transport-Security': HSTS_HEADER } : {}),
          },
        });
      }
      if (url.pathname !== '/' && !url.pathname.endsWith('/') && !url.pathname.startsWith('/api/')) {
        const lastSegment = url.pathname.split('/').pop() || '';
        if (!lastSegment.includes('.')) {
          url.pathname += '/';
          return new Response(null, {
            status: 301,
            headers: {
              Location: url.toString(),
              'Cache-Control': 'public, max-age=3600',
              ...(!isHttp ? { 'Strict-Transport-Security': HSTS_HEADER } : {}),
            },
          });
        }
      }
    }

    const response = await handle(request, env, ctx);
    return withHsts(response, !isHttp);
  },
  scheduled(_controller: ScheduledController, env: Env, ctx: CronContext) {
    ctx.waitUntil(publishDue(env));
  },
};
