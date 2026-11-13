// Memindahkan src/content ke SQLite/D1 lokal.
//   node scripts/migrate-content.mjs --dry-run
//   node scripts/migrate-content.mjs [--db .data/bacaanku.sqlite]
// Gambar disalin ke public/media/articles/ dan disimpan sebagai path /media/articles/…
// (bukan kunci R2). HTML disanitasi saat migrasi, sama seperti simpan di admin.
import { copyFile, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';
import { renderMarkdown } from '../src/lib/markdown.mjs';

const root = resolve(import.meta.dirname, '..');
const dry = process.argv.includes('--dry-run');
const dbFlag = process.argv.indexOf('--db');
const dbPath = resolve(dbFlag >= 0 ? process.argv[dbFlag + 1] : join(root, '.data/bacaanku.sqlite'));
const mediaDir = join(root, 'public/media/articles');
const emails = {
  redaksi: 'redaksi@bacaankunetwork.com',
  rizal: 'rizal@bacaankunetwork.com',
  jenny: 'jenny@bacaankunetwork.com',
  rere: 'rere@bacaankunetwork.com',
};

const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error('frontmatter hilang');
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!pair) continue;
    let value = pair[2].trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      data[pair[1]] = [...value.slice(1, -1).matchAll(/"([^"]*)"/g)].map((item) => item[1]);
      continue;
    }
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else if (value === 'true' || value === 'false') {
      data[pair[1]] = value === 'true';
      continue;
    }
    data[pair[1]] = value;
  }
  return { data, body: match[2] };
}

function publicUrl(file) {
  return `/media/articles/${basename(file)}`;
}

async function dimensions(file) {
  try {
    const meta = await sharp(file).metadata();
    return { width: meta.width ?? null, height: meta.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

function extractSources(body) {
  const match = body.match(/<div class="sources">([\s\S]*?)<\/div>/);
  if (!match) return { body, sources: [] };
  const sources = [];
  for (const line of match[1].split(/\r?\n/)) {
    const link = line.match(/^\s*[-*]\s+(.*?)\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*(.*)$/);
    if (!link) continue;
    const name = link[1].replace(/\*\*/g, '').replace(/\s+[—-]\s*$/, '').trim();
    if (!name || /^sumber:?$/i.test(name)) continue;
    const extra = link[4].replace(/^\((.*)\)$/, '$1').trim();
    sources.push({ name, title: extra ? `${link[2]} (${extra})` : link[2], url: link[3] });
  }
  return { body: body.replace(match[0], '').trim(), sources };
}

function applyFigures(body, images) {
  const imports = new Map();
  body = body.replace(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm, (_, name, spec) => {
    imports.set(name, spec);
    return '';
  });
  body = body.replace(/<Figure\b([\s\S]*?)\/>/g, (_, attrs) => {
    const srcName = /src=\{(\w+)\}/.exec(attrs)?.[1];
    const file = srcName ? images.get(imports.get(srcName) || '') : '';
    const attr = (key) => new RegExp(`${key}="([^"]*)"`).exec(attrs)?.[1] || '';
    const src = file ? publicUrl(file) : '';
    const creditUrl = attr('creditUrl');
    const credit = attr('credit');
    const caption = attr('caption');
    const creditHtml = credit
      ? `<span class="credit">${creditUrl ? `<a href="${esc(creditUrl)}">${esc(credit)}</a>` : esc(credit)}</span>`
      : '';
    return `<figure class="inline-figure"><img src="${esc(src)}" alt="${esc(attr('alt'))}" loading="lazy" decoding="async"><figcaption>${esc(caption)}${creditHtml}</figcaption></figure>`;
  });
  return body.trim();
}

async function collectImages(dir, body, heroImage) {
  const images = new Map();
  const specs = [];
  if (heroImage) specs.push(heroImage);
  for (const match of body.matchAll(/^import\s+\w+\s+from\s+['"]([^'"]+)['"]/gm)) specs.push(match[1]);
  for (const spec of specs) {
    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(spec)) continue;
    const file = resolve(dir, spec);
    images.set(spec, file);
  }
  return images;
}

const articleDir = join(root, 'src/content/articles');
const authorDir = join(root, 'src/content/authors');
const articleFiles = (await readdir(articleDir)).filter((name) => /\.mdx?$/.test(name));
const authorFiles = (await readdir(authorDir)).filter((name) => name.endsWith('.json'));
const articles = [];
for (const name of articleFiles) {
  const file = join(articleDir, name);
  const parsed = parseFrontmatter(await readFile(file, 'utf8'));
  const images = await collectImages(articleDir, parsed.body, parsed.data.heroImage);
  const withFigures = applyFigures(parsed.body, images);
  const { body, sources } = extractSources(withFigures);
  const rendered = renderMarkdown(body);
  const heroFile = parsed.data.heroImage ? images.get(parsed.data.heroImage) : null;
  const size = heroFile && !dry ? await dimensions(heroFile) : { width: null, height: null };
  if (basename(file, file.endsWith('.mdx') ? '.mdx' : '.md') !== parsed.data.slug) {
    console.warn(`peringatan: nama file ${name} berbeda dari slug ${parsed.data.slug}`);
  }
  articles.push({
    ...parsed.data,
    tags: parsed.data.tags || [],
    body,
    html: rendered.html,
    minutes: rendered.minutes,
    sources,
    heroFile,
    heroUrl: heroFile ? publicUrl(heroFile) : null,
    ...size,
    publishedAt: Math.floor(Date.parse(parsed.data.publishDate) / 1000),
    updatedAt: Math.floor(Date.parse(parsed.data.updatedDate || parsed.data.publishDate) / 1000),
    images: [...images.values()],
  });
}

console.log(`${dry ? 'dry-run' : 'migrasi'}: ${articles.length} artikel, ${authorFiles.length} penulis`);
for (const article of articles) {
  console.log(`- ${article.category}/${article.slug} sumber=${article.sources.length} gambar=${article.heroUrl || 'tanpa'} menit=${article.minutes}`);
}

if (dry) {
  console.log('dry-run selesai, tidak ada berkas yang ditulis.');
  process.exit(0);
}

await mkdir(mediaDir, { recursive: true });
const copied = new Set();
for (const article of articles) {
  for (const file of article.images) {
    if (copied.has(file)) continue;
    await copyFile(file, join(mediaDir, basename(file)));
    copied.add(file);
  }
}
console.log(`gambar disalin: ${copied.size} → public/media/articles/`);

await mkdir(dirname(dbPath), { recursive: true });
await rm(dbPath, { force: true });
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');
db.exec(await readFile(join(root, 'docs/schema.sql'), 'utf8'));

const upsertAuthor = db.prepare(`
  INSERT INTO authors (slug, name, role, bio, x_handle, email)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    role = excluded.role,
    bio = excluded.bio,
    x_handle = COALESCE(excluded.x_handle, authors.x_handle),
    email = COALESCE(authors.email, excluded.email)
`);
for (const name of authorFiles) {
  const author = JSON.parse(await readFile(join(authorDir, name), 'utf8'));
  upsertAuthor.run(author.slug, author.name, author.role || '', author.bio || '', author.x || null, emails[author.slug] || null);
}

const insertArticle = db.prepare(`
  INSERT INTO articles (
    slug, title, excerpt, body_markdown, body_html, reading_minutes,
    category_id, author_id, status, hero_r2_key, hero_width, hero_height,
    hero_alt, hero_caption, hero_credit, hero_credit_url, sources_json,
    seo_title, canonical_url, is_headline, published_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    (SELECT id FROM categories WHERE slug = ?),
    (SELECT id FROM authors WHERE slug = ?),
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  )
`);
const insertTag = db.prepare(`INSERT INTO tags (slug, name) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name`);
const selectTag = db.prepare(`SELECT id FROM tags WHERE slug = ?`);
const linkTag = db.prepare(`INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`);
const selectArticle = db.prepare(`SELECT id FROM articles WHERE slug = ?`);

const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

for (const article of articles) {
  insertArticle.run(
    article.slug,
    article.title,
    article.description,
    article.body,
    article.html,
    article.minutes,
    article.category,
    article.author,
    article.draft ? 'draft' : 'published',
    article.heroUrl,
    article.width,
    article.height,
    article.heroAlt || '',
    article.heroCaption || '',
    article.heroCredit || '',
    article.heroCreditUrl || null,
    JSON.stringify(article.sources),
    article.seoTitle || null,
    article.canonical || null,
    article.featured ? 1 : 0,
    article.publishedAt,
    article.updatedAt,
  );
  const id = selectArticle.get(article.slug).id;
  for (const tag of article.tags) {
    const slug = slugify(tag);
    insertTag.run(slug, tag);
    linkTag.run(id, selectTag.get(slug).id);
  }
}

const count = db.prepare(`SELECT COUNT(*) AS n FROM articles WHERE status = 'published'`).get().n;
console.log(`selesai: ${count} artikel terbit di ${dbPath}`);
