// Harga terstruktur artikel Hotel/Wisata/Kuliner (migrasi 0004).
// Aturan redaksi (docs/panduan-konten-local-wisdom.md):
// - Jangan mengarang harga. Harga utama = nominal rupiah yang sudah dicek, atau "Gratis".
// - Selalu ada tanggal cek. Harga berbayar wajib punya URL sumber https.
// - Harga tambahan yang belum bisa dicek boleh ditulis, tetapi tampil "Belum terverifikasi".

export type PriceExtra = { label: string; value: string; sourceUrl: string | null; verified: boolean };

export type GuidePrice = {
  label: string;
  value: string;
  free: boolean;
  checkedAt: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  extras: PriceExtra[];
};

export type PriceValues = {
  label: string;
  value: string;
  free: boolean;
  checkedAt: string;
  sourceName: string;
  sourceUrl: string;
  /** Satu baris per harga tambahan: "Label: nilai" atau "Label: nilai | https://sumber" */
  extra: string;
};

export type PreparedPrice = {
  label: string | null;
  value: string | null;
  free: 0 | 1;
  min: number | null;
  max: number | null;
  checkedAt: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  extraJson: string | null;
  /** true = artikel panduan tanpa harga utama (ditolak saat review/jadwal/terbit). */
  missing: boolean;
};

export const PRICE_FIELD_NAMES = ['price_label', 'price_value', 'price_free', 'price_checked_at', 'price_source_name', 'price_source_url', 'price_extra', 'price_extra_json'] as const;

export const DEFAULT_PRICE_LABEL: Record<string, string> = {
  hotel: 'Tarif kamar per malam',
  wisata: 'Tiket masuk per orang',
  kuliner: 'Harga per porsi',
};

export function emptyPrice(): PriceValues {
  return { label: '', value: '', free: false, checkedAt: '', sourceName: '', sourceUrl: '', extra: '' };
}

const HTTPS = /^https:\/\/\S+$/;
const RUPIAH = /Rp\s?\d/i;
const VAGUE = /cek (di )?situs|cek harga|hubungi|bervariasi|tergantung/i;

/** Angka rupiah di teks harga → [min, max] (untuk filter/urutan nanti). "Rp22.000–Rp60.000" → [22000, 60000]. */
export function rupiahRange(value: string): [number | null, number | null] {
  const nums = [...value.matchAll(/Rp\s?(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:\s?(rb|ribu|jt|juta))?/gi)].map((m) => {
    let n = Number(m[1].replace(/[.\s]/g, ''));
    const unit = (m[2] || '').toLowerCase();
    if (unit === 'rb' || unit === 'ribu') n *= 1000;
    if (unit === 'jt' || unit === 'juta') n *= 1_000_000;
    return n;
  }).filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return [null, null];
  return [Math.min(...nums), Math.max(...nums)];
}

/** Tanggal hari ini (WIB) sebagai YYYY-MM-DD. */
export function todayWib(nowMs = Date.now()): string {
  return new Date(nowMs + 7 * 3600_000).toISOString().slice(0, 10);
}

export function extrasToText(list: PriceExtra[]): string {
  return list.map((e) => `${e.label}: ${e.value}${e.sourceUrl ? ` | ${e.sourceUrl}` : ''}`).join('\n');
}

function parseExtras(text: string, json: string, errors: Record<string, string>): PriceExtra[] {
  if (json) {
    let list: unknown;
    try { list = JSON.parse(json); } catch { list = null; }
    if (!Array.isArray(list)) {
      errors.priceExtra = 'price_extra_json harus array JSON [{"label":"…","value":"…","source_url":"https://…"}].';
      return [];
    }
    return list.map((raw) => {
      const e = raw as Record<string, unknown>;
      const sourceUrl = String(e.source_url ?? e.sourceUrl ?? '').trim() || null;
      return { label: String(e.label ?? '').trim(), value: String(e.value ?? '').trim(), sourceUrl, verified: Boolean(sourceUrl) && e.verified !== false };
    });
  }
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [main, ...rest] = line.split('|');
    const src = rest.join('|').trim();
    const at = main.indexOf(':');
    const label = at > 0 ? main.slice(0, at).trim() : '';
    const value = at > 0 ? main.slice(at + 1).trim() : main.trim();
    return { label, value, sourceUrl: src || null, verified: Boolean(src) };
  });
}

const get = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Baca & validasi harga dari form /admin atau API terbit.
 * `guide` = kategori hotel/wisata/kuliner. `strict` = review/jadwal/terbit.
 */
export function parsePrice(form: FormData, category: string, guide: boolean, strict: boolean, errors: Record<string, string>, nowMs = Date.now()): { values: PriceValues; prepared: PreparedPrice } {
  const extraJson = get(form, 'price_extra_json');
  const values: PriceValues = {
    label: get(form, 'price_label'),
    value: get(form, 'price_value'),
    free: ['1', 'true', 'on', 'ya'].includes(get(form, 'price_free').toLowerCase()) || /^gratis$/i.test(get(form, 'price_value')),
    checkedAt: get(form, 'price_checked_at'),
    sourceName: get(form, 'price_source_name'),
    sourceUrl: get(form, 'price_source_url'),
    extra: get(form, 'price_extra'),
  };
  const extras = parseExtras(values.extra, extraJson, errors);
  if (extraJson && !values.extra) values.extra = extrasToText(extras);
  const anyFilled = Boolean(values.label || values.value || values.free || values.checkedAt || values.sourceName || values.sourceUrl || extras.length);

  if (!guide) {
    if (anyFilled) errors.price = 'Field harga hanya untuk tipe Hotel, Wisata, atau Kuliner. Kosongkan atau ganti kategori.';
    return { values, prepared: { label: null, value: null, free: 0, min: null, max: null, checkedAt: null, sourceName: null, sourceUrl: null, extraJson: null, missing: false } };
  }

  const hasMain = values.free || Boolean(values.value);
  if (values.label.length > 40) errors.priceLabel = 'Label harga maksimal 40 karakter.';
  if (!values.free && values.value) {
    if (values.value.length > 120) errors.priceValue = 'Harga utama maksimal 120 karakter.';
    else if (!RUPIAH.test(values.value) || VAGUE.test(values.value)) {
      errors.priceValue = 'Harga utama harus nominal rupiah yang sudah dicek (mis. "Rp20.000 per orang" atau "Rp450.000–Rp700.000 per malam"), atau centang Gratis. Jangan tulis "cek situs resmi".';
    }
  }
  if (values.checkedAt) {
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(values.checkedAt) && !Number.isNaN(Date.parse(`${values.checkedAt}T00:00:00+07:00`));
    if (!ok) errors.priceCheckedAt = 'Tanggal cek harus format YYYY-MM-DD.';
    else if (values.checkedAt > todayWib(nowMs)) errors.priceCheckedAt = 'Tanggal cek tidak boleh di masa depan.';
    else if (values.checkedAt < '2020-01-01') errors.priceCheckedAt = 'Tanggal cek terlalu lama. Cek ulang harganya.';
  }
  if (values.sourceUrl && !HTTPS.test(values.sourceUrl)) errors.priceSourceUrl = 'URL sumber harga harus https://.';
  if (values.sourceName.length > 80) errors.priceSourceName = 'Nama sumber maksimal 80 karakter.';

  let missing = false;
  if (strict) {
    if (!hasMain) {
      missing = true;
      errors.priceValue = errors.priceValue || 'Harga utama wajib untuk Hotel/Wisata/Kuliner (juga panduan lama): isi price_value berupa nominal rupiah yang sudah dicek, atau price_free=1 untuk tempat Gratis.';
    } else {
      if (!values.checkedAt) errors.priceCheckedAt = errors.priceCheckedAt || 'Tanggal cek harga wajib diisi.';
      if (!values.free && !values.sourceUrl) errors.priceSourceUrl = errors.priceSourceUrl || 'URL sumber harga wajib untuk harga berbayar (situs resmi, pengelola, atau media).';
    }
  }

  if (extras.length > 6) errors.priceExtra = 'Harga tambahan maksimal 6 baris.';
  extras.forEach((e, i) => {
    if (errors.priceExtra) return;
    if (!e.label || !e.value || e.label.length > 40 || e.value.length > 120) {
      errors.priceExtra = `Harga tambahan baris ${i + 1}: tulis "Label: nilai" (label ≤40, nilai ≤120 karakter).`;
    } else if (e.sourceUrl && !HTTPS.test(e.sourceUrl)) {
      errors.priceExtra = `Harga tambahan baris ${i + 1}: URL sumber harus https://.`;
    }
  });

  const value = values.free ? 'Gratis' : values.value;
  const [min, max] = values.free ? [0, 0] : rupiahRange(value);
  const nul = (v: string) => (v ? v : null);
  return {
    values,
    prepared: {
      label: hasMain ? values.label || DEFAULT_PRICE_LABEL[category] || 'Harga' : nul(values.label),
      value: nul(value),
      free: values.free ? 1 : 0,
      min: hasMain ? min : null,
      max: hasMain ? max : null,
      checkedAt: nul(values.checkedAt),
      sourceName: nul(values.sourceName),
      sourceUrl: nul(values.sourceUrl),
      extraJson: extras.length ? JSON.stringify(extras.map((e) => ({ label: e.label, value: e.value, source_url: e.sourceUrl, verified: e.verified }))) : null,
      missing,
    },
  };
}

export type PriceRecord = {
  price_label: string | null; price_value: string | null; price_free: number | null; price_checked_at: string | null;
  price_source_name: string | null; price_source_url: string | null; price_extra_json: string | null;
};

function extrasFromJson(raw: unknown): PriceExtra[] {
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter((e) => e && e.label && e.value).map((e) => ({
      label: String(e.label), value: String(e.value), sourceUrl: e.source_url ? String(e.source_url) : null, verified: Boolean(e.source_url) && e.verified !== false,
    }));
  } catch { return []; }
}

export function priceFromRecord(row: Partial<PriceRecord> | null): PriceValues {
  if (!row) return emptyPrice();
  const free = Number(row.price_free) === 1;
  return {
    label: row.price_label || '', value: free ? '' : row.price_value || '', free,
    checkedAt: row.price_checked_at || '', sourceName: row.price_source_name || '', sourceUrl: row.price_source_url || '',
    extra: extrasToText(extrasFromJson(row.price_extra_json)),
  };
}

/** Baris D1 → harga untuk tampilan (Info Singkat, kartu). undefined bila belum ada harga utama. */
export function mapPrice(row: Record<string, unknown>, category: string): GuidePrice | undefined {
  const free = Number(row.price_free) === 1;
  const value = free ? 'Gratis' : typeof row.price_value === 'string' ? row.price_value : '';
  const extras = extrasFromJson(row.price_extra_json);
  if (!value && !extras.length) return undefined;
  return {
    label: (row.price_label as string) || DEFAULT_PRICE_LABEL[category] || 'Harga',
    value,
    free,
    checkedAt: (row.price_checked_at as string) || null,
    sourceName: (row.price_source_name as string) || null,
    sourceUrl: (row.price_source_url as string) || null,
    extras,
  };
}

/** "2026-11-27" → "27 Nov 2026" */
export function formatCheckedAt(date: string | null): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(`${date}T12:00:00+07:00`));
}

export const sqlUpdatePrice = `UPDATE articles SET
  price_label=?, price_value=?, price_free=?, price_min=?, price_max=?, price_checked_at=?,
  price_source_name=?, price_source_url=?, price_extra_json=?
  WHERE id=?`;

export const sqlSelectPrice = `SELECT price_label, price_value, price_free, price_checked_at, price_source_name,
  price_source_url, price_extra_json FROM articles WHERE id = ?`;
