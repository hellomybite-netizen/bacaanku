import type { APIRoute } from 'astro';

export const prerender = __BUILD_MODE__ === 'static';

export const GET: APIRoute = () => new Response(null, { status: 405, headers: { 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
  if (__BUILD_MODE__ === 'static') return new Response(null, { status: 404 });
  const { getEnv } = await import('../../../lib/db');
  const { csrfMatches, readSession } = await import('../../../lib/auth');
  const { renderMarkdown } = await import('../../../lib/markdown.mjs');
  const env = getEnv();
  const session = await readSession(request, env);
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const body = (await request.json().catch(() => null)) as { csrf?: string; markdown?: string } | null;
  if (!body || !(await csrfMatches(env, session, body.csrf || ''))) {
    return Response.json({ error: 'csrf' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  const { html } = renderMarkdown(String(body.markdown || '').slice(0, 200_000));
  return Response.json({ html }, { headers: { 'Cache-Control': 'no-store' } });
};
