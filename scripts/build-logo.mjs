// Membuat semua aset logo Bacaanku Network dari file logo resmi.
// Pemakaian:  node scripts/build-logo.mjs [logo-penuh.png] [ikon-persegi.png]
//   default:  brand/source/logo-full.png  brand/source/logo-icon.png
//
// Langkah:
//  1. Latar hitam -> transparan (hanya jika sumber masih berlatar hitam solid):
//     flood fill dari tepi + area hitam tertutup (sela huruf), lalu tepi anti-alias
//     di-"unpremultiply" dari hitam supaya tidak ada halo gelap.
//     Navy teks (B jauh > R) tidak ikut terhapus karena hanya piksel hampir-hitam netral yang dihapus.
//  2. Bersihkan noise alpha, trim, beri padding.
//  3. Varian latar gelap: navy -> putih, halaman buku putih -> knockout (transparan),
//     merah & garis putih di dalam bubble merah tetap.
//  4. Ekspor: public/brand/*, favicon.ico + PNG, apple-touch-icon, icon-192/512 (+maskable),
//     manifest, logo organisasi (JSON-LD) dan og-default.png.
import sharp from 'sharp';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';

const FULL = process.argv[2] || 'brand/source/logo-full.png';
const ICON = process.argv[3] || 'brand/source/logo-icon.png';
const OUT = 'public/brand';
const PAPER = '#ffffff';
const NAVY = '#0b2239';
mkdirSync(OUT, { recursive: true });

const load = async (p) => {
  const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: Buffer.from(data), w: info.width, h: info.height };
};
const toSharp = (img) => sharp(img.d, { raw: { width: img.w, height: img.h, channels: 4 } });
const mx = (d, i) => Math.max(d[i], d[i + 1], d[i + 2]);

function removeBlackBackground(img) {
  const { d, w, h } = img;
  const N = w * h;
  const corners = [0, w - 1, (h - 1) * w, N - 1];
  const solidBlack = corners.every((p) => d[p * 4 + 3] > 250 && mx(d, p * 4) < 30);
  if (!solidBlack) return false; // sumber sudah transparan
  const BG_T = 40;
  const bg = new Uint8Array(N);
  const q = new Int32Array(N);
  let head = 0, tail = 0;
  const push = (p) => { if (!bg[p] && mx(d, p * 4) < BG_T) { bg[p] = 1; q[tail++] = p; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (head < tail) {
    const p = q[head++], x = p % w, y = (p / w) | 0;
    if (x > 0) push(p - 1); if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w); if (y < h - 1) push(p + w);
  }
  // Area hitam tertutup (mis. di dalam huruf): hitam netral, bukan navy (B tidak jauh di atas R)
  const seen = new Uint8Array(N);
  for (let s = 0; s < N; s++) {
    const i = s * 4;
    if (bg[s] || seen[s] || mx(d, i) >= 15 || d[i + 2] - d[i] >= 12) continue;
    const comp = []; const st = [s]; seen[s] = 1;
    while (st.length) {
      const p = st.pop(); comp.push(p);
      const x = p % w, y = (p / w) | 0;
      for (const n of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (n < 0 || seen[n] || bg[n]) continue;
        const j = n * 4;
        if (mx(d, j) < 15 && d[j + 2] - d[j] < 12) { seen[n] = 1; st.push(n); }
      }
    }
    if (comp.length > 20) for (const p of comp) bg[p] = 1;
  }
  for (let p = 0; p < N; p++) if (bg[p]) d[p * 4 + 3] = 0;
  // Tepi: piksel <=2px dari latar, campuran warna + hitam -> estimasi alpha & warna asli
  const dist = new Uint8Array(N).fill(255);
  for (let p = 0; p < N; p++) if (bg[p]) dist[p] = 0;
  for (let pass = 1; pass <= 2; pass++) {
    for (let p = 0; p < N; p++) {
      if (dist[p] !== 255) continue;
      const x = p % w, y = (p / w) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        if (dist[yy * w + xx] === pass - 1) { dist[p] = pass; dy = dx = 2; }
      }
    }
  }
  for (let p = 0; p < N; p++) {
    if (dist[p] !== 1 && dist[p] !== 2) continue;
    const x = p % w, y = (p / w) | 0, i = p * 4;
    let M = 0;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const n = yy * w + xx;
      if (dist[n] === 255) M = Math.max(M, mx(d, n * 4));
    }
    if (!M) M = 255;
    const a = Math.min(1, mx(d, i) / M);
    if (a < 0.05) { d[i + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) d[i + c] = Math.min(255, Math.round(d[i + c] / a));
    d[i + 3] = Math.round(a * 255);
  }
  return true;
}

function cleanAlpha(img) {
  const { d } = img;
  for (let i = 3; i < d.length; i += 4) { if (d[i] < 12) d[i] = 0; else if (d[i] >= 245) d[i] = 255; }
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 0) d[i] = d[i + 1] = d[i + 2] = 0;
}

function trim(img, padRatio = 0) {
  const { d, w, h } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, pad = Math.round(Math.max(cw, ch) * padRatio);
  const W = cw + pad * 2, H = ch + pad * 2, o = Buffer.alloc(W * H * 4);
  for (let y = 0; y < ch; y++) d.copy(o, ((y + pad) * W + pad) * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x1 + 1) * 4);
  return { d: o, w: W, h: H };
}

const isRed = (r, g, b) => r > g + 60 && r > b + 50;
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function darkVariant(img) {
  const { d, w, h } = img, N = w * h, o = Buffer.from(d);
  const navyness = (i) => Math.min(1, Math.max(0, (230 - lum(d[i], d[i + 1], d[i + 2])) / 195));
  // komponen terang (halaman buku / garis bubble)
  const label = new Int32Array(N).fill(-1);
  const keepWhite = [];
  const light = (p) => { const i = p * 4; return d[i + 3] > 0 && !isRed(d[i], d[i + 1], d[i + 2]) && navyness(i) < 0.5; };
  let id = 0;
  for (let s = 0; s < N; s++) {
    if (label[s] !== -1 || !light(s)) continue;
    let red = 0, other = 0; const st = [s]; label[s] = id;
    while (st.length) {
      const p = st.pop(), x = p % w, y = (p / w) | 0;
      for (const n of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (n < 0 || label[n] === id) continue;
        if (light(n)) { if (label[n] === -1) { label[n] = id; st.push(n); } continue; }
        const j = n * 4;
        if (d[j + 3] > 0 && isRed(d[j], d[j + 1], d[j + 2])) red++; else other++;
      }
    }
    keepWhite[id] = red / Math.max(1, red + other) > 0.6; id++;
  }
  for (let p = 0; p < N; p++) {
    const i = p * 4;
    if (!d[i + 3]) continue;
    if (isRed(d[i], d[i + 1], d[i + 2])) continue;
    if (label[p] >= 0 && keepWhite[label[p]]) continue;
    // dekat garis bubble (anti-alias) juga dipertahankan
    const n = navyness(i);
    o[i] = o[i + 1] = o[i + 2] = 255;
    o[i + 3] = Math.round(d[i + 3] * n);
  }
  cleanAlpha({ d: o });
  return { d: o, w, h };
}

const png = (s) => s.png({ compressionLevel: 9, adaptiveFiltering: true });

// ---------- logo penuh ----------
const full = await load(FULL);
console.log('logo penuh: latar hitam dihapus =', removeBlackBackground(full));
cleanAlpha(full);
const fullT = trim(full, 0.02);
const fullDark = darkVariant(fullT);
const ratio = fullT.w / fullT.h;
for (const [name, img] of [['light', fullT], ['dark', fullDark]]) {
  await png(toSharp(img)).toFile(`${OUT}/logo-${name}.png`); // master transparan
  for (const hgt of [48, 96, 144]) {
    const r = toSharp(img).resize({ height: hgt, kernel: 'lanczos3' });
    await r.clone().webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(`${OUT}/logo-${name}-h${hgt}.webp`);
    await png(r.clone()).toFile(`${OUT}/logo-${name}-h${hgt}.png`);
  }
}

// ---------- ikon persegi ----------
const icon = await load(ICON);
console.log('ikon: latar hitam dihapus =', removeBlackBackground(icon));
cleanAlpha(icon);
const iconT = trim(icon, 0);
const side = Math.max(iconT.w, iconT.h);
const iconSq = await toSharp(iconT).resize(side, side, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await png(sharp(iconSq)).toFile(`${OUT}/icon-transparent.png`);
await png(toSharp(darkVariant({ ...(await load(`${OUT}/icon-transparent.png`)) }))).toFile(`${OUT}/icon-dark.png`);

// ikon di atas kotak putih (terbaca di tab terang & gelap)
async function tile(n, { padding, radius, bg = PAPER }) {
  const inner = Math.round(n * (1 - padding * 2));
  const glyph = await sharp(iconSq).resize(inner, inner, { kernel: 'lanczos3' }).png().toBuffer();
  const r = Math.round(n * radius);
  const shape = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}"><rect width="${n}" height="${n}" rx="${r}" ry="${r}" fill="${bg}"/></svg>`);
  return sharp(shape).composite([{ input: glyph, gravity: 'center' }]).png({ compressionLevel: 9 });
}
const fav = { 16: [0.0, 0.16], 32: [0.06, 0.2], 48: [0.07, 0.2] };
const icoPngs = [];
for (const n of [16, 32, 48]) {
  const [padding, radius] = fav[n];
  const buf = await (await tile(n, { padding, radius })).toBuffer();
  icoPngs.push(buf);
  if (n !== 48) writeFileSync(`public/favicon-${n}x${n}.png`, buf);
}
const header = Buffer.alloc(6 + 16 * 3);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(3, 4);
let off = header.length;
[16, 32, 48].forEach((n, k) => {
  const o = 6 + 16 * k;
  header.writeUInt8(n, o); header.writeUInt8(n, o + 1); header.writeUInt16LE(1, o + 4); header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(icoPngs[k].length, o + 8); header.writeUInt32LE(off, o + 12); off += icoPngs[k].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...icoPngs]));
await (await tile(180, { padding: 0.1, radius: 0 })).toFile('public/apple-touch-icon.png'); // iOS membulatkan sendiri
await (await tile(192, { padding: 0.08, radius: 0.22 })).toFile('public/icon-192.png');
await (await tile(512, { padding: 0.08, radius: 0.22 })).toFile('public/icon-512.png');
await (await tile(512, { padding: 0.18, radius: 0 })).toFile('public/icon-maskable-512.png');
await (await tile(512, { padding: 0.1, radius: 0 })).toFile('public/logo-512.png'); // logo persegi (CMS, dll.)
rmSync('public/favicon.svg', { force: true });

writeFileSync('public/site.webmanifest', JSON.stringify({
  name: 'Bacaanku Network', short_name: 'Bacaanku', lang: 'id',
  start_url: './', scope: './', display: 'standalone', background_color: PAPER, theme_color: NAVY,
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2) + '\n');

// ---------- logo organisasi (JSON-LD) 1200x400 & OG default 1200x630 ----------
const orgLogo = await toSharp(fullT).resize({ width: 1080, height: 340, fit: 'inside', kernel: 'lanczos3' }).png().toBuffer();
await sharp({ create: { width: 1200, height: 400, channels: 4, background: PAPER } })
  .composite([{ input: orgLogo, gravity: 'center' }]).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-organization-1200x400.png`);
const ogLogo = await toSharp(fullT).resize({ width: 940, height: 300, fit: 'inside', kernel: 'lanczos3' }).png().toBuffer();
const ogBg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="${PAPER}"/><rect y="560" width="1200" height="70" fill="${NAVY}"/><rect y="552" width="1200" height="8" fill="#d92323"/>
<text x="600" y="604" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="30" fill="#ffffff">bacaankunetwork.com · Berita yang perlu kamu tahu</text></svg>`);
await sharp(ogBg).composite([{ input: ogLogo, top: Math.round((552 - 300 * 1) / 2), left: Math.round((1200 - 940) / 2) }])
  .png({ compressionLevel: 9 }).toFile('public/og-default.png');

writeFileSync(`${OUT}/logo-meta.json`, JSON.stringify({ ratio: +ratio.toFixed(4), full: [fullT.w, fullT.h], icon: side }, null, 2) + '\n');
console.log('selesai:', { full: [fullT.w, fullT.h], ratio: ratio.toFixed(3), icon: side });
