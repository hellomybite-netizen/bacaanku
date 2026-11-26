// Bangun .data/seed-local-wisdom.sql dari local-wisdom-seed.mjs — HANYA untuk D1 LOKAL.
// Jalankan setelah docs/migrations/0003_local_wisdom.sql. Aman diulang (INSERT OR IGNORE per slug).
import { mkdirSync, writeFileSync } from 'node:fs';
import { guides } from './local-wisdom-seed.mjs';
import { renderMarkdown } from '../../src/lib/markdown.mjs';

const provinceOf = { malang: 'jawa-timur', batu: 'jawa-timur', probolinggo: 'jawa-timur', surabaya: 'jawa-timur', yogyakarta: 'di-yogyakarta' };
const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replaceAll("'", "''")}'`);
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const now = Math.floor(Date.now() / 1000);
const out = ['-- DIBUAT OTOMATIS oleh scripts/preview/gen-local-wisdom-sql.mjs. JANGAN jalankan di D1 produksi.'];
for (const g of guides) {
  const r = renderMarkdown(g.body);
  const at = now - g.hoursAgo * 3600;
  out.push(`INSERT OR IGNORE INTO articles (slug, title, excerpt, body_markdown, body_html, reading_minutes, category_id, author_id, status,
  hero_r2_key, hero_width, hero_height, hero_alt, hero_caption, hero_credit, hero_credit_url, sources_json, published_at, updated_at, created_at,
  city_slug, province_slug, place_name, location_label, facts_json, budget_label, budget_value, map_query, action_label, action_url, gallery_json)
VALUES (${q(g.slug)}, ${q(g.title)}, ${q(g.excerpt)}, ${q(g.body)}, ${q(r.html)}, ${r.minutes},
  (SELECT id FROM categories WHERE slug = ${q(g.category)}), (SELECT id FROM authors WHERE slug = 'redaksi'), 'published',
  ${q(g.hero)}, 1600, 900, ${q(g.heroAlt)}, ${q(g.caption)}, ${q(g.credit)}, ${q(g.creditUrl)}, ${q(JSON.stringify(g.sources))}, ${at}, ${at}, ${at},
  ${q(g.city)}, ${q(provinceOf[g.city])}, ${q(g.name)}, ${q(g.location)}, ${q(JSON.stringify(g.facts))}, ${q(g.budget?.label)}, ${q(g.budget?.value)},
  ${q(g.mapQuery)}, ${q(g.action?.label)}, ${q(g.action?.url)}, ${q(g.gallery ? JSON.stringify(g.gallery) : null)});`);
  const tag = g.name.toLowerCase();
  out.push(`INSERT OR IGNORE INTO tags (slug, name) VALUES (${q(slugify(tag))}, ${q(tag)});`);
  out.push(`INSERT OR IGNORE INTO article_tags (article_id, tag_id) SELECT a.id, t.id FROM articles a, tags t WHERE a.slug = ${q(g.slug)} AND t.slug = ${q(slugify(tag))};`);
}
mkdirSync('.data', { recursive: true });
writeFileSync('.data/seed-local-wisdom.sql', out.join('\n') + '\n');
console.log(`seed-local-wisdom.sql: ${guides.length} panduan`);
