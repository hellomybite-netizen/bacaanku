/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  /** Opsional. Diisi bersama binding R2 `MEDIA` saat gambar pindah ke R2. */
  MEDIA?: R2Bucket;
  MEDIA_BASE?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_TOKEN?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  CF_ZONE_ID?: string;
  CF_PURGE_TOKEN?: string;
  /** "warn" = aturan panjang isi hanya peringatan (masa transisi). Kosong/lainnya = ditegakkan (HTTP 400). */
  LENGTH_RULES?: string;
}

declare const __BUILD_MODE__: 'static' | 'server';
