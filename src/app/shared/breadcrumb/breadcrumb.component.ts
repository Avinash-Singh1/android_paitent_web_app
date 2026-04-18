import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { filter, map, distinctUntilChanged, takeUntil, switchMap, catchError, tap } from 'rxjs/operators';
import { Subject, Observable, of, forkJoin, merge } from 'rxjs';
import { Breadcrumb, BreadcrumbConfig } from './breadcrumb.model';
import { MedicineApiService } from '../../services/medicine-api.service';

interface BreadcrumbCacheEntry {
  label: string;
  categoryLabel?: string;
  categorySlug?: string;
}

@Component({
  standalone: false,
  selector: 'nectar-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input() config: BreadcrumbConfig = {
    showHome: true,
    homeLabel: 'Home',
    homeIcon: 'home',
    separator: 'chevron_right',
    maxItems: 3  // Show last 3 items on mobile
  };

  breadcrumbs$: Observable<Breadcrumb[]>;
  private destroy$ = new Subject<void>();
  private labelCache = new Map<string, BreadcrumbCacheEntry>();  // Cache for API-fetched labels

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private medicineApiService: MedicineApiService
  ) {
    // Build breadcrumbs on initial load and on each NavigationEnd.
    this.breadcrumbs$ = merge(
      of(null),
      this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    ).pipe(
      tap(event => {
        if (event instanceof NavigationEnd) {
          this.labelCache.clear();
        }
      }),
      switchMap(() => this.buildBreadcrumbs(this.activatedRoute.root)),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    // No longer need to clear cache here since it's done in the constructor
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.labelCache.clear();
  }

  /**
   * Build breadcrumb trail from route tree
   */
  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Observable<Breadcrumb[]> {
    return new Observable(observer => {
      // Add home breadcrumb
      if (this.config.showHome && breadcrumbs.length === 0) {
        breadcrumbs.push({
          label: this.config.homeLabel,
          url: '/',
          isActive: false,
          icon: this.config.homeIcon
        });
      }

      // Get route snapshot
      const children: ActivatedRoute[] = route.children;

      if (children.length === 0) {
        observer.next(breadcrumbs);
        observer.complete();
        return;
      }

      // Process each child route
      for (const child of children) {
        this.processBreadcrumb(child, url, breadcrumbs, observer);
      }
    });
  }

  /**
   * Process individual route to extract breadcrumb info
   */
  private processBreadcrumb(
    route: ActivatedRoute,
    url: string,
    breadcrumbs: Breadcrumb[],
    observer: any
  ): void {
    const routeSnapshot = route.snapshot;
    const routeURL = routeSnapshot.url.map(segment => segment.path).join('/');
    
    if (routeURL !== '') {
      url += `/${routeURL}`;
    }

    // Check if route has breadcrumb data
    const hasBreadcrumbData = Object.prototype.hasOwnProperty.call(routeSnapshot.data, 'breadcrumb');
    const breadcrumbLabel = routeSnapshot.data['breadcrumb'];
    
    if (hasBreadcrumbData) {
      if (breadcrumbLabel === 'dynamic') {
        // Fetch label dynamically (for medicine details, categories)
        this.fetchDynamicLabel(routeSnapshot, url, breadcrumbs, observer);
      } else if (breadcrumbLabel) {
        // Static label
        breadcrumbs.push({
          label: breadcrumbLabel,
          url: url,
          isActive: false
        });
      }
    } else {
      // Auto-generate label from URL segment
      if (routeURL) {
        const label = this.formatLabel(routeURL);
        if (label && !this.isNumeric(label)) {  // Skip numeric IDs
          breadcrumbs.push({
            label: label,
            url: url,
            isActive: false
          });
        }
      }
    }

    // Recursively process child routes
    if (route.children.length > 0) {
      for (const child of route.children) {
        this.processBreadcrumb(child, url, breadcrumbs, observer);
      }
    } else {
      // Mark last breadcrumb as active
      if (breadcrumbs.length > 0) {
        breadcrumbs[breadcrumbs.length - 1].isActive = true;
      }
      observer.next(breadcrumbs);
      observer.complete();
    }
  }

  /**
   * Fetch dynamic label from API (medicine name, category name)
   */
  private fetchDynamicLabel(
    route: ActivatedRouteSnapshot,
    url: string,
    breadcrumbs: Breadcrumb[],
    observer: any
  ): void {
    const params = route.params;
    const cacheKey = url;

    // Check cache first
    if (this.labelCache.has(cacheKey)) {
      const cached = this.labelCache.get(cacheKey)!;
      if (params['id'] && params['name']) {
        this.appendMedicineHierarchy(breadcrumbs, cached, url);
      } else {
        breadcrumbs.push({
          label: cached.label,
          url: url,
          isActive: false
        });
      }
      observer.next(breadcrumbs);
      observer.complete();
      return;
    }

    // Determine what to fetch based on route params
    if (params['id'] && params['name']) {
      // Medicine details page - fetch medicine and category details
      const label = this.formatLabel(params['name']);
      
      this.medicineApiService.getMedicineBySlugOrId(params['id'].toString())
        .pipe(
          takeUntil(this.destroy$),
          switchMap((medicine) => {
            // Check if medicine has categoryId
            const categoryId = typeof medicine.categoryId === 'string' ? medicine.categoryId : (medicine.categoryId?._id || null);
            
            if (categoryId) {
              // Fetch category details
              return this.medicineApiService.getCategoryBySlugOrId(categoryId).pipe(
                map(category => {
                  return { medicine, category };
                }),
                catchError((err) => {
                  console.error('BREADCRUMB: Category fetch error', err);
                  return of({ medicine, category: null });
                })
              );
            }
            
            return of({ medicine, category: null });
          }),
          catchError((err) => {
            console.error('BREADCRUMB: Medicine fetch error', err);
            return of({ medicine: null, category: null });
          })
        )
        .subscribe({
          next: ({ medicine, category }) => {
            const entry: BreadcrumbCacheEntry = {
              label,
              categoryLabel: category?.name,
              categorySlug: category?.slug
            };
            this.labelCache.set(cacheKey, entry);
            this.appendMedicineHierarchy(breadcrumbs, entry, url);
            observer.next(breadcrumbs);
            observer.complete();
          },
          error: (err) => {
            console.error('BREADCRUMB: Subscription error', err);
            const entry: BreadcrumbCacheEntry = { label };
            this.labelCache.set(cacheKey, entry);
            this.appendMedicineHierarchy(breadcrumbs, entry, url);
            observer.next(breadcrumbs);
            observer.complete();
          }
        });
    } else if (params['categoryName']) {
      // Category page
      const label = this.formatLabel(params['categoryName']);
      const entry: BreadcrumbCacheEntry = { label };
      this.labelCache.set(cacheKey, entry);
      breadcrumbs.push({
        label: label,
        url: url,
        isActive: false
      });
      observer.next(breadcrumbs);
      observer.complete();
    } else {
      observer.next(breadcrumbs);
      observer.complete();
    }
  }

  private appendMedicineHierarchy(
    breadcrumbs: Breadcrumb[],
    entry: BreadcrumbCacheEntry,
    url: string
  ): void {
    const allMedicinesUrl = '/medicines/all-medicines';

    // Add "All Medicines" link
    breadcrumbs.push({
      label: 'All Medicines',
      url: allMedicinesUrl,
      isActive: false
    });

    // Add category if available (currently not populated by API)
    if (entry.categoryLabel) {
      const categorySlug = entry.categorySlug || this.toSlug(entry.categoryLabel);
      breadcrumbs.push({
        label: entry.categoryLabel,
        url: `${allMedicinesUrl}/${categorySlug}`,
        isActive: false
      });
    }

    // Add product name as final active breadcrumb
    breadcrumbs.push({
      label: entry.label,
      url: url,
      isActive: true
    });
  }

  private getCategoryLabel(category: any): string | undefined {
    if (!category) {
      return undefined;
    }
    if (typeof category === 'object') {
      return category.name || category.name_en || category.slug;
    }
    return undefined;
  }

  private getCategorySlug(category: any, fallbackLabel?: string): string | undefined {
    if (!category) {
      return fallbackLabel ? this.toSlug(fallbackLabel) : undefined;
    }
    if (typeof category === 'object') {
      return category.slug || (category.name ? this.toSlug(category.name) : undefined);
    }
    return fallbackLabel ? this.toSlug(fallbackLabel) : undefined;
  }

  private toSlug(value: string): string {
    return value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[/&]+/g, '-')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Format URL segment into readable label
   */
  private formatLabel(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\+/g, ' ');
  }

  /**
   * Check if string is numeric
   */
  private isNumeric(str: string): boolean {
    return !isNaN(Number(str));
  }

  /**
   * Navigate to breadcrumb URL
   */
  navigateTo(breadcrumb: Breadcrumb): void {
    if (!breadcrumb.isActive) {
      this.router.navigate([breadcrumb.url]);
    }
  }

  /**
   * Get visible breadcrumbs (limit for mobile)
   */
  getVisibleBreadcrumbs(breadcrumbs: Breadcrumb[]): Breadcrumb[] {
    if (!this.config.maxItems || breadcrumbs.length <= this.config.maxItems) {
      return breadcrumbs;
    }

    // On mobile, show: Home + ... + last 2 items
    const home = breadcrumbs[0];
    const lastItems = breadcrumbs.slice(-2);
    
    return [
      home,
      { label: '...', url: '', isActive: false },
      ...lastItems
    ];
  }
}
