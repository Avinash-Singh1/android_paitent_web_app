import { Component, Inject, OnInit, OnDestroy, Renderer2, DOCUMENT } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MyupcharService } from 'src/app/services/myupchar.service';
import { AdressedService } from 'src/app/services/adressed.service';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from 'src/app/services/seo.service';

import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MedicineApiService } from '../../../../../services/medicine-api.service';
import { MedicineStateService } from '../../../../../services/medicine-state.service';
import { Medicine } from '../../../../../models/medicine.model';

@Component({
  standalone: false,
  selector: 'nectar-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  id: number;
  titlemeta: any;
  productDetails: Medicine = {} as Medicine;
  selectedImageUrl: string | null = null;
  discountPercentage: string;
  relateddata: Medicine[] = [];
  breadcrumb: any = [];
  name: string;
  showAllUses = false;
  UrlName: any;
  breadcrumbText: any;
  discrptiondata: any;
  mrp: any;
  loading = false;
  errorMessage = '';
  constructor(
    private dataService: MyupcharService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private adressservies: AdressedService,
    private meta: Meta,
    private title: Title,
    private renderer: Renderer2,
    private SeoService: SeoService,
    private medicineApiService: MedicineApiService,
    private medicineStateService: MedicineStateService,
    @Inject(DOCUMENT) public document: any) {}

  ngOnInit() {
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          setTimeout(() => this.scrollToTop(), 0);
        }
      });

    this.actRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.id = +params['id'];
        this.name = params['name'].replace(/\s+/g, '-').replace(/-/g, ' ').toLowerCase();
        this.fetchProductDetails(this.id, this.name);
        this.loadRelatedProducts();

        this.scrollToTop();
      });

    this.meta.addTag({ name: 'keywords', content: `${this.name} | Nectarplus.health` });
    this.meta.addTag({ name: 'breadcrumb', content: this.breadcrumb });
    this.settingTagsAndTitles();
    this.addJsonLdScript();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRelatedProducts(): void {
    this.medicineApiService.getPopularMedicines(12)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (medicines) => {
          this.relateddata = medicines;
        },
        error: () => {
          this.relateddata = [];
        }
      });
  }

  getUsesList(): string[] {
    const uses = this.productDetails?.uses;
    const mainUses = uses?.main || [];
    const otherUses = uses?.others || [];
    return [...mainUses, ...otherUses].filter(Boolean);
  }

  getVisibleUses(): string[] {
    return this.showAllUses ? this.getUsesList() : this.getUsesList().slice(0, 3);
  }

  getUsesOverflowCount(): number {
    const total = this.getUsesList().length;
    return total > 3 ? total - 3 : 0;
  }

  toggleUses(): void {
    this.showAllUses = !this.showAllUses;
  }

  viewProduct(productId: string | number, name: string): void {
    const encodedName = this.formatProductName(name);

    this.scrollToTop();

    this.router.navigate(['medicines/details', productId, encodedName]);
  }

  fetchProductDetails(id: number, name: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.medicineApiService.getMedicineBySlugOrId(id.toString())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (medicine) => {
          this.productDetails = medicine;
          this.selectedImageUrl =
            medicine.images_hsh?.array?.[0] || medicine.image || null;

          if (medicine.price.mrp && medicine.price.sellingPrice) {
            const discountPercentage = ((medicine.price.mrp - medicine.price.sellingPrice) / medicine.price.mrp) * 100;
            this.discountPercentage = discountPercentage.toFixed(0);
            this.mrp = medicine.price.mrp;
          }

          this.addJsonLdScript();
        },
        error: () => {
          this.errorMessage = 'Failed to load product details.';
        }
      });
  }

  private scrollToTop(): void {

    const scrollElement = this.document?.scrollingElement || this.document?.documentElement;

    if (scrollElement) {
      scrollElement.scrollTop = 0;
    }

    if (this.document?.body) {
      this.document.body.scrollTop = 0;
    }

    const mainContent = this.document?.querySelector('.main-content') as HTMLElement | null;
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }

  //===================================
  //seo content work here
  settingTagsAndTitles() {
    this.discrptiondata = `Shop for ${this.name}  medicines and health essentials online with confidence at Nectar Health, India's reliable medical store. Enjoy fast delivery, premium-quality products,and expert advice to address all your health and wellness needs.With Nectar Health, .`
    this.title.setTitle(
      "Buy Online "+this.name
        .split(' ') // Split the string into an array of words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
        .join(' ')+" | Nectarplus.health"
    );

    // this.meta.addTags();
    this.SeoService.updateTags([
      {
        name: "description",
        content: `${this.discrptiondata}`
      },
      {
        name: "og:title",
        content:
          `Nectar:${this.name}`,
      },
      {
        property: "og:type",
        content: "Product:eCommerce",
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
        property: "og:description",
        content: `Buy Online ${this.name},${this.productDetails.form} at Best Prices in India from trusted brands ✔Free shipping all over India  ✔ Return policy | Nectarplus.health`
      },
      {
        name: "twitter:card",
        property: "summary_large_image",
      },
      {
        property: "twitter:title",
        content: "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online",
      },
      {
        property: "twitter:description",
        content: `${this.discrptiondata}`
      },
      {
        property: "twitter:url",
        cotent: true ? this.document.location.href : ''
      },

      // {
      //   name: "og:product_category",
      //   content:
      //     `${this.productDetails.product_category.name_en ,this.productDetails.product_category.permalink}`
      // },
      // {
      //   type: 'application/ld+json',
      //   content: JSON.stringify(breadcrumbJsonLd)
      // }
    ]);
  }
  addJsonLdScript() {
    if (!this.productDetails || !this.productDetails.name) {
      return;
    }
    const imageUrl =
      this.selectedImageUrl ||
      this.productDetails.images_hsh?.array?.[0] ||
      this.productDetails.image ||
      null;
    const description = this.productDetails.description || this.discrptiondata || '';
    const sku = this.productDetails._id || this.id || '';
    const priceValue =
      this.productDetails.price?.sellingPrice ??
      this.productDetails.price?.final_price ??
      this.productDetails.offers?.[0]?.final_price ??
      this.productDetails.final_price ??
      null;
    const mrpValue =
      this.productDetails.price?.mrp ??
      this.productDetails.offers?.[0]?.mrp ??
      this.mrp ??
      null;
    const currentUrl = true && this.document?.location?.href || '';
    const origin = true && this.document?.location?.origin || '';

    const productJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": this.productDetails.name,
      "description": description,
      "sku": sku,
      "brand": {
        "@type": "Brand",
        "name": this.productDetails.manufacturer || "Nectar Plus"
      },
      "additionalType": "https://schema.org/Drug"
    };

    if (imageUrl) {
      productJsonLd['image'] = imageUrl;
    }

    if (priceValue !== null) {
      productJsonLd['offers'] = {
        "@type": "Offer",
        "url": currentUrl,
        "priceCurrency": "INR",
        "price": Number(priceValue),
        "itemCondition": "https://schema.org/NewCondition",
        "availability": this.productDetails.stock?.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "NectarPlus"
        }
      };

      if (mrpValue !== null) {
        const currentOffers = productJsonLd['offers'] as Record<string, unknown>;
        productJsonLd['offers'] = {
          ...currentOffers,
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": Number(mrpValue),
            "priceCurrency": "INR"
          }
        };
      }
    }

    // Add aggregateRating if available
    if (this.productDetails.rating?.average && this.productDetails.rating?.count) {
      productJsonLd['aggregateRating'] = {
        "@type": "AggregateRating",
        "ratingValue": Number(this.productDetails.rating.average).toFixed(1),
        "reviewCount": this.productDetails.rating.count,
        "bestRating": "5",
        "worstRating": "1"
      };
    }

    const breadcrumbItems = [
      { name: 'Home', item: origin ? `${origin}/` : '/' },
      { name: 'Medicines', item: origin ? `${origin}/medicines` : '/medicines' },
      { name: 'All Medicines', item: origin ? `${origin}/medicines/all-medicines` : '/medicines/all-medicines' },
      { name: this.productDetails.name, item: currentUrl }
    ];

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((breadcrumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": breadcrumb.name,
        "item": breadcrumb.item
      }))
    };

    this.upsertJsonLd('product-jsonld', productJsonLd);
    this.upsertJsonLd('breadcrumb-jsonld', breadcrumbJsonLd);
  }

  private upsertJsonLd(id: string, data: object): void {

    const existing = this.document?.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(data);
    this.renderer.appendChild(this.document.head, script);
  }

  viewImage(url: string) {
    this.selectedImageUrl = url;
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
}

