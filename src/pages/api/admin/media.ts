import type { APIRoute } from 'astro';

export const prerender = __BUILD_MODE__ === 'static';

const noStore = { 'Cache-Control': 'no-store' };

/** Status unggah (untuk skrip & form): { enabled, maxBytes, maxSide, types }. Wajib login. */
export const GET: APIRoute = async ({ request }) => {
  if (__BUILD_MODE__ === 'static') return new Response(null, { status: 404 });
  const { getEnv } = await import('../../../lib/db');
  const { readSession } = await import('../../../lib/auth');
  const { MEDIA_MAX_BYTES, MEDIA_MAX_SIDE, MEDIA_TYPES, mediaEnabled } = await import('../../../lib/r2-media');
  const env = getEnv();
  if (!(await readSession(request, env))) return Response.json({ error: 'unauthorized' }, { status: 401, headers: noStore });
  return Response.json({ enabled: mediaEnabled(env), maxBytes: MEDIA_MAX_BYTES, maxSide: MEDIA_MAX_SIDE, types: MEDIA_TYPES }, { headers: noStore });
};

/**
 * Unggah satu gambar ke R2. multipart/form-data:
 *   file (wajib), csrf (atau header X-CSRF-Token), slug (opsional, untuk nama kunci), alt (opsional, dikembalikan).
 * 201 → { url, key, contentType, bytes, width, height, alt }
 */
export const POST: APIRoute = async ({ request }) => {
  if (__BUILD_MODE__ === 'static') return new Response(null, { status: 404 });
  const { getEnv } = await import('../../../lib/db');
  const { csrfMatches, readSession } = await import('../../../lib/auth');
  const { MEDIA_MAX_BYTES, storeUpload } = await import('../../../lib/r2-media');
  const env = getEnv();
  const session = await readSession(request, env);
  if (!session) return Response.json({ error: 'unauthorized', message: 'Masuk dulu ke /admin.' }, { status: 401, headers: noStore });
  if (!env.MEDIA) {
    return Response.json(
      { error: 'r2_unavailable', message: 'Unggah gambar belum aktif: penyimpanan R2 belum dinyalakan. Sementara pakai URL https:// atau path /media/….' },
      { status: 503, headers: { ...noStore, 'Retry-After': '86400' } },
    );
  }
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MEDIA_MAX_BYTES + 64 * 1024) {
    return Response.json({ error: 'too_large', message: 'Berkas lebih dari 5 MB.' }, { status: 413, headers: noStore });
  }
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('multipart/form-data')) {
    return Response.json({ error: 'bad_request', message: 'Kirim sebagai multipart/form-data dengan field "file".' }, { status: 400, headers: noStore });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: 'bad_request', message: 'Form tidak terbaca.' }, { status: 400, headers: noStore });
  }
  const token = String(form.get('csrf') || request.headers.get('x-csrf-token') || '');
  if (!(await csrfMatches(env, session, token))) {
    return Response.json({ error: 'csrf', message: 'Token csrf salah atau kosong. Ambil dari halaman /admin/artikel/baru/.' }, { status: 403, headers: noStore });
  }
  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ error: 'bad_request', message: 'Field "file" wajib berisi berkas gambar.' }, { status: 400, headers: noStore });
  }
  const result = await storeUpload(env, file, {
    name: String(form.get('slug') || '').trim(),
    alt: String(form.get('alt') || '').trim(),
    uploadedBy: session.slug,
  });
  if (!result.ok) return Response.json({ error: result.error, message: result.message }, { status: result.status, headers: noStore });
  const { ok: _ok, ...body } = result;
  return Response.json(body, { status: 201, headers: noStore });
};
