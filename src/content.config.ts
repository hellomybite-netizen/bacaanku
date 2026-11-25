import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorySlugs, isLocalCategory, priceUnits, regionSlugs } from './config/site';

/** Kotak info ulasan (hotel/wisata/kuliner). Sama dengan kolom D1 di docs/migrations/0003_local_wisdom.sql */
const review = z.object({
  placeName: z.string().min(2).max(120).optional(), // nama tempat yang diulas
  placeType: z.string().max(40).optional(), // schema.org: Hotel, Resort, TouristAttraction, Beach, Restaurant, ...
  priceMin: z.number().int().min(0).optional(), // rupiah tanpa titik
  priceMax: z.number().int().min(0).optional(),
  priceUnit: z.enum(priceUnits).optional(), // malam | porsi | orang | tiket | paket
  priceRange: z.string().min(3).max(80).optional(), // teks bebas, menggantikan priceMin/Max (mis. 'Gratis, parkir Rp5.000')
  address: z.string().min(8).max(200),
  rating: z.number().min(1).max(5).multipleOf(0.5).optional(), // penilaian redaksi, kelipatan 0,5
  openingHours: z.string().max(120).optional(), // hotel: 'Check-in 14.00 · check-out 12.00'
  mapUrl: z.url().optional(), // tautan Google Maps
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().max(40).optional(),
  website: z.url().optional(),
  facilities: z.array(z.string().max(40)).max(12).default([]),
  visitedAt: z.coerce.date().optional(), // tanggal kunjungan penulis
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan tanda hubung'),
      description: z.string().min(50).max(170), // meta description SEO
      category: z.enum(categorySlugs),
      // --- Niche local wisdom (wajib untuk hotel/wisata/kuliner) ---
      daerah: z.enum(regionSlugs).optional(),
      kota: z.string().min(2).max(60).optional(),
      review: review.optional(),
      contoh: z.boolean().default(false), // true = artikel CONTOH (placeholder tata letak): badge CONTOH + noindex
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
    })
    .superRefine((data, ctx) => {
      if (!isLocalCategory(data.category)) return;
      const need = (ok: unknown, path: (string | number)[], message: string) => {
        if (!ok) ctx.addIssue({ code: 'custom', path, message });
      };
      need(data.daerah, ['daerah'], 'Artikel hotel/wisata/kuliner wajib punya `daerah` (slug dari src/config/site.ts)');
      need(data.kota, ['kota'], 'Artikel hotel/wisata/kuliner wajib punya `kota`');
      need(data.review, ['review'], 'Artikel hotel/wisata/kuliner wajib punya blok `review` (alamat, rentang harga, rating)');
      need(data.heroCredit, ['heroCredit'], 'Foto wajib punya `heroCredit` (sumber + lisensi, atau foto milik sendiri)');
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
