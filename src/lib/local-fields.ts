// Field opsional artikel local wisdom (kota + info panduan) untuk /admin dan API terbit.
// Semua field OPSIONAL: berita lama & alur Jenny/Rere yang tidak mengirim field ini tidak berubah.
import { guideCategories, guideCity, isGuideCategory } from './local-guide';

export type LocalValues = {
  city: string;          // slug kota, mis. 'probolinggo'
  placeName: string;     // nama tempat (judul kartu)
  locationLabel: string; // 'Tongas, Kab. Probolinggo'
  facts: string;         // satu baris per fakta: "Label: nilai"
  budgetLabel: string;
  budgetValue: string;
  mapQuery: string;
  actionLabel: string;
  actionUrl: string;
  gallery: string;       // satu baris per gambar: "/media/... | teks alternatif"
};

export type PreparedLocal = {
  /** true = tulis kolom lokal ke D1 (artikel tipe hotel/wisata/kuliner, atau field lokal diisi). */
  write: boolean;
  citySlug: string | null;
  provinceSlug: string | null;
  placeName: string | null;
  locationLabel: string | null;
  factsJson: string | null;
  budgetLabel: string | null;
  budgetValue: string | null;
  mapQuery: string | null;
  actionLabel: string | null;
  actionUrl: string | null;
  galleryJson: string | null;
};

export const LOCAL_FIELD_NAMES = ['kota', 'city_slug', 'place_name', 'location_label', 'facts', 'facts_json', 'budget_label', 'budget_value', 'map_query', 'action_label', 'action_url', 'gallery', 'gallery_json'] as const;

export function emptyLocal(): LocalValues {
  return { city: '', placeName: '', locationLabel: '', facts: '', budgetLabel: '', budgetValue: '', mapQuery: '', actionLabel: '', actionUrl: '', gallery: '' };
}

const get = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

/** JSON array → teks baris (untuk form). */
function factsToText(raw: string | null | undefined): string {
  try {
    const list = JSON.parse(raw || '[]') as { label?: string; value?: string }[];
    return Array.isArray(list) ? list.map((f) => `${f.label ?? ''}: ${f.value ?? ''}`).join('\n') : '';
  } catch { return ''; }
}
function galleryToText(raw: string | null | undefined): string {
  try {
    const list = JSON.parse(raw || '[]') as { src?: string; alt?: string }[];
    return Array.isArray(list) ? list.map((g) => `${g.src ?? ''} | ${g.alt ?? ''}`).join('\n') : '';
  } catch { return ''; }
}

export type LocalRecord = {
  city_slug: string | null; place_name: string | null; location_label: string | null; facts_json: string | null;
  budget_label: string | null; budget_value: string | null; map_query: string | null; action_label: string | null;
  action_url: string | null; gallery_json: string | null;
};

export function localFromRecord(row: LocalRecord | null): LocalValues {
  if (!row) return emptyLocal();
  return {
    city: row.city_slug || '', placeName: row.place_name || '', locationLabel: row.location_label || '',
    facts: factsToText(row.facts_json), budgetLabel: row.budget_label || '', budgetValue: row.budget_value || '',
    mapQuery: row.map_query || '', actionLabel: row.action_label || '', actionUrl: row.action_url || '', gallery: galleryToText(row.gallery_json),
  };
}

function parseJsonList(raw: string): unknown[] | null {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : null; } catch { return null; }
}

/**
 * Baca field lokal dari form/API. `tipe` = alias kategori (hotel|wisata|kuliner), `kota` = slug kota.
 * Mengisi `errors` dengan pesan Bahasa Indonesia yang sama gayanya dengan field lain.
 */
export function parseLocal(form: FormData, category: string, strict: boolean, errors: Record<string, string>): { values: LocalValues; prepared: PreparedLocal } {
  const factsText = get(form, 'facts');
  const factsJsonRaw = get(form, 'facts_json');
  const galleryText = get(form, 'gallery');
  const galleryJsonRaw = get(form, 'gallery_json');
  const values: LocalValues = {
    city: (get(form, 'kota') || get(form, 'city_slug')).toLowerCase(),
    placeName: get(form, 'place_name'),
    locationLabel: get(form, 'location_label'),
    facts: factsText,
    budgetLabel: get(form, 'budget_label'),
    budgetValue: get(form, 'budget_value'),
    mapQuery: get(form, 'map_query'),
    actionLabel: get(form, 'action_label'),
    actionUrl: get(form, 'action_url'),
    gallery: galleryText,
  };
  const guide = isGuideCategory(category);
  const anyFilled = Object.values(values).some(Boolean) || Boolean(factsJsonRaw || galleryJsonRaw);
  const write = guide || anyFilled || form.get('local_fields') === '1';

  if (anyFilled && !guide) {
    errors.local = `Field kota/panduan hanya untuk tipe ${guideCategories.map((c) => c.name).join(', ')}. Kosongkan field itu atau ganti kategori.`;
  }

  const city = values.city ? guideCity(values.city) : undefined;
  if (values.city && !city) errors.city = `Kota "${values.city}" belum terdaftar. Pakai slug kota yang ada di panduan (mis. probolinggo, malang, batu, kediri, solo) atau minta admin menambahkannya.`;
  if (guide && strict && !values.city) errors.city = 'Kota wajib diisi untuk artikel Hotel/Wisata/Kuliner.';
  if (guide && strict && !values.locationLabel) errors.locationLabel = 'Lokasi singkat wajib diisi (mis. "Tongas, Kab. Probolinggo").';
  if (values.placeName.length > 80) errors.placeName = 'Nama tempat maksimal 80 karakter.';
  if (values.locationLabel.length > 80) errors.locationLabel = 'Lokasi singkat maksimal 80 karakter.';
  if (values.mapQuery.length > 140) errors.mapQuery = 'Kata kunci peta maksimal 140 karakter.';

  // Fakta: baris "Label: nilai" atau facts_json (API).
  let facts: { label: string; value: string }[] = [];
  if (factsJsonRaw) {
    const list = parseJsonList(factsJsonRaw);
    if (!list) errors.facts = 'facts_json harus array JSON [{"label":"…","value":"…"}].';
    else facts = list.map((f) => ({ label: String((f as { label?: unknown }).label ?? '').trim(), value: String((f as { value?: unknown }).value ?? '').trim() }));
    if (!values.facts) values.facts = facts.map((f) => `${f.label}: ${f.value}`).join('\n');
  } else if (factsText) {
    facts = factsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const at = line.indexOf(':');
      return at > 0 ? { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() } : { label: '', value: line };
    });
  }
  if (facts.length > 8) errors.facts = 'Info Singkat maksimal 8 baris.';
  if (facts.some((f) => !f.label || !f.value || f.label.length > 40 || f.value.length > 200)) {
    errors.facts = errors.facts || 'Setiap baris Info Singkat ditulis "Label: nilai" (label ≤40, nilai ≤200 karakter).';
  }

  if (Boolean(values.budgetLabel) !== Boolean(values.budgetValue)) errors.budget = 'Isi label dan nilai anggaran sekaligus, atau kosongkan keduanya.';
  if (values.actionUrl && !/^https:\/\/\S+$/.test(values.actionUrl)) errors.actionUrl = 'URL tombol aksi harus https://.';
  if (values.actionUrl && !values.actionLabel) errors.actionLabel = 'Teks tombol aksi wajib bila URL diisi.';
  if (values.actionLabel.length > 60) errors.actionLabel = 'Teks tombol aksi maksimal 60 karakter.';

  // Galeri: baris "src | alt" atau gallery_json (API).
  let gallery: { src: string; alt: string }[] = [];
  if (galleryJsonRaw) {
    const list = parseJsonList(galleryJsonRaw);
    if (!list) errors.gallery = 'gallery_json harus array JSON [{"src":"…","alt":"…"}].';
    else gallery = list.map((g) => ({ src: String((g as { src?: unknown }).src ?? '').trim(), alt: String((g as { alt?: unknown }).alt ?? '').trim() }));
    if (!values.gallery) values.gallery = gallery.map((g) => `${g.src} | ${g.alt}`).join('\n');
  } else if (galleryText) {
    gallery = galleryText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [src, ...rest] = line.split('|');
      return { src: (src ?? '').trim(), alt: rest.join('|').trim() };
    });
  }
  if (gallery.length > 6) errors.gallery = 'Galeri maksimal 6 gambar tambahan.';
  if (gallery.some((g) => !/^(https:\/\/\S+|\/\S+)$/.test(g.src) || g.alt.length < 5)) {
    errors.gallery = errors.gallery || 'Setiap baris galeri: "URL https:// atau /media/… | teks alternatif (min. 5 karakter)".';
  }

  const nul = (v: string) => (v ? v : null);
  return {
    values,
    prepared: {
      write,
      citySlug: city?.slug ?? null,
      provinceSlug: city?.province ?? null,
      placeName: nul(values.placeName),
      locationLabel: nul(values.locationLabel),
      factsJson: facts.length ? JSON.stringify(facts) : null,
      budgetLabel: nul(values.budgetLabel),
      budgetValue: nul(values.budgetValue),
      mapQuery: nul(values.mapQuery),
      actionLabel: nul(values.actionLabel),
      actionUrl: nul(values.actionUrl),
      galleryJson: gallery.length ? JSON.stringify(gallery) : null,
    },
  };
}

export const sqlUpdateLocal = `UPDATE articles SET
  city_slug=?, province_slug=?, place_name=?, location_label=?, facts_json=?, budget_label=?, budget_value=?,
  map_query=?, action_label=?, action_url=?, gallery_json=?
  WHERE id=?`;

export const sqlSelectLocal = `SELECT city_slug, place_name, location_label, facts_json, budget_label, budget_value,
  map_query, action_label, action_url, gallery_json FROM articles WHERE id = ?`;
