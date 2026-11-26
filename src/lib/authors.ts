/**
 * Profil penulis contoh/fiktif yang sudah dipensiunkan. Artikel yang (masih) tertaut ke slug ini
 * ditampilkan atas nama Redaksi; URL /penulis/{slug}/ di-301 ke /redaksi/ (lihat src/worker.ts).
 */
export const RETIRED_AUTHOR_SLUGS: ReadonlySet<string> = new Set(['ayu-lestari', 'dimas-saputra', 'rina-pratiwi', 'rizal']);
export const REDAKSI_AUTHOR = { slug: 'redaksi', name: 'Redaksi Bacaanku' } as const;

export function publicAuthor(slug: string | null | undefined, name: string | null | undefined) {
  const s = String(slug || '').trim();
  if (!s || RETIRED_AUTHOR_SLUGS.has(s)) return { ...REDAKSI_AUTHOR, retired: Boolean(s) };
  return { slug: s, name: String(name || '').trim() || REDAKSI_AUTHOR.name, retired: false };
}
