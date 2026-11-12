// Membuat aset logo & favicon dari file logo resmi (JPG/PNG berlatar hitam).
// Pemakaian: node scripts/build-logo.mjs /path/ke/logo-resmi.jpg
// Hasil: public/logo/* (PNG/WebP transparan), favicon.ico, favicon-32.png, apple-touch-icon.png,
//        icon-192.png, icon-512.png, logo-512.png (publisher JSON-LD), og-default.png
// Latar hitam dijadikan transparan (luma-key); bentuk merah & teks putih tidak diubah.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('Sertakan path file logo.'); process.exit(1); }
mkdirSync('public/logo', { recursive: true });

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const m = Math.max(data[i], data[i + 1], data[i + 2]);
  // hitam -> transparan, transisi halus di tepi (anti-alias)
  const a = m < 24 ? 0 : m < 64 ? Math.round(((m - 24) / 40) * 255) : 255;
  data[i + 3] = Math.min(data[i + 3], a);
}
const keyed = await sharp(data, { raw: info }).png().toBuffer();
const trimmed = await sharp(keyed).trim({ threshold: 1 }).png().toBuffer();
const meta = await sharp(trimmed).metadata();
console.log('logo transparan (trim):', meta.width, 'x', meta.height);
writeFileSync('public/logo/logo-meta.json', JSON.stringify({ width: meta.width, height: meta.height }));
for (const h of [48, 96, 144]) {
  await sharp(trimmed).resize({ height: h }).png({ compressionLevel: 9 }).toFile(`public/logo/bacaanku-${h}.png`);
  await sharp(trimmed).resize({ height: h }).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/logo/bacaanku-${h}.webp`);
}
// Ikon kecil: versi kotak berlatar hitam (lebih terbaca)
const square = (n) => sharp(src).resize(n, n, { fit: 'contain', background: '#000' }).png();
await square(512).toFile('public/icon-512.png');
await square(512).toFile('public/logo-512.png');
await square(192).toFile('public/icon-192.png');
await square(180).toFile('public/apple-touch-icon.png');
await square(32).toFile('public/favicon-32.png');
// favicon.ico (16/32/48) — kontainer ICO berisi PNG
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((n) => square(n).toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((n, i) => {
  const o = 6 + 16 * i;
  header.writeUInt8(n, o); header.writeUInt8(n, o + 1); header.writeUInt8(0, o + 2); header.writeUInt8(0, o + 3);
  header.writeUInt16LE(1, o + 4); header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(pngs[i].length, o + 8); header.writeUInt32LE(offset, o + 12);
  offset += pngs[i].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...pngs]));
// OG default 1200x630: latar gelap + logo transparan di tengah
const ogLogo = await sharp(trimmed).resize({ height: 380 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#111111' } })
  .composite([{ input: ogLogo, gravity: 'center' }]).png().toFile('public/og-default.png');
console.log('Aset logo selesai.');
