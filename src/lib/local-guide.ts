export const guideCategories = [
  { slug: 'hotel', name: 'Hotel', short: 'Temukan penginapan nyaman', description: 'Temukan penginapan setempat dan pilih lokasi yang pas untuk rencana perjalananmu.', image: 'hotel' },
  { slug: 'wisata', name: 'Wisata', short: 'Jelajahi destinasi menarik', description: 'Jelajahi lanskap alam, ruang budaya, dan tempat wisata untuk berbagai cara bepergian.', image: 'bromo' },
  { slug: 'kuliner', name: 'Kuliner', short: 'Cicipi rasa khas daerah', description: 'Temukan rekomendasi tempat makan dan cicipi sajian khas dari berbagai daerah Indonesia.', image: 'rawon' },
] as const;

export const guideRegions = [
  { slug: 'malang', name: 'Malang', province: 'Jawa Timur', description: 'Jelajahi sudut Kota Malang dan Kota Batu, dari hotel di pusat kota hingga wisata keluarga di kaki pegunungan.', image: 'malang', guideOrder: ['hotel-tugu-malang', 'jatim-park-2', 'bakso-president'] },
  { slug: 'probolinggo', name: 'Probolinggo', province: 'Jawa Timur', description: 'Kenali sisi timur kawasan Bromo Tengger Semeru dan rencanakan perjalanan dari Cemorolawang.', image: 'bromo' },
  { slug: 'surabaya', name: 'Surabaya', province: 'Jawa Timur', description: 'Temukan rasa khas Surabaya, mulai dari semangkuk rawon di sekitar Pasar Besar.', image: 'rawon' },
  { slug: 'yogyakarta', name: 'Yogyakarta', province: 'DI Yogyakarta', description: 'Kenali kuliner Yogyakarta lewat dapur dan kedai gudeg di sekitar Wijilan.', image: 'gudeg' },
] as const;

export type GuideCategory = (typeof guideCategories)[number]['slug'];
export type GuideRegion = (typeof guideRegions)[number]['slug'];
export type GuideImage = 'bromo' | 'malang' | 'rawon' | 'rawon-kuah' | 'rawon-sajian' | 'hotel' | 'tugu' | 'bakso' | 'jatim' | 'gudeg';
export type Guide = {
  slug: string;
  category: GuideCategory;
  region: GuideRegion;
  name: string;
  title: string;
  description: string;
  location: string;
  image: GuideImage;
  imageAlt: string;
  gallery?: { image: GuideImage; alt: string }[];
  facts: { label: string; value: string }[];
  budget?: { label: string; value: string };
  mapQuery: string;
  action?: { label: string; url: string };
  sources: { label: string; url: string }[];
  sections: { title: string; paragraphs: string[] }[];
};

export const guideCategory = (slug: string) => guideCategories.find((category) => category.slug === slug);
export const guideRegion = (slug: string) => guideRegions.find((region) => region.slug === slug);
export const guidePath = (guide: Guide) => `/${guide.category}/${guide.slug}/`;
export const regionPath = (slug: string) => `/daerah/${slug}/`;
export const guideImage = (image: GuideImage, size: 'card' | 'wide' = 'wide') => `/media/local-wisdom/${image}-${size}.webp`;
