// Unggah gambar ke R2 (binding `MEDIA`, bucket `bacaanku-media`) dan sajikan lewat Worker di /media/r2/…
// Workers tidak bisa menjalankan sharp: kompres/konversi WebP dilakukan di browser (form /admin).
// Server hanya memvalidasi tipe (magic bytes), ukuran, dan dimensi.

export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
export const MEDIA_MAX_SIDE = 2400;
export const MEDIA_PREFIX = '/media/r2/';
export const MEDIA_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/avif'] as const;
const EXT: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/avif': 'avif' };

export function mediaEnabled(env: Env): boolean {
  return Boolean(env.MEDIA);
}

/** Kenali tipe dari isi berkas, bukan dari nama/Content-Type kiriman. */
export function sniffImageType(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  if (b.length >= 12) {
    const box = String.fromCharCode(b[4], b[5], b[6], b[7]);
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (box === 'ftyp' && (brand === 'avif' || brand === 'avis')) return 'image/avif';
  }
  return null;
}

/** Lebar × tinggi dari header WebP/JPEG/PNG. null bila tidak terbaca (tidak memblokir). */
export function imageSize(bytes: Uint8Array, type: string): { width: number; height: number } | null {
  const b = bytes;
  const u16le = (i: number) => b[i] | (b[i + 1] << 8);
  const u24le = (i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
  const u16be = (i: number) => (b[i] << 8) | b[i + 1];
  const u32be = (i: number) => ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3];
  try {
    if (type === 'image/png' && b.length >= 24) return { width: u32be(16), height: u32be(20) };
    if (type === 'image/webp' && b.length >= 30) {
      const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
      if (chunk === 'VP8X') return { width: u24le(24) + 1, height: u24le(27) + 1 };
      if (chunk === 'VP8 ') return { width: u16le(26) & 0x3fff, height: u16le(28) & 0x3fff };
      if (chunk === 'VP8L') {
        const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
    }
    if (type === 'image/jpeg') {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
        const len = u16be(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { width: u16be(i + 7), height: u16be(i + 5) };
        }
        i += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function slugPart(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

async function shortHash(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(digest.slice(0, 5), (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Kunci R2: articles/2026/11/{slug-atau-nama-berkas}-{hash10}.webp — unik per isi, aman di-cache selamanya. */
export async function mediaKey(bytes: Uint8Array<ArrayBuffer>, type: string, name: string, now = new Date()): Promise<string> {
  const wib = new Date(now.getTime() + 7 * 3600 * 1000);
  const y = wib.getUTCFullYear();
  const m = String(wib.getUTCMonth() + 1).padStart(2, '0');
  const base = slugPart(name) || 'gambar';
  return `articles/${y}/${m}/${base}-${await shortHash(bytes)}.${EXT[type]}`;
}

export function mediaUrl(key: string, env: Env): string {
  const base = (env.MEDIA_BASE || '').trim().replace(/\/$/, '');
  return base ? `${base}/${key}` : `${MEDIA_PREFIX}${key}`;
}

const KEY_PATTERN = /^articles\/\d{4}\/\d{2}\/[a-z0-9-]+\.(webp|jpg|png|avif)$/;

/** GET/HEAD /media/r2/{key} — dipanggil dari src/worker.ts sebelum Astro. */
export async function serveMedia(request: Request, env: Env, pathname: string): Promise<Response> {
  const key = decodeURIComponent(pathname.slice(MEDIA_PREFIX.length));
  const notFound = () => new Response('Tidak ditemukan', { status: 404, headers: { 'Cache-Control': 'public, max-age=60', 'X-Content-Type-Options': 'nosniff' } });
  if (!env.MEDIA || !KEY_PATTERN.test(key)) return notFound();
  const ifNoneMatch = request.headers.get('if-none-match');
  const object = request.method === 'HEAD' ? await env.MEDIA.head(key) : await env.MEDIA.get(key, { onlyIf: request.headers });
  if (!object) return notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Access-Control-Allow-Origin', '*');
  if (!headers.get('Content-Type')) headers.set('Content-Type', 'application/octet-stream');
  const hasBody = 'body' in object && (object as R2ObjectBody).body;
  if (request.method === 'HEAD') {
    headers.set('Content-Length', String(object.size));
    return new Response(null, { status: 200, headers });
  }
  if (!hasBody) {
    // onlyIf tidak terpenuhi (If-None-Match cocok) → 304.
    return new Response(null, { status: ifNoneMatch ? 304 : 412, headers });
  }
  return new Response((object as R2ObjectBody).body, { status: 200, headers });
}

export type UploadOk = { ok: true; url: string; key: string; contentType: string; bytes: number; width: number | null; height: number | null; alt: string };
export type UploadErr = { ok: false; status: number; error: string; message: string };

/** Validasi + simpan satu berkas. `name` = slug artikel atau nama berkas asli (untuk kunci). */
export async function storeUpload(env: Env, file: File, opts: { name: string; alt: string; uploadedBy: string }): Promise<UploadOk | UploadErr> {
  if (!env.MEDIA) return { ok: false, status: 503, error: 'r2_unavailable', message: 'Unggah gambar belum aktif: penyimpanan R2 belum dinyalakan. Sementara pakai URL https:// atau path /media/….' };
  if (file.size === 0) return { ok: false, status: 400, error: 'empty', message: 'Berkas kosong.' };
  if (file.size > MEDIA_MAX_BYTES) return { ok: false, status: 413, error: 'too_large', message: 'Berkas lebih dari 5 MB. Perkecil ke ≤1.600 px dan simpan sebagai WebP/JPEG kualitas ±80%.' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, status: 415, error: 'unsupported_type', message: 'Format tidak didukung. Pakai WebP, JPEG, PNG, atau AVIF.' };
  const size = imageSize(bytes, type);
  if (size && (size.width > MEDIA_MAX_SIDE || size.height > MEDIA_MAX_SIDE)) {
    return { ok: false, status: 400, error: 'too_big_dimensions', message: `Gambar ${size.width}×${size.height} px terlalu besar. Sisi terpanjang maksimal ${MEDIA_MAX_SIDE.toLocaleString('id-ID')} px (disarankan 1.600 px).` };
  }
  if (opts.alt && opts.alt.length > 200) return { ok: false, status: 400, error: 'alt_too_long', message: 'Teks alternatif maksimal 200 karakter.' };
  const key = await mediaKey(bytes, type, opts.name || file.name || 'gambar');
  await env.MEDIA.put(key, bytes, {
    httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { uploadedBy: opts.uploadedBy, originalName: encodeURIComponent((file.name || '').slice(0, 120)), ...(opts.alt ? { alt: encodeURIComponent(opts.alt.slice(0, 200)) } : {}) },
  });
  return { ok: true, url: mediaUrl(key, env), key, contentType: type, bytes: bytes.length, width: size?.width ?? null, height: size?.height ?? null, alt: opts.alt };
}
