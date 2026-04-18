import { ChangeDetectionStrategy, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MedicineFilterService, MedicineFilterState } from '../../../../../services/medicine-filter.service';
import { MedicineType } from '../../../../../models/medicine.model';

export interface FilterChip {
  type: 'medicineType' | 'brand' | 'priceRange' | 'stock' | 'sort';
  label: string;
  value: any;
}

@Component({
  standalone: false,
  selector: 'nectar-medicine-filter-chips',
  templateUrl: './medicine-filter-chips.component.html',
  styleUrls: ['./medicine-filter-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineFilterChipsComponent implements OnInit {
  @Input() filters!: MedicineFilterState;
  @Output() filterRemoved = new EventEmitter<FilterChip>();
  @Output() clearAll = new EventEmitter<void>();

  activeChips: FilterChip[] = [];

  constructor(private filterService: MedicineFilterService) {}

  ngOnInit(): void {
    this.updateChips();
  }

  ngOnChanges(): void {
    this.updateChips();
  }

  /**
   * Update chips based on current filters
   */
  private updateChips(): void {
    if (!this.filters) {
      this.activeChips = [];
      return;
    }

    const chips: FilterChip[] = [];

    // Medicine Type chips
    if (this.filters.medicineTypes && this.filters.medicineTypes.length > 0) {
      this.filters.medicineTypes.forEach(type => {
        chips.push({
          type: 'medicineType',
          label: this.getMedicineTypeLabel(type),
          value: type
        });
      });
    }

    // Brand chips
    if (this.filters.brands && this.filters.brands.length > 0) {
      this.filters.brands.forEach(brand => {
        chips.push({
          type: 'brand',
          label: brand,
          value: brand
        });
      });
    }

    // Price Range chip
    if (this.filters.priceRange) {
      if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 10000) {
        chips.push({
          type: 'priceRange',
          label: `₹${this.filters.priceRange.min} - ₹${this.filters.priceRange.max}`,
          value: this.filters.priceRange
        });
      }
    }

    // Stock chip
    if (this.filters.inStock !== null && this.filters.inStock !== undefined) {
      chips.push({
        type: 'stock',
        label: this.filters.inStock ? 'In Stock Only' : 'Out of Stock',
        value: this.filters.inStock
      });
    }

    // Sort chip (only if not default)
    if (this.filters.sortBy && this.filters.sortBy !== 'popular') {
      chips.push({
        type: 'sort',
        label: `Sort: ${this.getSortLabel(this.filters.sortBy)}`,
        value: this.filters.sortBy
      });
    }

    this.activeChips = chips;
  }

  /**
   * Get medicine type label
   */
  private getMedicineTypeLabel(type: MedicineType): string {
    const labels: Record<MedicineType, string> = {
      'Allopathy': 'Allopathic',
      'Ayurveda': 'Ayurvedic',
      'Homeopathy': 'Homeopathic',
      'General': 'General',
      'OTC': 'OTC'
    };
    return labels[type] || type;
  }

  /**
   * Get sort label
   */
  private getSortLabel(sortBy: string): string {
    const labels: Record<string, string> = {
      'popular': 'Most Popular',
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low',
      'rating': 'Highest Rated',
      'name': 'Name (A-Z)'
    };
    return labels[sortBy] || sortBy;
  }

  /**
   * Remove specific filter chip
   */
  removeChip(chip: FilterChip): void {
    const currentFilters = { ...this.filters };

    switch (chip.type) {
      case 'medicineType':
        currentFilters.medicineTypes = currentFilters.medicineTypes.filter(t => t !== chip.value);
        break;
      
      case 'brand':
        currentFilters.brands = currentFilters.brands.filter(b => b !== chip.value);
        break;
      
      case 'priceRange':
        currentFilters.priceRange = { min: 0, max: 10000 };
        break;
      
      case 'stock':
        currentFilters.inStock = null;
        break;
      
      case 'sort':
        currentFilters.sortBy = 'popular';
        break;
    }

    this.filterService.updateFilters(currentFilters);
    this.filterRemoved.emit(chip);
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.filterService.resetFilters();
    this.clearAll.emit();
  }

  /**
   * Get chip icon based on type
   */
  getChipIcon(chip: FilterChip): string {
    const icons: Record<FilterChip['type'], string> = {
      'medicineType': 'category',
      'brand': 'business',
      'priceRange': 'currency_rupee',
      'stock': 'inventory',
      'sort': 'sort'
    };
    return icons[chip.type];
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return this.activeChips.length > 0;
  }
}
