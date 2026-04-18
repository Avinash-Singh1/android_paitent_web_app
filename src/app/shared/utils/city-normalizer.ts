/**
 * Canonical city alias mapping.
 * Maps all known aliases to a single canonical slug.
 * Must stay in sync with backend/utils/cityAliases.js CITY_ALIAS_GROUPS.
 */
export const CITY_ALIASES: Record<string, string[]> = {
  delhi: ['delhi', 'new delhi', 'new-delhi', 'delhi ncr', 'ncr', 'east delhi'],
  mumbai: ['mumbai', 'bombay', 'mumbai-suburban'],
  bengaluru: ['bengaluru', 'bangalore', 'bangalore-urban'],
  chennai: ['chennai', 'madras'],
  kolkata: ['kolkata', 'calcutta'],
  hyderabad: ['hyderabad', 'secunderabad'],
  pune: ['pune', 'poona', 'pune-division'],
  ahmedabad: ['ahmedabad', 'amdavad', 'ahemdabad'],
  gurugram: ['gurugram', 'gurgaon', 'gurgoan'],
  noida: ['noida', 'greater-noida', 'greater noida'],
  ghaziabad: ['ghaziabad', 'gaziabad'],
  lucknow: ['lucknow', 'lakhnau'],
  kanpur: ['kanpur', 'cawnpore'],
  prayagraj: ['prayagraj', 'allahabad', 'ilahabad'],
  varanasi: ['varanasi', 'banaras', 'benares', 'kashi'],
  agra: ['agra', 'aagra'],
  shimla: ['shimla', 'simla'],
  dehradun: ['dehradun', 'dehra dun'],
  haridwar: ['haridwar', 'hardwar'],
  rishikesh: ['rishikesh', 'hrishikesh'],
  jaipur: ['jaipur', 'jeypore'],
  jodhpur: ['jodhpur', 'marwar'],
  udaipur: ['udaipur', 'mewar'],
  chandigarh: ['chandigarh', 'chandigadh'],
  amritsar: ['amritsar', 'ambarsar'],
  ludhiana: ['ludhiana', 'ludhiyana'],
  jalandhar: ['jalandhar', 'jullundur'],
  jammu: ['jammu', 'dogra'],
  srinagar: ['srinagar', 'summer capital'],
  panaji: ['panaji', 'panjim', 'pangim'],
  vadodara: ['vadodara', 'baroda'],
  surat: ['surat', 'suryapur'],
  nagpur: ['nagpur', 'nagpore', 'nagpur-division'],
  nashik: ['nashik', 'nasik'],
  aurangabad: ['aurangabad', 'sambhajinagar'],
  kolhapur: ['kolhapur', 'kolhapore'],
  thane: ['thane', 'thaney'],
  'navi-mumbai': ['navi-mumbai', 'navi mumbai', 'new bombay'],
  thiruvananthapuram: ['thiruvananthapuram', 'trivandrum'],
  kochi: ['kochi', 'cochin', 'ernakulam'],
  kozhikode: ['kozhikode', 'calicut'],
  thrissur: ['thrissur', 'trichur'],
  kollam: ['kollam', 'quilon'],
  mysuru: ['mysuru', 'mysore'],
  mangaluru: ['mangaluru', 'mangalore'],
  hubballi: ['hubballi', 'hubli'],
  belagavi: ['belagavi', 'belgaum'],
  kalaburagi: ['kalaburagi', 'gulbarga', 'kalaburgi'],
  shivamogga: ['shivamogga', 'shimoga'],
  tumakuru: ['tumakuru', 'tumkur'],
  vijayapura: ['vijayapura', 'bijapur'],
  visakhapatnam: ['visakhapatnam', 'vizag', 'visakha'],
  vijayawada: ['vijayawada', 'bezawada'],
  tirupati: ['tirupati', 'tirumala'],
  rajahmundry: ['rajahmundry', 'rajamahendravaram'],
  guntur: ['guntur', 'guntoor'],
  kakinada: ['kakinada', 'cocanada'],
  nellore: ['nellore', 'nelluru'],
  warangal: ['warangal', 'orugallu'],
  madurai: ['madurai', 'madura'],
  coimbatore: ['coimbatore', 'kovai', 'koimbatore'],
  tiruchirappalli: ['tiruchirappalli', 'trichy', 'trichinopoly'],
  salem: ['salem', 'sailam'],
  tirunelveli: ['tirunelveli', 'tinnevelly'],
  puducherry: ['puducherry', 'pondicherry'],
  thanjavur: ['thanjavur', 'tanjore'],
  vellore: ['vellore', 'velur'],
  patna: ['patna', 'pataliputra'],
  ranchi: ['ranchi', 'rachi'],
  jamshedpur: ['jamshedpur', 'tatanagar'],
  bhubaneswar: ['bhubaneswar', 'bhubaneshwar', 'bhybaneswar'],
  cuttack: ['cuttack', 'kataka'],
  guwahati: ['guwahati', 'gauhati'],
  siliguri: ['siliguri', 'shiliguri'],
  bhopal: ['bhopal', 'bhopaal'],
  indore: ['indore', 'indur'],
  gwalior: ['gwalior', 'gwaliar'],
  jabalpur: ['jabalpur', 'jubbulpore'],
  ujjain: ['ujjain', 'ujjayin', 'avanti'],
  raipur: ['raipur', 'raipore'],
  bilaspur: ['bilaspur', 'bilaspore'],
  puri: ['puri', 'jagannath puri'],
  shillong: ['shillong', 'shilong'],
  imphal: ['imphal', 'kangla'],
  agartala: ['agartala', 'agortola'],
  aizawl: ['aizawl', 'aijal'],
  itanagar: ['itanagar', 'itanager'],
  dimapur: ['dimapur', 'dimapar'],
  gangtok: ['gangtok', 'gangtak'],
  cuddalore: ['cuddalore', 'kudalur'],
};

// Build reverse lookup: alias → canonical slug
const ALIAS_TO_CANONICAL: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(CITY_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL[alias] = canonical;
    // Also map hyphenated version
    ALIAS_TO_CANONICAL[alias.replace(/\s+/g, '-')] = canonical;
  }
}

/**
 * Normalize any city input to a canonical slug.
 * "New Delhi" → "delhi", "Bombay" → "mumbai", "Bengaluru" → "bengaluru"
 */
export function normalizeCity(input: string): string {
  if (!input) return '';
  const val = input.toLowerCase().trim().replace(/\s+/g, '-');
  return ALIAS_TO_CANONICAL[val] || ALIAS_TO_CANONICAL[val.replace(/-/g, ' ')] || val;
}

/**
 * Get canonical display name for a city (title case of canonical slug).
 */
export function getCanonicalCityName(input: string): string {
  const slug = normalizeCity(input);
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Check if a city slug is the canonical form.
 * Returns true if input is already canonical, false if it's an alias that maps elsewhere.
 */
export function isCanonicalCity(slug: string): boolean {
  if (!slug) return false;
  const normalized = normalizeCity(slug);
  return normalized === slug.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Get the canonical slug that a non-canonical alias should redirect to.
 * Returns null if already canonical.
 */
export function getCanonicalRedirect(urlCity: string): string | null {
  if (!urlCity) return null;
  const canonical = normalizeCity(urlCity);
  const input = urlCity.toLowerCase().trim();
  if (canonical !== input && canonical !== input.replace(/\s+/g, '-')) {
    return canonical;
  }
  return null;
}
