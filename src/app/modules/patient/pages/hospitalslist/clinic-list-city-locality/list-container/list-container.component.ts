import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, Renderer2, DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
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
import { hospitalTypeToSlug, SPEC_SLUG_TO_CLINIC_TYPE } from 'src/app/config/hospital-types.constant';

@Component({
  standalone: false,
  selector: "nectar-list-container",
  templateUrl: "./list-container.component.html",
  styleUrls: ["./list-container.component.scss"],
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
    private activateRoute: ActivatedRoute,
    private localStorage: LocalStorageService,
    private behaviourSub: BehvaiourEventService,
    private title: Title,
    private _renderer2: Renderer2,
    private seoService: SeoService,
    public commonService: CommonService,
    @Inject(DOCUMENT) private document: Document) {}

  city:any;
  isSpecialtyView = false;
  specialtySlug = '';
  specialtyClinicType = '';

  ngOnInit(): void {
  this.deviceWidth = this.commonService.gettingWinowWidth();

  this.activateRoute.params.subscribe((res: any) => {
    this.city = res?.city;
    this.payload.city = this.city;

    const localityParam = res?.locality;
    const specType = SPEC_SLUG_TO_CLINIC_TYPE.get(localityParam);

    if (specType) {
      this.isSpecialtyView = true;
      this.specialtySlug = localityParam;
      this.specialtyClinicType = specType;
      this.payload.specialization_id = localityParam;
      delete this.payload.locality;
    } else {
      this.isSpecialtyView = false;
      this.payload.locality = localityParam;
      delete this.payload.specialization_id;
    }

    this.settingTagsAndTitles();
    this.getHospitalList();

  });

  this.getFilterData();
  this.eventService.broadcastEvent("doctor-list", false);
  this.eventService.broadcastEvent("view-doctor", true);
  if (this.deviceWidth < 767) {
    this.eventService.broadcastEvent("enable-serach", true);
  }

  // Optionally enable scroll listener
  // this.eventService.getEvent("list-scroll").subscribe((res: any) => {
  //   if (res) {
  //     this.onScroll(1);
  //   }
  // });
}

  capitalizeWords(text: string): string {
    if (!text) return '';
    return text
      .replace(/-/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  settingTagsAndTitles() {
    const cityDisplay = this.capitalizeWords(this.city);

    if (this.isSpecialtyView) {
      const typeDisplay = this.specialtyClinicType;
      this.title.setTitle(
        `Best ${typeDisplay} in ${cityDisplay} | Nectarplus.Health`
      );
      const desc = `Find the best ${typeDisplay} in ${cityDisplay}. Compare verified clinics, read reviews, and book appointments online on Nectarplus.Health.`;
      this.seoService.updateTags([
        { name: "description", content: desc },
        { property: "og:title", content: `Best ${typeDisplay} in ${cityDisplay} | Nectarplus.Health` },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://nectarplus.health/${this.city}/clinics/${this.payload?.locality || ''}` },
        { property: "og:site_name", content: "NectarPlus Health" },
        { property: "og:description", content: desc },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@nectarplus" },
        { name: "twitter:title", content: `Best ${typeDisplay} in ${cityDisplay} | Nectarplus.Health` },
        { name: "twitter:description", content: desc },
      ]);
    } else {
      this.title.setTitle(
        `Find Best Clinics in ${cityDisplay} | Nectar Home - Discover Expert Online Consultations & Bookings`
      );
      const localityDisplay = this.capitalizeWords(this.payload?.locality || '');
      const pageTitle = `Best Clinics in ${localityDisplay}, ${cityDisplay} | Nectarplus.Health`;
      const desc = `Discover top-rated clinics in ${localityDisplay}, ${cityDisplay} offering expert medical care, modern facilities, and trusted healthcare professionals. Compare services, read reviews, and book appointments online.`;
      const canonicalUrl = `https://nectarplus.health/${this.city}/clinics/${this.payload?.locality || ''}`;
      this.seoService.updateTags([
        { name: "description", content: desc },
        { property: "og:title", content: pageTitle },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: "NectarPlus Health" },
        { property: "og:description", content: desc },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@nectarplus" },
        { name: "twitter:title", content: pageTitle },
        { name: "twitter:description", content: desc },
      ]);
    }
  }

  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  allLoaded: boolean = false;
  // getHospitalList(obj: any = {}, scroll: boolean = false) {
  //   if (this.localStorage.getItem("coordinates")) {
  //     obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
  //   }
  //   this.apiService
  //     .postParams(`${API_ENDPOINTS.patient.getAllHospitals}`, obj, this.payload)
  //     .subscribe((res: any) => {
  //       if (this.deviceWidth < 767 && scroll) {
  //         this.hospitalList.push(...res?.result?.data);
  //       } else {
  //         this.hospitalList = res?.result?.data;
  //         console.log("this.hospitalList: ",this.hospitalList);
  //       }
  //       this.hospitalList.forEach((element: any) => {
  //         this.apiService
  //           .postParams(
  //             `${API_ENDPOINTS.patient.getDoctorsUnderHospital}`,
  //             obj,
  //             {
  //               establishmentId: element?._id,
  //             }
  //           )
  //           .subscribe((res: any) => {
  //             element.docList = res?.result?.data;
  //           });
  //         if (this.deviceWidth > 1024) {
  //           this.searchDoctors(obj).subscribe((res: any) => {
  //             element.topDoc = res?.result?.data;
  //           });
  //         }
  //       });

  //       this.GetSchemaMarkUpForHospitalList();
  //       this.totalCount = res?.result?.count;
  //       this.isLoading = false;
  //     });

  // }

  getHospitalList(obj: any = {}, scroll: boolean = false) {
    if (this.localStorage.getItem("coordinates")) {
      obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
    }

    if (scroll) {
      this.isLoadingMore = true;
    }

    const apiUrl = this.isSpecialtyView
      ? API_ENDPOINTS.patient.getAllclinics
      : API_ENDPOINTS.patient.findcliniclistbylocality;

    this.apiService
      .postParams(`${apiUrl}`, obj, this.payload)
      .subscribe({
        next: (res: any) => {
        const newData = res?.result?.data || res?.data || [];

        if (scroll) {
          this.hospitalList.push(...newData);
        } else {
          this.hospitalList = newData;
        }

        this.totalCount = res?.result?.count;
        this.allLoaded = this.hospitalList.length >= this.totalCount;

        // Fetch doctors for only the NEW items
        const itemsToEnrich = scroll ? newData : this.hospitalList;
        const observables = itemsToEnrich.map((element: any) => {
          const doctorReq = this.apiService
            .postParams(
              `${API_ENDPOINTS.patient.getDoctorsUnderHospital}`,
              obj,
              { establishmentId: element?._id }
            )
            .pipe(
              tap((docRes: any) => {
                element.docList = docRes?.result?.data;
              })
            );

          const topDocReq = this.deviceWidth > 1024
            ? this.searchDoctors(obj).pipe(
                tap((topRes: any) => {
                  element.topDoc = topRes?.result?.data;
                })
              )
            : of(null);

          return forkJoin([doctorReq, topDocReq]);
        });

        if (observables.length > 0) {
          forkJoin(observables).subscribe(() => {
            this.isLoading = false;
            this.isLoadingMore = false;
            setTimeout(() => this.GetSchemaMarkUpForHospitalList(), 100);
          });
        } else {
          this.isLoading = false;
          this.isLoadingMore = false;
        }
      },
        error: () => {
          this.isLoading = false;
          this.isLoadingMore = false;
          this.hospitalList = [];
          this.totalCount = 0;
        }
      });
  }


  // Progressive loading — load next page
  loadMore() {
    if (this.isLoadingMore || this.allLoaded) return;
    this.payload.page += 1;
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
        // Reset to page 1 and clear list on filter change
        this.payload.page = 1;
        this.hospitalList = [];
        this.allLoaded = false;
        this.isLoading = true;
        this.getHospitalList(this.filterObject);
      });
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

  onScrollDown() {
    this.loadMore();
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
  }

  // GetSchemaMarkUpForHospitalList(): void {
  //   if (!this.hospitalList || this.hospitalList.length === 0) return;

  //   const jsonLdData = {
  //     "@context": "https://schema.org",
  //     "@type": "ItemList",
  //     "name": "List of Hospitals",
  //     "itemListElement": this.hospitalList.map((hospital: any, index: number) => {
  //       const address = hospital.address || {};
  //       const fullAddress = `${address.locality || ''}, ${address.city || ''}, ${address.state || ''}, ${address.pincode || ''}`;

  //       return {
  //         "@type": "ListItem",
  //         "position": index + 1,
  //         "item": {
  //           "@type": "Hospital",
  //           "name": hospital.name,
  //           "url": `${this.document.location.origin}/${address.city}/hospital/${hospital.establishmentProfileSlug}`,
  //           "image": hospital.profilePic,
  //           "address": {
  //             "@type": "PostalAddress",
  //             "streetAddress": address.locality || "",
  //             "addressLocality": address.city || "",
  //             "addressRegion": address.state || "",
  //             "postalCode": address.pincode || "",
  //             "addressCountry": "IN"
  //           },
  //           "aggregateRating": hospital.rating ? {
  //             "@type": "AggregateRating",
  //             "ratingValue": hospital.rating.toFixed(1),
  //             "reviewCount": hospital.totalDoctor || 0
  //           } : undefined,
  //           "specialty": hospital.specialization?.map((spec: any) => spec.name),
  //           "medicalSpecialty": hospital.hospitalType?.map((type: any) => type.name),
  //           "totalDoctor": hospital.totalDoctor,
  //           "availableService": {
  //             "@type": "MedicalProcedure",
  //             "name": "Consultation",
  //             "price": hospital.consultationFees || "N/A",
  //             "availableAtOrFrom": {
  //               "@type": "Place",
  //               "name": hospital.name
  //             }
  //           },
  //           "openingHoursSpecification": [
  //             ...['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  //               .filter(day => hospital[day] && hospital[day].length > 0)
  //               .map(day => ({
  //                 "@type": "OpeningHoursSpecification",
  //                 "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
  //                 "opens": hospital[day][0]?.from || "00:00",
  //                 "closes": hospital[day][0]?.to || "23:59"
  //               }))
  //           ]
  //         }
  //       };
  //     }).filter(item => item.item.name) // ensure no null items
  //   };

  //   this.seoService.setJsonLd(this._renderer2, jsonLdData);
  // }


  // GetSchemaMarkUpForHospitalList(): void {
  //   console.log("GetSchmea called: ");
  //   if (!this.hospitalList || this.hospitalList.length === 0) return;
  //   const jsonLdData = {
  //     "@context": "https://schema.org",
  //     "@type": "ItemList",
  //     "name": "List of Hospitals",
  //     "itemListElement": this.hospitalList.map((hospital: any, index: number) => {
  //       const address = hospital.address || {};

  //       return {
  //         "@type": "ListItem",
  //         "position": index + 1,
  //         "item": {
  //           "@type": "Hospital",
  //           "name": hospital.name,
  //           "url": `${this.document.location.origin}/${address.city}/hospital/${hospital.establishmentProfileSlug}`,
  //           "image": hospital.profilePic,
  //           "address": {
  //             "@type": "PostalAddress",
  //             "streetAddress": address.locality || "",
  //             "addressLocality": address.city || "",
  //             "addressRegion": address.state || "",
  //             "postalCode": address.pincode || "",
  //             "addressCountry": "IN"
  //           },
  //           "aggregateRating": hospital.rating ? {
  //             "@type": "AggregateRating",
  //             "ratingValue": hospital.rating.toFixed(1),
  //             "reviewCount": hospital.totalDoctor || 0
  //           } : undefined,
  //           "medicalSpecialty": [
  //             ...(hospital.specialization?.map((spec: any) => spec.name) || []),
  //             ...(hospital.hospitalType?.map((type: any) => type.name) || [])
  //           ],
  //           "availableService": {
  //             "@type": "MedicalProcedure",
  //             "name": "Consultation",
  //             "offers": {
  //               "@type": "Offer",
  //               "price": 500,
  //               "priceCurrency": "INR"
  //             }
  //           },
  //           "openingHoursSpecification": [
  //             ...['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  //               .filter(day => hospital[day] && hospital[day].length > 0)
  //               .map(day => ({
  //                 "@type": "OpeningHoursSpecification",
  //                 "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
  //                 "opens": hospital[day][0]?.from || "00:00",
  //                 "closes": hospital[day][0]?.to || "23:59"
  //               }))
  //           ]
  //         }
  //       };
  //     }).filter(item => item.item.name)
  //   };

  //   this.seoService.setJsonLd(this._renderer2, jsonLdData);
  // }

  // GetSchemaMarkUpForHospitalList(): void {
  //   // console.log("GetSchema called: ");
  //   if (!this.hospitalList || this.hospitalList.length === 0) return;

  //   const productionOrigin = 'https://yourdomain.com';

  //   const jsonLdData = {
  //     "@context": "https://schema.org",
  //     "@type": "ItemList",
  //     "name": "List of Hospitals",
  //     "itemListElement": this.hospitalList.map((hospital: any, index: number) => {
  //       const address = hospital.address || {};

  //       const doctors = Array.isArray(hospital.docList)
  //         ? hospital.docList.map((doc: any) => {
  //             const docAddress = doc.address || {};


  //             return {
  //               "@type": "Person",
  //               "name": doc.doctorName,
  //               "url": `${this.document.location.origin}/${docAddress.city || address.city}/doctor/${doc.doctorProfileSlug}`,
  //               "image": doc.doctorProfilePic || `${productionOrigin}/assets/default-doctor.jpg`,
  //               // "medicalSpecialty": doc.specialization?.map((spec: any) => spec.name),
  //               "address": {
  //                 "@type": "PostalAddress",
  //                 "streetAddress": docAddress.locality || "",
  //                 "addressLocality": docAddress.city || address.city || "",
  //                 "addressRegion": docAddress.state || address.state || "",
  //                 "postalCode": docAddress.pincode || address.pincode || "",
  //                 "addressCountry": "IN"
  //               },
  //               "aggregateRating": doc.rating && doc.rating > 0 ? {
  //                 "@type": "AggregateRating",
  //                 "ratingValue": doc.rating.toFixed(1),
  //                 "reviewCount": doc.reviews || 0
  //               } : undefined,
  //               "description": `Experience: ${doc.experience} years. Consultation Fee: ₹${doc.consultationFees}`
  //             };
  //           }) : [];

  //       return {
  //         "@type": "ListItem",
  //         "position": index + 1,
  //         "item": {
  //           "@type": "Hospital",
  //           "name": hospital.name,
  //           "url": `${productionOrigin}/${address.city}/hospital/${hospital.establishmentProfileSlug}`,
  //           "image": hospital.profilePic || `${productionOrigin}/assets/default-hospital.jpg`,
  //           "address": {
  //             "@type": "PostalAddress",
  //             "streetAddress": address.locality || "",
  //             "addressLocality": address.city || "",
  //             "addressRegion": address.state || "",
  //             "postalCode": address.pincode || "",
  //             "addressCountry": "IN"
  //           },
  //           "aggregateRating": hospital.rating ? {
  //             "@type": "AggregateRating",
  //             "ratingValue": hospital.rating.toFixed(1),
  //             "reviewCount": hospital.totalDoctor || 0
  //           } : undefined,
  //           "medicalSpecialty": [
  //             ...(hospital.specialization?.map((spec: any) => spec.name) || []),
  //             ...(hospital.hospitalType?.map((type: any) => type.name) || [])
  //           ],
  //           "openingHoursSpecification": [
  //             ...['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  //               .filter(day => hospital[day] && hospital[day].length > 0)
  //               .map(day => ({
  //                 "@type": "OpeningHoursSpecification",
  //                 "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
  //                 "opens": hospital[day][0]?.from || "00:00",
  //                 "closes": hospital[day][0]?.to || "23:59"
  //               }))
  //           ],
  //           "employee": doctors
  //         }
  //       };
  //     }).filter(item => item.item.name)
  //   };


  //   this.seoService.setJsonLd(this._renderer2, jsonLdData);
  // }

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

  trackByIndex(index: number): number {
    return index;
  }
}
