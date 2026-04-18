import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { SearchService, SearchResults, CityItem, AutocompleteResult, AutocompleteDoctor } from 'src/app/services/search.service';

@Component({
  standalone: false,
  selector: "nectar-wrap-search",
  templateUrl: "./wrap-search.component.html",
  styleUrls: ["./wrap-search.component.scss"],
})
export class WrapSearchComponent implements OnInit, AfterViewInit, OnDestroy  {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  @ViewChild("symptoms") symptoms: ElementRef<HTMLInputElement>;
  @ViewChild("location", { static: false })
  location: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  private destroy$ = new Subject<void>();

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
    private activatedRoute: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private localStorage: LocalStorageService,
    private commonService: CommonService,
    public searchService: SearchService,
    private cdr: ChangeDetectorRef) {
    // Subscribe to unified service observables
    this.searchService.suggestions$.pipe(takeUntil(this.destroy$)).subscribe((r: SearchResults) => {
      this.specialityOptions = r.specialityOptions;
      this.servicesOptions = r.servicesOptions;
      this.doctorsOptions = r.doctorsOptions;
      this.hospitalsOptions = r.hospitalsOptions;
      this.clinicOptions = r.clinicOptions;
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

  onSearchFocus(): void {
    this.searchService.loadRecentSearches();
    const currentValue = this.symptoms?.nativeElement?.value;
    this.searchTerm = currentValue || '';
    if (currentValue && currentValue.length >= 2) {
      this.searchService.searchAtlas(currentValue);
    }
  }

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

  findDoctor(): void {
    this.search({ code: 'Enter' });
  }

  searchByType(type: string): void {
    this.searchService.saveRecentSearch(this.symptoms.nativeElement.value);
    const symptom = this.symptoms.nativeElement.value;
    const location = this.location.nativeElement.value || this.searchService.currentCity;
    this.searchService.navigateToSearch(symptom, location, type);
  }

  ngOnInit(): void {
    this.initCityFromRoute();

    if (!this.isBrowser) return;

    setTimeout(() => {
      const routeArray = this.router.url.split("/");
      let filter = this.commonService.titleCase(
        this.commonService.replaceHyphenWithSpace(routeArray[2])
      );
      filter =
        filter != "Doctors"
          ? filter.replace(/%28/g, "(").replace(/%29/g, ")")
          : "";
      const location: string =
        this.localStorage.getItem("search-address") ||
        this.commonService.titleCase(
          this.commonService.replaceHyphenWithSpace(routeArray[1])
        );
      if (location == "Hospital List" || !location) {
        const currentCity = this.localStorage.getItem("city");
        const currentLocality = this.localStorage.getItem("locality");

        if (currentLocality) {
          this.location.nativeElement.value = currentLocality;
        } else {
          this.location.nativeElement.value = currentCity ? currentCity : "Delhi";
        }
      } else {
        const currentLocality = this.localStorage.getItem("locality");
        if (currentLocality) {
          this.location.nativeElement.value = currentLocality;
        } else {
          this.location.nativeElement.value = location;
        }
      }
      this.symptoms.nativeElement.value = filter || "";
    });

    this.eventService.getEvent("clear-speciality").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.symptoms.nativeElement.value = "";
      }
    });

    // Update location input when city is auto-detected via geolocation
    this.eventService.getEvent<string>("city-detected").pipe(takeUntil(this.destroy$)).subscribe((city) => {
      if (city && this.location?.nativeElement) {
        this.location.nativeElement.value = city;
      }
    });
  }

  ngAfterViewInit() {
    if (this.location?.nativeElement) {
      this.location.nativeElement.value = this.searchService.currentCity;
    }
    // Clear stale suggestions so dropdown doesn't auto-open with old data
    this.searchService.clearSuggestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  /* ── Route-based city init ───────────────────────────── */

  private initCityFromRoute(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res.city) {
        this.searchService.currentCity = res.city;
        this.localStorage.setItem("city", res.city);
        if (this.location?.nativeElement) {
          this.location.nativeElement.value = res.city;
        }
      }
      if (res.locality) {
        this.searchService.currentCity = res.locality;
        this.localStorage.setItem("locality", res.locality);
        if (this.location?.nativeElement) {
          this.location.nativeElement.value = res.locality;
        }
      }
    });
  }

  /* ── Google Places — delegate to service ─────────────── */

  getPlace(data: any) {
    this.searchService.resolvePlaceFromData(data).then((result) => {
      if (!this.symptoms.nativeElement.value && true) {
        this.symptoms.nativeElement.focus();
      }
      this.search({ code: "Enter" });
    });
  }

  /* ── Search navigation ───────────────────────────────── */

  search(e: any) {
    if (e.code == "Enter") {
      this.searchService.saveRecentSearch(this.symptoms.nativeElement.value);
      const symptom = this.symptoms.nativeElement.value;
      const location = this.location.nativeElement.value || this.searchService.currentCity;
      this.searchService.navigateToSearch(symptom, location);
    }
  }

  selectRecentSearch(term: string): void {
    this.symptoms.nativeElement.value = term;
    this.searchTerm = term;
    this.searchService.searchAtlas(term);
  }

  onSuggestionSelected(item: any, type: string): void {
    this.searchService.saveRecentSearch(item?.name || '');
    this.searchService.navigateToCanonicalResult(item, type);
  }

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
    this.searchService.navigateToSuggestion(data, type);
  }

  focusOnLocation() {
    if (!this.location.nativeElement.value && true) {
      setTimeout(() => {
        this.location.nativeElement.focus();
      }, 0);
    }
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
