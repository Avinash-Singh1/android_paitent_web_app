import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MyupcharService } from 'src/app/services/myupchar.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MedicineApiService } from 'src/app/services/medicine-api.service';
import { Medicine } from 'src/app/models/medicine.model';
import { MedicineFilterService } from 'src/app/services/medicine-filter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,
  selector: 'nectar-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  category = [];
  currentUrl: string;
  suggestions: Medicine[] = [];
  showSuggestions: boolean = false;
  @ViewChild('searchInput') searchInput!: ElementRef;
  searchQuery: string = '';
  loading = false;

  constructor(
    private service: MyupcharService,
    private router: Router,
    private http: HttpClient,
    private medicineApiService: MedicineApiService,
    private medicineFilterService: MedicineFilterService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // Load search term from URL on init
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const searchFromUrl = params['search'] || '';
        if (searchFromUrl !== this.searchQuery) {
          this.searchQuery = searchFromUrl;
          if (this.searchInput) {
            this.searchInput.nativeElement.value = searchFromUrl;
          }
        }
      });

    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.urlAfterRedirects;
          if (this.currentUrl === '/medicines/details') {
            this.resetSearchInput();
          }
        }
      });

    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.length >= 3) {
            this.loading = true;
            return this.medicineApiService.getAutocompleteSuggestions(query);
          }
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (suggestions) => {
          this.suggestions = suggestions;
          this.showSuggestions = suggestions.length > 0;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.clearSuggestions();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;

    if (query.length < 3) {
      this.clearSuggestions();
      if (query.length === 0) {
        // Clear search filter when empty
        this.executeSearch('');
      }
    } else {
      this.searchSubject$.next(query);
    }
  }

  /**
   * Execute search - updates filter service and URL
   */
  executeSearch(query: string): void {
    this.medicineFilterService.updateSearchTerm(query);
    this.medicineFilterService.updateUrlParams(this.medicineFilterService.getCurrentFilters());
    this.clearSuggestions();
  }

  /**
   * Handle search submission (Enter key or search button)
   */
  onSearchSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (this.searchQuery.trim()) {
      this.executeSearch(this.searchQuery.trim());
    }
  }

  goToProduct(productId: string, name: string): void {
    const encodedName = name
      .toString()
      .toLowerCase()
      .replace(/\([^\)]*\)/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Store search term before navigating
    const currentSearch = this.searchQuery;
    this.router.navigate(['medicines/details', productId, encodedName]);
    this.resetSearchInput();

    // Restore search after navigation for back button
    setTimeout(() => {
      this.searchQuery = currentSearch;
    }, 100);
  }

  resetSearchInput(): void {
    this.searchQuery = '';
    this.clearSuggestions();
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    // Clear search from filter service
    this.medicineFilterService.updateSearchTerm('');
  }
  clearSuggestions(): void {
    this.suggestions = [];
    this.showSuggestions = false;
  }

  getSelectedData(name_en: string) {
    const selectedCategory = this.category.find(cat => cat.name_en === name_en);
    if (selectedCategory) {
      // Handle selected category
    }
  }
}
