// Membuat gambar placeholder (CONTOH) secara lokal dengan sharp — tanpa foto berhak cipta.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const items = [
  ['kota-fiksi-resmikan-taman-kota-terapung', 'News', 200],
  ['jalur-sepeda-baru-sepanjang-12-km', 'News', 210],
  ['aplikasi-ojek-lokal-luncurkan-fitur-hemat-baterai', 'Teknologi', 250],
  ['startup-contoh-kembangkan-penerjemah-bahasa-daerah', 'Teknologi', 265],
  ['mobil-listrik-mungil-uji-jalan-tanjakan-bandung', 'Otomotif', 15],
  ['tips-merawat-motor-saat-musim-hujan', 'Otomotif', 30],
  ['teleskop-amatir-rekam-komet-hijau', 'Sains', 285],
  ['peneliti-contoh-temukan-jamur-pengurai-plastik', 'Sains', 150],
  ['harga-cabai-turun-pasokan-panen-raya', 'Ekonomi', 0],
  ['umkm-kopi-contoh-tembus-pasar-ekspor', 'Ekonomi', 35],
  ['timnas-futsal-contoh-melaju-ke-final', 'Olahraga', 130],
  ['pebulutangkis-muda-juarai-turnamen-contoh', 'Olahraga', 170],
  ['film-animasi-lokal-contoh-tembus-sejuta-penonton', 'Hiburan', 320],
  ['festival-musik-hutan-kota-digelar-akhir-pekan', 'Hiburan', 340],
];

const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;

function art(w, h, hue, label, seed) {
  const rnd = (n) => { seed = (seed * 9301 + 49297) % 233280; return (seed / 233280) * n; };
  let shapes = '';
  for (let i = 0; i < 7; i++) {
    const r = 80 + rnd(260);
    shapes += `<circle cx="${rnd(w)}" cy="${rnd(h)}" r="${r}" fill="${hsl((hue + rnd(50)) % 360, 70, 55 + rnd(20))}" opacity="${0.18 + rnd(0.25)}"/>`;
  }
  for (let i = 0; i < 4; i++) {
    const x = rnd(w), y = rnd(h);
    shapes += `<rect x="${x}" y="${y}" width="${120 + rnd(320)}" height="${12 + rnd(30)}" rx="8" fill="#fff" opacity="${0.08 + rnd(0.12)}" transform="rotate(${-20 + rnd(40)} ${x} ${y})"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${hsl(hue, 55, 28)}"/><stop offset="1" stop-color="${hsl((hue + 40) % 360, 65, 45)}"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>${shapes}
  <text x="${w * 0.06}" y="${h * 0.86}" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="${h * 0.13}" fill="#fff" opacity="0.92">${label}</text>
  <rect x="${w * 0.06}" y="${h * 0.08}" width="${w * 0.27}" height="${h * 0.075}" rx="${h * 0.02}" fill="#000" opacity="0.45"/>
  <text x="${w * 0.075}" y="${h * 0.132}" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="${h * 0.04}" fill="#fff" letter-spacing="3">GAMBAR CONTOH</text>
</svg>`;
}

mkdirSync('src/assets/articles', { recursive: true });
let s = 7;
for (const [slug, label, hue] of items) {
  await sharp(Buffer.from(art(1600, 900, hue, label, (s += 13)))).jpeg({ quality: 82, mozjpeg: true }).toFile(`src/assets/articles/${slug}.jpg`);
}

// OG default, logo, favicon
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#17130f"/>
<circle cx="1050" cy="120" r="260" fill="#c2410c" opacity="0.35"/><circle cx="980" cy="560" r="180" fill="#fb923c" opacity="0.18"/>
<text x="90" y="320" font-family="DejaVu Serif, serif" font-weight="700" font-size="96" fill="#fff">bacaanku<tspan fill="#fb923c">network</tspan></text>
<text x="94" y="410" font-family="DejaVu Sans, sans-serif" font-size="40" fill="#e7e2dc">bacaankunetwork.com · Bacaan jernih, setiap hari.</text></svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');
const logo = (n) => `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#c2410c"/><text x="32" y="47" text-anchor="middle" font-family="DejaVu Serif, serif" font-weight="700" font-size="44" fill="#fff">b</text></svg>`;
await sharp(Buffer.from(logo(512))).png().toFile('public/logo-512.png');
await sharp(Buffer.from(logo(180))).png().toFile('public/apple-touch-icon.png');
const { writeFileSync } = await import('node:fs');
writeFileSync('public/favicon.svg', logo(64));
console.log('Placeholder images generated.');
