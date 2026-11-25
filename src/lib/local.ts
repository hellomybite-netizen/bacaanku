/** Utilitas niche local wisdom yang dipakai build statis dan SSR (D1). */
import { getRegion } from '../config/site';
import type { ArticleView, ReviewInfo } from './content-types';

const rp = (n: number) => 'Rp' + n.toLocaleString('id-ID');

/** "Rp350.000–Rp600.000 per malam". Jika `note` diisi, itu yang dipakai. */
export function formatPrice(min?: number | null, max?: number | null, unit?: string | null, note?: string | null): string | undefined {
  if (note) return note;
  if (min == null && max == null) return undefined;
  const per = unit ? ` per ${unit}` : '';
  if (min === 0 && (max == null || max === 0)) return 'Gratis';
  if (min != null && max != null && max !== min) return `${rp(min)}–${rp(max)}${per}`;
  return `${rp((min ?? max) as number)}${per}`;
}

/** Label "$$" sederhana untuk schema.org priceRange. */
export function priceLevel(review: ReviewInfo): string | undefined {
  return review.priceRange;
}

const LODGING = new Set(['Hotel', 'Resort', 'BedAndBreakfast', 'Hostel', 'LodgingBusiness', 'Motel', 'Campground']);
const FOOD = new Set(['Restaurant', 'CafeOrCoffeeShop', 'FoodEstablishment', 'Bakery', 'BarOrPub', 'FastFoodRestaurant']);

export function defaultPlaceType(category: string): string {
  if (category === 'hotel') return 'Hotel';
  if (category === 'kuliner') return 'Restaurant';
  return 'TouristAttraction';
}

/**
 * JSON-LD Review + tempat yang diulas (Hotel / TouristAttraction / Restaurant ...).
 * Tidak dibuat untuk artikel CONTOH (data fiktif tidak boleh jadi rich result).
 */
export function reviewLd(article: ArticleView, url: string): Record<string, unknown> | null {
  const review = article.review;
  if (!review || article.isSample || !review.placeName) return null;
  const type = review.placeType || defaultPlaceType(article.categorySlug);
  const region = article.daerahSlug ? getRegion(article.daerahSlug) : undefined;
  const item: Record<string, unknown> = {
    '@type': type,
    name: review.placeName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: review.address,
      addressLocality: article.kota,
      addressRegion: region?.name,
      addressCountry: 'ID',
    },
  };
  if (review.latitude != null && review.longitude != null) item.geo = { '@type': 'GeoCoordinates', latitude: review.latitude, longitude: review.longitude };
  if (review.mapUrl) item.hasMap = review.mapUrl;
  if (review.phone) item.telephone = review.phone;
  if (review.website) item.url = review.website;
  if (review.priceRange && (LODGING.has(type) || FOOD.has(type))) item.priceRange = review.priceRange;
  if (review.facilities?.length && LODGING.has(type)) {
    item.amenityFeature = review.facilities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true }));
  }
  if (article.heroSrc) item.image = new URL(article.heroSrc, 'https://bacaankunetwork.com').href;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    url,
    name: article.title,
    itemReviewed: item,
    author: { '@type': 'Person', name: article.authorName },
    datePublished: new Date(article.publishedAt * 1000).toISOString(),
    publisher: { '@type': 'Organization', name: 'Bacaanku Network', url: 'https://bacaankunetwork.com/' },
  };
  if (review.rating != null) ld.reviewRating = { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 };
  return ld;
}
