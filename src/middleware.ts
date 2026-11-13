import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isAdmin && context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    const origin = context.request.headers.get('origin');
    if (!origin || origin !== context.url.origin) {
      return new Response('Permintaan ditolak (origin).', {
        status: 403,
        headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }
  }
  if (isAdmin) context.cache?.set?.(false);
  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isAdmin) {
    response.headers.set('Cache-Control', 'no-store, private');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});
