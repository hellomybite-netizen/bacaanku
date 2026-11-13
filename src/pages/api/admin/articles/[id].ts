import type { APIRoute } from 'astro';

export const prerender = __BUILD_MODE__ === 'static';

export function getStaticPaths() {
  return [];
}

export const GET: APIRoute = () => new Response(null, { status: 405, headers: { 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async (context) => {
  if (__BUILD_MODE__ === 'static') return new Response(null, { status: 404 });
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: 'id' }, { status: 400 });
  const { getEnv } = await import('../../../../lib/db');
  const { readSession } = await import('../../../../lib/auth');
  const { handleArticlePost } = await import('../../../../lib/admin-save');
  const env = getEnv();
  const session = await readSession(context.request, env);
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const result = await handleArticlePost(context.request, {
    id,
    session,
    waitUntil: (promise) => context.locals.cfContext.waitUntil(promise),
  });
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  return Response.json({ id: result.id, redirect: result.redirect }, { headers: { 'Cache-Control': 'no-store' } });
};
