import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, ChangeDetectorRef, DOCUMENT } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject, combineLatest,
  debounceTime, distinctUntilChanged, switchMap, catchError, of, tap, takeUntil,
} from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import {
  SearchService, AutocompleteResult, AutocompleteDoctor,
} from 'src/app/services/search.service';
import { SeoService } from 'src/app/services/seo.service';
import { getCanonicalUrl } from '../../../../../shared/utils/canonical-url';

/** Valid search types for clean URL params */
type SearchType = 'all' | 'doctor' | 'hospital' | 'specialization' | 'service' | 'procedure';

@Component({
  standalone: false,
  selector: 'nectar-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  /* ── State ─────────────────────────────────────────── */
  query = '';
  city = '';
  type: SearchType = 'all';
  isLoading = false;
  noResults = false;
  searchFocused = false;

  doctors: AutocompleteDoctor[] = [];
  specializations: { name: string; count: number }[] = [];
  services: { name: string; count: number }[] = [];
  hospitals: any[] = [];
  totalDoctors = 0;

  didYouMean: string | null = null;
  relatedSearches: string[] = [];
  citySpecializations: { name: string; specializationId?: string }[] = [];
  private lastCitySpecFetched = '';

  /* ── Inline search input (syncs with URL) ──────────── */
  private inputSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public commonService: CommonService,
    public searchService: SearchService,
    private seoService: SeoService,
    private titleService: Title,
    private meta: Meta,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    // initial render: only set SEO meta tags, skip all search API execution
    this.setSeo();

    // All search logic runs only in browser — search pages are CSR-only

    // 1) React to query-param changes (back/forward, external links, initial load)
    combineLatest([
      this.route.queryParams,
    ]).pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    ).subscribe(([params]) => {
      this.query = (params['query'] || '').trim();
      this.city  = (params['city']  || '').trim();
      this.type  = (params['type']  as SearchType) || 'all';
      this.cdr.markForCheck();

      this.setSeo();
      this.fetchCitySpecializations(this.city);

      if (this.query.length >= 2) {
        this.executeSearch(this.query, this.city);
      } else {
        this.clearResults();
      }
    });

    // 2) Debounced input → update URL (which triggers search above)
    this.inputSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe((term) => {
      this.updateQueryParams({ query: term || null });
    });

    // 3) Did-you-mean from service
    this.searchService.didYouMean$.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      this.didYouMean = v;
      this.cdr.markForCheck();
    });

    // 4) Related searches
    this.searchService.relatedSearches$.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      this.relatedSearches = v;
      this.cdr.markForCheck();
    });

    // SEO is now called reactively inside the queryParams subscription
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ── Search execution ──────────────────────────────── */

  private executeSearch(query: string, city: string): void {
    this.isLoading = true;
    this.noResults = false;
    this.cdr.markForCheck();

    this.apiService.searchAutocomplete(query, city, 20).pipe(
      catchError(() => of({ result: { data: {
        doctors: [], specializations: [], services: [], hospitals: [],
        totalDoctors: 0, hasAny: false,
      }}})),
    ).subscribe((res: any) => {
      const data: AutocompleteResult = res?.result?.data || res?.result || {
        doctors: [], specializations: [], services: [], hospitals: [],
        totalDoctors: 0, hasAny: false,
      };

      this.doctors         = data.doctors || [];
      this.specializations = data.specializations || [];
      this.services        = data.services || [];
      this.hospitals       = data.hospitals || [];
      this.totalDoctors    = data.totalDoctors || 0;
      this.noResults       = !data.hasAny;
      this.isLoading       = false;
      this.cdr.markForCheck();

      // Fetch supplementary data
      if (!data.hasAny) {
        this.searchService.fetchDidYouMeanPublic(query);
      }
      this.searchService.fetchRelatedSearches(query);
    });
  }

  private clearResults(): void {
    this.doctors = [];
    this.specializations = [];
    this.services = [];
    this.hospitals = [];
    this.totalDoctors = 0;
    this.noResults = false;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private fetchCitySpecializations(city: string): void {
    const normalized = (city || '').trim().toLowerCase();
    if (!normalized || normalized === this.lastCitySpecFetched) return;
    this.lastCitySpecFetched = normalized;
    this.apiService.get_CurrentCitySpecialization(city).pipe(
      catchError(() => of({ data: [] })),
      takeUntil(this.destroy$),
    ).subscribe((res: any) => {
      this.citySpecializations = res?.data || [];
      this.cdr.markForCheck();
    });
  }

  /* ── URL ↔ Input sync ──────────────────────────────── */

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputSubject.next(value);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const value = (event.target as HTMLInputElement).value.trim();
      if (value) {
        this.updateQueryParams({ query: value });
      }
    }
  }

  /** Merge new params into current query params (removes nulls) */
  updateQueryParams(patch: Record<string, string | null>): void {
    const current = { ...this.route.snapshot.queryParams };
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') {
        delete current[k];
      } else {
        current[k] = v;
      }
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: current,
      replaceUrl: true,
    });
  }

  /* ── Filter by type ────────────────────────────────── */

  filterByType(type: SearchType): void {
    this.updateQueryParams({ type: type === 'all' ? null : type });
  }

  get filteredDoctors(): AutocompleteDoctor[] {
    return (this.type === 'all' || this.type === 'doctor') ? this.doctors : [];
  }

  get filteredSpecializations(): { name: string; count: number }[] {
    return (this.type === 'all' || this.type === 'specialization') ? this.specializations : [];
  }

  get filteredServices(): { name: string; count: number }[] {
    return (this.type === 'all' || this.type === 'service') ? this.services : [];
  }

  get filteredHospitals(): any[] {
    return (this.type === 'all' || this.type === 'hospital') ? this.hospitals : [];
  }

  /* ── Canonical navigation (click result → SEO URL) ── */

  navigateToResult(item: any, type: string): void {
    const url = getCanonicalUrl(item, type, this.city || this.searchService.currentCity);
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  /* ── Did-you-mean ──────────────────────────────────── */

  clearSearch(): void {
    this.query = '';
    this.cdr.markForCheck();
    this.updateQueryParams({ query: null });
  }

  applyDidYouMean(): void {
    if (this.didYouMean) {
      this.updateQueryParams({ query: this.didYouMean });
    }
  }

  applyRelatedSearch(term: string): void {
    this.updateQueryParams({ query: term });
  }

  /* ── SEO ───────────────────────────────────────────── */

  private setSeo(): void {
    const q = this.query || 'Search';
    const c = this.city || '';
    const title = c ? `${q} in ${c} - NectarPlus Health` : `${q} - NectarPlus Health`;
    this.titleService.setTitle(title);
    this.meta.updateTag({
      name: 'description',
      content: `Find ${q} ${c ? 'in ' + c : ''} on NectarPlus Health. Book appointments with top doctors, hospitals, and clinics.`,
    });

    // Canonical = production URL with query params (search pages need them)
    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.fragment = null;
    const canonical = 'https://nectarplus.health' + urlTree.toString();
    this.seoService.setCanonicalUrl(canonical);
    this.seoService.noIndexRobot();
  }

  /* ── TrackBy ───────────────────────────────────────── */

  hasHighlightFor(doc: AutocompleteDoctor, path: string): boolean {
    return doc.highlights?.some(hl => hl.path === path) ?? false;
  }

  trackByDoctorId(_index: number, doc: AutocompleteDoctor): string {
    return doc._id;
  }
}
