import rss from '@astrojs/rss';
import type { ArticleCard } from '../lib/content-types';
import { SITE } from '../config/site';
import { articlePath } from './articles';

export const feed = (items: ArticleCard[], title: string, description: string) =>
  rss({
    title,
    description,
    site: SITE.url,
    items: items.slice(0, 50).map((article) => ({
      title: article.title,
      description: article.excerpt,
      link: articlePath(article.categorySlug, article.slug),
      pubDate: new Date(article.publishedAt * 1000),
      categories: [article.categoryName],
    })),
    customData: `<language>id-id</language>`,
    trailingSlash: true,
  });
