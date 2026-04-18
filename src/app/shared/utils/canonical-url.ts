import { normalizeCity } from './city-normalizer';

/**
 * Canonical URL map: given a search result item and its type,
 * returns the SEO-friendly URL path.
 *
 * URL patterns:
 *   doctor         → /:city/doctor/:slug
 *   hospital       → /:city/hospital/:slug
 *   clinic         → /:city/hospital/:slug  (same detail page)
 *   specialization → /:city/:slug
 *   service        → /:city/doctors-for-:slug
 *   procedure      → /:city/doctors-for-:slug   (same as service)
 */
export function getCanonicalUrl(
  item: any,
  type: string,
  fallbackCity: string = 'delhi',
): string | null {
  const city = resolveCity(item, fallbackCity);
  if (!city) return null;

  switch (type) {
    case 'doctor': {
      const slug = item?.doctorProfileSlug;
      return slug ? `/${city}/doctor/${slug}` : null;
    }

    case 'hospital':
    case 'clinic': {
      const slug = item?.establishmentProfileSlug;
      return slug ? `/${city}/hospital/${slug}` : null;
    }

    case 'specialization': {
      const slug = toSlug(item?.name);
      return slug ? `/${city}/${slug}` : null;
    }

    case 'service':
    case 'procedure': {
      const slug = item?.slug || toSlug(item?.name);
      return slug ? `/${city}/doctors-for-${slug}` : null;
    }

    default:
      return null;
  }
}

/**
 * Extract and normalize the city from an item's address,
 * falling back to the provided default.
 */
function resolveCity(item: any, fallback: string): string {
  const raw = item?.address?.city || fallback || 'delhi';
  return toSlug(normalizeCity(raw) || raw);
}

/**
 * Convert a display name to a URL-safe slug.
 * "Dental Surgeon" → "dental-surgeon"
 */
function toSlug(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
