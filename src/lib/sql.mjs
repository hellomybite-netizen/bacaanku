/**
 * Query publik. Setiap pernyataan harus lolos EXPLAIN QUERY PLAN
 * tanpa "SCAN articles" (lihat scripts/explain-queries.mjs).
 * Jangan pakai SELECT * di daftar. Jangan pakai OFFSET.
 */

export const cardSelect = `
  a.id, a.slug, a.title, a.excerpt,
  a.hero_r2_key, a.hero_width, a.hero_height, a.hero_alt,
  a.published_at, a.is_headline,
  c.slug AS category_slug, c.name AS category_name
`;

export const sqlLatest = `
  SELECT ${cardSelect}
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.status = 'published' AND a.published_at <= ?
  ORDER BY a.published_at DESC
  LIMIT ?
`;

export const sqlHeadline = `
  SELECT ${cardSelect}
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.status = 'published' AND a.is_headline = 1 AND a.published_at <= ?
  ORDER BY a.published_at DESC
  LIMIT 1
`;

export const sqlByCategory = `
  SELECT ${cardSelect}
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.category_id = ? AND a.status = 'published' AND a.published_at <= ?
  ORDER BY a.published_at DESC
  LIMIT ?
`;

/** Keyset: published_at lebih lama, atau waktu sama dengan id lebih kecil. */
export const sqlByCategoryBefore = `
  SELECT ${cardSelect}
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.category_id = ?
    AND a.status = 'published'
    AND a.published_at <= ?
    AND (a.published_at < ? OR (a.published_at = ? AND a.id < ?))
  ORDER BY a.published_at DESC, a.id DESC
  LIMIT ?
`;

export const sqlByAuthor = `
  SELECT ${cardSelect}
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.author_id = ? AND a.status = 'published' AND a.published_at <= ?
  ORDER BY a.published_at DESC
  LIMIT ?
`;

export const sqlBySlug = `
  SELECT ${cardSelect}
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.slug = ? AND a.status = 'published' AND a.published_at <= ?
`;

export const sqlCategoryBySlug = `
  SELECT id, slug, name, description
  FROM categories
  WHERE slug = ? AND is_active = 1
`;

export const sqlAuthorBySlug = `
  SELECT id, slug, name, role, bio, x_handle
  FROM authors
  WHERE slug = ? AND is_active = 1
`;

export const sqlTagBySlug = `
  SELECT id, slug, name FROM tags WHERE slug = ?
`;

export const sqlByTag = `
  SELECT ${cardSelect}
  FROM article_tags at
  JOIN articles a ON a.id = at.article_id
  JOIN categories c ON c.id = a.category_id
  WHERE at.tag_id = ? AND a.status = 'published' AND a.published_at <= ?
  ORDER BY a.published_at DESC
  LIMIT ?
`;

export const sqlArticle = `
  SELECT a.id, a.slug, a.title, a.excerpt, a.body_html, a.reading_minutes,
         a.hero_r2_key, a.hero_width, a.hero_height, a.hero_alt, a.hero_caption,
         a.hero_credit, a.hero_credit_url, a.sources_json,
         a.seo_title, a.seo_description, a.canonical_url,
         a.published_at, a.updated_at, a.is_headline, a.category_id,
         c.slug AS category_slug, c.name AS category_name,
         au.slug AS author_slug, au.name AS author_name, au.role AS author_role, au.bio AS author_bio
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  JOIN authors au ON au.id = a.author_id
  WHERE a.slug = ? AND a.status = 'published' AND a.published_at <= ?
`;

export const sqlArticleTags = `
  SELECT t.slug, t.name
  FROM article_tags at
  JOIN tags t ON t.id = at.tag_id
  WHERE at.article_id = ?
`;

export const sqlRelated = `
  SELECT ${cardSelect}
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.category_id = ? AND a.status = 'published' AND a.id != ? AND a.published_at <= ?
  ORDER BY a.published_at DESC
  LIMIT ?
`;

export const sqlRedirect = `
  SELECT new_path FROM slug_redirects WHERE old_path = ?
`;

export const sqlSearch = `
  SELECT a.id, a.slug, a.title, a.excerpt,
         a.hero_r2_key, a.hero_width, a.hero_height, a.hero_alt,
         a.published_at, a.is_headline,
         c.slug AS category_slug, c.name AS category_name
  FROM articles_fts
  JOIN articles a ON a.id = articles_fts.rowid
  JOIN categories c ON c.id = a.category_id
  WHERE articles_fts MATCH ? AND a.status = 'published'
  ORDER BY rank
  LIMIT ?
`;

export const sqlNews = `
  SELECT a.slug, a.title, a.published_at, c.slug AS category_slug
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.status = 'published' AND a.published_at >= ? AND a.published_at <= ?
  ORDER BY a.published_at DESC
  LIMIT 1000
`;

export const sqlMonth = `
  SELECT a.slug, a.published_at, a.updated_at, c.slug AS category_slug
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  WHERE a.status = 'published' AND a.published_at >= ? AND a.published_at < ?
  ORDER BY a.published_at DESC
  LIMIT 5000
`;

export const sqlPublishedBounds = `
  SELECT MIN(published_at) AS min_at, MAX(published_at) AS max_at
  FROM articles
  WHERE status = 'published' AND published_at IS NOT NULL
`;

export const sqlDue = `
  SELECT a.id, a.slug, c.slug AS category_slug, au.slug AS author_slug
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  JOIN authors au ON au.id = a.author_id
  WHERE a.status = 'scheduled' AND a.published_at <= ?
`;

export const sqlTagSlugsForArticle = `
  SELECT t.slug
  FROM article_tags at
  JOIN tags t ON t.id = at.tag_id
  WHERE at.article_id = ?
`;

export const sqlPublishOne = `
  UPDATE articles
  SET status = 'published', updated_at = unixepoch()
  WHERE id = ? AND status = 'scheduled'
`;

export const sqlAdminByStatus = `
  SELECT a.id, a.slug, a.title, a.status, a.updated_at, a.published_at, a.is_headline,
         c.slug AS category_slug, c.name AS category_name, au.name AS author_name
  FROM articles a
  JOIN categories c ON c.id = a.category_id
  JOIN authors au ON au.id = a.author_id
  WHERE a.status = ?
  ORDER BY a.updated_at DESC
  LIMIT ?
`;
