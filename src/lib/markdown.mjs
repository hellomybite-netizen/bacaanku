import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'blockquote', 'code', 'pre',
  'figure', 'figcaption', 'img', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
];

marked.setOptions({ gfm: true, breaks: false });

/** Waktu baca: 200 kata/menit, minimal 1. */
export function readingMinutes(markdown = '') {
  const text = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`\[\]()!-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200) || 1);
}

/**
 * Markdown → HTML yang sudah disanitasi (allowlist).
 * Dipakai saat simpan di admin dan saat migrasi, bukan saat request publik.
 */
export function renderMarkdown(markdown = '') {
  const raw = marked.parse(String(markdown), { async: false });
  const html = sanitizeHtml(String(raw), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'rel', 'target', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      figure: ['class'],
      figcaption: ['class'],
      span: ['class'],
      div: ['class'],
      code: ['class'],
      pre: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      a: (tagName, attribs) => {
        const href = attribs.href || '';
        const next = { href };
        if (/^https?:\/\//i.test(href)) {
          next.target = '_blank';
          next.rel = 'noopener noreferrer';
        }
        return { tagName, attribs: next };
      },
    },
  });
  return { html, minutes: readingMinutes(markdown) };
}
