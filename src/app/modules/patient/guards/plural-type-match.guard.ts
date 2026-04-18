import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { VALID_PLURAL_TYPE_SLUGS } from 'src/app/config/hospital-types.constant';

/**
 * canMatch guard for type listing routes.
 *
 * Route pattern: :city/:pluralType  (e.g., /delhi/clinics, /delhi/super-speciality-hospitals)
 * Checks that segments[1] is a valid plural hospital type slug.
 *
 * This allows routes like:
 *   /delhi/clinics                    → type listing
 *   /delhi/clinics/dentist            → type + specialization listing
 *   /delhi/clinics/vasundhara         → type + locality listing
 *   /delhi/multi-speciality-hospitals → type listing
 */
export const isPluralTypeMatch: CanMatchFn = (
  _route: Route,
  segments: UrlSegment[]
) => {
  if (segments.length >= 2) {
    return VALID_PLURAL_TYPE_SLUGS.has(segments[1].path.toLowerCase());
  }
  return false;
};
