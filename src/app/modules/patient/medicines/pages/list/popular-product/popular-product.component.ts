import { Component, OnInit, OnDestroy, SimpleChanges, OnChanges, ChangeDetectorRef, Inject, Input, AfterViewInit, DOCUMENT } from '@angular/core';
import { MyupcharService } from 'src/app/services/myupchar.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from 'src/app/services/seo.service';

import { Subject } from 'rxjs';
import { takeUntil, finalize, debounceTime } from 'rxjs/operators';
import { MedicineApiService } from 'src/app/services/medicine-api.service';
import { Medicine, MedicineCategory } from 'src/app/models/medicine.model';
import { MedicineFilterService } from 'src/app/services/medicine-filter.service';
import { MedicineFilterState } from 'src/app/services/medicine-filter.service';

@Component({
  standalone: false,
  selector: 'nectar-popular-product',
  templateUrl: './popular-product.component.html',
  styleUrls: ['./popular-product.component.scss'],
})
export class PopularProductComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab: number = 1;
  data: Medicine[] = [];
  filteredData: Medicine[] = [];
  categories: MedicineCategory[] = [];
  currentUrl: string;
  pageNumber: number = 1;
  selectedCategoryIds: number[] = [];
  selectedFilter: string = 'All';
  expandedCategories: Set<number> = new Set<number>();
  dataArray: string[] = [];
  categoryPath: any;
  allProductUrls: string[] = [];
  @Input() productData: Medicine[] = [];
  categoriesname: any;
  categoryNameurl: any;
  categor: any;
  newData: any = [];
  newArr: Medicine[];
  starSize: string = '30px';
  loading = false;
  errorMessage = '';
  filterSidebarOpen = false;
  currentFilters: MedicineFilterState;

  constructor(
    private dataService: MyupcharService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title,
    private actroute: ActivatedRoute,
    private SeoService: SeoService,
    private myUpchar: MyupcharService,
    private medicineApiService: MedicineApiService,
    private medicineFilterService: MedicineFilterService,
    @Inject(DOCUMENT) public document: any) { }

  routeParams: { [key: string]: string } = {};
  id: any;

  ngOnInit(): void {
    // Subscribe to query params to apply filters from URL
    this.actroute.queryParams
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(queryParams => {
        this.currentFilters = this.medicineFilterService.parseFiltersFromUrl(queryParams);
        this.applyFiltersToData();
      });

    this.actroute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: ParamMap) => {
        params.keys.forEach(key => {
          this.routeParams[key] = params.get(key) ?? '';
        });

        this.id = this.routeParams['id'];
        const categoryName = this.routeParams['categoryName'];

        if (this.id) {
          this.loadCategoryProducts(this.id);
        }
      });

    this.myUpchar.medicinedata$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.productData = data;
        if (this.productData) {
          this.newArr = [...this.productData];
        }
      });

    this.settingTagsAndTitles();
    this.loadMoreMedicines();
    this.loadCategories();
    this.currentUrl = this.router.url;
  }

  loadCategories(): void {
    this.medicineApiService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load categories.';
          this.cdr.detectChanges();
        }
      });
  }

  loadCategoryProducts(categoryId: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.medicineApiService.searchMedicines({ categoryId })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.productData = response.medicines;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load medicines.';
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

formatProductName(name: string): string {
  return name
    .toString()
    .toLowerCase()
    .replace(/\([^\)]*\)/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

  viewProduct(productId: number, name: string): void {
    const encodedName = this.formatProductName(name);
    this.router.navigate(['medicines/details', productId, encodedName]);
  }

  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex;
  }

  toggleChildrenVisibility(categoryId: number, type: 'desktop' | 'mobile'): void {

    const categoryElement = document.getElementById(`${type}-category-${categoryId}`);
    if (categoryElement) {
      if (categoryElement.classList.contains('hidden')) {
        categoryElement.classList.remove('hidden');
        this.expandedCategories.add(categoryId);
      } else {
        categoryElement.classList.add('hidden');
        this.expandedCategories.delete(categoryId);
      }
    }
  }
  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  selectCategory(categoryId: number, categoryName: string): void {
    this.productData = [];
    this.categoryNameurl = categoryName;

    if (this.selectedCategoryIds.includes(categoryId)) {
      this.selectedCategoryIds = [];
    } else {
      this.selectedCategoryIds = [categoryId];
      this.loadSelectedCategories();
    }
  }

  loadSelectedCategories(): void {
    if (this.selectedCategoryIds.length === 0) {
      this.data = [];
      this.filterData();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.data = [];

    this.medicineApiService.searchMedicines({
      categoryId: this.selectedCategoryIds[0].toString()
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.data = response.medicines;
          this.filterData();
          this.updateUrl();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load medicines. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

  fetchData(): void {
    // Apply filters method - called when user clicks "Apply Filter" button
    this.loadSelectedCategories();
  }

  filterData(): void {
    if (this.selectedFilter === 'All') {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(item => item.medicineType === this.selectedFilter);
    }
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterData();
  }

  viewMore(): void {
    this.pageNumber++;
    this.loadMoreMedicines();
  }

  loadMoreMedicines(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medicineApiService.searchMedicines({ page: this.pageNumber })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.data = [...this.data, ...response.medicines];
          this.filterData();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load more medicines. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

// Buy Online Sbl Solidago Virgaurea Mother Tincture Q | Nectarplus.Health

  settingTagsAndTitles() {
    this.title.setTitle(
      "Shop Medicines & Health Products Online | India's Reliable Medical Store | Nectarplus.health"
    );
    this.SeoService.updateTags([
      {
        name: "description",
        content: "Shop for medicines and health essentials online with confidence at Nectar Health, India's reliable medical store. Enjoy fast delivery, premium-quality products, and expert advice to address all your health and wellness needs. With Nectar Health, you can trust exceptional service and care for your well-being."
      },
      {
        name: "og:title",
        content:
          "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: true ? this.document.location.href : '',
      },
      {
        property: "og:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png",
      },
      {
        name: "twitter:card",
        property: "summary_large_image",
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png",
      },
    ]);
  }

  updateUrl(): void {
    const buildCategoryPath = (categories: any[], selectedId: number, path: string[] = []): string[] => {
      for (const category of categories) {
        if (category.category_id === selectedId) {
          path.push(category.name_en);
          return path;
        }
        if (category.children && category.children.length > 0) {
          const childPath = buildCategoryPath(category.children, selectedId, [...path, category.name_en]);
          if (childPath.length) {
            return childPath;
          }
        }
      }
      return [];
    };

    const selectedCategoryId = this.selectedCategoryIds[0];
    if (selectedCategoryId) {
      const categoryPath = buildCategoryPath(this.categories, selectedCategoryId).join('/');
      this.router.navigate(
        ['/medicines/all-medicines', categoryPath.replace(/\s+/g, '-').toLowerCase()],
        { relativeTo: this.actroute }
      );
    }
  }

  // New filter methods
  applyFiltersToData(): void {
    if (!this.currentFilters) return;

    // Apply filters to the data
    const allMedicines = this.data.length > 0 ? this.data : this.productData;
    this.filteredData = this.medicineFilterService.applyFilters(allMedicines, this.currentFilters);
    this.cdr.detectChanges();
  }

  onFiltersChanged(filters: MedicineFilterState): void {
    this.currentFilters = filters;
    this.medicineFilterService.updateUrlParams(filters);
    this.applyFiltersToData();
    this.filterSidebarOpen = false; // Close sidebar on mobile after applying filters
  }

  onFilterRemoved(chip: any): void {
    // The filter chip component will update the service, which will trigger queryParams change
    this.applyFiltersToData();
  }

  onClearAllFilters(): void {
    this.medicineFilterService.updateUrlParams({
      medicineTypes: [],
      priceRange: { min: 0, max: 10000 },
      brands: [],
      inStock: null,
      sortBy: 'popular'
    });
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
  }

  getAvailableBrands(): string[] {
    return this.medicineFilterService.getAvailableBrands(
      this.data.length > 0 ? this.data : this.productData
    );
  }

  getActiveFilterCount(): number {
    return this.medicineFilterService.getActiveFilterCount(this.currentFilters);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/medicine-placeholder.png';
  }

}