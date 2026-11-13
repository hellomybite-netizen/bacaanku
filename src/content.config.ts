import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorySlugs } from './config/site';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan tanda hubung'),
      description: z.string().min(50).max(170), // meta description SEO
      category: z.enum(categorySlugs),
      tags: z.array(z.string()).default([]),
      author: reference('authors'),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image(),
      heroAlt: z.string().min(5),
      heroCaption: z.string().optional(),
      heroCredit: z.string().optional(), // mis. 'Foto: Nama/Wikimedia Commons, CC BY-SA 4.0' atau 'Ilustrasi: bacaankunetwork.com'
      heroCreditUrl: z.url().optional(), // tautan sumber/lisensi gambar
      featured: z.boolean().default(false),
      seoTitle: z.string().max(70).optional(),
      canonical: z.url().optional(),
      draft: z.boolean().default(false),
    }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    role: z.string(),
    bio: z.string(),
    x: z.string().optional(),
  }),
});

export const collections = { articles, authors };
