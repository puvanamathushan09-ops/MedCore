/**
 * Generates a URL-safe slug from a string (e.g. title).
 * Transliterates/strips special characters, converts spaces to hyphens, and lowercases.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\_\-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, ''); // Trim hyphens from end
}

/**
 * Generates a unique slug by appending an incremental index if a collision occurs.
 */
export async function generateUniqueSlug(
  title: string,
  existsCheckFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = slugify(title) || 'article';
  let slug = baseSlug;
  let counter = 1;

  while (await existsCheckFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
