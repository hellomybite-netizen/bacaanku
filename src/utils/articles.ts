import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from '../config/site';

export type Article = CollectionEntry<'articles'>;

/** Semua artikel terbit (bukan draft), terbaru dulu. */
export async function getArticles(): Promise<Article[]> {
  const all = await getCollection('articles', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export const articleUrl = (a: Article) => `/${a.data.category}/${a.id}/`;
export const absUrl = (path: string) => new URL(path, SITE.url).href;

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function readingTime(body = ''): number {
  const words = body.replace(/[#>*_`\[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const dateFmt = new Intl.DateTimeFormat('id-ID', { timeZone: SITE.timezone, day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('id-ID', { timeZone: SITE.timezone, hour: '2-digit', minute: '2-digit', hour12: false });
export const formatDate = (d: Date) => dateFmt.format(d);
export const formatDateTime = (d: Date) => `${dateFmt.format(d)}, ${timeFmt.format(d).replace('.', ':')} WIB`;

/** Artikel terkait: kategori sama + tag sama, tanpa artikel itu sendiri. */
export function related(all: Article[], current: Article, n = 4): Article[] {
  const tags = new Set(current.data.tags);
  return all
    .filter((a) => a.id !== current.id)
    .map((a) => ({ a, score: (a.data.category === current.data.category ? 3 : 0) + a.data.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || y.a.data.publishDate.valueOf() - x.a.data.publishDate.valueOf())
    .slice(0, n)
    .map((x) => x.a);
}
