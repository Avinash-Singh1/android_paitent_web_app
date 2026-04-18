import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, Renderer2, DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
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

import { forkJoin, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { hospitalTypeToSlug } from 'src/app/config/hospital-types.constant';

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
  city:any;
  totalCount: number;
  url_specialization:string;
  breadcrumb_locality:string;
  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private behaviourSub: BehvaiourEventService,
    private title: Title,
    private _renderer2: Renderer2,
    private seoService: SeoService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document) {}

   ngOnInit(): void {

    this.deviceWidth = this.commonService.gettingWinowWidth();

    // Subscribe to route params to get the city
    this.activateRoute.params.subscribe((res: any) => {
      this.city = res?.city;
      this.payload.city = this.city;
      this.payload.specialization_id = this.url_specialization = res.specialization_id || '';
      if(res.locality && res.locality != undefined) this.payload.locality=this.breadcrumb_locality=res.locality;
      this.settingTagsAndTitles();
      this.url_specialization = this.url_specialization.replace(/-/g, ' ');
      if(this.url_specialization){
        this.fetch_spec_service(this.url_specialization);
      }
      this.getHospitalList();
    });

    this.getFilterData();
    this.eventService.broadcastEvent("doctor-list", false);
    this.eventService.broadcastEvent("view-doctor", true);
    if (this.deviceWidth < 767) {
      this.eventService.broadcastEvent("enable-serach", true);
    }
  }

clinicsName: Record<string, string> = {
  "orthopedic-surgeon": "orthopedic clinic",
  "orthopedist": "orthopedic clinic",
  "anesthesiologist": "anesthesiology clinic",
  "ayurveda": "ayurvedic clinic",
  "preventive cardiologist": "preventive cardiology clinic",
  "cardiologist": "cardiology clinic",
  "colposcopist": "colposcopy clinic",

  "conservative dentist": "dental clinic",
  "pediatric-dentist": "dental clinic",
  "endodontist": "dental clinic",
  "dentist": "dental clinic",
  "dental-surgeon": "dental clinic",
  "orthodontist": "dental clinic",
  "prosthodontist": "dental clinic",
  "implantologist": "dental clinic",
  "cosmetic-aesthetic-dentist": "dental clinic",
  "diabetologist": "diabetology clinic",
  "dietitian-nutritionist": "diet & nutrition clinic",
  "ophthalmologist": "eye clinic",
  "ent-specialist": "ent clinic",
  "endocrinologist": "endocrinology clinic",
  "family-physician": "family physician clinic",
  "general-physician": "general physician clinic",
  "general-surgeon": "general surgery clinic",
  "geriatrician": "geriatric clinic",
  "reproductive-endocrinologist": "reproductive endocrinology clinic",
  "infertility-specialist": "infertility clinic",
  "gynecologist": "gynecology clinic",
  "gynecologist-obstetrician": "gynecology clinic",
  "laparoscopic-surgeon": "laparoscopic surgery clinic",
  "homeopath": "homeopathy clinic",
  "dermatologist": "dermatology clinic",
  "pediatric-dermatologist": "dermatology clinic",
  "aesthetic-dermatologist": "dermatology clinic",
  "cosmetologist": "cosmetology clinic",
  "plastic-surgeon": "plastic surgery clinic",
  "hair transplant surgeon": "hair transplant clinic",
  "oncologist": "oncology clinic",
  "radiation-oncologist": "oncology clinic",
  "surgical-oncologist": "oncology clinic",
  "joint-replacement-surgeon": "joint replacement clinic",
  "physiotherapist": "physiotherapy clinic",
  "pediatrician": "pediatric clinic",
  "neonatologist": "neonatal clinic",
  "psychiatrist": "psychiatry clinic",
  "psychologist": "psychology clinic",
  "pulmonologist": "pulmonology clinic",
  "radiologist": "radiology clinic",
  "sexologist": "sexual health clinic",
  "trichologist": "trichology clinic",
  "urological surgeon": "urology clinic",
  "urologist": "urology clinic"
}

  spec_services:any;
  fetch_spec_service(specialization_name:string){
          this.apiService.getservices_based_on_specialization(specialization_name)
          .subscribe({
            next: (res: any) => {
              this.spec_services=res.result[0].services;
               this.settingTagsAndTitles();
            },
            error: (error: any) => {
              console.error(error);
            }
          });
  }


  capitalizeWords(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

    private formatServices(services: string[]): string {
  if (!services || !services.length) {
    return 'specialized treatments';
  }

  if (services.length === 1) {
    return services[0];
  }

  if (services.length === 2) {
    return `${services[0]} and ${services[1]}`;
  }

  return `${services.slice(0, -1).join(', ')}, and ${services[services.length - 1]}`;
}

removeHyphenWithSpace(value: string): string {
  if (!value) return '';

  const result = value.replace(/-/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

  settingTagsAndTitles() {
    this.seoService.indexAndFollowRobot();
    //setting title and description
    const servicesText = this.formatServices(this.spec_services);
    this.title.setTitle(
      `Best ${this.removeHyphenWithSpace(this.url_specialization)} near me in ${this.removeHyphenWithSpace(this.city)} | Nectarplus.Health`
    );
    this.seoService.updateTags([
      {
        name: "description",
        content:
          `Find the top rated ${this.removeHyphenWithSpace(this.url_specialization)} in ${this.removeHyphenWithSpace(this.city)} on Nectarplus.Health. Compare verified experts for ${servicesText}. Book your consult today.`,
      },
      {
        property: "og:title",
        content: `Best ${this.removeHyphenWithSpace(this.url_specialization)} near me in ${this.removeHyphenWithSpace(this.city)} | Nectarplus.Health`,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: `https://nectarplus.health/${this.city}/clinics/${this.url_specialization}`,
      },
      {
        property: "og:image",
        content: "https://nectarplus.health/assets/images/surgrey-image/doctors.png",
      },
      {
        property: "og:description",
        content:
          `Find the top rated ${this.removeHyphenWithSpace(this.url_specialization)} in ${this.removeHyphenWithSpace(this.city)} on Nectarplus.Health. Compare verified experts for ${servicesText}. Book your consult today.`,
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
          `Find the top rated ${this.removeHyphenWithSpace(this.url_specialization)} in ${this.removeHyphenWithSpace(this.city)} on Nectarplus.Health. Compare verified experts for ${servicesText}. Book your consult today.`,
      },
      {
        name: "twitter:image",
        content: "https://nectarplus.health/assets/images/surgrey-image/surgery.png",
      },
    ]);
  }

  isLoading: boolean = true;
  isLoadingMore: boolean = false;

  getHospitalList(obj: any = {}, append: boolean = false) {
    if (this.localStorage.getItem("coordinates")) {
      obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
    }

    const currentPayload = {
      ...this.payload,
      ...obj, // obj contains filter data and coordinates
      city: this.city // Always explicitly add the city
    };

    this.apiService
      .postParams(`${API_ENDPOINTS.patient.getAllclinics}`, {}, currentPayload)
      .subscribe((res: any) => {
        const newData = res?.result?.data || [];
        if (append) {
          this.hospitalList = [...this.hospitalList, ...newData];
        } else {
          this.hospitalList = newData;
        }

        // Create array of forkJoin observables for each hospital
        const newHospitals = append ? newData : this.hospitalList;
        const observables = newHospitals.map((element: any) => {
          const doctorReq = this.apiService
            .postParams(
              `${API_ENDPOINTS.patient.getDoctorsUnderHospital_2}`,
              {...this.payload,...obj},
              { establishmentId: element?._id }
            )
            .pipe(
              tap((res: any) => {
                element.docList = res?.result?.data;
              })
            );

          return forkJoin([doctorReq, "topDocReq"]);
        });

        // Wait for all nested async doctor/topDoc fetches to complete
        forkJoin(observables).subscribe(() => {
          this.totalCount = res?.result?.count;
          this.isLoading = false;
          this.isLoadingMore = false;
          this.cdr.markForCheck();
          // Schema markup only needed in browser
          if (this.isBrowser) {
            setTimeout(() => {
              this.GetSchemaMarkUpForHospitalList();
            }, 100);
          }
        });
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

  // top 3 doctors listing
  docPage: number = 1;
  searchDoctors(obj: any = {}) {
    return this.apiService.postParams(API_ENDPOINTS.doctor.searchDoctors, obj, {
      page: this.docPage++,
      size: 3,
    });
  }

  // getting filter data form filter component
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

  trackByHospitalId(index: number, item: any): string {
    return item?._id || index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  /** Get URL-safe singular type slug from hospital data */
  getTypeSlug(item: any): string {
    return hospitalTypeToSlug(item?.hospitalType?.[0]?.name || 'Clinic');
  }

  viewHospital(data: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = data?.address?.city.split(" ").join("-").toLowerCase();
    const typeSlug = hospitalTypeToSlug(data?.hospitalType?.[0]?.name || 'Clinic');
    this.router.navigate([
      `${city}/${typeSlug}/${data?.establishmentProfileSlug}`,
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
            "@id": 'https://nectarplus.health',
            name: "Home",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": `https://nectarplus.health/${city}`,
            name: firstHospital?.address?.city || "City",
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": `https://nectarplus.health/${city}/hospital`,
            name: "Hospitals",
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@id": `https://nectarplus.health/${city}/hospital/${locality}`,
            name: `${locality || "Locality"} - Listings`,
          },
        },
      ],
    };
    this.seoService.setJsonLd(this._renderer2, jsonLdData);

    // MedicalWebPage schema for listing pages
    const medicalWebPage = {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: `Best ${this.removeHyphenWithSpace(this.url_specialization)} in ${this.removeHyphenWithSpace(this.city)}`,
      url: `https://nectarplus.health/${city}/clinics/${this.url_specialization}`,
      about: {
        "@type": "MedicalSpecialty",
        name: this.removeHyphenWithSpace(this.url_specialization),
      },
      audience: {
        "@type": "MedicalAudience",
        audienceType: "Patient",
      },
    };
    this.seoService.setJsonLd(this._renderer2, medicalWebPage, 'schema-medicalwebpage');
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
            "url": `${productionOrigin}/${address.city}/${hospitalTypeToSlug(hospital.hospitalType?.[0]?.name || 'Clinic')}/${hospital.establishmentProfileSlug}`,
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
            "reviewCount": hospital.totalReview || hospital.totalDoctor || 1,
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
      this.scrollTop = scrollTop;
    }
  });
  }
}
