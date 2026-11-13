// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { cacheCloudflare } from '@astrojs/cloudflare/cache';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';

const isStatic = process.env.BUILD_MODE === 'static';

/** @type {import('astro').AstroUserConfig} */
const config = {
  site: 'https://bacaankunetwork.com',
  trailingSlash: 'always',
  output: isStatic ? 'static' : 'server',
  session: false,
  build: { format: 'directory', inlineStylesheets: 'always' },
  adapter: isStatic
    ? undefined
    : cloudflare({
        imageService: 'compile',
        prerenderEnvironment: 'node',
      }),
  cache: isStatic ? undefined : { provider: cacheCloudflare() },
  integrations: [mdx()],
  prefetch: false,
  vite: {
    define: {
      __BUILD_MODE__: JSON.stringify(isStatic ? 'static' : 'server'),
    },
    resolve: isStatic
      ? { alias: { 'cloudflare:workers': fileURLToPath(new URL('./src/lib/cloudflare-stub.ts', import.meta.url)) } }
      : undefined,
  },
};

export default defineConfig(config);
