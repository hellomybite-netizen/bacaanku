/** Disuntik saat build lewat vite.define. `static` = pratinjau GitHub Pages. */
export const IS_STATIC = __BUILD_MODE__ === 'static';

/** Catatan "contoh fiktif" di footer. Aktif di preview, atau jika PUBLIC_PROTOTYPE=1. */
export const SHOW_PROTOTYPE_NOTE = IS_STATIC || import.meta.env.PUBLIC_PROTOTYPE === '1';
