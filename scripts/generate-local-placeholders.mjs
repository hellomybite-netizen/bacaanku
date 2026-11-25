// Ilustrasi CONTOH (bukan foto) untuk artikel contoh niche local wisdom.
// Dibuat sendiri dengan SVG + sharp: palet tropis ceria, motif wastra samar (kawung/parang/tumpal),
// dan siluet sederhana per rubrik. Tanpa foto, tanpa aset berhak cipta pihak lain.
//   node scripts/generate-local-placeholders.mjs
// Output: src/assets/articles/<slug>.jpg (build statis) + public/media/articles/<slug>.jpg (seed D1 lokal).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

export const items = [
  // slug, rubrik, motif, warna gelap, warna terang
  ['contoh-hotel-malang', 'hotel', 'kawung', '#C44C09', '#FFD34D'],
  ['contoh-kuliner-malang', 'kuliner', 'parang', '#C4332B', '#FFB199'],
  ['contoh-wisata-batu', 'wisata', 'kawung', '#187338', '#8FDEAE'],
  ['contoh-kuliner-surabaya', 'kuliner', 'tumpal', '#C44C09', '#FFC44D'],
  ['contoh-hotel-yogyakarta', 'hotel', 'parang', '#0A6E68', '#7EE0D4'],
  ['contoh-kuliner-yogyakarta', 'kuliner', 'kawung', '#BE332C', '#FFE08A'],
  ['contoh-wisata-gunungkidul', 'wisata', 'tumpal', '#0B7A73', '#9EE4F0'],
  ['contoh-hotel-ubud', 'hotel', 'tumpal', '#187338', '#C5E87A'],
  ['contoh-wisata-karangasem', 'wisata', 'parang', '#0A6E68', '#FFC4A0'],
];

const motif = {
  kawung: (c) => `<pattern id="m" width="120" height="120" patternUnits="userSpaceOnUse"><g fill="none" stroke="${c}" stroke-width="2.4" opacity=".28">
    <ellipse cx="60" cy="30" rx="15" ry="30"/><ellipse cx="60" cy="90" rx="15" ry="30"/><ellipse cx="30" cy="60" rx="30" ry="15"/><ellipse cx="90" cy="60" rx="30" ry="15"/>
    <circle cx="60" cy="60" r="5"/></g></pattern>`,
  parang: (c) => `<pattern id="m" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><g fill="none" stroke="${c}" stroke-width="2.4" opacity=".28">
    <path d="M0 45 C 22 20, 45 70, 67 45 S 112 20, 135 45"/><path d="M0 0 h90" stroke-dasharray="6 10"/></g></pattern>`,
  tumpal: (c) => `<pattern id="m" width="80" height="120" patternUnits="userSpaceOnUse"><g fill="none" stroke="${c}" stroke-width="2.4" opacity=".28">
    <path d="M0 120 L40 20 L80 120"/><path d="M20 120 L40 70 L60 120"/><circle cx="40" cy="10" r="4"/></g></pattern>`,
};

const scene = {
  hotel: (w, h, ink, light) => `
    <g transform="translate(${w * 0.5} ${h * 0.62})">
      <ellipse cx="0" cy="${h * 0.26}" rx="${w * 0.42}" ry="${h * 0.05}" fill="${ink}" opacity=".35"/>
      <path d="M-420 -10 L-250 -150 L250 -150 L420 -10 Z" fill="${ink}" opacity=".9"/>
      <path d="M-250 -150 L-150 -250 L150 -250 L250 -150 Z" fill="${ink}"/>
      <rect x="-330" y="-10" width="660" height="240" fill="${light}" opacity=".92"/>
      ${[-260, -130, 0, 130, 260].map((x) => `<rect x="${x - 6}" y="-10" width="12" height="240" fill="${ink}" opacity=".85"/>`).join('')}
      <rect x="-60" y="70" width="120" height="160" rx="4" fill="${ink}" opacity=".9"/>
      <rect x="-230" y="60" width="90" height="70" rx="3" fill="${ink}" opacity=".55"/>
      <rect x="140" y="60" width="90" height="70" rx="3" fill="${ink}" opacity=".55"/>
    </g>`,
  wisata: (w, h, ink, light) => `
    <circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.11}" fill="#FFE08A" opacity=".95"/>
    <path d="M0 ${h * 0.72} L${w * 0.22} ${h * 0.38} L${w * 0.4} ${h * 0.62} L${w * 0.58} ${h * 0.3} L${w} ${h * 0.7} L${w} ${h} L0 ${h} Z" fill="${ink}" opacity=".75"/>
    <path d="M0 ${h * 0.8} Q ${w * 0.25} ${h * 0.7} ${w * 0.5} ${h * 0.8} T ${w} ${h * 0.78} L${w} ${h} L0 ${h} Z" fill="${ink}" opacity=".9"/>
    ${[0.84, 0.89, 0.94].map((y) => `<path d="M0 ${h * y} Q ${w * 0.25} ${h * (y - 0.05)} ${w * 0.5} ${h * y} T ${w} ${h * (y - 0.01)}" fill="none" stroke="${light}" stroke-width="5" opacity=".55"/>`).join('')}`,
  kuliner: (w, h, ink, light) => `
    <g transform="translate(${w * 0.5} ${h * 0.6})">
      <ellipse cx="0" cy="150" rx="430" ry="60" fill="${ink}" opacity=".35"/>
      <path d="M-380 40 Q -300 -60 0 -40 Q 300 -60 380 40 Q 260 150 0 140 Q -260 150 -380 40 Z" fill="#1F7A3C" opacity=".9"/>
      <path d="M-260 0 A 260 150 0 0 0 260 0 Z" fill="${light}"/>
      <ellipse cx="0" cy="0" rx="260" ry="46" fill="${ink}" opacity=".9"/>
      <ellipse cx="-60" cy="-6" rx="70" ry="16" fill="${light}" opacity=".8"/>
      <ellipse cx="80" cy="-4" rx="50" ry="12" fill="#FFE08A" opacity=".9"/>
      ${[-90, 0, 90].map((x) => `<path d="M${x} -70 q -30 -45 0 -90 q 30 -45 0 -90" fill="none" stroke="#FFF8EE" stroke-width="10" stroke-linecap="round" opacity=".7"/>`).join('')}
    </g>`,
};

function art(w, h, cat, m, c1, c2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient>${motif[m]('#fffdf6')}</defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#m)"/>
  ${scene[cat](w, h, c1, '#FFF8EE')}
  <g transform="translate(${w / 2 + 175} 34)"><rect x="-354" y="-4" width="358" height="72" rx="36" fill="#14332F" opacity=".18"/>
  <rect x="-350" y="0" width="350" height="64" rx="32" fill="#FFF8EE" stroke="#14332F" stroke-width="3"/>
  <text x="-175" y="42" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="26" fill="#14332F" letter-spacing="3">ILUSTRASI CONTOH</text></g>
</svg>`;
}

mkdirSync('src/assets/articles', { recursive: true });
mkdirSync('public/media/articles', { recursive: true });
for (const [slug, cat, m, c1, c2] of items) {
  const buf = await sharp(Buffer.from(art(1600, 900, cat, m, c1, c2))).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  await sharp(buf).toFile(`src/assets/articles/${slug}.jpg`);
  await sharp(buf).toFile(`public/media/articles/${slug}.jpg`);
}
console.log('Ilustrasi contoh dibuat:', items.length);
