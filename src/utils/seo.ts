import { SITE } from '../config/site';
import { absUrl } from './articles';

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.domain,
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', url: absUrl(SITE.logo), width: 512, height: 512 },
  email: SITE.email,
  publishingPrinciples: absUrl('/pedoman-media-siber/'),
  sameAs: [`https://x.com/${SITE.twitter.replace('@', '')}`],
});

export const websiteLd = () => ({
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
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/cari/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbLd = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.href) })),
});

export const newsArticleLd = (o: {
  url: string; headline: string; description: string; image: string; datePublished: Date; dateModified: Date;
  authorName: string; authorUrl: string; section: string; keywords: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  mainEntityOfPage: { '@type': 'WebPage', '@id': o.url },
  headline: o.headline,
  description: o.description,
  image: [o.image],
  datePublished: o.datePublished.toISOString(),
  dateModified: o.dateModified.toISOString(),
  author: [{ '@type': 'Person', name: o.authorName, url: o.authorUrl }],
  publisher: {
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    logo: { '@type': 'ImageObject', url: absUrl(SITE.logo), width: 512, height: 512 },
  },
  articleSection: o.section,
  keywords: o.keywords.join(', '),
  inLanguage: SITE.hreflang,
  isAccessibleForFree: true,
});
