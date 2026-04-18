
import { ChangeDetectorRef, Component, Inject, OnInit, OnDestroy, Renderer2, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute,Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject, Subscription, take, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { ApiService } from 'src/app/services/api.service';
import { BehvaiourEventService } from 'src/app/services/behvaiour-event.service';
import { CommonService } from 'src/app/services/common.service';
import { EventService } from 'src/app/services/event.service';
import { SeoService } from 'src/app/services/seo.service';
import { LocalStorageService } from 'src/app/services/storage.service';
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'nectar-hospitalslisting',
  standalone: false,
  templateUrl: './hospitalslisting.component.html',
  styleUrls: ['./hospitalslisting.component.scss']
})
export class HospitalslistingComponent implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
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
    private cdr: ChangeDetectorRef
  ) {
    // this.changingPage = this.changingPage.bind(this);
  }
      fading: boolean = false;
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
      private destroy$ = new Subject<void>();
      doctorDetailSubject = new BehaviorSubject<any>(null);
      filteredData$ = this.doctorDetailSubject.asObservable();
      isMobile: boolean = false;
      flag: any = null;

      // Track if initial SEO has been set to prevent re-applying on minor changes
      private initialSeoSet: boolean = false;
      private seoDataSubject = new BehaviorSubject<any[]>([]);
     public seoData$ = this.seoDataSubject.asObservable();
    private payloadSubject = new BehaviorSubject<any>(null);
    public payload$ = this.payloadSubject.asObservable();
    doctorState:any;

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
          // this.searchDoctors(this.filterObject);
            // if (true) {
              this.searchDoctors(this.filterObject);
            // }
        })
      );

      // Event listener for infinite scroll on mobile (browser-only)
      this.subscriptions.push(
        this.eventService.getEvent("list-scroll").subscribe((res: any) => {
          if (res) {
            this.triggerPageTransition();
            this.onScroll(1);
          }
        })
      );

      // this.headerBroadcastEvent();
        this.getFilterData(); // Subscription for filter changes
    }

    searchDoctors(obj: any = {}, scroll: boolean = false) {
      // Only show skeleton on subsequent navigations — not during initial page load.
      if (this.apiHit) {
        this.isLoading = true;
      }

      if (this.localStorage.getItem("coordinates")) {
        obj.coordinates = JSON.parse(this.localStorage.getItem("coordinates"));
      }
this.subscriptions.push( // Add this subscription to subscriptions array
        this.apiService.postParams(API_ENDPOINTS.doctor.searchDoctors, obj, this.payload)
          .pipe(
            take(1) // Ensure only one response is processed per API call
          )
          .subscribe({
            next: (res: any) => {
              if (res.status_code !== 200) {
                // Only redirect in the browser, not during prerendering
                this.router.navigateByUrl('/page-not-found'); // Use router.navigateByUrl for Angular routing
                this.isLoading = false;
                return;
              }

              this.apiHit = true;
              this.localStorage.removeItem("coordinates");

              this.filteredData = res?.result?.data || [];

              if (this.payload.locality) {
                const normalizedPayloadLocality = this.normalizeLocality(this.payload.locality);
                this.filteredData = this.filteredData.filter((doctor: any) => {
                  const normalizedDoctorLocality = this.normalizeLocality(doctor.locality);
                  return normalizedDoctorLocality?.includes(normalizedPayloadLocality);
                });
              }

              if (this.isMobile && scroll) {
                this.content.push(...this.filteredData);
              } else {
                // Only assign content if it's different to minimize change detection
               const isSame = this.content.length === this.filteredData.length &&
                 this.content.every((doc, i) => doc.id === this.filteredData[i].id);
                  if (!isSame) {
                    this.content = this.filteredData;
                  }

              }

              if (this.filteredData.length === 0) {
                this.router.navigateByUrl('/page-not-found');
                this.isLoading = false;
                return;
              }
              this.doctorState = this.filteredData[0]?.doctorState || null;

              this.totalItems = res?.result?.count || this.filteredData.length;

              const seo: any[] = [];
              if (res?.result?.specialization) seo.push(res.result.specialization);
              if (res?.result?.procedure) seo.push(res.result.procedure);

              this.settingTagsAndTitles(); // Call SEO updates
              this.settingSchemaMarkUp();   // Call SEO updates

              this.seoDataSubject.next(seo);
              this.payloadSubject.next(this.payload);
              this.doctorDetailSubject.next(this.filteredData);

              this.isLoading = false;
              this.cdr.detectChanges(); // Manually trigger change detection if using OnPush
            },
            error: (err) => {
              this.isLoading = false;
              if (err.status === 404) {
                this.router.navigateByUrl('/page-not-found');
              } else {
                console.error('API error: ', err);
              }
              this.cdr.detectChanges(); // Manually trigger change detection if using OnPush
            } })
      );
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

  triggerPageTransition() {
    this.fading = true;
    setTimeout(() => {
      this.fading = false;
      this.cdr.detectChanges();
      this.scrollToTop();
    }, 30);
  }

  onScroll(e: number) {
    // Only fetch more data if in browser and conditions met
    if (true && this.totalItems > this.payload.page * this.payload.size && this.isMobile) {
      this.payload.page += 1;
      this.searchDoctors(this.filterObject, true);
    }
  }

  settingTagsAndTitles() {
    // Only update SEO tags if in browser, or if totalItems has a meaningful value after data load
    if (!true && this.totalItems === 0) {
        // On server, only set tags if data is available (prerendered with data)
        // Or if you explicitly want default SEO values even for 0 results on server
        return;
    }
    if (true && this.initialSeoSet) {
        // Prevent re-setting basic SEO on every client-side page change if it's already done
        // This is a heuristic; adjust if you need dynamic SEO changes on filters
        return;
    }

    const robotsValue = this.flag ? "noindex, follow" : "index, follow";
    const isAltMedical = this.symptomps?.toLowerCase() === "ayurveda" || this.symptomps?.toLowerCase() === "homeopath";
    const displayTerm = isAltMedical ? "Doctors" : "";

    const descriptionContent = this.isService
      ? `${this.totalItems} Best ${this.capitalizeWords(this.symptomps)} Doctors in ${
      this.capitalizeWords(this.payload.locality) || ""
      }, ${
      this.capitalizeWords(this.city)
      }. Book Doctor 24x7 Appointment Online, View Fees, User feedbacks and Address of ${
      this.symptomps
      } in ${this.capitalizeWords(this.city)}, ${this.capitalizeWords(this.doctorState)}. Nectar Plus Health.`
      : `Best ${this.capitalizeWords(this.symptomps)} ${displayTerm} in ${
      this.capitalizeWords(this.payload.locality) || ""
      } ${
      this.capitalizeWords(this.city)
      }, ${this.capitalizeWords(this.doctorState)}. Book Doctor 24x7 Appointment Online, View Fees, User feedbacks and Address of ${
      this.symptomps
      } in ${this.capitalizeWords(this.city)}, ${this.capitalizeWords(this.doctorState)}. Nectar Plus Health.`;

    const ogTitle = this.isService
      ? `${this.totalItems} Best ${this.capitalizeWords(this.symptomps)} Doctors in ${
      this.capitalizeWords(this.payload.locality) || ""
      } ${
      this.capitalizeWords(this.city)
      }, ${this.capitalizeWords(this.doctorState)}. Find Best Reviewed Hospitals and Surgeons/Doctors, Reviews | Nectar Health`
      : `${this.totalItems} Best ${this.capitalizeWords(this.symptomps)} ${displayTerm} in ${
      this.capitalizeWords(this.payload.locality) || ""
      } ${
      this.capitalizeWords(this.city)
      }, ${this.capitalizeWords(this.doctorState)}. Find Best Reviewed Hospitals and Surgeons/Doctors, Reviews | Nectar Health`;

    if (this.isService) {
      this.title.setTitle(
        `${this.totalItems} Best ${this.capitalizeWords(this.symptomps)} Doctors in ${this.capitalizeWords(this.payload.locality) || ""} ${
        this.capitalizeWords(this.city)
        }, ${this.capitalizeWords(this.doctorState)}– Verified Reviews & Easy Booking Online | Nectarplus.health`
      );
    } else {
      this.title.setTitle(
        `${this.totalItems} Best ${this.capitalizeWords(this.symptomps)} ${displayTerm} in ${this.capitalizeWords(this.payload.locality) || ""} ${
        this.capitalizeWords(this.city)
        }, ${this.capitalizeWords(this.doctorState)}. Find Best Reviewed Hospitals and Surgeons/Doctors, Reviews | Nectar Health`
      );
    }
    this.seoService.updateTags([
      {
        name: "robots",
        content: robotsValue
      },
      {
        name: "description",
        content: descriptionContent
      },
      {
        property: "og:title",
        content: ogTitle },
      {
        property: "og:type",
        content: "website" },
      {
        property: "og:url",
        content: `https://nectarplus.health/${this.payload.city}/${this.payload.search}` },
      {
        property: "og:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png" },
      {
        property: "og:description",
        content: descriptionContent },
      {
        property: "og:image:alt",
        content: "A photo of a doctor looking at a computer." },
      {
        property: "og:image:width",
        content: "1200" },
      {
        property: "og:image:height",
        content: "628" },
      {
        name: "twitter:card",
        content: "summary_large_image" },
      {
        name: "twitter:site",
        content: true ? this.document.location.href : 'YOUR_CANONICAL_URL' },
      {
        name: "twitter:title",
        content: ogTitle },
      {
        name: "twitter:description",
        content: descriptionContent },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png" },
    ]);

      this.initialSeoSet = true; // Mark SEO as set after the first client-side update
  }
   capitalizeWords(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

    settingSchemaMarkUp() {
    // Only set schema markup if in browser
    if (!true && this.totalItems === 0) {
        // On server, only set schema if data is available (prerendered with data)
        return;
    }

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": 'https://nectarplus.health',
            name: "Home" } },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": `https://nectarplus.health/${this.payload.city}/doctors`,
            name: this.payload.city } },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@id": `https://nectarplus.health/${this.payload.city}/${this.payload.search}`,
            name: this.payload.search } },
      ] };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  scrollToTop(): void {
    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  trackByFn(index: number, item: any): any {
  return item?.id || index;
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
