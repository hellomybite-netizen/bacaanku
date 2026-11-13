export const EDITORS = [
  { slug: 'rizal', name: 'Rizal' },
  { slug: 'jenny', name: 'Jenny' },
  { slug: 'rere', name: 'Rere' },
  { slug: 'redaksi', name: 'Redaksi' },
] as const;

export type EditorSlug = (typeof EDITORS)[number]['slug'];

export type Session = {
  slug: EditorSlug;
  name: string;
  email?: string;
  csrf: string;
  exp: number;
};

const COOKIE = 'bk_session';
const MAX_AGE = 60 * 60 * 12;

export function authConfig(env: Env) {
  return {
    access: Boolean(env.CF_ACCESS_TEAM_DOMAIN && env.CF_ACCESS_AUD),
    password: Boolean(env.ADMIN_PASSWORD),
  };
}

function signingKey(env: Env): string | null {
  return env.ADMIN_TOKEN || env.ADMIN_PASSWORD || env.CF_ACCESS_AUD || null;
}

export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const left = enc.encode(a);
  const right = enc.encode(b);
  const len = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < len; i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const pad = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4));
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string, usages: KeyUsage[]) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usages);
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await hmacKey(secret, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return bytesToB64url(new Uint8Array(sig));
}

export async function csrfFor(env: Env, slug: string): Promise<string> {
  const secret = signingKey(env);
  if (!secret) return '';
  return sign(`csrf:${slug}`, secret);
}

export function editorBySlug(slug: string): { slug: EditorSlug; name: string } | null {
  return EDITORS.find((editor) => editor.slug === slug) ?? null;
}

export async function createSessionCookie(env: Env, slug: EditorSlug, secure: boolean): Promise<string | null> {
  const secret = signingKey(env);
  const editor = editorBySlug(slug);
  if (!secret || !editor) return null;
  const session: Session = {
    slug: editor.slug,
    name: editor.name,
    csrf: await csrfFor(env, editor.slug),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const body = bytesToB64url(new TextEncoder().encode(JSON.stringify(session)));
  const token = `${body}.${await sign(body, secret)}`;
  const parts = [
    `${COOKIE}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(secure: boolean): string {
  const parts = [`${COOKIE}=`, 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

async function sessionFromCookie(request: Request, env: Env): Promise<Session | null> {
  const secret = signingKey(env);
  const token = readCookie(request.headers.get('cookie'), COOKIE);
  if (!secret || !token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = await sign(body, secret);
  if (!safeEqual(sig, expected)) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as Session;
    if (!json?.exp || json.exp < Math.floor(Date.now() / 1000)) return null;
    if (!editorBySlug(json.slug)) return null;
    return json;
  } catch {
    return null;
  }
}

type AccessCerts = { keys?: (JsonWebKey & { kid?: string })[] };
let certCache: { exp: number; keys: NonNullable<AccessCerts['keys']> } | null = null;

async function accessKeys(team: string): Promise<NonNullable<AccessCerts['keys']>> {
  const now = Date.now();
  if (certCache && certCache.exp > now) return certCache.keys;
  const response = await fetch(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error('cert access gagal');
  const data = (await response.json()) as AccessCerts;
  const keys = data.keys ?? [];
  certCache = { exp: now + 5 * 60 * 1000, keys };
  return keys;
}

async function sessionFromAccess(request: Request, env: Env): Promise<Session | null> {
  if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) return null;
  const jwt = request.headers.get('cf-access-jwt-assertion');
  if (!jwt) return null;
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  let header: { alg?: string; kid?: string };
  let payload: { aud?: string | string[]; iss?: string; exp?: number; email?: string };
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
  } catch {
    return null;
  }
  if (header.alg !== 'RS256' || !header.kid) return null;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000) - 60) return null;
  const iss = `https://${env.CF_ACCESS_TEAM_DOMAIN}.cloudflareaccess.com`;
  if (payload.iss !== iss) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.CF_ACCESS_AUD)) return null;
  const keys = await accessKeys(env.CF_ACCESS_TEAM_DOMAIN);
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const signature = b64urlToBytes(s);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, new TextEncoder().encode(`${h}.${p}`));
  if (!ok || !payload.email) return null;
  const email = payload.email.toLowerCase();
  const { getDb } = await import('./db');
  const author = await getDb()
    .prepare('SELECT slug, name FROM authors WHERE lower(email) = ? AND is_active = 1')
    .bind(email)
    .first<{ slug: string; name: string }>();
  const editor = editorBySlug(author?.slug || '') ?? { slug: 'redaksi' as const, name: author?.name || 'Redaksi' };
  return {
    slug: editor.slug,
    name: author?.name || editor.name,
    email,
    csrf: await csrfFor(env, editor.slug),
    exp: payload.exp,
  };
}

export async function readSession(request: Request, env: Env): Promise<Session | null> {
  try {
    const access = await sessionFromAccess(request, env);
    if (access) return access;
  } catch (error) {
    console.error('access jwt', error);
  }
  return sessionFromCookie(request, env);
}

export function checkPassword(env: Env, password: string): boolean {
  const expected = env.ADMIN_PASSWORD || '';
  if (!expected) return false;
  return safeEqual(password, expected);
}

export async function csrfMatches(env: Env, session: Session, token: string): Promise<boolean> {
  const expected = session.csrf || (await csrfFor(env, session.slug));
  return Boolean(token) && safeEqual(token, expected);
}
