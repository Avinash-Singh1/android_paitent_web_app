import { Component, HostListener, Inject, OnDestroy, OnInit, AfterViewInit, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router"; // Import NavigationEnd
import { BehaviorSubject, Subject, Subscription, combineLatest, filter, take, distinctUntilChanged, takeUntil } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { BehvaiourEventService } from "src/app/services/behvaiour-event.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { CommonService } from "src/app/services/common.service";


@Component({
  standalone: false,
  selector: "nectar-doctor-search-result",
  templateUrl: "./doctor-search-result.component.html",
  styleUrls: ["./doctor-search-result.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush, // Consider OnPush strategy for performance
})
export class DoctorSearchResultComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private destroy$ = new Subject<void>();
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public eventService: EventService,
    private localStorage: LocalStorageService,
    private behaviourSub: BehvaiourEventService,
    private title: Title,
    private seoService: SeoService,
    public commonService: CommonService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) public document: any,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  city: string;
  symptomps: any;
  filterObject: any = {};
  apiHit: boolean = false;
  deviceWidth: any;
  serviceName: any = "";
  specialityName: any = "";
  isService: any = false;
  isSpeciality: any = false;
  content: any[] = []; // Initialize as empty array
  payload: any = {
    page: 1,
    size: 10 };
  totalItems: number = 0; // Initialize totalItems
  seoData: any = [];
  isLoading: boolean = false;
  filteredData: any[] = [];
  scrollTop: any = 10;
  subscription: Subscription | null = null;
  private subscriptions: Subscription[] = [];
  doctorDetailSubject = new BehaviorSubject<any>(null);
  filteredData$ = this.doctorDetailSubject.asObservable();
  isMobile: boolean = false;
  flag: any = null;

  // ── Infinite Scroll State ──
  isLoadingMore: boolean = false;
  hasMore: boolean = true;
  private observer: IntersectionObserver | null = null;

  /** Deduplicate doctors by _id, keeping the first occurrence */
  private deduplicateDoctors(doctors: any[]): any[] {
    const seen = new Set<string>();
    return doctors.filter((doc) => {
      const id = doc?._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  // Track if initial SEO has been set to prevent re-applying on minor changes
  private initialSeoSet: boolean = false;

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.isMobile = this.deviceWidth <= 767;
    // Scroll to top instantly on client-side navigation
    // This is primarily for client-side routing; for initial load, prerendering handles it.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.isBrowser) window.scrollTo({ top: 0, behavior: "instant" });
    });

  this.doctorDetailSubject.next([]);
  this.seoDataSubject.next([]);
    // Subscribe to route params and query params
    this.subscriptions.push(
      combineLatest([
        this.activatedRoute.params.pipe(distinctUntilChanged()),
        this.activatedRoute.queryParams.pipe(distinctUntilChanged())
      ]).subscribe(([res, query]) => {
        // Update payload based on route params/query params
        this.flag = query['service'] || null;
        this.payload.page = res?.['page'] || 1;
        this.serviceName = "";
        this.specialityName = "";
        this.isService = false;
        this.isSpeciality = false;

        if (this.flag && res?.['speciality'] && res?.['speciality'] !== "doctors") {
          this.serviceName = this.commonService.replaceHyphenWithSpace(res?.['speciality']);
          this.payload.search = this.serviceName;
          this.symptomps = this.serviceName;
          this.isService = true;
        } else if (res?.['speciality'] && res?.['speciality'] !== "doctors") {
          this.specialityName = this.commonService.replaceHyphenWithSpace(res?.['speciality']);
          this.payload.search = this.specialityName;
          this.symptomps = this.specialityName;
          this.isSpeciality = true;
        } else {
          delete this.payload.speciality;
          delete this.payload.search;
          this.symptomps = "";
        }

        if (res?.['city']) {
          this.payload.city = this.commonService.replaceHyphenWithSpace(res?.['city']);
          this.city = this.payload.city;
        } else {
          delete this.payload.city;
          this.city = "";
        }

        if (res?.['locality']) {
          this.payload.locality = this.commonService.replaceHyphenWithSpace(res?.['locality']);
        } else {
          delete this.payload.locality;
        }

          // Ensure payload is cleaned in filterObject too
        delete this.filterObject.search;
        delete this.filterObject.speciality;

        Object.assign(this.filterObject, this.payload);

        // Trigger doctor search
            this.searchDoctors(this.filterObject);
      })
    );

    // Legacy scroll event — infinite scroll handled by IntersectionObserver
    this.subscriptions.push(
      this.eventService.getEvent("list-scroll").subscribe((_res: any) => {
        // No-op: IntersectionObserver handles infinite scroll
      })
    );

    this.headerBroadcastEvent();
      this.getFilterData(); // Subscription for filter changes
  }

  scrollToTop(): void {
    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  capitalizeWords(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  private getServiceSpecializationNames(): string {
  if (!this.service_page_specializaton?.length) {
    return 'specialists';
  }

  return this.service_page_specializaton
    .map((spec: any) => spec.name)
    .join(', ');
}

  fading: boolean = false;

  triggerPageTransition() {
    this.fading = true;
    setTimeout(() => {
      this.fading = false;
      this.cdr.detectChanges();
      this.scrollToTop();
    }, 30);
  }

settingTagsAndTitles() {

  if (!true && this.totalItems === 0) {
    return;
  }

  if (true && this.initialSeoSet) {
    return;
  }

  const city = this.capitalizeWords(this.city);
  const serviceName = this.capitalizeWords(this.symptomps);
  const isServicePage = this.isService && this.flag;

  /* ============================
     SERVICE PAGE META TAGS
     ============================ */
  if (isServicePage) {

    const specializationNames = this.getServiceSpecializationNames();
    // e.g. "Dentist, Prosthodontist"

    const metaTitle =
      `Best Doctors for ${serviceName} Near Me in ${city} | Nectarplus.Health`;

    const metaDescription =
      `Find and book appointments with the top ${serviceName.toLowerCase()} specialists in ${city} on Nectarplus.Health. ` +
      `Compare verified ${specializationNames.toLowerCase()}, read patient reviews, get expert care near you. | Nectarplus.Health`;

    this.title.setTitle(metaTitle);

    this.seoService.updateTags([
      { name: 'robots', content: 'index, follow' },
      { name: 'description', content: metaDescription },

      { property: 'og:title', content: metaTitle },
      { property: 'og:description', content: metaDescription },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:url',
        content: 'https://nectarplus.health' + this.router.url.split('?')[0]
      },
      {
        property: 'og:image',
        content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png'
      },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: metaTitle },
      { name: 'twitter:description', content: metaDescription },
      {
        name: 'twitter:image',
        content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png'
      }
    ]);

    this.seoService.setCanonicalUrl();
    this.initialSeoSet = true;
    return; // 🚨 Prevent doctor-search SEO override
  }

  /* ============================
     EXISTING DOCTOR / SPECIALITY SEO (UNCHANGED)
     ============================ */

  const robotsValue = "index, follow";
  const displayTerm =
    this.symptomps?.toLowerCase() === "ayurveda" ||
    this.symptomps?.toLowerCase() === "homeopath"
      ? "Doctors"
      : "";

  const descriptionContent =
    `Find and book the top ${this.totalItems} ${this.capitalizeWords(this.symptomps)} near me ${displayTerm} in ` +
    `${this.capitalizeWords(this.payload.locality) || ""} ${city}, ${this.capitalizeWords(this.doctorState)}. ` +
    `Compare experience, fees & reviews. Instant video consultation, Verified doctors Near Me, Book appointments at Nectarplus.Health`;

  const ogTitle =
    `Top ${this.totalItems} Best ${this.capitalizeWords(this.symptomps)} Near Me ${displayTerm} in ` +
    `${this.capitalizeWords(this.payload.locality) || ""} ${city}, ${this.capitalizeWords(this.doctorState)} | Nectarplus.Health`;

  this.title.setTitle(ogTitle);

  this.seoService.updateTags([
    { name: 'robots', content: robotsValue },
    { name: 'description', content: descriptionContent },
    { property: 'og:title', content: ogTitle },
    { property: 'og:description', content: descriptionContent },
    { property: 'og:url', content: 'https://nectarplus.health' + this.router.url.split('?')[0] },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: ogTitle },
    { name: 'twitter:description', content: descriptionContent },
    { name: 'twitter:image', content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png' }
  ]);

  this.seoService.setCanonicalUrl();
  this.initialSeoSet = true;
}

  private seoDataSubject = new BehaviorSubject<any[]>([]);
  public seoData$ = this.seoDataSubject.asObservable();

  private payloadSubject = new BehaviorSubject<any>(null);
  public payload$ = this.payloadSubject.asObservable();
  doctorState:any;
  breadcrumbSpecialization:any;
  service_page_specializaton:any;

  doctorSearchTerm: string = ''; // Direct binding for initial render
  hospitalURLs: any[] = [];

searchDoctors(obj: any = {}, scroll: boolean = false) {
  if (scroll) {
    this.isLoadingMore = true;
    this.cdr.detectChanges();
  } else {
    this.scrollToTop();
    this.isLoading = true;
    this.content = [];
    this.totalItems = 0;
    this.hasMore = true;
    this.payload.page = 1;
    this.cdr.detectChanges();
  }

this.apiService.postParams(API_ENDPOINTS.doctor.searchDoctors, obj, this.payload)
    .subscribe({
      next: (res: any) => {
        if (res.status_code !== 200) {
          this.router.navigateByUrl('/page-not-found');
          this.isLoading = false;
          this.isLoadingMore = false;
          return;
        }

        this.apiHit = true;

        if (this.localStorage.getItem("coordinates")) {
          obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
        }

        // ✅ STEP 1: Process raw data first
        let rawData = res?.result?.data || [];
        this.service_page_specializaton = rawData[0]?.specialization || null;

        // ✅ STEP 2: Backend handles locality filtering via query params
        let processedData = rawData;
        if (!scroll) {
          this.filteredData = processedData;
        }

        // ✅ STEP 3: Update content array (infinite scroll) — deduplicate by _id
        if (scroll) {
          this.content = this.deduplicateDoctors([...this.content, ...processedData]);
        } else {
          this.content = this.deduplicateDoctors(processedData);
        }

        // ✅ STEP 4: Early exit if no doctors — show "no results" UI
        if (processedData.length === 0) {
          if (scroll) {
            this.hasMore = false;
          }
          this.totalItems = res?.result?.count || 0;
          this.isLoading = false;
          this.isLoadingMore = false;
          this.cdr.detectChanges();
          return;
        }

        // ✅ STEP 5: Set basic metadata
        this.doctorState = processedData[0]?.doctorState || null;
        this.totalItems = res?.result?.count || processedData.length;

        // ✅ STEP 5b: Update hasMore for infinite scroll
        this.hasMore = this.content.length < this.totalItems;

        // ✅ STEP 6–10: SEO & subjects (only on fresh search, not load-more)
        if (!scroll) {
          this.doctorDetailSubject.next(processedData);
          this.payloadSubject.next(this.payload);

          // ✅ STEP 7: Prepare SEO data FIRST (breadcrumbs depend on this)
          this.prepareSeoData();

          // ✅ STEP 8: Build SEO array for breadcrumbs
          const seo: any[] = [];
          if (res?.result?.specialization) {
            this.breadcrumbSpecialization = res.result.specialization.breadcrumb;
            seo.push(res.result.specialization);
          }
          if (res?.result?.procedure) seo.push(res.result.procedure);

          // ✅ STEP 9: Update SEO subject (breadcrumbs render ✅)
          this.seoDataSubject.next(seo);

          // ✅ STEP 10: SEO-CRITICAL - Set schema SYNCHRONOUSLY
          this.settingTagsAndTitles();
          this.settingSchemaMarkUp();
        } // end if (!scroll)

        // ✅ STEP 11: Cleanup
        this.localStorage.removeItem("coordinates");

        this.isLoading = false;
        this.isLoadingMore = false;
        this.cdr.detectChanges();

        // Reconnect IntersectionObserver after fresh search DOM update
        if (!scroll && this.isBrowser) {
          setTimeout(() => this.setupIntersectionObserver(), 100);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isLoadingMore = false;
        if (err.status === 404 && true) {
          this.router.navigateByUrl('/page-not-found');
        }
        this.cdr.detectChanges();
      }
    });
}

    /**
   * ✅ SEO-CRITICAL: Prepares SEO data for View Source (same as doctor-details)
   */
  private prepareSeoData(): void {
    if (this.filteredData?.length && this.payload?.city) {
      const specializationNames = this.filteredData[0]?.specialization?.map((s: any) => s.name).join(', ') || '';
      const city = this.payload.city;
      const locality = this.payload.locality || '';

      // 1. SEO Description Data (VIEW SOURCE VISIBLE)
      this.seoData = [{
        description: `Find top ${specializationNames} doctors in ${city}${locality ? `, ${locality}` : ''}. Book online appointments with verified specialists near you.`,
        sections: [
          {
            title: "Top Doctors Available",
            content: `${specializationNames} specialists in ${city}<br>Verified doctors<br>Online booking<br>Patient reviews`
          }
        ]
      }];

      // 2. Doctor search term (VIEW SOURCE VISIBLE)
      this.doctorSearchTerm = specializationNames || this.payload.search || '';

      // 3. Hospital URLs (VIEW SOURCE VISIBLE) - from first doctor or static
      this.hospitalURLs = this.filteredData[0]?.establishmentmaster?.slice(0, 10).map((hospital: any) => ({
        name: hospital.name || 'Hospital',
        profileSlug: hospital.establishmentProfileSlug || hospital._id,
        address: {
          city: hospital.address?.city || city,
          locality: hospital.address?.locality || ''
        }
      })) || [];
    }

    // 4. Trigger change detection for initial render
    this.cdr?.detectChanges();
  }

  normalizeLocality(value: string): string {
    return value
      ? value
        .toLowerCase()
        .replace(/-/g, ' ')
        .replace(/[^a-z0-9\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
      : '';
  }

  headerBroadcastEvent() {
    // Show normal header (logo + nav links) instead of search-mode header
    // Search bar is now embedded directly in this component's template
    this.eventService.broadcastEvent("doctor-list", false);
    if (this.isMobile) {
      this.eventService.broadcastEvent("enable-serach", true);
    }
  }

  getFilterData() {
    this.subscriptions.push( // Ensure this subscription is also managed
      this.eventService.getEvent("filter-doctor-list").subscribe((res: any) => {
        this.filterObject = {
          ...this.filterObject,
          ...res };

        ["consultationFee", "specialty", "availability", "timeOfDay", "sortBy"].forEach((key) => {
          if (!res[key]) delete this.filterObject[key];
        });

        this.searchDoctors(this.filterObject);
      })
    );
  }

  removeLocality() {
    this.isSpeciality = false;
    this.isService = false;
    this.specialityName = "";
    this.serviceName = "";
    this.payload.search = "doctors";
    const currentLocality = true ? this.localStorage.getItem('locality') : null;
    if (currentLocality) {
      this.localStorage.removeItem('locality');
    }
    this.eventService.broadcastEvent('clear-speciality', true);
    // After changing payload, re-search for doctors
    this.searchDoctors(this.filterObject);
  }

  changingPage(_e: number) {
    // Deprecated: pagination replaced by infinite scroll
  }

  onScroll(_e: number) {
    // Deprecated: IntersectionObserver handles infinite scroll
  }

  ngOnDestroy(): void {
    // Clean up IntersectionObserver
    this.destroyObserver();

    // Complete destroy$ to clean up fromEvent and other takeUntil subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Ensure all subscriptions are unsubscribed to prevent memory leaks
    this.subscriptions.forEach(sub => sub?.unsubscribe());

    this.eventService.broadcastEvent("doctor-list", false);
    this.localStorage.removeItem("city");
    this.localStorage.removeItem("state");
    this.localStorage.removeItem("search-address");

    this.behaviourSub.broadcastEvent("filter", {});
    this.eventService.broadcastEvent("doctor-list", false);

    if (this.isMobile) {
      this.eventService.broadcastEvent("enable-serach", false);
    }
  }

  ngAfterViewInit(): void {
    // Desktop scroll tracking removed — sticky filter is commented out in template

    // Infinite scroll observer (all devices)
    if (this.isBrowser) this.setupIntersectionObserver();
  }

  // Dead schema functions removed (settingSchemaMarkUp_new1, settingSchemaMarkUp_Final_1, settingSchemaMarkUp_F2)

settingSchemaMarkUp() {
  if (!true && this.totalItems === 0) {
    return;
  }

  if (!this.filteredData?.length) {
    return;
  }

  const getValidMedicalSpecialty = (specialtyName: string): string => {
    const medicalSpecialtyMap: { [key: string]: string } = {
      'Dentist': 'http://schema.org/Dentistry',
      'Orthodontist': 'http://schema.org/Dentistry',
      'Cardiologist': 'http://schema.org/Cardiovascular',
      'Dermatologist': 'http://schema.org/Dermatology',
      'General Physician': 'http://schema.org/CommunityHealth',
      'default': 'http://schema.org/MedicalBusiness'
    };
    return medicalSpecialtyMap[specialtyName.trim()] || medicalSpecialtyMap['default'];
  };

  const getValidSchemaType = (specialtyName: string): string => {
    const schemaTypeMap: { [key: string]: string } = {
      'Dentist': 'Dentist',
      'Physiotherapist': 'Physiotherapist',
      'default': 'Physician'
    };
    return schemaTypeMap[specialtyName.trim()] || schemaTypeMap['default'];
  };

  const convertTime24 = (timeStr: string) => {
    if (!timeStr) return "00:00";
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const specialtyName = this.specialityName || this.serviceName || this.payload.search || 'Doctors';
  const pageTitle = `${this.totalItems} Best ${this.capitalizeWords(specialtyName)} in ${this.capitalizeWords(this.city)}`;

  const doctorItems = this.filteredData.slice(0, 10).map((doctor: any, index: number) => {
    const firstSpecialty = doctor.specialization?.[0]?.name || 'Physician';
    const clinicName = doctor.establishmentName || 'Clinic';
    const schemaType = getValidSchemaType(firstSpecialty);
    const doctorUrl = `https://nectarplus.health/${this.payload.city}/${doctor.doctorProfileSlug}`;

    // Process Opening Hours
    const dayMap: any = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
    const openingHoursSpec = [];
    for (const key in dayMap) {
      if (doctor[key] && Array.isArray(doctor[key])) {
        doctor[key].forEach((slot: any) => {
          openingHoursSpec.push({
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": dayMap[key],
            "opens": convertTime24(slot.from),
            "closes": convertTime24(slot.to)
          });
        });
      }
    }

    return {
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": schemaType,
        "@id": `${doctorUrl}#doctor`,
        "name": doctor.fullName,
        "image": doctor.profilePic,
        "url": doctorUrl,
        "medicalSpecialty": getValidMedicalSpecialty(firstSpecialty),
        "telephone": "+91-XXXXXXXXX",
        "priceRange": `INR ${doctor.consultationFees || '500'}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": doctor.address?.landmark || '',
          "addressLocality": doctor.address?.locality || doctor.city,
          "addressRegion": doctor.doctorState,
          "postalCode": doctor.address?.pincode,
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": doctor.pinLocation?.coordinates[1],
          "longitude": doctor.pinLocation?.coordinates[0]
        },

        // ✅ FIX: Use 'memberOf' or 'parentOrganization' instead of 'worksFor'
        "memberOf": {
          "@type": "MedicalOrganization",
          "name": clinicName
        },

        // ✅ FIX: Instead of 'availableChannel', use 'hasOfferCatalog'
        // to define Video Consultation as a Service Offer.
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Consultations",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "In-Clinic Visit"
              },
              "price": doctor.consultationFees?.toString() || "500",
              "priceCurrency": "INR"
            },
            ...(doctor.videoConsultationFees > 0 ? [{
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Video Consultation"
              },
              "price": doctor.videoConsultationFees.toString(),
              "priceCurrency": "INR"
            }] : [])
          ]
        },

        "openingHoursSpecification": openingHoursSpec
      }
    };
  });

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": this.totalItems,
      "itemListElement": doctorItems
    }
  };

  this.seoService.setJsonLd(this._renderer2, collectionPageSchema);
}

  private resizeTimer: any;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Debounce resize to avoid scroll-triggered thrashing on mobile (URL bar hide/show)
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      const newWidth = event.target.innerWidth;
      if (newWidth !== this.deviceWidth) {
        this.deviceWidth = newWidth;
        this.isMobile = this.deviceWidth <= 767;
        this.cdr.detectChanges();
      }
    }, 150);
  }

  // ── Infinite Scroll ──────────────────────────────────────────────

  /** Set up IntersectionObserver for infinite scroll (browser-only) */
  private setupIntersectionObserver(): void {
    this.destroyObserver();

    this.ngZone.runOutsideAngular(() => {
      const sentinel = this.document.getElementById('loadMoreTrigger');
      if (!sentinel) return;

      this.observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting &&
            this.hasMore &&
            !this.isLoadingMore &&
            !this.isLoading
          ) {
            this.ngZone.run(() => this.loadMore());
          }
        },
        { rootMargin: '300px 0px' }
      );

      this.observer.observe(sentinel);
    });
  }

  /** Disconnect IntersectionObserver */
  private destroyObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /** Load next page of doctor results */
  loadMore(): void {
    if (!this.hasMore || this.isLoadingMore || this.isLoading) return;
    this.payload.page += 1;
    this.searchDoctors(this.filterObject, true);
  }

  trackByFn(index: number, item: any) {
    return item?._id || index;
  }

}