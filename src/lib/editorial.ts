import { slugify } from '../utils/articles';
import { isResolvableHero } from './media';
import { renderMarkdown } from './markdown.mjs';

export type Source = { name: string; title: string; url: string };
export type ArticleAction = 'draft' | 'review' | 'schedule' | 'publish' | 'archive';

export type ArticleValues = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  tags: string;
  heroUrl: string;
  heroAlt: string;
  heroCaption: string;
  heroCredit: string;
  heroCreditUrl: string;
  heroWidth: string;
  heroHeight: string;
  sources: Source[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  isHeadline: boolean;
  publishWib: string;
  body: string;
};

export type PreparedArticle = {
  values: ArticleValues;
  action: ArticleAction;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  publishedAt: number | null;
  slug: string;
  tagList: { slug: string; name: string }[];
  sources: Source[];
  bodyHtml: string;
  readingMinutes: number;
  errors: Record<string, string>;
};

const ACTIONS = new Set<ArticleAction>(['draft', 'review', 'schedule', 'publish', 'archive']);

export function emptyValues(): ArticleValues {
  return {
    title: '',
    slug: '',
    excerpt: '',
    category: 'news',
    author: 'redaksi',
    tags: '',
    heroUrl: '',
    heroAlt: '',
    heroCaption: '',
    heroCredit: '',
    heroCreditUrl: '',
    heroWidth: '',
    heroHeight: '',
    sources: [blankSource(), blankSource(), blankSource()],
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
    isHeadline: false,
    publishWib: '',
    body: '',
  };
}

function blankSource(): Source {
  return { name: '', title: '', url: '' };
}

export function valuesFromRecord(record: {
  title: string;
  slug: string;
  excerpt: string;
  category_slug: string;
  author_slug: string;
  hero_r2_key: string | null;
  hero_alt: string;
  hero_caption: string;
  hero_credit: string;
  hero_credit_url: string | null;
  hero_width: number | null;
  hero_height: number | null;
  sources_json: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  is_headline: number;
  published_at: number | null;
  body_markdown: string;
  tags: { name: string }[];
}): ArticleValues {
  let sources: Source[] = [];
  try {
    const parsed = JSON.parse(record.sources_json) as Source[];
    if (Array.isArray(parsed)) sources = parsed.map((source) => ({ name: source.name || '', title: source.title || '', url: source.url || '' }));
  } catch {
    sources = [];
  }
  while (sources.length < 3) sources.push(blankSource());
  return {
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    category: record.category_slug,
    author: record.author_slug,
    tags: record.tags.map((tag) => tag.name).join(', '),
    heroUrl: record.hero_r2_key || '',
    heroAlt: record.hero_alt || '',
    heroCaption: record.hero_caption || '',
    heroCredit: record.hero_credit || '',
    heroCreditUrl: record.hero_credit_url || '',
    heroWidth: record.hero_width ? String(record.hero_width) : '',
    heroHeight: record.hero_height ? String(record.hero_height) : '',
    sources,
    seoTitle: record.seo_title || '',
    seoDescription: record.seo_description || '',
    canonicalUrl: record.canonical_url || '',
    isHeadline: record.is_headline === 1,
    publishWib: epochToWibInput(record.published_at),
    body: record.body_markdown || '',
  };
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

/** "2026-11-13T15:30" diartikan sebagai WIB (UTC+7, tanpa DST). */
export function wibInputToEpoch(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const ms = Date.parse(`${value}:00+07:00`);
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / 1000);
}

export function epochToWibInput(epoch: number | null | undefined): string {
  if (!epoch) return '';
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(epoch * 1000))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parseArticleForm(form: FormData, mediaBase?: string | null): PreparedArticle {
  const names = form.getAll('source_name').map((value) => String(value).trim());
  const titles = form.getAll('source_title').map((value) => String(value).trim());
  const urls = form.getAll('source_url').map((value) => String(value).trim());
  const count = Math.max(names.length, titles.length, urls.length, 3);
  const sources: Source[] = [];
  for (let i = 0; i < count; i++) sources.push({ name: names[i] || '', title: titles[i] || '', url: urls[i] || '' });

  const actionRaw = field(form, 'action');
  const action: ArticleAction = ACTIONS.has(actionRaw as ArticleAction) ? (actionRaw as ArticleAction) : 'draft';
  const title = field(form, 'title');
  const values: ArticleValues = {
    title,
    slug: field(form, 'slug'),
    excerpt: field(form, 'excerpt'),
    category: field(form, 'category'),
    author: field(form, 'author'),
    tags: field(form, 'tags'),
    heroUrl: field(form, 'hero_url'),
    heroAlt: field(form, 'hero_alt'),
    heroCaption: field(form, 'hero_caption'),
    heroCredit: field(form, 'hero_credit'),
    heroCreditUrl: field(form, 'hero_credit_url'),
    heroWidth: field(form, 'hero_width'),
    heroHeight: field(form, 'hero_height'),
    sources,
    seoTitle: field(form, 'seo_title'),
    seoDescription: field(form, 'seo_description'),
    canonicalUrl: field(form, 'canonical_url'),
    isHeadline: form.get('is_headline') === '1',
    publishWib: field(form, 'publish_wib'),
    body: typeof form.get('body') === 'string' ? String(form.get('body')) : '',
  };

  const errors: Record<string, string> = {};
  const strict = action === 'review' || action === 'schedule' || action === 'publish';
  if (title.length < 8 || title.length > 120) errors.title = 'Judul wajib diisi, 8–120 karakter.';
  const slugBase = slugify(values.slug || title);
  if (!slugBase) errors.slug = 'Slug tidak valid.';
  if (values.slug && !/^[a-z0-9-]+$/.test(values.slug)) errors.slug = 'Slug hanya huruf kecil, angka, dan tanda hubung.';

  if (!values.category) errors.category = 'Pilih kategori.';
  if (!values.author) errors.author = 'Pilih penulis.';

  if (strict) {
    if (values.excerpt.length < 50 || values.excerpt.length > 170) errors.excerpt = 'Ringkasan wajib 50–170 karakter.';
    if (!values.heroUrl) errors.heroUrl = 'URL gambar utama wajib diisi.';
    else if (!isResolvableHero(values.heroUrl, mediaBase)) errors.heroUrl = 'Pakai URL https:// atau path /… (kunci R2 butuh MEDIA_BASE).';
    if (values.heroAlt.length < 5) errors.heroAlt = 'Teks alternatif gambar minimal 5 karakter.';
    if (!values.heroCaption) errors.heroCaption = 'Keterangan foto wajib diisi.';
    if (!values.heroCredit) errors.heroCredit = 'Kredit foto wajib diisi.';
    if (!/^https:\/\/\S+$/.test(values.heroCreditUrl)) errors.heroCreditUrl = 'URL kredit wajib https://.';
    const tagList = splitTags(values.tags);
    if (!tagList.length) errors.tags = 'Isi minimal satu tag.';
  }

  if (values.seoTitle && values.seoTitle.length > 70) errors.seoTitle = 'Judul SEO maksimal 70 karakter.';
  if (values.seoDescription && (values.seoDescription.length < 50 || values.seoDescription.length > 170)) {
    errors.seoDescription = 'Deskripsi SEO, jika diisi, 50–170 karakter.';
  }
  if (values.canonicalUrl && !/^https:\/\/\S+$/.test(values.canonicalUrl)) errors.canonicalUrl = 'URL kanonis harus https://.';
  if (values.heroWidth && !/^\d{2,5}$/.test(values.heroWidth)) errors.heroWidth = 'Lebar harus angka.';
  if (values.heroHeight && !/^\d{2,5}$/.test(values.heroHeight)) errors.heroHeight = 'Tinggi harus angka.';

  const filledSources = sources.filter((source) => source.name || source.title || source.url);
  if (strict) {
    if (filledSources.length < 3) errors.sources = 'Minimal 3 sumber.';
    filledSources.forEach((source, index) => {
      if (!source.name || !source.title || !/^https:\/\/\S+$/.test(source.url)) {
        errors[`source-${index}`] = `Sumber ${index + 1} perlu nama, judul, dan URL https://.`;
      }
    });
  } else {
    filledSources.forEach((source, index) => {
      if ((source.name || source.title || source.url) && !/^https:\/\/\S+$/.test(source.url)) {
        errors[`source-${index}`] = `URL sumber ${index + 1} harus https:// atau dikosongkan.`;
      }
    });
  }

  const now = Math.floor(Date.now() / 1000);
  let publishedAt = values.publishWib ? wibInputToEpoch(values.publishWib) : null;
  if (values.publishWib && publishedAt == null) errors.publishWib = 'Waktu tayang tidak valid.';
  let status: PreparedArticle['status'] = 'draft';
  if (action === 'review') status = 'review';
  if (action === 'archive') status = 'archived';
  if (action === 'schedule') {
    status = 'scheduled';
    if (publishedAt == null) errors.publishWib = 'Jadwal wajib diisi (waktu WIB).';
  }
  if (action === 'publish') {
    if (publishedAt != null && publishedAt > now + 60) status = 'scheduled';
    else {
      status = 'published';
      publishedAt = publishedAt ?? now;
    }
  }
  if ((status === 'scheduled' || status === 'published') && publishedAt == null) {
    errors.publishWib = errors.publishWib || 'Waktu terbit wajib untuk jadwal dan tayang.';
  }

  const rendered = renderMarkdown(values.body);
  if (strict && rendered.minutes <= 1 && values.body.trim().length < 80) errors.body = 'Isi artikel masih terlalu pendek.';

  return {
    values,
    action,
    status,
    publishedAt,
    slug: slugBase,
    tagList: splitTags(values.tags),
    sources: filledSources,
    bodyHtml: rendered.html,
    readingMinutes: rendered.minutes,
    errors,
  };
}

function splitTags(value: string): { slug: string; name: string }[] {
  const seen = new Set<string>();
  const tags: { slug: string; name: string }[] = [];
  for (const part of value.split(',')) {
    const name = part.trim();
    const slug = slugify(name);
    if (!name || !slug || seen.has(slug)) continue;
    seen.add(slug);
    tags.push({ slug, name });
  }
  return tags;
}
