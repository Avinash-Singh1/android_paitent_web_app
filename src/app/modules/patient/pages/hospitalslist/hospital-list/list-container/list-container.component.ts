import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild, Renderer2, DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
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

import { takeUntil } from 'rxjs/operators';
import { hospitalTypeToSlug } from 'src/app/config/hospital-types.constant';

@Component({
  standalone: false,
  selector: "nectar-list-container",
  templateUrl: "./list-container.component.html",
  styleUrls: ["./list-container.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush })
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
        items: 1 },
      600: {
        items: 2 },
      1000: {
        items: 4 },
      1200: {
        items: 6 } } };
  @ViewChild("owlCar") owlCar: any;
  payload: any = {
    page: 1,
    size: 6 };
  hospitalList: any = [];
  totalCount: number;
  url_specialization:string;
  breadcrumb_locality:string;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private eventService: EventService,
    private activateRoute: ActivatedRoute,
    private localStorage: LocalStorageService,
    private behaviourSub: BehvaiourEventService,
    private title: Title,
    private _renderer2: Renderer2,
    private seoService: SeoService,
    private commonService: CommonService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document) {}

  city:any;
  Non_Hyphen_url_specialization:any
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
       this.activateRoute.params.subscribe((res: any) => {
      this.city = res?.city;
      this.payload.city = this.city; // Set city in the initial payload
      this.payload.specialization_id =this.url_specialization= res.specialization_id; // Set city in the initial payload
      if(res.locality && res.locality != undefined) this.payload.locality=this.breadcrumb_locality=res.locality;
      // Call getHospitalList after the city is set
      this.settingTagsAndTitles();
      this.getHospitalList();
    this.Non_Hyphen_url_specialization = this.url_specialization
      ? this.url_specialization.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
      : '';

      if(this.url_specialization){
        this.fetch_spec_service(this.url_specialization);
      }
    });

    this.getFilterData();
  }

 hospitalsName = {
  "orthopedic-surgeon": "orthopedic hospital",
  "orthopedist": "orthopedic hospital",
  "anesthesiologist": "anesthesiology hospital",
  "ayurveda": "ayurvedic hospital",
  "preventive-cardiologist": "preventive cardiology hospital",
  "cardiologist": "cardiology hospital",
  "colposcopist": "colposcopy hospital",

  "conservative-dentist": "dental hospital",
  "pediatric-dentist": "dental hospital",
  "endodontist": "dental hospital",
  "dentist": "dental hospital",
  "dental-surgeon": "dental hospital",
  "orthodontist": "dental hospital",
  "prosthodontist": "dental hospital",
  "implantologist": "dental hospital",

  "diabetologist": "diabetology hospital",
  "dietitian-nutritionist": "diet & nutrition hospital",
  "ophthalmologist": "eye hospital",
  "ent-specialist": "ent hospital",
  "endocrinologist": "endocrinology hospital",
  "family-physician": "family physician hospital",
  "general-physician": "general physician hospital",
  "general-surgeon": "general surgery hospital",
  "geriatrician": "geriatric hospital",
  "reproductive-endocrinologist": "reproductive endocrinology hospital",
  "infertility-specialist": "infertility hospital",
  "gynecologist": "gynecology hospital",
  "gynecologist-obstetrician": "gynecology hospital",
  "laparoscopic-surgeon": "laparoscopic surgery hospital",
  "homeopath": "homeopathy hospital",
  "dermatologist": "dermatology hospital",
  "pediatric-dermatologist": "dermatology hospital",
  "aesthetic-dermatologist": "dermatology hospital",
  "cosmetologist": "cosmetology hospital",
  "plastic-surgeon": "plastic surgery hospital",
  "hair-transplant-surgeon": "hair transplant hospital",
  "oncologist": "oncology hospital",
  "radiation-oncologist": "oncology hospital",
  "surgical-oncologist": "oncology hospital",
  "joint-replacement-surgeon": "joint replacement hospital",
  "physiotherapist": "physiotherapy hospital",
  "pediatrician": "pediatric hospital",
  "neonatologist": "neonatal hospital",
  "psychiatrist": "psychiatry hospital",
  "psychologist": "psychology hospital",
  "pulmonologist": "pulmonology hospital",
  "radiologist": "radiology hospital",
  "sexologist": "sexual health hospital",
  "trichologist": "trichology hospital",
  "urological-surgeon": "urology hospital",
  "urologist": "urology hospital"
};

  spec_services:any;
  fetch_spec_service(specialization_name:string){
this.apiService.getservices_based_on_specialization(specialization_name).subscribe({
      next: (res: any) => {
        this.spec_services=res.result[0].services;
        this.settingTagsAndTitles();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
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
    const servicesText = this.formatServices(this.spec_services);
    //setting title and description
    this.title.setTitle(
      `Best ${this.removeHyphenWithSpace(this.url_specialization)} near me in ${this.removeHyphenWithSpace(this.city)} | Nectarplus.Health`
    );
    this.seoService.updateTags([
      {
        name: "description",
        content:
          `Find the top rated ${this.removeHyphenWithSpace(this.url_specialization)} in ${this.removeHyphenWithSpace(this.city)} on Nectarplus.Health. Compare verified experts for ${servicesText}. Book your consult today.` },
      {
        property: "og:title",
        content: `Best ${this.removeHyphenWithSpace(this.url_specialization)} near me in ${this.removeHyphenWithSpace(this.city)} | Nectarplus.Health` },
      {
        property: "og:type",
        content: "website" },
      {
        property: "og:url",
        content: `https://nectarplus.health/${this.city}/hospitals/${this.url_specialization}` },
      {
        property: "og:image",
        content: "https://nectarplus.health/assets/images/surgrey-image/doctors.png" },
      {
        property: "og:description",
        content:
          `Find the top rated ${this.removeHyphenWithSpace(this.url_specialization)} in ${this.removeHyphenWithSpace(this.city)} on Nectarplus.Health. Compare verified experts for ${servicesText}. Book your consult today.` },
      {
        name: "twitter:card",
        content: "summary_large_image" },
      {
        name: "twitter:site",
        content: "@nectarplus" },
      {
        name: "twitter:title",
        content: "Find Doctors | Nectar Plus Health" },
      {
        name: "twitter:description",
        content:
         `Find the top rated ${this.removeHyphenWithSpace(this.url_specialization)} in ${this.removeHyphenWithSpace(this.city)} on Nectarplus.Health. Compare verified experts for ${servicesText}. Book your consult today.` },
      {
        name: "twitter:image",
        content: "https://nectarplus.health/assets/images/surgrey-image/surgery.png" },
    ]);
  }

  isLoading: boolean = false;
  isLoadingMore: boolean = false;

  getHospitalList(obj: any = {}, append: boolean = false) {
    if (this.localStorage.getItem("coordinates")) {
      obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
    }

    this.apiService.postParams(`${API_ENDPOINTS.patient.getAllHospitals2}`, obj, this.payload)
      .subscribe((res: any) => {
        const data = res?.result?.data || res?.data || [];
        const count = res?.result?.count ?? res?.count ?? 0;

        if (append) {
          this.hospitalList = [...this.hospitalList, ...data];
        } else {
          this.hospitalList = data;
        }

        // docList is now embedded in each hospital from the API response
        // No need for separate doctor list API calls (N+1 eliminated)
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

  /** Get URL-safe singular type slug from hospital data */
  getTypeSlug(item: any): string {
    return hospitalTypeToSlug(item?.hospitalType?.[0]?.name || 'Hospital');
  }

  viewHospital(data: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = data?.address?.city.split(" ").join("-").toLowerCase();
    const typeSlug = hospitalTypeToSlug(data?.hospitalType?.[0]?.name || 'Hospital');
    this.router.navigate([
      `${city}/${typeSlug}/${data?.establishmentProfileSlug}`,
    ]);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription?.unsubscribe();
    this.behaviourSub.broadcastEvent("filter", {});
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
            name: "Home" } },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": `${this.document.location.origin}/${city}`,
            name: firstHospital?.address?.city || "City" } },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": `${this.document.location.origin}/${city}/hospital`,
            name: "Hospitals" } },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@id": this.document.location.href,
            name: `${locality || "Locality"} - Listings` } },
      ] };
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
            "url": `${productionOrigin}/${address.city}/${hospitalTypeToSlug(hospital.hospitalType?.[0]?.name || 'Hospital')}/${hospital.establishmentProfileSlug}`,
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
            this.cdr.markForCheck();
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
