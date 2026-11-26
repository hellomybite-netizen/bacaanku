import { getDb, getEnv } from './db';
import { csrfMatches, type Session } from './auth';
import { parseArticleForm, validateRemoteHeroSize, type ArticleValues } from './editorial';
import { purgeContent, purgeForArticle } from './purge';
import { adminArticle, saveArticle } from './repo';
import { sqlArticleTags } from './sql.mjs';
import { localFromRecord, sqlSelectLocal, sqlUpdateLocal, type LocalRecord } from './local-fields';
import { guideCity } from './local-guide';
import { SITE } from '../config/site';
import { checkLength, sameBody } from './length-rules';

/** Kolom lokal belum ada (migrasi 0003 belum jalan) → null, bukan error, supaya /admin berita tetap jalan. */
async function readLocal(db: D1Database, id: number): Promise<LocalRecord | null> {
  try {
    return await db.prepare(sqlSelectLocal).bind(id).first<LocalRecord>();
  } catch {
    return null;
  }
}

/**
 * Aturan panjang (berita 450–900 kata; panduan 600–1.800 kata, 4–10 `##`, FAQ) hanya berlaku saat
 * review/jadwal/terbit. Draf & arsip bebas. Artikel lama yang isinya TIDAK diubah boleh disimpan
 * ulang (mis. ganti gambar/tag/judul SEO) walau lebih pendek dari aturan baru.
 */
async function enforceLengthRules(env: Env, db: D1Database, prepared: ReturnType<typeof parseArticleForm>, id?: number): Promise<Record<string, string>> {
  const strict = prepared.action === 'review' || prepared.action === 'schedule' || prepared.action === 'publish';
  if (!strict) return {};
  if (id) {
    const stored = await db.prepare('SELECT body_markdown FROM articles WHERE id = ?').bind(id).first<{ body_markdown: string | null }>();
    if (stored && sameBody(stored.body_markdown, prepared.values.body)) return {};
  }
  const found: Record<string, string> = {};
  checkLength(prepared.values.body, prepared.values.category, found);
  // Default = masa transisi (peringatan saja): tetap tersimpan, pelanggaran dikembalikan sebagai `warnings`.
  // Ditegakkan (HTTP 400) hanya bila var Worker LENGTH_RULES="enforce" — aman walau skrip deploy tidak membawa var.
  if ((env.LENGTH_RULES || '').toLowerCase() !== 'enforce') return found;
  if (Object.keys(found).length) {
    delete prepared.errors.body;
    Object.assign(prepared.errors, found);
  }
  return {};
}

export type SaveResult =
  | { ok: false; errors: Record<string, string>; values: ArticleValues }
  | { ok: true; redirect: string; id: number; warnings?: Record<string, string> };

export async function handleArticlePost(
  request: Request,
  opts: { id?: number; session: Session; waitUntil?: (promise: Promise<unknown>) => void },
): Promise<SaveResult> {
  const env = getEnv();
  const form = await request.formData();
  const token = String(form.get('csrf') || '');
  if (!(await csrfMatches(env, opts.session, token))) {
    const prepared = parseArticleForm(form, env.MEDIA_BASE);
    return { ok: false, errors: { form: 'Sesi kedaluwarsa. Muat ulang halaman, lalu simpan lagi.' }, values: prepared.values };
  }
  const prepared = parseArticleForm(form, env.MEDIA_BASE);
  await validateRemoteHeroSize(prepared.values, prepared.errors);
  const db = getDb();
  const warnings = await enforceLengthRules(env, db, prepared, opts.id);
  if (Object.keys(prepared.errors).length) return { ok: false, errors: prepared.errors, values: prepared.values };
  const previousLocal = opts.id && prepared.local.write ? await readLocal(db, opts.id) : null;
  const saved = await saveArticle(db, prepared, opts.id);
  // Kolom local wisdom ditulis terpisah dan HANYA bila artikel tipe hotel/wisata/kuliner
  // atau field lokal dikirim. Berita biasa (alur Jenny/Rere) tidak menyentuh kolom ini.
  if (prepared.local.write) {
    const l = prepared.local;
    await db.prepare(sqlUpdateLocal).bind(
      l.citySlug, l.provinceSlug, l.placeName, l.locationLabel, l.factsJson, l.budgetLabel, l.budgetValue,
      l.mapQuery, l.actionLabel, l.actionUrl, l.galleryJson, saved.id,
    ).run();
  }
  const tags = await db.prepare(sqlArticleTags).bind(saved.id).all<{ slug: string }>();
  const category = prepared.values.category;
  const target = purgeForArticle({
    id: saved.id,
    categorySlug: category,
    slug: saved.newPath.split('/').filter(Boolean).at(-1) || prepared.slug,
    authorSlug: prepared.values.author,
    tagSlugs: tags.results.map((tag) => tag.slug),
  });
  if (saved.oldPath) target.urls.push(new URL(saved.oldPath, 'https://bacaankunetwork.com').href);
  if (prepared.local.write) {
    const origin = SITE.url.replace(/\/$/, '');
    target.tags.push('artikel', 'daerah');
    target.urls.push(`${origin}/artikel/`, `${origin}/daerah/`);
    for (const slug of new Set([prepared.local.citySlug, previousLocal?.city_slug].filter(Boolean) as string[])) {
      const city = guideCity(slug);
      if (!city) continue;
      target.tags.push(`kota-${city.slug}`, `prov-${city.province}`);
      target.urls.push(`${origin}/artikel/${city.slug}/`, `${origin}/artikel/${city.slug}/${category}/`, `${origin}/daerah/${city.province}/`);
    }
  }
  const job = purgeContent(env, target).catch((error) => console.error('purge', error));
  if (opts.waitUntil) opts.waitUntil(job);
  else await job;
  const hasWarnings = Object.keys(warnings).length > 0;
  return {
    ok: true,
    id: saved.id,
    redirect: `/admin/artikel/${saved.id}/?tersimpan=1${hasWarnings ? '&panjang=1' : ''}`,
    ...(hasWarnings ? { warnings } : {}),
  };
}

export async function loadEditor(id: number) {
  const db = getDb();
  const record = await adminArticle(db, id);
  if (!record) return null;
  return { ...record, local: localFromRecord(await readLocal(db, id)) };
}
