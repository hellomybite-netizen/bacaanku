import { SITE } from '../config/site';
import { absUrl } from './articles';

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.domain,
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', url: absUrl(SITE.logo), width: SITE.logoWidth, height: SITE.logoHeight },
  publishingPrinciples: absUrl('/pedoman-media-siber/'),
  sameAs: [`https://x.com/${SITE.twitter.replace('@', '')}`],
});

export const websiteLd = (searchPath = '/cari/') => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: SITE.domain,
  url: `${SITE.url}/`,
  inLanguage: SITE.hreflang,
  publisher: { '@id': `${SITE.url}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}${searchPath}?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbLd = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.href) })),
});

const imageObject = (url: string, width?: number | null, height?: number | null) => ({
  '@type': 'ImageObject',
  url,
  ...(width && height ? { width, height } : {}),
});

const publisherLd = () => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', url: absUrl(SITE.logo), width: SITE.logoWidth, height: SITE.logoHeight },
});

/** JSON-LD panduan lokal (wisata/kuliner/hotel): Article + publisher berlogo + gambar berdimensi. */
export const guideArticleLd = (o: {
  url: string; headline: string; description: string; image: string; imageWidth: number; imageHeight: number;
  imageAlt?: string; datePublished: Date; dateModified: Date; authorName: string; authorUrl: string;
  section: string; placeName?: string; location?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  mainEntityOfPage: { '@type': 'WebPage', '@id': o.url },
  headline: o.headline.length > 110 ? truncateAtWord(o.headline, 110) : o.headline,
  description: o.description,
  image: [{ ...imageObject(o.image, o.imageWidth, o.imageHeight), ...(o.imageAlt ? { caption: o.imageAlt } : {}) }],
  datePublished: o.datePublished.toISOString(),
  dateModified: o.dateModified.toISOString(),
  author: [{ '@type': o.authorUrl.endsWith('/penulis/redaksi/') ? 'Organization' : 'Person', name: o.authorName, url: o.authorUrl }],
  publisher: publisherLd(),
  articleSection: o.section,
  ...(o.placeName ? { about: { '@type': 'Place', name: o.placeName, ...(o.location ? { address: o.location } : {}) } } : {}),
  inLanguage: SITE.hreflang,
  isAccessibleForFree: true,
});

export const newsArticleLd = (o: {
  url: string; headline: string; description: string; image: string; imageWidth?: number | null; imageHeight?: number | null; datePublished: Date; dateModified: Date;
  authorName: string; authorUrl: string; section: string; keywords: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  mainEntityOfPage: { '@type': 'WebPage', '@id': o.url },
  headline: o.headline,
  description: o.description,
  image: [imageObject(o.image, o.imageWidth, o.imageHeight)],
  datePublished: o.datePublished.toISOString(),
  dateModified: o.dateModified.toISOString(),
  author: [{ '@type': 'Person', name: o.authorName, url: o.authorUrl }],
  publisher: {
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    logo: { '@type': 'ImageObject', url: absUrl(SITE.logo), width: SITE.logoWidth, height: SITE.logoHeight },
  },
  articleSection: o.section,
  keywords: o.keywords.join(', '),
  inLanguage: SITE.hreflang,
  isAccessibleForFree: true,
});

export function truncateAtWord(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const limit = maxLen - 1;
  const sliced = clean.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace >= Math.floor(limit * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.replace(/[,;:\-–—]+$/, "").trim()}…`;
}

export function formatPageTitle(title: string, siteName: string, rawTitle = false): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (rawTitle) return clean.length <= 70 ? clean : truncateAtWord(clean, 70);
  const full = `${clean} | ${siteName}`;
  if (full.length <= 70) return full;
  const short = `${clean} | Bacaanku`;
  if (short.length <= 70) return short;
  if (clean.length <= 70) return clean;
  return truncateAtWord(clean, 70);
}
