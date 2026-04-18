import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { VALID_SINGULAR_TYPE_SLUGS } from 'src/app/config/hospital-types.constant';

/**
 * canMatch guard for hospital detail routes.
 *
 * Route pattern: :city/:hospitalType/:slug
 * This guard checks that segments[1] is a valid singular hospital type slug
 * (e.g., "clinic", "hospital", "multi-speciality-clinic").
 *
 * This prevents the route from incorrectly matching doctor routes or
 * speciality routes that also have :city/:something/:something patterns.
 */
export const isHospitalTypeMatch: CanMatchFn = (
  _route: Route,
  segments: UrlSegment[]
) => {
  // Pattern: :city / :hospitalType / :slug
  if (segments.length >= 3) {
    return VALID_SINGULAR_TYPE_SLUGS.has(segments[1].path.toLowerCase());
  }
  return false;
};
