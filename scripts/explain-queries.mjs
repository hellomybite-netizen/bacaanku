// EXPLAIN QUERY PLAN untuk query publik. Gagal jika ada SCAN pada tabel articles.
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import * as sql from '../src/lib/sql.mjs';

const dbPath = resolve(process.argv[2] || '.data/bacaanku.sqlite');
const db = new DatabaseSync(dbPath);
const queries = {
  sqlLatest: sql.sqlLatest,
  sqlHeadline: sql.sqlHeadline,
  sqlByCategory: sql.sqlByCategory,
  sqlByCategoryBefore: sql.sqlByCategoryBefore,
  sqlByAuthor: sql.sqlByAuthor,
  sqlBySlug: sql.sqlBySlug,
  sqlByTag: sql.sqlByTag,
  sqlArticle: sql.sqlArticle,
  sqlArticleTags: sql.sqlArticleTags,
  sqlRelated: sql.sqlRelated,
  sqlRedirect: sql.sqlRedirect,
  sqlSearch: sql.sqlSearch,
  sqlNews: sql.sqlNews,
  sqlMonth: sql.sqlMonth,
  sqlPublishedBounds: sql.sqlPublishedBounds,
  sqlDue: sql.sqlDue,
  sqlAdminByStatus: sql.sqlAdminByStatus,
  sqlCategoryBySlug: sql.sqlCategoryBySlug,
  sqlTagBySlug: sql.sqlTagBySlug,
};

let failed = false;
for (const [name, query] of Object.entries(queries)) {
  const plan = db.prepare(`EXPLAIN QUERY PLAN ${query}`).all();
  const text = plan.map((row) => row.detail).join(' | ');
  const scan = /SCAN (TABLE )?articles\b/.test(text);
  console.log(`${scan ? 'GAGAL' : 'ok'} ${name}: ${text}`);
  if (scan) failed = true;
}

const published = db.prepare(`SELECT COUNT(*) AS n FROM articles WHERE status = 'published'`).get().n;
const leonid = db.prepare(`SELECT slug, hero_r2_key FROM articles WHERE slug = ?`).get('hujan-meteor-leonid-2026-puncak-17-18-november');
const fts = db.prepare(`SELECT a.slug FROM articles_fts JOIN articles a ON a.id = articles_fts.rowid WHERE articles_fts MATCH 'leonid' LIMIT 1`).get();
const sources = leonid && JSON.parse(db.prepare(`SELECT sources_json AS s FROM articles WHERE slug = ?`).get(leonid.slug).s);
const script = db.prepare(`SELECT COUNT(*) AS n FROM articles WHERE body_html LIKE '%<script%'`).get().n;
console.log(`artikel terbit: ${published}`);
console.log(`leonid hero: ${leonid?.hero_r2_key}`);
console.log(`fts leonid: ${fts?.slug || 'TIDAK KETEMU'}`);
console.log(`sumber leonid: ${sources?.length ?? 0}`);
console.log(`body mengandung script: ${script}`);
if (!leonid?.hero_r2_key?.startsWith('/media/')) failed = true;
if (!fts) failed = true;
if ((sources?.length ?? 0) < 3) failed = true;
if (script !== 0) failed = true;
if (published < 1) failed = true;
if (failed) {
  console.error('verifikasi query/data gagal');
  process.exit(1);
}
console.log('EXPLAIN dan data lokal lolos.');
