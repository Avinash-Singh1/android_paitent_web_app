import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { normalizeCity, getCanonicalRedirect } from 'src/app/shared/utils/city-normalizer';

/**
 * Guard that redirects non-canonical city URLs to their canonical form.
 * e.g. /new-delhi/dentist → 301 → /delhi/dentist
 *      /bombay/cardiologist → 301 → /mumbai/cardiologist
 *
 * Used on all `:city` routes to enforce canonical city URLs for SEO.
 */
export const canonicalCityRedirectGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const cityParam = route.paramMap.get('city');

  if (!cityParam) return true;

  const canonicalRedirect = getCanonicalRedirect(cityParam);

  if (canonicalRedirect) {
    // Build the new URL with canonical city
    const newUrl = state.url.replace(
      new RegExp(`^/${escapeRegex(cityParam)}(/|$)`),
      `/${canonicalRedirect}$1`
    );
    router.navigateByUrl(newUrl, { replaceUrl: true });
    return false;
  }

  return true;
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
