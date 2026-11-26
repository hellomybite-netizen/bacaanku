// Aturan panjang isi artikel (keputusan Rizal 27 Nov 2026).
// Berita: 450–900 kata. Panduan (hotel/wisata/kuliner): 600–1.800 kata, 4–10 subjudul `##`, wajib bagian FAQ.
// Dipakai server (validasi API + /admin) dan klien (penghitung langsung di form) — tanpa dependensi.

export const GUIDE_TYPES = ['hotel', 'wisata', 'kuliner'] as const;

export type LengthRule = {
  kind: 'news' | 'guide';
  label: string;
  minWords: number;
  maxWords: number;
  minH2: number;
  maxH2: number;
  faq: boolean;
};

export const NEWS_RULE: LengthRule = { kind: 'news', label: 'berita', minWords: 450, maxWords: 900, minH2: 0, maxH2: 0, faq: false };
export const GUIDE_RULE: LengthRule = { kind: 'guide', label: 'panduan Hotel/Wisata/Kuliner', minWords: 600, maxWords: 1800, minH2: 4, maxH2: 10, faq: true };

export function lengthRuleFor(category: string): LengthRule {
  return (GUIDE_TYPES as readonly string[]).includes(category) ? GUIDE_RULE : NEWS_RULE;
}

export type BodyStats = { words: number; h2: string[]; faq: boolean; faqQuestions: number };

const FAQ_HEADING = /\b(faq|pertanyaan|tanya[\s-]*jawab)\b/i;

/** Hitung kata (teks yang tampil, tanpa sintaks Markdown/URL/HTML), subjudul `##`, dan bagian FAQ. */
export function bodyStats(markdown: string): BodyStats {
  const source = String(markdown || '').replace(/\r\n?/g, '\n');
  const lines = source.split('\n');
  const h2: string[] = [];
  let inFence = false;
  let inFaq = false;
  let faq = false;
  let faqQuestions = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m2 = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (m2 && !line.startsWith('###')) {
      h2.push(m2[1]);
      inFaq = FAQ_HEADING.test(m2[1]);
      if (inFaq) faq = true;
      continue;
    }
    if (/^#\s/.test(line)) { inFaq = false; continue; }
    if (inFaq && line.includes('?')) faqQuestions++;
  }
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#>*_`~|]/g, ' ');
  const words = (text.match(/[\p{L}\p{N}]+(?:[-'’.,][\p{L}\p{N}]+)*/gu) || []).length;
  return { words, h2, faq, faqQuestions };
}

const fmt = (n: number) => n.toLocaleString('id-ID');

/**
 * Isi `errors.body`, `errors.bodyHeadings`, `errors.bodyFaq` bila melanggar aturan.
 * Mengembalikan statistik supaya pemanggil bisa menampilkan angka sekarang.
 */
export function checkLength(markdown: string, category: string, errors: Record<string, string>): BodyStats {
  const rule = lengthRuleFor(category);
  const stats = bodyStats(markdown);
  if (stats.words < rule.minWords || stats.words > rule.maxWords) {
    errors.body = `Isi ${rule.label} harus ${fmt(rule.minWords)}–${fmt(rule.maxWords)} kata (sekarang ${fmt(stats.words)} kata). ${
      stats.words < rule.minWords ? `Tambah sekitar ${fmt(rule.minWords - stats.words)} kata.` : `Pangkas sekitar ${fmt(stats.words - rule.maxWords)} kata.`
    }`;
  }
  if (rule.kind === 'guide') {
    const n = stats.h2.length;
    if (n < rule.minH2 || n > rule.maxH2) {
      errors.bodyHeadings = `Panduan perlu ${rule.minH2}–${rule.maxH2} subjudul "## " (sekarang ${n}). Bagian FAQ ikut dihitung.`;
    }
    if (!stats.faq) {
      errors.bodyFaq = 'Panduan wajib punya bagian FAQ: subjudul "## FAQ" atau "## Pertanyaan yang Sering Diajukan", berisi minimal 2 pertanyaan (baris dengan tanda "?").';
    } else if (stats.faqQuestions < 2) {
      errors.bodyFaq = `Bagian FAQ perlu minimal 2 pertanyaan (baris yang memuat tanda "?"), sekarang ${stats.faqQuestions}.`;
    }
  }
  return stats;
}

/** Normalisasi untuk membandingkan isi lama vs baru (spasi akhir baris & baris kosong ganda diabaikan). */
export function sameBody(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (v: string | null | undefined) => String(v || '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  return norm(a) === norm(b);
}
