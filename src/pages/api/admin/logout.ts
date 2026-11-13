import type { APIRoute } from 'astro';

export const prerender = __BUILD_MODE__ === 'static';

export const GET: APIRoute = () => new Response(null, { status: 405 });

export const POST: APIRoute = async ({ url }) => {
  if (__BUILD_MODE__ === 'static') return new Response(null, { status: 404 });
  const { clearSessionCookie } = await import('../../../lib/auth');
  const secure = url.protocol === 'https:';
  return new Response(null, {
    status: 303,
    headers: { Location: '/admin/login/', 'Set-Cookie': clearSessionCookie(secure), 'Cache-Control': 'no-store' },
  });
};
