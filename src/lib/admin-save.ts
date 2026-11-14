import { getDb, getEnv } from './db';
import { csrfMatches, type Session } from './auth';
import { parseArticleForm, validateRemoteHeroSize, type ArticleValues } from './editorial';
import { purgeContent, purgeForArticle } from './purge';
import { adminArticle, saveArticle } from './repo';
import { sqlArticleTags } from './sql.mjs';

export type SaveResult =
  | { ok: false; errors: Record<string, string>; values: ArticleValues }
  | { ok: true; redirect: string; id: number };

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
  if (Object.keys(prepared.errors).length) return { ok: false, errors: prepared.errors, values: prepared.values };
  const db = getDb();
  const saved = await saveArticle(db, prepared, opts.id);
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
  const job = purgeContent(env, target).catch((error) => console.error('purge', error));
  if (opts.waitUntil) opts.waitUntil(job);
  else await job;
  return { ok: true, id: saved.id, redirect: `/admin/artikel/${saved.id}/?tersimpan=1` };
}

export async function loadEditor(id: number) {
  return adminArticle(getDb(), id);
}
