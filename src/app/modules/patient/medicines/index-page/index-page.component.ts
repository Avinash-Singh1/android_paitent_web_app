import { ChangeDetectorRef, Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from "@angular/common";
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SeoService } from 'src/app/services/seo.service';
import { MedicineApiService } from 'src/app/services/medicine-api.service';
import { MedicineStateService } from 'src/app/services/medicine-state.service';
import { MedicineCategory, Medicine } from 'src/app/models/medicine.model';

@Component({
  standalone: false,
  selector: 'nectar-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss']
})
export class IndexPageComponent implements OnInit, OnDestroy {
  categories: MedicineCategory[] = [];
  medicinedata: Medicine[] = [];
  loading = false;
  errorMessage: string | null = null;
  selectedCategoryIds: string[] = [];
  selectedCategory: MedicineCategory | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private SeoService: SeoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
   * Get image for category (fallback to containerClass-based image)
   */
  getCategoryImage(category: MedicineCategory): string {
    if (category.image?.url) {
      return category.image.url;
    }
    // Fallback to default images based on containerClass
    const classToImage: { [key: string]: string } = {
      'con-1': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Sexual-Health-Image.png',
      'con-2': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Women-Care-Image.png',
      'con-3': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Heart-Care-Image.png',
      'con-4': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Oral-and-Dental-Care-Image.png',
      'con-5': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Heart-Care-Image.png',
      'con-6': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Mental-Healt-Image.png',
      'con-7': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/Baby-Care-Image.png',
      'con-8': '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/First-Aid-Image.png'
    };
    return classToImage[category.containerClass || ''] || '../../../../../assets/images/my-upchar-image/Featured-Categories/Images/default.png';
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
