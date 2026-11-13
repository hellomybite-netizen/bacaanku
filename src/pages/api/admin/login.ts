import type { APIRoute } from 'astro';

export const prerender = __BUILD_MODE__ === 'static';

export const GET: APIRoute = () => new Response('Gunakan formulir masuk.', { status: 405, headers: { 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request, url }) => {
  if (__BUILD_MODE__ === 'static') return new Response(null, { status: 404 });
  const { getEnv } = await import('../../../lib/db');
  const { checkPassword, createSessionCookie, editorBySlug } = await import('../../../lib/auth');
  const env = getEnv();
  const form = await request.formData();
  const slug = editorBySlug(String(form.get('slug') || ''));
  const password = String(form.get('password') || '');
  const secure = url.protocol === 'https:';
  if (!slug || !checkPassword(env, password)) {
    return new Response(null, { status: 303, headers: { Location: '/admin/login/?salah=1', 'Cache-Control': 'no-store' } });
  }
  const cookie = await createSessionCookie(env, slug.slug, secure);
  if (!cookie) return new Response('ADMIN_TOKEN atau ADMIN_PASSWORD belum diisi.', { status: 503 });
  return new Response(null, { status: 303, headers: { Location: '/admin/', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' } });
};
