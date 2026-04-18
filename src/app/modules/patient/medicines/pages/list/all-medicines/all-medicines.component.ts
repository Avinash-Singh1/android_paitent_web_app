import { ChangeDetectorRef, Component, Inject, OnInit, OnDestroy, DOCUMENT } from '@angular/core';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SeoService } from 'src/app/services/seo.service';
import { MedicineApiService } from 'src/app/services/medicine-api.service';
import { MedicineStateService } from 'src/app/services/medicine-state.service';
import { MedicineCategory, Medicine } from 'src/app/models/medicine.model';

@Component({
  standalone: false,
  selector: 'nectar-all-medicines',
  templateUrl: './all-medicines.component.html',
  styleUrls: ['./all-medicines.component.scss']
})
export class AllMedicinesComponent implements OnInit, OnDestroy {
  categories: MedicineCategory[] = [];
  medicinedata: Medicine[] = [];
  loading = false;
  errorMessage: string | null = null;
  selectedCategoryIds: string[] = [];
  selectedCategory: MedicineCategory | null = null;

  private destroy$ = new Subject<void>();

  /** Icon SVG map keyed by slug */
  private iconMap: { [slug: string]: { svg: string; bg: string; accent: string } } = {
    'ayurveda': {
      bg: '#e8f5e9', accent: '#2e7d32',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M24 6c-3 4-12 14-12 22a12 12 0 0 0 24 0c0-8-9-18-12-22Z" fill="#66bb6a" opacity=".18"/><path d="M24 6c-3 4-12 14-12 22a12 12 0 0 0 24 0c0-8-9-18-12-22Z" stroke="#2e7d32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M24 20v16M20 28h8" stroke="#2e7d32" stroke-width="2" stroke-linecap="round"/></svg>`
    },
    'allopathy': {
      bg: '#e3f2fd', accent: '#1565c0',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><rect x="14" y="6" width="20" height="36" rx="10" fill="#42a5f5" opacity=".15"/><rect x="14" y="6" width="20" height="36" rx="10" stroke="#1565c0" stroke-width="2.2" fill="none"/><line x1="14" y1="24" x2="34" y2="24" stroke="#1565c0" stroke-width="2" stroke-dasharray="3 2"/><circle cx="24" cy="15" r="3" fill="#1565c0" opacity=".3"/><circle cx="24" cy="33" r="3" fill="#1565c0" opacity=".5"/></svg>`
    },
    'homeopathy': {
      bg: '#f3e5f5', accent: '#7b1fa2',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M20 8h8v10l6 18H14l6-18V8Z" fill="#ce93d8" opacity=".18"/><path d="M20 8h8v10l6 18H14l6-18V8Z" stroke="#7b1fa2" stroke-width="2.2" stroke-linejoin="round" fill="none"/><line x1="18" y1="8" x2="30" y2="8" stroke="#7b1fa2" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="30" r="2.5" fill="#7b1fa2" opacity=".4"/><circle cx="20" cy="26" r="1.5" fill="#7b1fa2" opacity=".3"/><circle cx="28" cy="27" r="1.8" fill="#7b1fa2" opacity=".35"/></svg>`
    },
    'unani': {
      bg: '#fff3e0', accent: '#e65100',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="32" rx="12" ry="8" fill="#ffb74d" opacity=".18"/><ellipse cx="24" cy="32" rx="12" ry="8" stroke="#e65100" stroke-width="2.2" fill="none"/><path d="M18 18c0-3.3 2.7-6 6-6s6 2.7 6 6c0 5-3 8-6 14-3-6-6-9-6-14Z" fill="#ffb74d" opacity=".15"/><path d="M18 18c0-3.3 2.7-6 6-6s6 2.7 6 6c0 5-3 8-6 14-3-6-6-9-6-14Z" stroke="#e65100" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
    },
    'health-supplements': {
      bg: '#e0f2f1', accent: '#00695c',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M14 14h20v24a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V14Z" fill="#4db6ac" opacity=".15"/><path d="M14 14h20v24a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V14Z" stroke="#00695c" stroke-width="2.2" fill="none"/><path d="M18 6h12a2 2 0 0 1 2 2v6H16V8a2 2 0 0 1 2-2Z" stroke="#00695c" stroke-width="2.2" fill="none"/><path d="M24 20v10M19 25h10" stroke="#00695c" stroke-width="2.2" stroke-linecap="round"/></svg>`
    },
    'personal-care': {
      bg: '#fce4ec', accent: '#c62828',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M24 42s-14-8.4-14-19.2C10 16.1 14.5 12 20 12c2.8 0 4.2 1.6 4 1.6S22.2 12 28 12c5.5 0 10 4.1 10 10.8C38 33.6 24 42 24 42Z" fill="#ef9a9a" opacity=".2"/><path d="M24 42s-14-8.4-14-19.2C10 16.1 14.5 12 20 12c2.8 0 4.2 1.6 4 1.6S22.2 12 28 12c5.5 0 10 4.1 10 10.8C38 33.6 24 42 24 42Z" stroke="#c62828" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
    }
  };

  /** Cached safe-HTML icons */
  private iconCache = new Map<string, SafeHtml>();

  constructor(
    private route: ActivatedRoute,
    private SeoService: SeoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private medicineApiService: MedicineApiService,
    private medicineStateService: MedicineStateService,
    private title: Title,
    @Inject(DOCUMENT) public document: any) { }

  ngOnInit(): void {
    this.settingTagsAndTitles();
    this.loadCategories();
    this.loadPopularMedicines();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load medicine categories from API
   */
  loadCategories(): void {
    this.loading = true;
    this.medicineApiService.getAllCategories()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load categories. Please try again later.';
        }
      });
  }

  /**
   * Load popular medicines for homepage
   */
  loadPopularMedicines(): void {
    this.medicineApiService.getPopularMedicines(20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (medicines) => {
          this.medicinedata = medicines;
          this.cdr.detectChanges();
        },
        error: (error) => {
          // Error loading popular medicines
        }
      });
  }

  /**
   * Navigate to category page when user clicks on a category
   */
  navigateToCategory(category: MedicineCategory): void {
    this.router.navigate(['/medicines/all-medicines', category._id, category.slug]);
  }

  /**
   * Get SVG icon HTML for a category (cached & sanitized)
   */
  getCategoryIcon(category: MedicineCategory): SafeHtml {
    const slug = category.slug || '';
    if (this.iconCache.has(slug)) return this.iconCache.get(slug)!;
    const entry = this.iconMap[slug];
    const svg = entry ? entry.svg : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><rect x="12" y="6" width="24" height="36" rx="4" fill="#9575cd" opacity=".15"/><rect x="12" y="6" width="24" height="36" rx="4" stroke="#45197c" stroke-width="2.2" fill="none"/><path d="M24 16v16M18 24h12" stroke="#45197c" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    const safe = this.sanitizer.bypassSecurityTrustHtml(svg);
    this.iconCache.set(slug, safe);
    return safe;
  }

  /**
   * Get background color for a category card
   */
  getCategoryBg(category: MedicineCategory): string {
    return this.iconMap[category.slug || '']?.bg || '#f3e8ff';
  }

  /**
   * Get accent color for a category card
   */
  getCategoryAccent(category: MedicineCategory): string {
    return this.iconMap[category.slug || '']?.accent || '#45197c';
  }

  settingTagsAndTitles() {
    this.title.setTitle(
      "Shop Medicines & Health Products Online | India's Reliable Medical Store | Nectarplus.health"
    );
    this.SeoService.updateTags([
      {
        name: "description",
        content: "Shop for medicines and health essentials online with confidence at Nectar Health, India's reliable medical store. Enjoy fast delivery, premium-quality products, and expert advice to address all your health and wellness needs. With Nectar Health, you can trust exceptional service and care for your well-being."
      },
      { name: "og:title", content: "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: true ? this.document.location.href : '' },
      { property: "og:image", content: "https://nectarplus.health/assets/images/svg/nectarLogo.png" },
      { name: "twitter:card", property: "summary_large_image" },
      { name: "twitter:image", content: "https://nectarplus.health/assets/images/svg/nectarLogo.png" }
    ]);
  }
}
