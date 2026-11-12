// Pasca-build KHUSUS preview GitHub Pages (npm run build:preview).
// Build normal untuk bacaanku.com TIDAK memakai skrip ini.
// - Menambahkan prefix base path (mis. /bacaanku) ke semua tautan internal
// - Mengganti URL absolut https://bacaanku.com -> URL preview
// - Memaksa noindex,nofollow + robots.txt Disallow: / agar Google tidak mengindeks situs contoh
import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const BASE = (process.env.PREVIEW_BASE || '/bacaanku').replace(/\/$/, '');
const ORIGIN = process.env.PREVIEW_ORIGIN || 'https://hellomybite-netizen.github.io';
const PROD = 'https://bacaanku.com';

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'pagefind') yield* walk(p); } else yield p;
  }
}

const prefix = (path) => (path.startsWith(BASE + '/') || path === BASE ? path : BASE + path);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function rewriteHtml(s) {
  s = s.replaceAll(PROD, ORIGIN + BASE);
  // href/src/action/poster/data-* = "/..." (bukan "//")
  s = s.replace(/\b((?:href|src|action|poster|content|data-[\w-]+)=["'])(\/(?!\/)[^"']*)/g, (m, a, p) => a + prefix(p));
  // srcset="/a.webp 400w, /b.webp 800w"
  s = s.replace(/\bsrcset=(["'])([^"']*)\1/g, (m, q, v) =>
    `srcset=${q}${v.split(',').map((part) => part.replace(/^(\s*)(\/(?!\/)\S*)/, (mm, sp, p) => sp + prefix(p))).join(',')}${q}`);
  // url(/...) di CSS inline
  s = s.replace(/url\((['"]?)(\/(?!\/)[^)'"]*)\1\)/g, (m, q, p) => `url(${q}${prefix(p)}${q})`);
  // robots: noindex untuk preview
  s = s.replace(/<meta name="robots" content="[^"]*"\s*\/?>/g, '');
  s = s.replace(/<head>/, '<head><meta name="robots" content="noindex,nofollow">');
  // Pagefind: URL hasil pencarian perlu base path
  s = s.replace(/new PagefindUI\(\{/g, `new PagefindUI({ baseUrl: '${BASE}/',`);
  return s;
}

let n = 0;
for await (const f of walk(DIST)) {
  if (f.endsWith('.html')) { await writeFile(f, rewriteHtml(await readFile(f, 'utf8'))); n++; }
  else if (/\.(xml|txt|webmanifest|json|yml)$/.test(f)) {
    let s = (await readFile(f, 'utf8')).replaceAll(PROD, ORIGIN + BASE);
    await writeFile(f, s); n++;
  } else if (f.endsWith('.css')) {
    const s = (await readFile(f, 'utf8')).replace(/url\((['"]?)(\/(?!\/)[^)'"]*)\1\)/g, (m, q, p) => `url(${q}${prefix(p)}${q})`);
    await writeFile(f, s);
  }
}
await writeFile(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
await writeFile(join(DIST, '.nojekyll'), '');
await rm(join(DIST, '_headers'), { force: true }); // tidak dipakai GitHub Pages
console.log(`preview-rewrite: ${n} file diproses (base ${BASE}, origin ${ORIGIN})`);
