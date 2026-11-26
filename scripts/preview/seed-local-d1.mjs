// Siapkan D1 LOKAL untuk pratinjau (wrangler --local). TIDAK PERNAH menyentuh D1 produksi.
//   node scripts/preview/seed-local-d1.mjs --apply            → schema + penulis + berita lama + migrasi 0003 + 7 panduan
//   node scripts/preview/seed-local-d1.mjs --apply --no-guides → hanya schema + penulis + berita lama (tanpa 0003)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const dataDir = join(root, '.data');
mkdirSync(dataDir, { recursive: true });
const q = (v) => (v == null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const withGuides = !process.argv.includes('--no-guides');

// 1) Berita lama dari src/content → SQLite sementara → SQL INSERT.
const basePath = join(dataDir, 'preview-base.sqlite');
if (existsSync(basePath)) rmSync(basePath);
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

if (process.argv.includes('--apply')) {
  const state = join(root, '.wrangler/state/v3/d1');
  if (existsSync(state)) rmSync(state, { recursive: true, force: true });
  const files = ['docs/schema.sql', 'docs/migrations/0002_seed_editors.sql', '.data/preview-seed-berita.sql'];
  if (withGuides) {
    execFileSync('node', ['scripts/preview/gen-local-wisdom-sql.mjs'], { cwd: root, stdio: 'inherit' });
    files.push('docs/migrations/0003_local_wisdom.sql', '.data/seed-local-wisdom.sql');
  }
  for (const file of files) {
    console.log(`wrangler d1 execute --local ← ${file}`);
    execFileSync('npx', ['wrangler', 'd1', 'execute', 'bacaanku-db', '--local', '--persist-to', join(root, '.wrangler/state'), `--file=${file}`, '--yes'], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
  }
  console.log('D1 lokal siap (.wrangler/state). Produksi tidak disentuh.');
}
