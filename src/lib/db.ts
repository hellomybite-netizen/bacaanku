import { env } from 'cloudflare:workers';

export function getEnv(): Env {
  return env as Env;
}

export function getDb(): D1Database {
  const database = getEnv().DB;
  if (!database) throw new Error('Binding D1 "DB" tidak ada. Periksa wrangler.jsonc.');
  return database;
}
