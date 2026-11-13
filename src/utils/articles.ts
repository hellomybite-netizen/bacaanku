import { SITE } from '../config/site';

export const articlePath = (category: string, slug: string) => `/${category}/${slug}/`;
export const categoryPath = (slug: string) => `/${slug}/`;
export const absUrl = (path: string) => new URL(path, SITE.url).href;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export function readingTime(body = ''): number {
  const words = body.replace(/[#>*_`\[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const dateFmt = new Intl.DateTimeFormat('id-ID', { timeZone: SITE.timezone, day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('id-ID', { timeZone: SITE.timezone, hour: '2-digit', minute: '2-digit', hour12: false });

export const formatDate = (epoch: number) => dateFmt.format(new Date(epoch * 1000));
export const formatDateTime = (epoch: number) => `${dateFmt.format(new Date(epoch * 1000))}, ${timeFmt.format(new Date(epoch * 1000)).replace('.', ':')} WIB`;
export const isoDate = (epoch: number) => new Date(epoch * 1000).toISOString();
