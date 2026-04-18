import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild, Renderer2, DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { OwlOptions } from "ngx-owl-carousel-o";
import { Subject, Subscription, debounceTime, fromEvent } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { BehvaiourEventService } from "src/app/services/behvaiour-event.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { Title, Meta } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { CommonService } from "src/app/services/common.service";

import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: "nectar-list-container",
  templateUrl: "./list-container.component.html",
  styleUrls: ["./list-container.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  deviceWidth: any;
  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    dots: false,
    autoWidth: true,
    startPosition: 0,
    margin: 20,
    nav: true,
    navText: [
      '<img src="assets/images/pageright.svg" alt="" height="36" width="36" >',
      '<img src="assets/images/pageright.svg" alt="" height="36" width="36">',
    ],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1000: {
        items: 4,
      },
      1200: {
        items: 6,
      },
    },
  };
  @ViewChild("owlCar") owlCar: any;
  payload: any = {
    page: 1,
    size: 6,
  };
  hospitalList: any = [];
  totalCount: number;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private behaviourSub: BehvaiourEventService,
    private title: Title,
    private _renderer2: Renderer2,
    private seoService: SeoService,
    private commonService: CommonService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.settingTagsAndTitles();
    this.deviceWidth = this.commonService.gettingWinowWidth();

    this.getHospitalList();
    this.getFilterData();
    // Show normal header (logo + nav links) instead of search-mode header
    // Search bar is now embedded directly in this component's template
    this.eventService.broadcastEvent("doctor-list", false);
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("enable-serach", true);
    }
    // this.eventService.getEvent("list-scroll").subscribe((res: any) => {
    //   if (res) {
    //     this.onScroll(1);
    //   }
    // });
  }

  settingTagsAndTitles() {
    //setting title and description
    this.title.setTitle(
      "Find Doctor | Nectar Home - Discover Expert Online Consultations & Bookings"
    );
    // this.meta.addTags();
    this.seoService.updateTags([
      {
        name: "description",
        content:
          "Discover expert online consultations and hassle-free hospital bookings at Nectar Home's 'Find Doctor' feature. Connect with highly skilled doctors across various specialties in India, ensuring personalized healthcare solutions at your fingertips. Take control of your well-being with Nectar Home's seamless and convenient healthcare platform.",
      },
      {
        property: "og:title",
        content: "Find Doctors | Nectar Plus Health",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://nectarplus.health/find-doctors/",
      },
      {
        property: "og:image",
        content: "https://nectarplus.health/img/doctors.png",
      },
      {
        property: "og:description",
        content:
          "Discover expert online consultations and hassle-free hospital bookings at Nectar Home's 'Find Doctor' feature. Connect with highly skilled doctors across various specialties in India, ensuring personalized healthcare solutions at your fingertips. Take control of your well-being with Nectar Home's seamless and convenient healthcare platform.",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@nectarplus",
      },
      {
        name: "twitter:title",
        content: "Find Doctors | Nectar Plus Health",
      },
      {
        name: "twitter:description",
        content:
          "Find doctors in your area who are covered by your Nectar Plus Health plan.",
      },
      {
        name: "twitter:image",
        content: "https://nectarplus.health/img/search-for-doctors.png",
      },
    ]);
  }

  isLoading: boolean = true;
  isLoadingMore: boolean = false;

  getHospitalList(obj: any = {}, append: boolean = false) {
    if (this.localStorage.getItem("coordinates")) {
      obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
    }

    this.apiService
      .postParams(`${API_ENDPOINTS.patient.getAllHospitals2}`, obj, this.payload)
      .subscribe({
        next: (res: any) => {
          const data = res?.result?.data || [];
          const count = res?.result?.count ?? 0;

          if (append) {
            this.hospitalList = [...this.hospitalList, ...data];
          } else {
            this.hospitalList = data;
          }

          // docList is already embedded in each hospital from the API response
          // No N+1 nested API calls needed
          // Only show hospitals/clinics that have at least one doctor
          this.hospitalList = this.hospitalList.filter(
            (h: any) => h.docList && h.docList.length > 0
          );

          this.totalCount = count;
          this.isLoading = false;
          this.isLoadingMore = false;
          this.cdr.markForCheck();

          // Generate schema markup after data is available
          this.GetSchemaMarkUpForHospitalList();
        },
        error: () => {
          this.isLoading = false;
          this.isLoadingMore = false;
          this.cdr.markForCheck();
        }
      });
  }


  // Infinite scroll — load next page
  onScroll(e: any) {
    if (this.isLoading || this.isLoadingMore) return;
    if (!this.totalCount || this.hospitalList.length >= this.totalCount) return;
    this.payload.page = this.payload.page + 1;
    this.isLoadingMore = true;
    this.cdr.markForCheck();
    this.getHospitalList(this.filterObject, true);
  }

  // Reset and re-fetch when filters change
  filterObject: any = {};
  subscription: Subscription;
  getFilterData() {
    let obj: any = {};
    this.subscription = this.eventService
      .getEvent("filter-doctor-list")
      .subscribe((res: any) => {
        obj = res;
        if (!obj.consultationFee) {
          delete this.filterObject.consultationFee;
        }
        if (!obj.specialty) {
          delete this.filterObject.specialty;
        }
        if (!obj.availability) {
          delete this.filterObject.availability;
        }
        if (!obj.timeOfDay) {
          delete this.filterObject.timeOfDay;
        }
        if (!obj.sortBy) {
          delete this.filterObject.sortBy;
        }
        this.filterObject = { ...this.filterObject, ...obj };
        // Reset to page 1 on filter change
        this.payload.page = 1;
        this.hospitalList = [];
        this.isLoading = true;
        this.cdr.markForCheck();
        this.getHospitalList(this.filterObject);
      });
  }

  viewHospital(data: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = data?.address?.city.split(" ").join("-").toLowerCase();
    this.router.navigate([
      `${city}/hospital/${data?.establishmentProfileSlug}`,
    ]);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
    this.behaviourSub.broadcastEvent("filter", {});
    this.eventService.broadcastEvent("doctor-list", false);
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("enable-serach", false);
    }
  }

  settingSchemaMarkUpForBreadcrumb(): void {
    if (!this.hospitalList || this.hospitalList.length === 0) return;
    const firstHospital = this.hospitalList[0];
    const city = this.commonService.replaceSpaceWithHyphen(firstHospital?.address?.city);
    const locality = this.commonService.replaceSpaceWithHyphen(firstHospital?.address?.locality);

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": this.document.location.origin,
            name: "Home",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": `${this.document.location.origin}/${city}`,
            name: firstHospital?.address?.city || "City",
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": `${this.document.location.origin}/${city}/hospital`,
            name: "Hospitals",
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@id": this.document.location.href,
            name: `${locality || "Locality"} - Listings`,
          },
        },
      ],
    };
    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  GetSchemaMarkUpForHospitalList(): void {
    if (!this.hospitalList || this.hospitalList.length === 0) return;

    const productionOrigin = 'https://nectarplus.health/';

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "List of Hospitals",
      "itemListElement": this.hospitalList.map((hospital: any, index: number) => {
        const address = hospital.address || {};

        const doctors = Array.isArray(hospital.docList)
          ? hospital.docList.map((doc: any) => {
              const docAddress = doc.address || {};

              return {
                "@type": "Person",
                "name": doc.doctorName,
                "url": `${productionOrigin}/${docAddress.city || address.city}/doctor/${doc.doctorProfileSlug}`,
                "image": doc.doctorProfilePic || `https://nector-prod.s3.ap-south-1.amazonaws.com/986d9500-921d-11ef-9eef-990c47d7fcd5-defaultProfilePic.png`,
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": docAddress.locality || "",
                  "addressLocality": docAddress.city || address.city || "",
                  "addressRegion": docAddress.state || address.state || "",
                  "postalCode": docAddress.pincode || address.pincode || "",
                  "addressCountry": "IN"
                },
                "aggregateRating": doc.rating && doc.rating > 0 ? {
                  "@type": "AggregateRating",
                  "ratingValue": doc.rating.toFixed(1),
                  "reviewCount": doc.reviews || 0
                } : undefined,
                "description": `Experience: ${doc.experience} years. Consultation Fee: ₹${doc.consultationFees}`
              };
            })
          : [];

        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Hospital",
            "name": hospital.name,
            "url": `${productionOrigin}/${address.city}/hospital/${hospital.establishmentProfileSlug}`,
            "image": hospital.profilePic || `${productionOrigin}/assets/default-hospital.jpg`,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": address.locality || "",
              "addressLocality": address.city || "",
              "addressRegion": address.state || "",
              "postalCode": address.pincode || "",
              "addressCountry": "IN"
            },
            "priceRange": "₹500 - ₹2000",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": hospital.rating && hospital.rating >= 1
              ? hospital.rating.toFixed(1)
              : "1.0",
            "reviewCount": hospital.totalDoctor || 0,
            "bestRating": "5",
            "worstRating": "1"
             },
            "medicalSpecialty": [
              ...(hospital.specialization?.map((spec: any) => spec.name) || []),
              ...(hospital.hospitalType?.map((type: any) => type.name) || [])
            ],
            "openingHoursSpecification": [
              ...['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
                .filter(day => hospital[day] && hospital[day].length > 0)
                .map(day => ({
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
                  "opens": hospital[day][0]?.from || "00:00",
                  "closes": hospital[day][0]?.to || "23:59"
                }))
            ],
            "employee": doctors
          }
        };
      }).filter(item => item.item.name)
    };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }


  scrollTop: any = 10;
  private destroy$ = new Subject<void>();

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, "scroll").pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        if (this.deviceWidth > 767) {
          const scrollTop =
            window.scrollY ||
            this.document.documentElement.scrollTop ||
            this.document.body.scrollTop ||
            0;
          this.ngZone.run(() => {
            this.scrollTop = scrollTop;
          });
        }
      });
    });
  }

  trackByHospitalId(index: number, item: any): string {
    return item?._id || index;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
