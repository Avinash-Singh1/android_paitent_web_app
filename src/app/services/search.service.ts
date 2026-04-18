import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  Subject, BehaviorSubject, Observable,
  debounceTime, distinctUntilChanged, switchMap, catchError, of, map, tap, filter
} from 'rxjs';
import { ApiService } from './api.service';
import { LocalStorageService } from './storage.service';
import { CommonService } from './common.service';
import { normalizeCity, getCanonicalCityName } from '../shared/utils/city-normalizer';

/* ─── Client-side result cache with TTL ───────────────── */
class ResultCache<T> {
  private store = new Map<string, { value: T; expiry: number }>();
  constructor(private ttlMs: number = 120_000) {} // 2 min default

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) { this.store.delete(key); return null; }
    return entry.value;
  }

  set(key: string, value: T): void {
    // Cap at 50 entries to prevent memory bloat
    if (this.store.size >= 50) {
      const oldest = this.store.keys().next().value;
      if (oldest) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiry: Date.now() + this.ttlMs });
  }

  clear(): void { this.store.clear(); }
}
import { GoogleMapsService } from './google-maps.service';
import { EventService } from './event.service';

/* ─── Interfaces ──────────────────────────────────────── */

export interface CityItem {
  name: string;
  type: 'city' | 'locality';
  city?: string;      // parent city for localities
  count?: number;
}

export interface SearchResults {
  specialityOptions: any[];
  servicesOptions: any[];
  doctorsOptions: any[];
  hospitalsOptions: any[];
  clinicOptions: any[];
  hasAny: boolean;
}

export interface PlaceResult {
  selectedCity: string;
  selectedSubLocality: string;
  lat: number;
  lng: number;
}

const EMPTY_RESULTS: SearchResults = {
  specialityOptions: [],
  servicesOptions: [],
  doctorsOptions: [],
  hospitalsOptions: [],
  clinicOptions: [],
  hasAny: false,
};

/* ─── Service ─────────────────────────────────────────── */

@Injectable({ providedIn: 'root' })
export class SearchService {

  /* ── Search suggestions ─────────────────────────────── */
  private searchSubject = new Subject<string>();
  private suggestionsSubject = new BehaviorSubject<SearchResults>(EMPTY_RESULTS);

  readonly suggestions$: Observable<SearchResults> = this.suggestionsSubject.asObservable();
  readonly isSearching$ = new BehaviorSubject<boolean>(false);
  readonly noResults$ = new BehaviorSubject<boolean>(false);

  /* ── Canonical/corrected term from API (for SEO redirect) ─ */
  readonly canonicalTerm$ = new BehaviorSubject<string | null>(null);
  readonly correctedTerm$ = new BehaviorSubject<string | null>(null);

  /* ── City data ──────────────────────────────────────── */
  private citySearchSubject = new Subject<string>();
  private filteredCitiesSubject = new BehaviorSubject<CityItem[]>([]);
  private filteredLocalitiesSubject = new BehaviorSubject<CityItem[]>([]);
  readonly isCityLoading$ = new BehaviorSubject<boolean>(false);

  readonly filteredCities$ = this.filteredCitiesSubject.asObservable();
  readonly filteredLocalities$ = this.filteredLocalitiesSubject.asObservable();

  // Keep a local cache for selectCity / validateCity lookups
  private lastCityResults: CityItem[] = [];
  private lastLocalityResults: CityItem[] = [];

  currentCity = '';
  searchSource = '';
  selectedSubLocality = '';

  /* ── Google Places ──────────────────────────────────── */
  readonly placePredictions$ = new BehaviorSubject<any[]>([]);

  /* ── Recent searches ────────────────────────────────── */
  readonly recentSearches$ = new BehaviorSubject<string[]>([]);

  /* ── Client-side caches ─────────────────────────────── */
  private suggestionCache = new ResultCache<any>(120_000);      // 2 min,
  private autocompleteCache = new ResultCache<any>(120_000);    // 2 min
  private cityCache = new ResultCache<any>(300_000);            // 5 min,

  private isBrowser: boolean;

  constructor(
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private commonService: CommonService,
    private gService: GoogleMapsService,
    private eventService: EventService,
    private router: Router) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    // Load current city from storage
    const storedCity = this.localStorage.getItem('city');
    this.currentCity = storedCity || 'Delhi';
    if (!storedCity) {
      this.localStorage.setItem('city', this.currentCity);
    }

    // Skip setting up RxJS debounce pipes during initial render — they create
    // Zone.js-tracked setTimeout macrotasks that block initial render rendering.
    if (!this.isBrowser) return;

    // Initialize city search pipe: debounce and fetch from API
    this.initCitySearchPipe();

    // On startup: try geolocation, fallback to stored city
    if (this.isBrowser) {
      this.detectCityAndLoadLocalities();
    }

    // Load recent searches
    this.loadRecentSearches();

    // Initialize Atlas autocomplete pipe
    this.initAtlasAutocomplete();

    // Unified search pipe: dynamic debounce + cache + switchMap
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term: string) => term.length >= 2),
      switchMap((searchTerm: string) => {
        const city = this.currentCity || this.localStorage.getItem('city') || '';
        const cacheKey = `${city}:${searchTerm}`.toLowerCase();
        const cached = this.suggestionCache.get(cacheKey);
        if (cached) {
          return of(cached);
        }
        this.isSearching$.next(true);
        this.noResults$.next(false);
        return this.apiService.searchSuggestions(searchTerm, city).pipe(
          tap((res: any) => this.suggestionCache.set(cacheKey, res)),
          catchError(() => of({ result: { data: {} } }))
        );
      }),
      map((res: any) => {
        // Extract canonical/corrected terms for SEO redirect
        const data = res?.result?.data;
        this.canonicalTerm$.next(data?.canonicalTerm || null);
        this.correctedTerm$.next(data?.correctedTerm || null);
        // Feed corrected term into "did you mean" UI
        if (data?.correctedTerm) {
          this.didYouMean$.next(data.correctedTerm);
        }
        return this.mapResults(res);
      }),
      tap((results: SearchResults) => {
        this.isSearching$.next(false);
        this.noResults$.next(!results.hasAny);
      })
    ).subscribe((results: SearchResults) => {
      this.suggestionsSubject.next(results);
    });
  }

  /* ═══════════════════════════════════════════════════════
     SEARCH SUGGESTIONS
     ═══════════════════════════════════════════════════════ */

  /** Push a search term into the debounced pipe (used only for Enter-key navigation) */
  search(term: string): void {
    if (term && term.length >= 2) {
      this.searchSubject.next(term);
    } else {
      this.clearSuggestions();
    }
  }

  clearSuggestions(): void {
    this.suggestionsSubject.next(EMPTY_RESULTS);
    this.noResults$.next(false);
    this.isSearching$.next(false);
    this.canonicalTerm$.next(null);
    this.correctedTerm$.next(null);
  }

  private mapResults(res: any): SearchResults {
    const data = res?.result?.data || {};
    const specialityOptions = data?.specializationData?.data || [];
    const servicesOptions = data?.procedureData?.data || [];
    const hospitalsOptions = data?.hospitalData?.data || [];
    const doctorsOptions = data?.doctorData?.data || [];
    const clinicOptions = data?.clinicData?.data || [];
    const hasAny = !!(doctorsOptions.length || hospitalsOptions.length ||
      servicesOptions.length || specialityOptions.length || clinicOptions.length);
    return { specialityOptions, servicesOptions, doctorsOptions, hospitalsOptions, clinicOptions, hasAny };
  }

  /* ═══════════════════════════════════════════════════════
     CITY SEARCH — API-driven with debounce
     ═══════════════════════════════════════════════════════ */

  private initCitySearchPipe(): void {
    this.citySearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        const cacheKey = `city:${term}`.toLowerCase();
        const cached = this.cityCache.get(cacheKey);
        if (cached) {
          return of(cached);
        }
        this.isCityLoading$.next(true);
        return this.apiService.searchCities(term).pipe(
          tap((res: any) => this.cityCache.set(cacheKey, res)),
          catchError(() => of({ result: { cities: [], localities: [] } }))
        );
      }),
      map((res: any) => {
        const data = res?.result || { cities: [], localities: [] };
        return {
          cities: (data.cities || []).map((c: any) => ({ name: c.name, type: 'city' as const, count: c.count })),
          localities: (data.localities || []).map((l: any) => ({ name: l.name, type: 'locality' as const, city: l.city, count: l.count })),
        };
      }),
      tap(() => this.isCityLoading$.next(false))
    ).subscribe(({ cities, localities }) => {
      this.lastCityResults = cities;
      this.lastLocalityResults = localities;
      this.filteredCitiesSubject.next(cities);
      this.filteredLocalitiesSubject.next(localities);
    });
  }

  /** Trigger city search — called on every keystroke in the city input */
  filterCities(input: string): void {
    const term = (input || '').trim();
    if (!term) {
      // Empty input — fetch popular cities immediately (bypass distinctUntilChanged)
      this.loadPopularCities();
    } else {
      this.citySearchSubject.next(term);
    }
  }

  /** Load popular/default cities (used when city input is blank) */
  loadPopularCities(): void {
    const cacheKey = 'city:_popular';
    const cached = this.cityCache.get(cacheKey);
    if (cached) {
      const data = cached?.result || { cities: [], localities: [] };
      const cities = (data.cities || []).map((c: any) => ({ name: c.name, type: 'city' as const, count: c.count }));
      this.lastCityResults = cities;
      this.filteredCitiesSubject.next(cities);
      this.filteredLocalitiesSubject.next([]);
      return;
    }
    this.isCityLoading$.next(true);
    this.apiService.searchCities('').pipe(
      tap((res: any) => this.cityCache.set(cacheKey, res)),
      catchError(() => of({ result: { cities: [], localities: [] } }))
    ).subscribe((res: any) => {
      const data = res?.result || { cities: [], localities: [] };
      const cities = (data.cities || []).map((c: any) => ({ name: c.name, type: 'city' as const, count: c.count }));
      this.lastCityResults = cities;
      this.filteredCitiesSubject.next(cities);
      this.filteredLocalitiesSubject.next([]);
      this.isCityLoading$.next(false);
    });
  }

  /** Fetch localities of a specific city (for default dropdown view) */
  private fetchLocalitiesOfCity(cityName: string): void {
    this.isCityLoading$.next(true);
    this.apiService.searchCities('', cityName).pipe(
      catchError(() => of({ result: { cities: [], localities: [] } }))
    ).subscribe((res: any) => {
      const data = res?.result || { cities: [], localities: [] };
      const localities = (data.localities || []).map((l: any) => ({ name: l.name, type: 'locality' as const, city: l.city, count: l.count }));
      this.lastCityResults = [];
      this.lastLocalityResults = localities;
      this.filteredCitiesSubject.next([]);
      this.filteredLocalitiesSubject.next(localities);
      this.isCityLoading$.next(false);
    });
  }

  /** On startup: silently detect city via IP (no permission prompt) */
  private detectCityAndLoadLocalities(): void {
    this.gService.detectCityByIP().then((city: string) => {
      // Normalize to canonical city slug
      const canonicalCity = getCanonicalCityName(city) || city;
      this._detectedCity = canonicalCity;
      this.currentCity = canonicalCity;
      this.localStorage.setItem('city', canonicalCity);
      this.localStorage.removeItem('locality');
      this.fetchLocalitiesOfCity(canonicalCity);
      // Notify components to update the input value
      this.eventService.broadcastEvent('city-detected', canonicalCity);
    }).catch(() => {
      // IP detection failed — use stored/default city
      this.fetchLocalitiesOfCity(this.currentCity);
    });
  }

  selectCity(selectedName: string): { source: string; city?: string } | null {
    const lowerName = (selectedName || '').trim().toLowerCase();
    const previousCity = this.currentCity;

    // Check localities first (more specific)
    const localityMatch = this.lastLocalityResults.find(c => c.name.toLowerCase() === lowerName);
    if (localityMatch) {
      this.searchSource = 'establishment';
      this.selectedSubLocality = localityMatch.city || '';
      this.localStorage.setItem('city', localityMatch.city || '');
      this.localStorage.setItem('locality', localityMatch.name);
      this.currentCity = localityMatch.name;
      this._onCityChanged(previousCity);
      return { source: 'establishment', city: localityMatch.city };
    }

    // Then check cities
    const cityMatch = this.lastCityResults.find(c => c.name.toLowerCase() === lowerName);
    if (cityMatch) {
      this.searchSource = 'city';
      this.localStorage.setItem('city', cityMatch.name);
      this.localStorage.removeItem('locality');
      this.currentCity = cityMatch.name;
      this.selectedSubLocality = '';
      // Load localities of the newly selected city
      this.fetchLocalitiesOfCity(cityMatch.name);
      this._onCityChanged(previousCity);
      return { source: 'city' };
    }

    // No match in DB results — reject arbitrary city names
    return null;
  }

  /** Called after city changes — clears caches and re-triggers search if active */
  private _onCityChanged(previousCity: string): void {
    if (this.currentCity.toLowerCase() !== previousCity.toLowerCase()) {
      this.suggestionCache.clear();
      this.autocompleteCache.clear();
      if (this.lastSearchTerm && this.lastSearchTerm.length >= 2) {
        this.searchAtlas(this.lastSearchTerm);
      }
    }
  }

  validateCity(enteredCity: string): CityItem | null {
    const trimmed = (enteredCity || '').trim();
    if (!trimmed || trimmed === 'Detecting location...' || this._isDetectingLocation) {
      return null;
    }

    // Check in last results
    const allResults = [...this.lastCityResults, ...this.lastLocalityResults];
    const match = allResults.find(c =>
      c.name.toLowerCase() === trimmed.toLowerCase() ||
      (c.city && c.city.toLowerCase() === trimmed.toLowerCase())
    );

    if (match) {
      this.currentCity = match.name;
      this.searchSource = match.type === 'locality' ? 'establishment' : 'city';
      if (match.type === 'locality') {
        this.selectedSubLocality = match.city || '';
      }
      return match;
    }

    // No match in DB — reject arbitrary city names
    return null;
  }

  /** Use browser geolocation to detect the user's current city */
  _isDetectingLocation = false;
  /** City detected via geolocation (set on first-load auto-detect) */
  private _detectedCity: string | null = null;

  useMyLocation(): Promise<string> {
    // If geolocation already succeeded on first load, reuse that city instantly
    if (this._detectedCity) {
      const city = this._detectedCity;
      this.currentCity = city;
      this.searchSource = 'city';
      this.selectedSubLocality = '';
      this.localStorage.setItem('city', city);
      this.localStorage.removeItem('locality');
      this.fetchLocalitiesOfCity(city);
      return Promise.resolve(city);
    }

    this._isDetectingLocation = true;
    // Try client-side geocoder first, fall back to HTTP geocoding API
    return this.gService.getCurrentCity().catch(() => {
      // Client-side geocoder failed — try HTTP-based reverse geocode
      return new Promise<string>((resolve, reject) => {
        this.gService.getCurrentCityObs().subscribe({
          next: (city) => city ? resolve(city) : reject('No city found'),
          error: (e) => reject(e)
        });
      });
    }).then((city: string) => {
      this._isDetectingLocation = false;
      // Normalize to canonical city name
      const canonicalCity = getCanonicalCityName(city) || city;
      this._detectedCity = canonicalCity;
      this.currentCity = canonicalCity;
      this.searchSource = 'city';
      this.selectedSubLocality = '';
      this.localStorage.setItem('city', canonicalCity);
      this.localStorage.removeItem('locality');
      this.fetchLocalitiesOfCity(canonicalCity);
      return canonicalCity;
    }).catch(() => {
      // Geolocation failed — fall back to the current/stored city
      this._isDetectingLocation = false;
      const fallback = this.currentCity || 'Delhi';
      this.fetchLocalitiesOfCity(fallback);
      return fallback;
    });
  }

  /** Select the entire city (remove locality filter) */
  searchEntireCity(): void {
    const city = this.localStorage.getItem('city') || this.currentCity || 'Delhi';
    this.currentCity = city;
    this.searchSource = 'city';
    this.selectedSubLocality = '';
    this.localStorage.removeItem('locality');
    // Reload localities for this city
    this.fetchLocalitiesOfCity(city);
  }

  /* ═══════════════════════════════════════════════════════
     GOOGLE PLACES
     ═══════════════════════════════════════════════════════ */

  getPlacePredictions(value: string): void {
    if (!this.isBrowser || !value?.length) {
      this.placePredictions$.next([]);
      return;
    }
    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { input: value, componentRestrictions: { country: 'in' } },
      (predictions: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.placePredictions$.next(predictions || []);
        } else {
          this.placePredictions$.next([]);
        }
      }
    );
  }

  resolvePlace(placeId: string): Promise<PlaceResult> {
    this.localStorage.setItem('search-address', placeId);
    return this.gService.getAddressComponents(placeId).then((res: any) => {
      let selectedCity = '';
      let selectedSubLocality = '';
      res?.address_components?.forEach((e: any) => {
        if (e.types.includes('administrative_area_level_3')) {
          selectedCity = e.long_name;
        } else if (e.types.includes('sublocality_level_1') || e.types.includes('sublocality')) {
          selectedSubLocality = e.long_name;
        }
      });
      const lng = res?.geometry?.location?.lng();
      const lat = res?.geometry?.location?.lat();
      this.localStorage.setItem('coordinates', JSON.stringify([lng, lat]));
      return { selectedCity, selectedSubLocality, lat, lng };
    });
  }

  resolvePlaceFromData(data: any): Promise<PlaceResult> {
    this.localStorage.setItem('search-address', data?.description);
    return this.resolvePlace(data?.place_id);
  }

  /* ═══════════════════════════════════════════════════════
     RECENT SEARCHES
     ═══════════════════════════════════════════════════════ */

  loadRecentSearches(): void {
    if (!this.isBrowser) return;
    try {
      const stored = localStorage.getItem('recent_searches');
      const parsed = stored ? JSON.parse(stored) : [];
      const clean = Array.isArray(parsed)
        ? parsed.filter((s: any) => typeof s === 'string' && s.trim().length > 0 && !s.includes('[object Object]'))
        : [];
      this.recentSearches$.next(clean);
      if (clean.length !== parsed.length) {
        localStorage.setItem('recent_searches', JSON.stringify(clean));
      }
    } catch {
      this.recentSearches$.next([]);
    }
  }

  saveRecentSearch(term: string): void {
    if (!this.isBrowser || !term || typeof term !== 'string' || term.trim().length < 2) return;
    if (term.includes('[object Object]')) return;
    const normalized = term.trim();
    const current = this.recentSearches$.value;
    const updated = [normalized, ...current.filter(s => s !== normalized)].slice(0, 5);
    this.recentSearches$.next(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  }

  /* ═══════════════════════════════════════════════════════
     NAVIGATION HELPERS
     ═══════════════════════════════════════════════════════ */

  navigateToSuggestion(data: any, type: string): void {
    this.eventService.broadcastEvent('view-doctor', true);
    this.clearSuggestions();
    const rawCity = data?.address?.city || '';
    const city = this.commonService.replaceSpaceWithHyphen(normalizeCity(rawCity) || rawCity) || normalizeCity(this.currentCity) || 'delhi';
    if (type === 'doctor') {
      this.router.navigateByUrl(`/${city}/doctor/${data?.doctorProfileSlug}`);
    } else if (type === 'hospital') {
      this.router.navigateByUrl(`/${city}/hospital/${data?.establishmentProfileSlug}`);
    }
  }

  navigateToSearch(symptom: string, location: string, type?: string): void {
    this.clearSuggestions();

    // Smart SEO redirect: use canonical term if available
    const canonical = this.canonicalTerm$.value;
    const query = (canonical || symptom || '').trim();

    const city = normalizeCity(location) || this.commonService.replaceSpaceWithHyphen(location || '') || '';

    // Reset canonical after use
    this.canonicalTerm$.next(null);
    this.correctedTerm$.next(null);

    if (!query) return;

    const params: any = { query };
    if (city) params.city = city;
    if (type) params.type = type;

    this.router.navigate(['/search'], { queryParams: params });
  }

  /** Navigate to canonical SEO-friendly URL based on result type */
  navigateToCanonicalResult(item: any, type: string): void {
    this.eventService.broadcastEvent('view-doctor', true);
    this.clearSuggestions();
    const city = normalizeCity(this.currentCity) || this.commonService.replaceSpaceWithHyphen(this.currentCity) || 'delhi';
    switch (type) {
      case 'doctor': {
        const rawCity = item?.address?.city || '';
        const docCity = this.commonService.replaceSpaceWithHyphen(normalizeCity(rawCity) || rawCity) || city;
        this.router.navigateByUrl(`/${docCity}/doctor/${item?.doctorProfileSlug}`);
        break;
      }
      case 'hospital':
      case 'clinic': {
        const rawCity = item?.address?.city || '';
        const hCity = this.commonService.replaceSpaceWithHyphen(normalizeCity(rawCity) || rawCity) || city;
        this.router.navigateByUrl(`/${hCity}/hospital/${item?.establishmentProfileSlug}`);
        break;
      }
      case 'service': {
        const slug = item?.slug || this.commonService.replaceSpaceWithHyphen(item?.name || '');
        this.router.navigateByUrl(`/${city}/doctors-for-${slug}`);
        break;
      }
      default: {
        const slug = item?.slug || this.commonService.replaceSpaceWithHyphen(item?.name || '');
        this.router.navigateByUrl(`/${city}/${slug}`);
        break;
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     ATLAS SEARCH — Fuzzy Autocomplete with Highlights
     ═══════════════════════════════════════════════════════ */

  /** Atlas Search highlight fragment */
  readonly autocompleteResults$ = new BehaviorSubject<AutocompleteResult>({
    doctors: [], specializations: [], services: [], hospitals: [],
    totalDoctors: 0, hasAny: false,
  });
  readonly didYouMean$ = new BehaviorSubject<string | null>(null);
  readonly relatedSearches$ = new BehaviorSubject<string[]>([]);
  readonly searchFacets$ = new BehaviorSubject<any>(null);

  private autocompleteSubject = new Subject<string>();

  private initAtlasAutocomplete(): void {
    this.autocompleteSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter((term: string) => term.length >= 2),
      switchMap((term: string) => {
        const city = this.currentCity || this.localStorage.getItem('city') || '';
        console.log('[Atlas] Searching:', term, '| city:', city);
        const cacheKey = `ac:${city}:${term}`.toLowerCase();
        const cached = this.autocompleteCache.get(cacheKey);
        if (cached) {
          console.log('[Atlas] CACHE HIT for:', cacheKey);
          return of(cached);
        }
        this.isSearching$.next(true);
        this.noResults$.next(false);
        this.didYouMean$.next(null);
        return this.apiService.searchAutocomplete(term, city).pipe(
          tap((res: any) => {
            console.log('[Atlas] API response:', JSON.stringify(res?.result?.hasAny), '| doctors:', res?.result?.doctors?.length, '| specs:', res?.result?.specializations?.length);
            this.autocompleteCache.set(cacheKey, res);
          }),
          catchError((err) => {
            console.error('[Atlas] API error:', err);
            return of({ result: { hasAny: false, doctors: [], specializations: [], services: [], hospitals: [], totalDoctors: 0 } });
          })
        );
      }),
      map((res: any) => res?.result as AutocompleteResult || {
        doctors: [], specializations: [], services: [], hospitals: [],
        totalDoctors: 0, hasAny: false,
      }),
      tap((results: AutocompleteResult) => {
        this.isSearching$.next(false);
        this.noResults$.next(!results.hasAny);
        console.log('[Atlas] hasAny:', results.hasAny, '| doctors:', results.doctors?.length, '| specs:', results.specializations?.length, '| services:', results.services?.length, '| hospitals:', results.hospitals?.length);
        // If no results, fetch "did you mean" suggestion
        if (!results.hasAny) {
          this.fetchDidYouMean(this.lastSearchTerm);
        }
        // Map Atlas results into suggestion categories for the dropdown
        const mapped: SearchResults = {
          doctorsOptions: results.doctors || [],
          specialityOptions: (results.specializations || []).map(s => ({ name: s.name, slug: s.name?.toLowerCase().replace(/\s+/g, '-'), count: s.count })),
          servicesOptions: (results.services || []).map(s => ({ name: s.name, slug: s.name?.toLowerCase().replace(/\s+/g, '-'), count: s.count })),
          hospitalsOptions: results.hospitals || [],
          clinicOptions: [],
          hasAny: results.hasAny,
        };
        console.log('[Atlas] Emitting suggestions:', mapped.doctorsOptions?.length, 'doctors,', mapped.specialityOptions?.length, 'specs,', mapped.servicesOptions?.length, 'services,', mapped.hospitalsOptions?.length, 'hospitals');
        this.suggestionsSubject.next(mapped);
      })
    ).subscribe((results: AutocompleteResult) => {
      this.autocompleteResults$.next(results);
    });
  }

  private lastSearchTerm = '';

  /** Push to Atlas autocomplete pipe — primary source for dropdown suggestions */
  searchAtlas(term: string): void {
    this.lastSearchTerm = term;
    if (term && term.length >= 2) {
      this.autocompleteSubject.next(term);
    } else {
      this.autocompleteResults$.next({
        doctors: [], specializations: [], services: [], hospitals: [],
        totalDoctors: 0, hasAny: false,
      });
      this.suggestionsSubject.next(EMPTY_RESULTS);
      this.didYouMean$.next(null);
      this.isSearching$.next(false);
    }
  }

  private fetchDidYouMean(term: string): void {
    if (!term || term.length < 3) return;
    const city = this.currentCity || '';
    this.apiService.searchDidYouMean(term, city).pipe(
      catchError(() => of({ result: { data: { suggestion: null } } }))
    ).subscribe((res: any) => {
      this.didYouMean$.next(res?.result?.data?.suggestion || null);
    });
  }

  /** Fetch related/popular searches for a term */
  fetchRelatedSearches(term: string): void {
    if (!term || term.length < 2) return;
    const city = this.currentCity || '';
    this.apiService.searchRelated(term, city).pipe(
      catchError(() => of({ result: { data: [] } }))
    ).subscribe((res: any) => {
      this.relatedSearches$.next(res?.result?.data || []);
    });
  }

  /** Fetch filter facet counts for the current search */
  fetchFacets(term: string): void {
    const city = this.currentCity || '';
    this.apiService.searchFacets(term, city).pipe(
      catchError(() => of({ result: { data: null } }))
    ).subscribe((res: any) => {
      this.searchFacets$.next(res?.result?.data || null);
    });
  }

  /* ═══════════════════════════════════════════════════════
     CLEAN SEARCH PAGE NAVIGATION
     /search?type=...&query=...&city=...
     ═══════════════════════════════════════════════════════ */

  /** Navigate to the /search results page with clean query params */
  navigateToSearchPage(query: string, options?: { type?: string; city?: string }): void {
    const params: Record<string, string> = {};
    if (query) params['query'] = query;
    if (options?.type && options.type !== 'all') params['type'] = options.type;
    const city = options?.city || normalizeCity(this.currentCity) || this.currentCity || '';
    if (city) params['city'] = city;
    this.clearSuggestions();
    this.router.navigate(['/search'], { queryParams: params });
  }

  /** Public wrapper: fetch "did you mean" suggestion for a term */
  fetchDidYouMeanPublic(term: string): void {
    this.fetchDidYouMean(term);
  }
}

/* ─── Interfaces for Atlas Search results ─────────────── */

export interface HighlightText {
  value: string;
  type: 'hit' | 'text';
}

export interface HighlightFragment {
  path: string;
  texts: HighlightText[];
}

export interface AutocompleteDoctor {
  _id: string;
  doctorId: string;
  doctorProfileSlug: string;
  name: string;
  profilePic: string;
  specialization: string[];
  service: string[];
  address: { city: string; locality: string };
  establishmentId: string;
  establishmentProfileSlug: string;
  searchScore: number;
  highlights: HighlightFragment[];
}

export interface AutocompleteResult {
  doctors: AutocompleteDoctor[];
  specializations: { name: string; count: number }[];
  services: { name: string; count: number }[];
  hospitals: { _id: string; name: string; establishmentProfileSlug: string; address: any }[];
  totalDoctors: number;
  hasAny: boolean;
}
