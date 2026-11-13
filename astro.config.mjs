// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://bacaankunetwork.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/(cari|admin)\//.test(page) && !page.includes('/404'),
      i18n: { defaultLocale: 'id', locales: { id: 'id-ID' } },
    }),
  ],
  prefetch: false,
});
