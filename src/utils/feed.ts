import rss from '@astrojs/rss';
import { SITE, getCategory } from '../config/site';
import { articleUrl, type Article } from './articles';

export const feed = (items: Article[], title: string, description: string) =>
  rss({
    title,
    description,
    site: SITE.url,
    items: items.slice(0, 50).map((a) => ({
      title: a.data.title,
      description: a.data.description,
      link: articleUrl(a),
      pubDate: a.data.publishDate,
      categories: [getCategory(a.data.category)!.name, ...a.data.tags],
    })),
    customData: `<language>id-id</language>`,
    trailingSlash: true,
  });
