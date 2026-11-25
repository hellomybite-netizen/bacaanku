// Siapkan D1 LOKAL untuk pratinjau redesain local wisdom.
//   node scripts/preview/seed-local-d1.mjs          → tulis file md contoh + SQL seed
//   npm run preview:db                              → + reset & isi D1 lokal (wrangler --local)
//
// TIDAK PERNAH menyentuh D1 produksi: semua perintah wrangler di sini memakai --local.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { join, resolve } from 'node:path';
import { contoh, bodyMarkdown } from './contoh-local-wisdom.mjs';
import { renderMarkdown } from '../../src/lib/markdown.mjs';

const root = resolve(import.meta.dirname, '../..');
const dataDir = join(root, '.data');
mkdirSync(dataDir, { recursive: true });
const q = (v) => (v == null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const yaml = (v) => JSON.stringify(v);
const citySlug = (name) => name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// 1) Markdown contoh untuk build statis (GitHub Pages).
const nowSec = Math.floor(Date.now() / 1000);
for (const item of contoh) {
  const published = new Date((nowSec - item.hoursAgo * 3600) * 1000).toISOString();
  const fm = [
    '---',
    `title: ${yaml(item.title)}`,
    `slug: ${item.slug}`,
    `description: ${yaml(item.excerpt)}`,
    `category: ${item.category}`,
    `daerah: ${item.province}`,
    `kota: ${yaml(item.city)}`,
    'contoh: true',
    `tags: ${yaml(['contoh', item.city.toLowerCase()])}`,
    'author: redaksi',
    `publishDate: ${published}`,
    `heroImage: ../../assets/articles/${item.slug}.jpg`,
    `heroAlt: ${yaml(`Ilustrasi contoh rubrik ${item.category} bermotif wastra, bukan foto tempat asli`)}`,
    `heroCaption: ${yaml('Ilustrasi contoh. Foto asli menyusul.')}`,
    `heroCredit: ${yaml('Ilustrasi: bacaankunetwork.com (dibuat sendiri, bukan foto)')}`,
    `featured: ${item.headline ? 'true' : 'false'}`,
    'review:',
    `  placeName: ${yaml(item.placeName)}`,
    `  placeType: ${item.placeType}`,
    `  priceMin: ${item.priceMin}`,
    `  priceMax: ${item.priceMax}`,
    `  priceUnit: ${item.priceUnit}`,
    `  address: ${yaml(item.address)}`,
    `  rating: ${item.rating}`,
    `  openingHours: ${yaml(item.hours)}`,
    `  facilities: ${yaml(item.facilities)}`,
    '---',
    '',
  ].join('\n');
  writeFileSync(join(root, 'src/content/articles', `${item.slug}.md`), fm + bodyMarkdown(item) + '\n');
}
console.log(`md contoh: ${contoh.length} file → src/content/articles/contoh-*.md`);

// 2) Artikel berita lama (src/content, tanpa contoh-*) → SQLite sementara → SQL INSERT.
const basePath = join(dataDir, 'preview-base.sqlite');
execFileSync('node', ['scripts/migrate-content.mjs', '--db', basePath], { cwd: root, stdio: 'inherit' });
const base = new DatabaseSync(basePath);
const lines = ['-- Seed D1 LOKAL: penulis + artikel berita lama dari src/content (dibuat otomatis).'];
const dump = (table, cols, conflict = 'OR IGNORE') => {
  for (const row of base.prepare(`SELECT ${cols.join(', ')} FROM ${table}`).all()) {
    lines.push(`INSERT ${conflict} INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((c) => q(row[c])).join(', ')});`);
  }
};
dump('authors', ['id', 'slug', 'name', 'role', 'bio', 'email', 'x_handle'], 'OR REPLACE');
dump('articles', ['id', 'slug', 'title', 'excerpt', 'body_markdown', 'body_html', 'reading_minutes', 'category_id', 'author_id', 'status', 'hero_r2_key', 'hero_width', 'hero_height', 'hero_alt', 'hero_caption', 'hero_credit', 'hero_credit_url', 'sources_json', 'seo_title', 'canonical_url', 'is_headline', 'published_at', 'updated_at']);
dump('tags', ['id', 'slug', 'name']);
dump('article_tags', ['article_id', 'tag_id']);
writeFileSync(join(dataDir, 'preview-seed-berita.sql'), lines.join('\n') + '\n');
console.log(`seed berita: ${lines.length - 1} baris → .data/preview-seed-berita.sql`);

// 3) Artikel CONTOH dengan kolom baru (butuh migrasi 0003).
const out = ['-- DATA CONTOH FIKTIF — hanya untuk D1 lokal. JANGAN jalankan ke produksi.'];
for (const item of contoh) {
  const md = bodyMarkdown(item);
  const { html, minutes } = renderMarkdown(md);
  const pub = nowSec - item.hoursAgo * 3600;
  out.push(`INSERT INTO articles (
  slug, title, excerpt, body_markdown, body_html, reading_minutes, category_id, author_id, status,
  hero_r2_key, hero_width, hero_height, hero_alt, hero_caption, hero_credit, hero_credit_url, sources_json,
  is_headline, published_at, updated_at,
  province_slug, city_name, city_slug, place_name, place_type, address, maps_url,
  price_min, price_max, price_unit, opening_hours, rating, facilities_json, is_sample
) VALUES (
  ${q(item.slug)}, ${q(item.title)}, ${q(item.excerpt)}, ${q(md)}, ${q(html)}, ${minutes},
  (SELECT id FROM categories WHERE slug = ${q(item.category)}), (SELECT id FROM authors WHERE slug = 'redaksi'), 'published',
  ${q(`/media/articles/${item.slug}.jpg`)}, 1600, 900, ${q(`Ilustrasi contoh rubrik ${item.category} bermotif wastra, bukan foto tempat asli`)},
  'Ilustrasi contoh. Foto asli menyusul.', 'Ilustrasi: bacaankunetwork.com (dibuat sendiri, bukan foto)', NULL, '[]',
  ${item.headline ? 1 : 0}, ${pub}, ${pub},
  ${q(item.province)}, ${q(item.city)}, ${q(citySlug(item.city))}, ${q(item.placeName)}, ${q(item.placeType)}, ${q(item.address)}, NULL,
  ${item.priceMin}, ${item.priceMax}, ${q(item.priceUnit)}, ${q(item.hours)}, ${item.rating}, ${q(JSON.stringify(item.facilities))}, 1
);`);
}
writeFileSync(join(dataDir, 'preview-seed-contoh.sql'), out.join('\n') + '\n');
console.log(`seed contoh: ${contoh.length} artikel → .data/preview-seed-contoh.sql`);

// 4) Reset + isi D1 lokal (opsional: --apply).
if (process.argv.includes('--apply')) {
  const state = join(root, '.wrangler/state/v3/d1');
  if (existsSync(state)) rmSync(state, { recursive: true, force: true });
  const files = ['docs/schema.sql', 'docs/migrations/0002_seed_editors.sql', '.data/preview-seed-berita.sql', 'docs/migrations/0003_local_wisdom.sql', '.data/preview-seed-contoh.sql'];
  for (const file of files) {
    console.log(`wrangler d1 execute --local ← ${file}`);
    execFileSync('npx', ['wrangler', 'd1', 'execute', 'bacaanku-db', '--local', `--file=${file}`, '--yes'], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
  }
  console.log('D1 lokal siap (.wrangler/state). Produksi tidak disentuh.');
}
