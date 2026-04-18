import { AfterViewInit, Component, ElementRef, Inject, OnInit, OnDestroy, ViewChild } from "@angular/core";
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from "@angular/material/bottom-sheet";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { SearchService, SearchResults, CityItem } from "src/app/services/search.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";

@Component({
  standalone: false,
  selector: "nectar-search-suggestions-mobile",
  templateUrl: "./search-suggestions-mobile.component.html",
  styleUrls: ["./search-suggestions-mobile.component.scss"],
})
export class SearchSuggestionsMobileComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("symptoms", { static: true })
  symptoms: ElementRef;
  @ViewChild("location", { static: true })
  location: ElementRef;

  private destroy$ = new Subject<void>();

  // Template-bound properties driven by SearchService
  specialityOptions: any[] = [];
  servicesOptions: any[] = [];
  doctorsOptions: any[] = [];
  hospitalsOptions: any[] = [];
  clinicOptions: any[] = [];
  filteredCities: string[] = [];
  filteredLocalities: string[] = [];
  currentCity = '';
  selectedCity = '';
  selectedSubLocality = '';
  inputFocused: string = "location";
  searchTerm = '';

  constructor(
    public bottomSheetRef: MatBottomSheetRef<SearchSuggestionsMobileComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private eventService: EventService,
    private router: Router,
    private localStorage: LocalStorageService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    public searchService: SearchService,
    private googleMapsService: GoogleMapsService) {
    // Subscribe to unified service observables
    this.searchService.suggestions$.pipe(takeUntil(this.destroy$)).subscribe((r: SearchResults) => {
      this.specialityOptions = r.specialityOptions;
      this.servicesOptions = r.servicesOptions;
      this.doctorsOptions = r.doctorsOptions;
      this.hospitalsOptions = r.hospitalsOptions;
      this.clinicOptions = r.clinicOptions;
    });

    // Map CityItem[] to string[] for the mobile template (which uses {{ city }} directly)
    this.searchService.filteredCities$.pipe(takeUntil(this.destroy$)).subscribe(v => {
      this.filteredCities = v.map(c => c.name);
    });
    this.searchService.filteredLocalities$.pipe(takeUntil(this.destroy$)).subscribe(v => {
      this.filteredLocalities = v.map(c => c.name);
    });
  }

  ngOnInit(): void {
    if (this.data?.initialFocus) {
      this.inputFocused = this.data.initialFocus;
    }
    this.currentCity = this.searchService.currentCity || this.localStorage.getItem('city') || 'Delhi';
    // Load popular cities so the dropdown shows suggestions immediately
    this.searchService.loadPopularCities();
  }

  ngAfterViewInit(): void {
    this.activatedRoute.queryParams.subscribe((res: any) => {
      if (res?.filter) {
        this.symptoms.nativeElement.value = res?.filter;
      }
      if (res?.location) {
        this.location.nativeElement.value = res?.location;
      }
    });
    if (this.data?.location) {
      this.location.nativeElement.value = this?.data?.location;
    }
    if (this.data?.symptomps) {
      this.symptoms.nativeElement.value = this?.data?.symptomps;
    }
    if (!this.location.nativeElement?.value) {
      this.location.nativeElement.value = this.currentCity;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ── Search suggestions — delegate to service ────────── */

  getSuggestionList(event: any): void {
    const inputValue = event.target.value;
    this.searchTerm = inputValue || '';
    this.searchService.searchAtlas(inputValue);
  }

  /* ── Suggestion navigation ───────────────────────────── */

  getSuggestion(data: any, type: string) {
    this.bottomSheetRef.dismiss();
    this.searchService.navigateToSuggestion(data, type);
  }

  selectingValue(data: any, type = "symptoms") {
    if (this.data?.type != "both") {
      this.bottomSheetRef.dismiss({ symptoms: data });
    } else {
      this.symptoms.nativeElement.value = data;
      const filter = this.symptoms.nativeElement.value;
      const location = this.location.nativeElement.value || this.searchService.currentCity;
      if (location && filter) {
        this.bottomSheetRef.dismiss();
        this.searchService.saveRecentSearch(filter);
        this.searchService.navigateToSearch(filter, location);
      }
    }
  }

  /* ── City methods — delegate to service ──────────────── */

  onCitySearch(event: any): void {
    this.searchService.filterCities(event.target.value);
  }

  onCitySelect(event: any): void {
    const selectedCity = event.option.value;
    this.searchService.selectCity(selectedCity);
    this.currentCity = selectedCity;
  }

  setSelectedCity(city: string) {
    this.selectedCity = city;
    this.searchService.selectCity(city);
    this.location.nativeElement.value = city;

    this.tryNavigateOrDismiss();
  }

  setSelectedState(state: string) {
    this.searchService.selectCity(state);
    this.location.nativeElement.value = state;

    this.tryNavigateOrDismiss();
  }

  searchEntireCity(): void {
    this.searchService.searchEntireCity();
    this.location.nativeElement.value = this.searchService.currentCity;
    this.tryNavigateOrDismiss();
  }

  private tryNavigateOrDismiss(): void {
    if (
      this.symptoms.nativeElement?.value &&
      this.location.nativeElement?.value &&
      this.data?.type == "both"
    ) {
      this.bottomSheetRef.dismiss();
      const symptom = this.symptoms.nativeElement.value;
      const location = this.searchService.currentCity || this.location.nativeElement.value;
      this.searchService.saveRecentSearch(symptom);
      this.searchService.navigateToSearch(symptom, location);
    } else if (this.data?.type == "symptomps") {
      this.bottomSheetRef.dismiss({
        symptoms: this.symptoms.nativeElement.value,
      });
    } else if (this.data?.type == "location") {
      this.bottomSheetRef.dismiss({
        location: this.location.nativeElement.value,
      });
    }
  }

  /* ── Current Location ────────────────────────────────── */

  getCurrentCity() {
    if (this.location?.nativeElement) {
      this.location.nativeElement.value = 'Detecting location...';
    }
    this.searchService.useMyLocation().then((city: string) => {
      this.currentCity = city;
      if (this.location?.nativeElement) {
        this.location.nativeElement.value = city;
      }
    }).catch(() => {
      if (this.location?.nativeElement) {
        this.location.nativeElement.value = '';
        this.location.nativeElement.placeholder = 'Location not detected. Type a city';
        this.location.nativeElement.focus();
      }
    });
  }

  /* ── Google Places — delegate to service ─────────────── */

  getPlace(data: any) {
    this.searchService.resolvePlaceFromData(data).then((result) => {
      this.selectedCity = result.selectedCity;
      this.selectedSubLocality = result.selectedSubLocality;
      if (!this.symptoms.nativeElement.value && true) {
        this.symptoms.nativeElement.focus();
      }
    });
  }

  /* ── Enter key navigation ────────────────────────────── */

  pressedEnter(e: any) {
    if (
      e.code == "Enter" ||
      e.code === "NumpadEnter" ||
      e.code === "Return" ||
      e.keyCode === 13
    ) {
      this.tryNavigateOrDismiss();
    }
  }

  private matchesTerm(text: string): boolean {
    if (!this.searchTerm || this.searchTerm.length < 2) return true;
    const words = this.searchTerm.toLowerCase().replace(/[''`&\-_.]/g, '').split(/\s+/).filter(Boolean);
    const t = (text || '').toLowerCase().replace(/[''`&\-_.]/g, '');
    return words.some(w => t.includes(w));
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

  get filteredSpecialities(): any[] {
    if (!this.searchTerm) return this.specialityOptions.slice(0, 3);
    return this.specialityOptions.filter(i => this.matchesTerm(i?.name)).slice(0, 3);
  }

  get filteredServices(): any[] {
    if (!this.searchTerm) return this.servicesOptions.slice(0, 3);
    return this.servicesOptions.filter(i => this.matchesTerm(i?.name)).slice(0, 3);
  }
}
