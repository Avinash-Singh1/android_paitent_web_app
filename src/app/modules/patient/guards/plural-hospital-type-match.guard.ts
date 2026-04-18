import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { VALID_PLURAL_TYPE_SLUGS } from 'src/app/config/hospital-types.constant';

/**
 * canMatch guard for plural hospital type listing routes.
 *
 * Matches routes like /:city/multi-speciality-clinics or
 * /:city/multi-speciality-clinics/:locality.
 *
 * Excludes "hospitals" and "clinics" which have their own dedicated routes.
 */
const DEDICATED_PLURAL_ROUTES = new Set(['hospitals', 'clinics']);

export const isPluralHospitalTypeListMatch: CanMatchFn = (
  _route: Route,
  segments: UrlSegment[]
) => {
  if (segments.length >= 2) {
    const slug = segments[1].path.toLowerCase();
    return VALID_PLURAL_TYPE_SLUGS.has(slug) && !DEDICATED_PLURAL_ROUTES.has(slug);
  }
  return false;
};
