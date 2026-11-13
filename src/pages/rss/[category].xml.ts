import type { APIRoute } from 'astro';
import { SITE, categories } from '../../config/site';
import { getArticles } from '../../utils/articles';
import { feed } from '../../utils/feed';

export function getStaticPaths() {
  return categories.map((c) => ({ params: { category: c.slug }, props: { cat: c } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { cat } = props as { cat: (typeof categories)[number] };
  const items = (await getArticles()).filter((a) => a.data.category === cat.slug);
  return feed(items, `${SITE.name} — ${cat.name}`, cat.description);
};
