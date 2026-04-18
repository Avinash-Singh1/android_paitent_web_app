import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { Subject, debounceTime, fromEvent, takeUntil } from "rxjs";
import { LocalStorageService } from "src/app/services/storage.service";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { SearchSuggestionsMobileComponent } from "../search-suggestions-mobile/search-suggestions-mobile.component";
import { CommonService } from "src/app/services/common.service";

import { SearchService, SearchResults, CityItem, AutocompleteResult, AutocompleteDoctor } from 'src/app/services/search.service';

@Component({
  standalone: false,
  selector: "nectar-global-search",
  templateUrl: "./global-search.component.html",
  styleUrls: ["./global-search.component.scss"],
})
export class GlobalSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('symptoms', { static: false }) symptoms!: ElementRef<HTMLInputElement>;
  @ViewChild("location", { static: false }) location: ElementRef;
  @Input() type = "header";
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  deviceWidth: any;
  isBrowser: boolean;

  // Template-bound properties driven by SearchService
  isSearching = false;
  noResults = false;
  specialityOptions: any[] = [];
  servicesOptions: any[] = [];
  doctorsOptions: any[] = [];
  hospitalsOptions: any[] = [];
  clinicOptions: any[] = [];
  recentSearches: string[] = [];
  filteredCities: CityItem[] = [];
  filteredLocalities: CityItem[] = [];
  isCityLoading = false;
  placePredictions: any[] = [];
  searchTerm = '';

  // Atlas Search properties
  didYouMean: string | null = null;
  atlasResults: AutocompleteResult = {
    doctors: [], specializations: [], services: [], hospitals: [],
    totalDoctors: 0, hasAny: false,
  };

  constructor(
    private router: Router,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private bottomSheet: MatBottomSheet,
    private commonService: CommonService,
    public searchService: SearchService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    // CSR-only: skip all subscriptions during initial render
    if (!this.isBrowser) return;

    // Subscribe to unified service observables
    this.searchService.suggestions$.pipe(takeUntil(this.destroy$)).subscribe((r: SearchResults) => {
      this.specialityOptions = r.specialityOptions;
      this.servicesOptions = r.servicesOptions;
      this.doctorsOptions = r.doctorsOptions;
      this.hospitalsOptions = r.hospitalsOptions;
      this.clinicOptions = r.clinicOptions;
      console.log('[GlobalSearch] Got suggestions:', this.doctorsOptions?.length, 'doctors,', this.specialityOptions?.length, 'specs,', this.servicesOptions?.length, 'services,', this.hospitalsOptions?.length, 'hospitals');
      this.cdr.markForCheck();
    });
    this.searchService.isSearching$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.isSearching = v; this.cdr.markForCheck(); });
    this.searchService.noResults$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.noResults = v; this.cdr.markForCheck(); });
    this.searchService.recentSearches$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.recentSearches = v; this.cdr.markForCheck(); });
    this.searchService.filteredCities$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.filteredCities = v; this.cdr.markForCheck(); });
    this.searchService.filteredLocalities$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.filteredLocalities = v; this.cdr.markForCheck(); });
    this.searchService.isCityLoading$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.isCityLoading = v; this.cdr.markForCheck(); });
    this.searchService.placePredictions$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.placePredictions = v; this.cdr.markForCheck(); });
    // Atlas Search observables
    this.searchService.autocompleteResults$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.atlasResults = v; this.cdr.markForCheck(); });
    this.searchService.didYouMean$.pipe(takeUntil(this.destroy$)).subscribe(v => { this.didYouMean = v; this.cdr.markForCheck(); });
  }

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }

  ngAfterViewInit(): void {
    if (this.location?.nativeElement) {
      this.location.nativeElement.value = this.searchService.currentCity || "Delhi";
    }
    this.initScrollListener();

    // Update location input when city is auto-detected via geolocation
    this.eventService.getEvent<string>("city-detected").pipe(takeUntil(this.destroy$)).subscribe((city) => {
      if (city && this.location?.nativeElement) {
        this.location.nativeElement.value = city;
      }
    });
  }

  /* ── Search Navigation ───────────────────────────────── */

  getSearchData() {
    const symptom = this.symptoms.nativeElement.value;
    const location = this.location.nativeElement.value || this.searchService.currentCity;
    this.searchService.saveRecentSearch(symptom);
    this.searchService.navigateToSearch(symptom, location);
    this.symptoms.nativeElement.value = '';
  }

  /* ── City methods — delegate to service ──────────────── */

  onCitySearch(event: any): void {
    this.searchService.filterCities(event.target.value);
  }

  onCitySelect(event: any): void {
    const selectedValue = event.source.value;
    const result = this.searchService.selectCity(selectedValue);
    if (result) {
      this.location.nativeElement.value = selectedValue;
    } else {
      this.location.nativeElement.value = this.searchService.currentCity || '';
    }
  }

  useMyLocation(): void {
    if (this.autocomplete) this.autocomplete.closePanel();
    this.location.nativeElement.value = 'Detecting location...';
    this.searchService.useMyLocation().then((city) => {
      this.location.nativeElement.value = city;
    }).catch(() => {
      this.location.nativeElement.value = '';
      this.location.nativeElement.placeholder = 'Location not detected. Type a city';
      this.location.nativeElement.focus();
    });
  }

  searchEntireCity(): void {
    this.searchService.searchEntireCity();
    this.location.nativeElement.value = this.searchService.currentCity;
  }

  validateCity(event: any): void {
    const match = this.searchService.validateCity(event.target.value);
    if (!match) {
      event.target.value = this.searchService.currentCity || '';
    }
  }

  /* ── Search suggestions — delegate to service ────────── */

  getSuggestionList(event: any): void {
    const inputValue = event.target.value;
    this.searchTerm = inputValue;
    this.searchService.searchAtlas(inputValue);
  }

  applyDidYouMean(): void {
    if (this.didYouMean) {
      this.symptoms.nativeElement.value = this.didYouMean;
      this.searchTerm = this.didYouMean;
      this.searchService.searchAtlas(this.didYouMean);
    }
  }

  /* ── Google Places — delegate to service ─────────────── */

  getPlace(data: any) {
    this.searchService.resolvePlaceFromData(data).then(() => {
      if (!this.symptoms.nativeElement.value && true) {
        this.symptoms.nativeElement.focus();
      }
    });
  }

  setSelectedState(state: any) {
    // For legacy template — state is CityItem from service
    const name = typeof state === 'string' ? state : state?.name;
    if (name) {
      this.searchService.selectCity(name);
    }
  }

  /* ── Suggestion navigation — delegate to service ─────── */

  closeSuggestion(data: string) {
    if (data == "symptomps") {
      this.symptoms.nativeElement.value = "";
      this.searchTerm = '';
      this.searchService.clearSuggestions();
    } else {
      this.location.nativeElement.value = "";
      this.searchService.loadPopularCities();
      setTimeout(() => this.location.nativeElement.focus(), 0);
    }
  }

  getSuggestion(data: any, type: string) {
    this.searchService.saveRecentSearch(this.symptoms.nativeElement.value);
    this.symptoms.nativeElement.value = '';
    this.searchService.navigateToSuggestion(data, type);
  }

  selectRecentSearch(term: string): void {
    this.symptoms.nativeElement.value = term;
    this.searchTerm = term;
    this.searchService.searchAtlas(term);
  }

  focusOnLocation() {
    if (!this.location.nativeElement.value && true) {
      setTimeout(() => {
        this.location.nativeElement.focus();
      }, 0);
    }
  }

  searchByType(type: string) {
    const symptom = this.symptoms.nativeElement.value;
    const location = this.location.nativeElement.value || this.searchService.currentCity;
    this.searchService.saveRecentSearch(symptom);
    this.searchService.navigateToSearch(symptom, location, type);
    this.symptoms.nativeElement.value = '';
  }

  /* ── Scroll listener (unique to global-search) ──────── */

  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  scrollTop: any;
  bottomReached: boolean = false;

  initScrollListener() {
    if (!this.isBrowser) return;
    fromEvent(window, "scroll").pipe(
      debounceTime(100),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const scrollTop =
        window.scrollY ||
        this._document.documentElement.scrollTop ||
        this._document.body.scrollTop ||
        0;
      this.scrollTop = scrollTop;

      const scrollHeight = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = this._document.documentElement.scrollHeight;

      if (scrollHeight + windowHeight > documentHeight - 700) {
        this.bottomReached = true;
      } else {
        this.bottomReached = false;
      }
      this.cdr.markForCheck();
    });
  }

  /* ── Bottom sheet (unique to global-search) ──────────── */

  openBottomSheet(data: any) {
    if (this.deviceWidth < 767) {
      let obj: any = {
        type: data,
        location: this.location?.nativeElement?.value || '',
        symptomps: this.symptoms?.nativeElement?.value || '',
        initialFocus: data === 'both' ? 'symptoms' : data
      };
      const sheetRef = this.bottomSheet.open(SearchSuggestionsMobileComponent, {
        data: obj,
        panelClass: "search-bottom-sheet",
      });
      sheetRef.afterDismissed().subscribe((data: any) => {
        if (data?.symptoms) {
          this.symptoms.nativeElement.value = data?.symptoms;
        }
        if (data?.location) {
          this.location.nativeElement.value = data?.location;
        }
      });
    }
  }

  focusinmethod() {
    if (!this.isBrowser) return;
    let b = this._document.body;
    b.style.overflow = "hidden";
  }
  focusoutmethod() {
    if (!this.isBrowser) return;
    let b = this._document.body;
    b.style.overflow = "auto";
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusoutmethod();
  }

  /* ── Filtered getters for autocomplete dropdown ─────── */

  private matchesTerm(text: string): boolean {
    if (!this.searchTerm || this.searchTerm.length < 2) return true;
    const words = this.searchTerm.toLowerCase().replace(/[''`&\-_.]/g, '').split(/\s+/).filter(Boolean);
    const t = (text || '').toLowerCase().replace(/[''`&\-_.]/g, '');
    return words.some(w => t.includes(w));
  }

  get filteredSpecialities(): any[] {
    if (!this.searchTerm) return this.specialityOptions.slice(0, 3);
    return this.specialityOptions.filter(i => this.matchesTerm(i?.name)).slice(0, 3);
  }

  get filteredServices(): any[] {
    if (!this.searchTerm) return this.servicesOptions.slice(0, 3);
    return this.servicesOptions.filter(i => this.matchesTerm(i?.name)).slice(0, 3);
  }

  get filteredDoctors(): any[] {
    if (!this.searchTerm) return this.doctorsOptions.slice(0, 3);
    return this.doctorsOptions.filter(i =>
      this.matchesTerm(i?.name) ||
      (i?.specialization || []).some((s: string) => this.matchesTerm(s)) ||
      (i?.service || []).some((s: string) => this.matchesTerm(s))
    ).slice(0, 3);
  }

  get filteredHospitals(): any[] {
    if (!this.searchTerm) return this.hospitalsOptions.slice(0, 3);
    return this.hospitalsOptions.filter(i =>
      this.matchesTerm(i?.name) || this.matchesTerm(i?.address?.locality)
    ).slice(0, 3);
  }

  get filteredClinics(): any[] {
    if (!this.searchTerm) return this.clinicOptions.slice(0, 3);
    return this.clinicOptions.filter(i =>
      this.matchesTerm(i?.name) || this.matchesTerm(i?.address?.locality)
    ).slice(0, 3);
  }

  trackByName(_i: number, item: any): string { return item?.name || item; }
  trackByIndex(i: number): number { return i; }
}
