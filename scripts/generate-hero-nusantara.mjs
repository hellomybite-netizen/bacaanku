// Ilustrasi hero beranda (BUKAN foto): pantai tropis ala pulau Nusantara, buatan sendiri dengan SVG + sharp.
// Palet cerah (langit biru, laut toska, bukit kuning-hijau, pasir muda, perahu coral). Tanpa aset pihak lain.
//   node scripts/generate-hero-nusantara.mjs
// Output: public/media/hero-nusantara-{1920,960}.jpg (lanskap) dan hero-nusantara-m-{900,540}.jpg (potret, HP).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

function art(w, h) {
  const hz = h * 0.5; // garis horizon
  const s = w / 1920;
  const portrait = h > w;
  const k = portrait ? (w / 900) * 1.35 : s;
  const hillA = (cx, base, sc) => `<g transform="translate(${cx} ${base}) scale(${sc})">
      <path d="M-640 0 C-520 -60 -420 -210 -300 -250 C-230 -150 -170 -300 -80 -330 C0 -240 80 -200 140 -120 C220 -60 330 -30 420 0 Z" fill="#CDA84A"/>
      <path d="M-300 -250 C-230 -150 -170 -300 -80 -330 C-20 -260 20 -170 -30 -60 C-120 -120 -210 -140 -300 -250 Z" fill="#E3C46C" opacity=".95"/>
      <path d="M-640 0 C-560 -40 -470 -20 -380 -60 C-300 -20 -200 -10 -100 0 Z" fill="#6DB36F"/>
      <path d="M140 -120 C220 -60 330 -30 420 0 L100 0 C80 -40 100 -90 140 -120Z" fill="#8FC76A"/>
    </g>`;
  const hillB = (cx, base, sc) => `<g transform="translate(${cx} ${base}) scale(${sc})">
      <path d="M-420 0 C-330 -90 -240 -150 -150 -190 C-60 -140 40 -200 120 -160 C200 -110 300 -60 380 0 Z" fill="#4FA865"/>
      <path d="M-150 -190 C-60 -140 40 -200 120 -160 C60 -120 -10 -80 -60 -20 C-100 -80 -130 -120 -150 -190 Z" fill="#78C27C" opacity=".9"/>
    </g>`;
  const boat = (cx, cy, sc) => `<g transform="translate(${cx} ${cy}) scale(${sc})">
      <path d="M-120 0 L120 0 L90 30 L-90 30 Z" fill="#D9261F"/>
      <rect x="-120" y="-6" width="240" height="8" rx="4" fill="#FFD34D"/>
      <rect x="-3" y="-120" width="6" height="120" fill="#FFF8EE"/>
      <path d="M6 -118 L100 -20 L6 -20 Z" fill="#FFD34D"/>
      <path d="M-6 -100 L-70 -20 L-6 -20 Z" fill="#FFF8EE"/>
      <path d="M-170 38 L170 38" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    </g>`;
  const waves = [0.58, 0.64, 0.71, 0.79, 0.87].map((p, i) =>
    `<path d="M0 ${h * p} q ${w * 0.06} ${-h * 0.012} ${w * 0.12} 0 t ${w * 0.12} 0 t ${w * 0.12} 0 t ${w * 0.12} 0 t ${w * 0.12} 0 t ${w * 0.12} 0 t ${w * 0.12} 0 t ${w * 0.12} 0 t ${w * 0.12} 0" fill="none" stroke="#fff" stroke-width="${3 + i}" stroke-linecap="round" opacity="${0.55 - i * 0.07}"/>`).join('');
  const clouds = (portrait
    ? [[0.2, 0.14, 1.0], [0.78, 0.22, 0.8], [0.45, 0.33, 0.6]]
    : [[0.12, 0.16, 1.0], [0.55, 0.1, 0.8], [0.86, 0.25, 1.1], [0.35, 0.3, 0.55]]
  ).map(([x, y, c]) => `<g transform="translate(${w * x} ${h * y}) scale(${c * k})" fill="#fff" opacity=".85"><ellipse cx="0" cy="0" rx="120" ry="28"/><ellipse cx="-60" cy="-16" rx="60" ry="30"/><ellipse cx="30" cy="-22" rx="70" ry="34"/></g>`).join('');
  const sandPath = portrait
    ? `M0 ${h * 0.84} C ${w * 0.3} ${h * 0.8}, ${w * 0.7} ${h * 0.9}, ${w} ${h * 0.86} L${w} ${h} L0 ${h} Z`
    : `M0 ${h * 0.78} C ${w * 0.18} ${h * 0.74}, ${w * 0.34} ${h * 0.86}, ${w * 0.5} ${h * 0.9} C ${w * 0.7} ${h * 0.95}, ${w * 0.9} ${h * 0.92}, ${w} ${h * 0.97} L${w} ${h} L0 ${h} Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E9BD0"/><stop offset=".55" stop-color="#8FD0E8"/><stop offset="1" stop-color="#DFF4F1"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1FB0B0"/><stop offset=".5" stop-color="#53CDC4"/><stop offset="1" stop-color="#A8E6DC"/></linearGradient>
    <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7D3CB"/><stop offset="1" stop-color="#FFEFE6"/></linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6CF" stop-opacity="1"/><stop offset=".35" stop-color="#FFE9A0" stop-opacity=".7"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
    <pattern id="kw" width="120" height="120" patternUnits="userSpaceOnUse"><g fill="none" stroke="#fff" stroke-width="2.4" opacity=".16"><ellipse cx="60" cy="30" rx="15" ry="30"/><ellipse cx="60" cy="90" rx="15" ry="30"/><ellipse cx="30" cy="60" rx="30" ry="15"/><ellipse cx="90" cy="60" rx="30" ry="15"/><circle cx="60" cy="60" r="5"/></g></pattern>
  </defs>
  <rect width="${w}" height="${hz + 2}" fill="url(#sky)"/>
  <rect width="${w}" height="${hz + 2}" fill="url(#kw)"/>
  <circle cx="${portrait ? w * 0.72 : w * 0.7}" cy="${hz * 0.62}" r="${(portrait ? w : h) * 0.34}" fill="url(#sun)"/>
  <circle cx="${portrait ? w * 0.72 : w * 0.7}" cy="${hz * 0.62}" r="${(portrait ? w : h) * 0.05}" fill="#FFF3C4"/>
  ${clouds}
  ${hillA(portrait ? w * 0.34 : w * 0.3, hz + 6, k * 0.92 * (portrait ? 0.8 : 1))}
  ${hillB(portrait ? w * 0.86 : w * 0.78, hz + 6, k * 0.78 * (portrait ? 0.8 : 1))}
  <rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#sea)"/>
  ${waves}
  ${boat(portrait ? w * 0.66 : w * 0.62, h * (portrait ? 0.7 : 0.66), k * 0.55)}
  <path d="${sandPath}" fill="url(#sand)"/>
</svg>`;
}

mkdirSync('public/media', { recursive: true });
const jobs = [
  ['hero-nusantara-1920.jpg', 1920, 1000],
  ['hero-nusantara-960.jpg', 960, 500],
  ['hero-nusantara-m-900.jpg', 900, 1250],
  ['hero-nusantara-m-540.jpg', 540, 750],
];
for (const [name, w, h] of jobs) {
  await sharp(Buffer.from(art(w, h))).jpeg({ quality: 72, mozjpeg: true }).toFile(`public/media/${name}`);
}
console.log('Hero ilustrasi dibuat:', jobs.length);
