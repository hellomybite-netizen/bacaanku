import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { getArticles } from '../utils/articles';
import { feed } from '../utils/feed';

export const GET: APIRoute = async () => feed(await getArticles(), `${SITE.name} — Berita Terkini`, SITE.description);
