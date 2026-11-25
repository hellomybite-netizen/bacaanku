import { slugify } from '../utils/articles';
import { isResolvableHero, rewriteWikimediaOriginal } from './media';
import { renderMarkdown } from './markdown.mjs';
import { citySlug, getRegion, isLocalCategory, priceUnits } from '../config/site';

/** Info ulasan (niche local wisdom). Semua string mentah dari form; kosong = tidak diisi. */
export type PlaceValues = {
  province: string;
  city: string;
  placeName: string;
  placeType: string;
  address: string;
  priceMin: string;
  priceMax: string;
  priceUnit: string;
  priceNote: string;
  openingHours: string;
  rating: string;
  latitude: string;
  longitude: string;
  mapsUrl: string;
  phone: string;
  website: string;
  facilities: string;
  visitedDate: string;
};

/** Baris kolom D1 migrasi 0003 (dibaca untuk form edit). */
export type PlaceRecord = {
  province_slug: string | null; city_name: string | null; place_name: string | null; place_type: string | null;
  address: string | null; price_min: number | null; price_max: number | null; price_unit: string | null; price_note: string | null;
  opening_hours: string | null; rating: number | null; latitude: number | null; longitude: number | null; maps_url: string | null;
  phone: string | null; website: string | null; facilities_json: string | null; visited_at: number | null;
};

export function emptyPlace(): PlaceValues {
  return {
    province: '', city: '', placeName: '', placeType: '', address: '', priceMin: '', priceMax: '', priceUnit: '', priceNote: '',
    openingHours: '', rating: '', latitude: '', longitude: '', mapsUrl: '', phone: '', website: '', facilities: '', visitedDate: '',
  };
}

export function placeFromRecord(row: PlaceRecord | null | undefined): PlaceValues {
  if (!row) return emptyPlace();
  const str = (v: unknown) => (v == null ? '' : String(v));
  let facilities = '';
  try {
    const parsed = row.facilities_json ? JSON.parse(row.facilities_json) : [];
    if (Array.isArray(parsed)) facilities = parsed.join(', ');
  } catch {
    facilities = '';
  }
  return {
    province: str(row.province_slug), city: str(row.city_name), placeName: str(row.place_name), placeType: str(row.place_type),
    address: str(row.address), priceMin: str(row.price_min), priceMax: str(row.price_max), priceUnit: str(row.price_unit),
    priceNote: str(row.price_note), openingHours: str(row.opening_hours), rating: str(row.rating), latitude: str(row.latitude),
    longitude: str(row.longitude), mapsUrl: str(row.maps_url), phone: str(row.phone), website: str(row.website), facilities,
    visitedDate: row.visited_at ? new Date(row.visited_at * 1000).toISOString().slice(0, 10) : '',
  };
}

const hasAnyPlace = (place: PlaceValues) => Object.values(place).some((v) => v !== '');

/**
 * Kolom D1 yang ditulis untuk info ulasan, atau null bila tidak perlu menulis apa pun
 * (artikel berita lama tanpa isian info ulasan → query lama saja, tidak menyentuh kolom baru).
 */
export function placeColumns(values: ArticleValues): Record<string, string | number | null> | null {
  const place = values.place;
  if (!isLocalCategory(values.category) && !hasAnyPlace(place)) return null;
  const num = (v: string) => (v === '' ? null : Number(v.replace(/[^\d.-]/g, '')));
  const txt = (v: string) => (v === '' ? null : v);
  const facilities = place.facilities.split(',').map((f) => f.trim()).filter(Boolean);
  return {
    province_slug: txt(place.province),
    city_name: txt(place.city),
    city_slug: place.city ? citySlug(place.city) : null,
    place_name: txt(place.placeName),
    place_type: txt(place.placeType),
    address: txt(place.address),
    latitude: num(place.latitude),
    longitude: num(place.longitude),
    maps_url: txt(place.mapsUrl),
    phone: txt(place.phone),
    website: txt(place.website),
    price_min: num(place.priceMin),
    price_max: num(place.priceMax),
    price_unit: txt(place.priceUnit),
    price_note: txt(place.priceNote),
    opening_hours: txt(place.openingHours),
    rating: num(place.rating),
    facilities_json: facilities.length ? JSON.stringify(facilities) : null,
    visited_at: place.visitedDate ? Math.floor(Date.parse(`${place.visitedDate}T12:00:00+07:00`) / 1000) : null,
  };
}

function validatePlace(values: ArticleValues, strict: boolean, errors: Record<string, string>) {
  const place = values.place;
  const local = isLocalCategory(values.category);
  if (!local && !hasAnyPlace(place)) return;
  if (place.province && !getRegion(place.province)) errors.placeProvince = 'Provinsi tidak dikenal. Pilih dari daftar.';
  if (place.priceMin && !/^\d{1,9}$/.test(place.priceMin.replace(/\./g, ''))) errors.placePriceMin = 'Harga minimum: angka rupiah tanpa titik, mis. 25000.';
  if (place.priceMax && !/^\d{1,9}$/.test(place.priceMax.replace(/\./g, ''))) errors.placePriceMax = 'Harga maksimum: angka rupiah tanpa titik.';
  if (place.priceUnit && !(priceUnits as readonly string[]).includes(place.priceUnit)) errors.placePriceUnit = 'Satuan harga tidak dikenal.';
  if (place.rating) {
    const r = Number(place.rating.replace(',', '.'));
    if (!(r >= 1 && r <= 5) || Math.round(r * 2) !== r * 2) errors.placeRating = 'Rating 1–5, kelipatan 0,5 (mis. 4,5).';
    else place.rating = String(r);
  }
  if (place.latitude && !(Math.abs(Number(place.latitude)) <= 90)) errors.placeLat = 'Latitude tidak valid (−90 s.d. 90).';
  if (place.longitude && !(Math.abs(Number(place.longitude)) <= 180)) errors.placeLng = 'Longitude tidak valid (−180 s.d. 180).';
  for (const [key, label] of [['mapsUrl', 'Tautan peta'], ['website', 'Situs resmi']] as const) {
    if (place[key] && !/^https:\/\/\S+$/.test(place[key])) errors[`place-${key}`] = `${label} harus diawali https://.`;
  }
  if (place.visitedDate && !/^\d{4}-\d{2}-\d{2}$/.test(place.visitedDate)) errors.placeVisited = 'Tanggal kunjungan tidak valid.';
  if (strict && local) {
    if (!place.province) errors.placeProvince = 'Ulasan Hotel/Wisata/Kuliner wajib memilih provinsi.';
    if (!place.city) errors.placeCity = 'Ulasan wajib mengisi kota/kabupaten.';
    if (!place.placeName) errors.placeName = 'Ulasan wajib mengisi nama tempat.';
    if (place.address.length < 8) errors.placeAddress = 'Ulasan wajib mengisi alamat lengkap.';
    if (!place.priceMin && !place.priceNote) errors.placePriceMin = 'Isi harga minimum, atau catatan harga (mis. "Gratis").';
  }
}

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
  /** Info ulasan (opsional; wajib sebagian untuk kategori hotel/wisata/kuliner saat tayang). */
  place: PlaceValues;
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
    place: emptyPlace(),
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
  place?: PlaceRecord | null;
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
    place: placeFromRecord(record.place),
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
    heroUrl: rewriteWikimediaOriginal(field(form, 'hero_url')),
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
    place: {
      province: field(form, 'place_province'),
      city: field(form, 'place_city'),
      placeName: field(form, 'place_name'),
      placeType: field(form, 'place_type'),
      address: field(form, 'place_address'),
      priceMin: field(form, 'place_price_min').replace(/\./g, ''),
      priceMax: field(form, 'place_price_max').replace(/\./g, ''),
      priceUnit: field(form, 'place_price_unit'),
      priceNote: field(form, 'place_price_note'),
      openingHours: field(form, 'place_hours'),
      rating: field(form, 'place_rating'),
      latitude: field(form, 'place_lat'),
      longitude: field(form, 'place_lng'),
      mapsUrl: field(form, 'place_maps_url'),
      phone: field(form, 'place_phone'),
      website: field(form, 'place_website'),
      facilities: field(form, 'place_facilities'),
      visitedDate: field(form, 'place_visited'),
    },
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

  validatePlace(values, strict, errors);

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

const REMOTE_HERO_MAX_WIDTH = 2400;
const REMOTE_HERO_MAX_BYTES = Math.floor(1.5 * 1024 * 1024);
const REMOTE_PROBE_MS = 4500;

/**
 * Tolak URL https gambar utama yang jelas-jelas terlalu besar.
 * Jika probe jaringan gagal, jangan blokir simpan.
 */
export async function validateRemoteHeroSize(values: ArticleValues, errors: Record<string, string>): Promise<void> {
  const url = (values.heroUrl || '').trim();
  if (!/^https:\/\//i.test(url)) return;

  if (values.heroWidth && /^\d+$/.test(values.heroWidth) && Number(values.heroWidth) > REMOTE_HERO_MAX_WIDTH) {
    errors.heroUrl =
      'Gambar terlalu besar: lebar tertera lebih dari 2.400 piksel. Pakai versi ≤1.600 px atau tautan thumbnail Wikimedia, bukan file aslinya.';
  }

  try {
    const size = await probeRemoteImageBytes(url);
    if (size != null && size > REMOTE_HERO_MAX_BYTES) {
      errors.heroUrl =
        'Gambar terlalu besar: ukuran berkas lebih dari 1,5 MB. Kompres atau unggah ke /media/articles/, jangan tempel file asli Wikimedia.';
    }
  } catch {
    // Jangan blokir jika HEAD/Range gagal.
  }
}

async function probeRemoteImageBytes(url: string): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REMOTE_PROBE_MS);
  const headers = {
    'User-Agent': 'BacaankuNetworkBot/1.0 (https://bacaankunetwork.com; redaksi@bacaankunetwork.com)',
  };
  try {
    const head = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers });
    const fromHead = parseContentLength(head.headers.get('content-length'));
    if (fromHead != null) return fromHead;

    const ranged = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { ...headers, Range: 'bytes=0-0' },
    });
    const range = ranged.headers.get('content-range');
    const match = range ? /\/(\d+)\s*$/.exec(range) : null;
    if (match) return Number(match[1]);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseContentLength(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}
