import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Medicine, MedicineType } from '../../../../../models/medicine.model';
import { MedicineFilterService, MedicineFilterState } from '../../../../../services/medicine-filter.service';

@Component({
  standalone: false,
  selector: 'nectar-medicine-filter-sidebar',
  templateUrl: './medicine-filter-sidebar.component.html',
  styleUrls: ['./medicine-filter-sidebar.component.scss']
})
export class MedicineFilterSidebarComponent implements OnInit, OnDestroy {
  @Input() medicines: Medicine[] = [];
  @Output() filtersChanged = new EventEmitter<MedicineFilterState>();
  @Output() closeFilter = new EventEmitter<void>();

  // Filter state
  selectedTypes: MedicineType[] = [];
  selectedBrands: string[] = [];
  priceMin = 0;
  priceMax = 10000;
  inStockOnly: boolean | null = null;
  selectedSort = 'popular';

  // Available options
  availableBrands: string[] = [];
  medicineTypeCounts = new Map<MedicineType, number>();

  // Form controls
  searchBrandControl = new FormControl('');
  filteredBrands: string[] = [];

  // Medicine types with labels
  medicineTypes: Array<{value: MedicineType, label: string, icon?: string}> = [
    { value: 'Allopathy', label: 'Allopathic', icon: 'local_pharmacy' },
    { value: 'Ayurveda', label: 'Ayurvedic', icon: 'spa' },
    { value: 'Homeopathy', label: 'Homeopathic', icon: 'healing' }
  ];

  // Sort options
  sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name (A-Z)' }
  ];

  private destroy$ = new Subject<void>();

  constructor(public filterService: MedicineFilterService) {}

  ngOnInit(): void {
    // Load available brands
    this.loadAvailableBrands();

    // Load medicine type counts
    this.medicineTypeCounts = this.filterService.getMedicineTypeCounts(this.medicines);

    // Setup brand search
    this.searchBrandControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterBrands(searchTerm || '');
    });

    // Initialize from service state
    const currentFilters = this.filterService.getCurrentFilters();
    this.applyCurrentFilters(currentFilters);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load available brands from medicines
   */
  private loadAvailableBrands(): void {
    this.availableBrands = this.filterService.getAvailableBrands(this.medicines);
    this.filteredBrands = [...this.availableBrands];
  }

  /**
   * Apply current filter state to UI
   */
  private applyCurrentFilters(filters: MedicineFilterState): void {
    this.selectedTypes = [...filters.medicineTypes];
    this.selectedBrands = [...filters.brands];
    this.priceMin = filters.priceRange.min;
    this.priceMax = filters.priceRange.max;
    this.inStockOnly = filters.inStock;
    this.selectedSort = filters.sortBy;
  }

  /**
   * Filter brands based on search term
   */
  private filterBrands(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredBrands = [...this.availableBrands];
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    this.filteredBrands = this.availableBrands.filter(brand =>
      brand.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Toggle medicine type selection
   */
  toggleMedicineType(type: MedicineType): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.emitFilterChange();
  }

  /**
   * Toggle brand selection
   */
  toggleBrand(brand: string): void {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.emitFilterChange();
  }

  /**
   * Update price range
   */
  onPriceRangeChange(): void {
    // Ensure min <= max
    if (this.priceMin > this.priceMax) {
      this.priceMin = this.priceMax;
    }
    this.emitFilterChange();
  }

  /**
   * Set stock filter
   */
  setStockFilter(value: boolean | null): void {
    this.inStockOnly = value;
    this.emitFilterChange();
  }

  /**
   * Change sort order
   */
  changeSortOrder(sortBy: string): void {
    this.selectedSort = sortBy;
    this.emitFilterChange();
  }

  /**
   * Emit filter change event
   */
  private emitFilterChange(): void {
    const filters: MedicineFilterState = {
      medicineTypes: this.selectedTypes,
      brands: this.selectedBrands,
      priceRange: {
        min: this.priceMin,
        max: this.priceMax
      },
      inStock: this.inStockOnly,
      sortBy: this.selectedSort as any
    };

    this.filterService.updateFilters(filters);
    this.filtersChanged.emit(filters);
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.selectedTypes = [];
    this.selectedBrands = [];
    this.priceMin = 0;
    this.priceMax = 10000;
    this.inStockOnly = null;
    this.selectedSort = 'popular';
    this.searchBrandControl.setValue('');
    
    this.filterService.resetFilters();
    this.emitFilterChange();
  }

  /**
   * Check if medicine type is selected
   */
  isTypeSelected(type: MedicineType): boolean {
    return this.selectedTypes.includes(type);
  }

  /**
   * Check if brand is selected
   */
  isBrandSelected(brand: string): boolean {
    return this.selectedBrands.includes(brand);
  }

  /**
   * Get active filter count
   */
  getActiveFilterCount(): number {
    return this.filterService.getActiveFilterCount();
  }

  /**
   * Close filter sidebar (mobile)
   */
  close(): void {
    this.closeFilter.emit();
  }
}
