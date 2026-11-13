export type HeroResolved = { src: string; srcset?: string };

const ABSOLUTE = /^https?:\/\//i;
const HAS_EXT = /\.(webp|avif|jpe?g|png|gif)$/i;

/**
 * hero_r2_key boleh URL https, path situs `/...`, atau kunci R2.
 * Kunci R2 hanya diselesaikan jika MEDIA_BASE terisi (R2 menyusul).
 */
export function resolveHero(key: string | null | undefined, mediaBase?: string | null): HeroResolved {
  const value = (key || '').trim();
  if (!value) return { src: '' };
  if (ABSOLUTE.test(value) || value.startsWith('/')) return { src: value };
  const base = (mediaBase || '').trim().replace(/\/$/, '');
  if (!base) return { src: '' };
  const path = value.replace(/^\/+/, '');
  if (HAS_EXT.test(path)) return { src: `${base}/${path}` };
  return {
    src: `${base}/${path}-960.webp`,
    srcset: [480, 960, 1600].map((w) => `${base}/${path}-${w}.webp ${w}w`).join(', '),
  };
}

export function isResolvableHero(key: string, mediaBase?: string | null): boolean {
  return resolveHero(key, mediaBase).src.length > 0;
}
