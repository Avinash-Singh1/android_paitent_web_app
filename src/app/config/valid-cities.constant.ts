/**
 * List of valid city slugs used in URL routing.
 * Normalized to lowercase. Used by cityMatcher in patient-routing.module.ts
 * and any other components that need to validate city paths.
 *
 * Includes both canonical slugs AND known aliases so that routing
 * can match alias URLs (which will then 301 redirect to canonical).
 */
import { CITY_ALIASES } from '../shared/utils/city-normalizer';

// Build the set from all canonical slugs + all aliases (hyphenated)
const _allCities = new Set<string>();
for (const [canonical, aliases] of Object.entries(CITY_ALIASES)) {
  _allCities.add(canonical);
  for (const alias of aliases) {
    _allCities.add(alias.replace(/\s+/g, '-'));
  }
}

// Add additional cities not in the alias map but known to exist in the system
const EXTRA_CITIES = [
  'adoni', 'ahmednagar', 'ajmer', 'akola', 'alappuzha', 'aligarh', 'alwar',
  'amravati', 'amravati-division', 'amreli', 'anakapalle', 'arrah', 'asansol',
  'badlapur', 'bail-hongal', 'ballari', 'barabanki', 'barrackpore',
  'bharuch', 'bhiwani', 'bhoom', 'bhuj', 'bihar', 'bijni-bongaigaon',
  'bikaner', 'bommasandra', 'buldhana', 'chiloda', 'chittaurgarh', 'chopda',
  'dharwad', 'dhule', 'dombivli', 'erode', 'faridabad', 'gandhinagar',
  'gaya', 'godhra', 'gorakhpur', 'gubli', 'hamirpur', 'hazaribag',
  'hoshiarpur', 'jam-khambhaliya', 'jharsuguda',
  'kaikaluru', 'kalyan-dombivali', 'kalyan-dombivli', 'kannur',
  'karimnagar', 'karnal', 'karnataka', 'keri-sattari-north-goa', 'kolar',
  'kota', 'kottakkal', 'kudal', 'kurukshetra', 'kurnool', 'latur',
  'lonavla', 'mahuva', 'malda', 'mancheral', 'manjari-budruk-pune',
  'marthandam', 'meerut', 'mohali', 'moradabad', 'muvattupuzha',
  'nadiad', 'nagercoil', 'nanded', 'orai', 'panipat',
  'pathankot', 'patiala', 'porbandar', 'raichur', 'raigarh',
  'rajkot', 'ratnagiri', 'rewari', 'sanchore', 'satara',
  'solapur', 'sumerpur', 'theni-allinagaram', 'tirupur',
  'valsad', 'vanasthalipuram', 'vapi', 'vatakara', 'wardha-m-s',
  'bilaspur',
];

for (const city of EXTRA_CITIES) {
  _allCities.add(city);
}

export const VALID_CITIES: ReadonlySet<string> = _allCities;

/**
 * Reserved path segments that should NOT be matched as city names.
 */
export const RESERVED_PATHS: ReadonlySet<string> = new Set([
  'home',
  'contact-us',
  'appointment-booking',
  'cancel-booking',
  'confirm-booking',
  'reschedule-booking',
  'appointment-completed',
  'patient-login',
  'privacy-policy',
  'terms-conditions',
  'auth',
  'register',
  'patient',
  'profile',
  'about-us',
  'search',
  'hospitals',
  'medicines',
  'surgeries',
  'page-not-found',
]);
