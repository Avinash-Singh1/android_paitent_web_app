import { Inject, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Medicine, MedicineType } from '../models/medicine.model';
import { Router } from '@angular/router';

export interface MedicineFilterState {
  medicineTypes: MedicineType[];
  priceRange: {
    min: number;
    max: number;
  };
  brands: string[];
  inStock: boolean | null;
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'popular';
  searchTerm?: string;
}

export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineFilterService {
  private readonly STORAGE_KEY = 'nectar_medicine_filters';
  private readonly isBrowser: boolean;

  // Default filter state
  private readonly defaultFilters: MedicineFilterState = {
    medicineTypes: [],
    priceRange: { min: 0, max: 10000 },
    brands: [],
    inStock: null,
    sortBy: 'popular',
    searchTerm: ''
  };

  // Filter state subject
  private filterStateSubject: BehaviorSubject<MedicineFilterState>;
  public filterState$: Observable<MedicineFilterState>;

  // Price range presets
  public readonly priceRanges: PriceRange[] = [
    { min: 0, max: 100, label: 'Under ₹100' },
    { min: 100, max: 500, label: '₹100 - ₹500' },
    { min: 500, max: 1000, label: '₹500 - ₹1000' },
    { min: 1000, max: 5000, label: '₹1000 - ₹5000' },
    { min: 5000, max: 10000, label: 'Above ₹5000' }
  ];

  constructor(
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    // Initialize with stored filters or defaults
    const initialFilters = this.loadFiltersFromStorage();
    this.filterStateSubject = new BehaviorSubject<MedicineFilterState>(initialFilters);
    this.filterState$ = this.filterStateSubject.asObservable();
  }

  /**
   * Get current filter state
   */
  getCurrentFilters(): MedicineFilterState {
    return this.filterStateSubject.value;
  }

  /**
   * Update filter state
   */
  updateFilters(filters: Partial<MedicineFilterState>): void {
    const currentFilters = this.filterStateSubject.value;
    const newFilters = { ...currentFilters, ...filters };
    this.filterStateSubject.next(newFilters);
    this.saveFiltersToStorage(newFilters);
  }

  /**
   * Update search term
   */
  updateSearchTerm(searchTerm: string): void {
    this.updateFilters({ searchTerm });
  }

  /**
   * Reset all filters to default
   */
  resetFilters(): void {
    this.filterStateSubject.next(this.defaultFilters);
  }

  /**
   * Apply filters to medicines array (client-side)
   */
  applyFilters(medicines: Medicine[], filters?: MedicineFilterState): Medicine[] {
    const activeFilters = filters || this.getCurrentFilters();
    let filtered = [...medicines];

    // Filter by medicine type
    if (activeFilters.medicineTypes.length > 0) {
      filtered = filtered.filter(med =>
        activeFilters.medicineTypes.includes(med.medicineType)
      );
    }

    // Filter by price range
    if (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 10000) {
      filtered = filtered.filter(med => {
        const price = med.price?.sellingPrice || med.price?.final_price || 0;
        return price >= activeFilters.priceRange.min && price <= activeFilters.priceRange.max;
      });
    }

    // Filter by brands
    if (activeFilters.brands.length > 0) {
      filtered = filtered.filter(med =>
        activeFilters.brands.includes(med.manufacturer?.name || '')
      );
    }

    // Filter by stock availability
    if (activeFilters.inStock !== null) {
      filtered = filtered.filter(med =>
        activeFilters.inStock ? med.stock?.inStock : !med.stock?.inStock
      );
    }

    // Filter by search term
    if (activeFilters.searchTerm && activeFilters.searchTerm.trim()) {
      const searchLower = activeFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(searchLower) ||
        med.manufacturer?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered = this.sortMedicines(filtered, activeFilters.sortBy);

    return filtered;
  }

  /**
   * Sort medicines array
   */
  private sortMedicines(medicines: Medicine[], sortBy: string): Medicine[] {
    const sorted = [...medicines];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = a.price?.sellingPrice || a.price?.final_price || 0;
          const priceB = b.price?.sellingPrice || b.price?.final_price || 0;
          return priceA - priceB;
        });

      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = a.price?.sellingPrice || a.price?.final_price || 0;
          const priceB = b.price?.sellingPrice || b.price?.final_price || 0;
          return priceB - priceA;
        });

      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = a.rating?.average || 0;
          const ratingB = b.rating?.average || 0;
          return ratingB - ratingA;
        });

      case 'popular':
      default:
        return sorted.sort((a, b) => {
          const viewsA = a.viewCount || 0;
          const viewsB = b.viewCount || 0;
          return viewsB - viewsA;
        });
    }
  }

  /**
   * Extract unique brands from medicines
   */
  getAvailableBrands(medicines: Medicine[]): string[] {
    const brands = new Set<string>();
    medicines.forEach(med => {
      if (med.manufacturer?.name) {
        brands.add(med.manufacturer.name);
      }
    });
    return Array.from(brands).sort();
  }

  /**
   * Get medicine type counts
   */
  getMedicineTypeCounts(medicines: Medicine[]): Map<MedicineType, number> {
    const counts = new Map<MedicineType, number>();

    medicines.forEach(med => {
      const type = med.medicineType;
      counts.set(type, (counts.get(type) || 0) + 1);
    });

    return counts;
  }

  /**
   * Parse filters from URL query params
   */
  parseFiltersFromUrl(queryParams: any): MedicineFilterState {
    return {
      medicineTypes: queryParams['types'] ? queryParams['types'].split(',') : [],
      priceRange: {
        min: parseInt(queryParams['priceMin']) || 0,
        max: parseInt(queryParams['priceMax']) || 10000
      },
      brands: queryParams['brands'] ? queryParams['brands'].split(',') : [],
      inStock: queryParams['inStock'] === 'true' ? true : queryParams['inStock'] === 'false' ? false : null,
      sortBy: queryParams['sort'] || 'popular',
      searchTerm: queryParams['search'] || ''
    };
  }

  /**
   * Convert filters to URL query params
   */
  filtersToQueryParams(filters: MedicineFilterState): any {
    const params: any = {};

    if (filters.medicineTypes.length > 0) {
      params['types'] = filters.medicineTypes.join(',');
    }

    if (filters.priceRange.min > 0) {
      params['priceMin'] = filters.priceRange.min;
    }

    if (filters.priceRange.max < 10000) {
      params['priceMax'] = filters.priceRange.max;
    }

    if (filters.brands.length > 0) {
      params['brands'] = filters.brands.join(',');
    }

    if (filters.inStock !== null) {
      params['inStock'] = filters.inStock;
    }

    if (filters.sortBy !== 'popular') {
      params['sort'] = filters.sortBy;
    }

    if (filters.searchTerm) {
      params['search'] = filters.searchTerm;
    }

    return params;
  }

  /**
   * Update URL with current filters
   */
  updateUrlParams(filters: MedicineFilterState): void {
    const queryParams = this.filtersToQueryParams(filters);

    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * Count active filters
   */
  getActiveFilterCount(filters?: MedicineFilterState): number {
    const activeFilters = filters || this.getCurrentFilters();
    let count = 0;

    if (activeFilters.medicineTypes.length > 0) count++;
    if (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 10000) count++;
    if (activeFilters.brands.length > 0) count++;
    if (activeFilters.inStock !== null) count++;
    if (activeFilters.searchTerm && activeFilters.searchTerm.trim()) count++;

    return count;
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(filters?: MedicineFilterState): boolean {
    return this.getActiveFilterCount(filters) > 0;
  }

  /**
   * Save filters to localStorage
   */
  private saveFiltersToStorage(filters: MedicineFilterState): void {
    if (!this.isBrowser) return;
    try {
      const filtersToSave = {
        medicineTypes: filters.medicineTypes,
        brands: filters.brands,
        sortBy: filters.sortBy
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtersToSave));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }

  /**
   * Load filters from localStorage
   */
  private loadFiltersFromStorage(): MedicineFilterState {
    if (!this.isBrowser) return this.defaultFilters;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaultFilters, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
    }
    return this.defaultFilters;
  }

  /**
   * Clear saved filters from localStorage
   */
  clearStoredFilters(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear filters from localStorage:', error);
    }
  }
}
