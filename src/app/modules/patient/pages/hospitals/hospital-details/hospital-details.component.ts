import { Component, Inject, OnInit, Renderer2, ChangeDetectorRef, AfterViewInit, OnDestroy, DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { LoginModalComponent } from "../login-modal/login-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { Subject, Subscription, debounceTime, fromEvent, takeUntil } from "rxjs";
import { SearchService } from "src/app/services/search.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { CommonModule, Location } from "@angular/common";
import { ShareModalComponent } from "src/app/shared/components/share-modal/share-modal.component";
import { SearchSuggestionsMobileComponent } from "src/app/shared/components/search-suggestions-mobile/search-suggestions-mobile.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { CommonService } from "src/app/services/common.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { HospitalDetailService } from "src/app/services/hospital-detail.service";
import { CryptoProvider } from "src/app/services/crypto.service";

import {
  hospitalTypeToSlug,
  singularToPlural,
  typeSlugToDisplayName,
  typePluralDisplayName,
  typeToListingRouteSlug } from "src/app/config/hospital-types.constant";
import { SharedModule } from "src/app/shared/shared.module";
import { StarRatingModule } from "angular-star-rating";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, StarRatingModule, AngularSvgIconModule],
  selector: "nectar-hospital-details",
  templateUrl: "./hospital-details.component.html",
  styleUrls: ["./hospital-details.component.scss"] })
export class HospitalDetailsComponent implements OnInit,OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private destroy$ = new Subject<void>();
  deviceWidth: any;
  selected = 0;
  hospitalId: any;
  tabContent: any = [
    {
      name: "About" },
    {
      name: "Doctors",
      count: 0 },
    {
      name: "Procedures" },

    {
      name: "Services" },

    {
      name: "FAQs" },
    {
      name: "Videos" },
    {
      name: "Review",
      count: 0 },
  ];
  hospitalDetail: any;

  posts: any;
  private sub = new Subscription();
  servicesList:any;
  // current_specialization:any;
  doc_fullName:any;
  isOwnEstablishment:any;
  currentCity: any;
  scrollTop: number = 0;
  Current_hospitalId:any;
  Currrent_hospital_location:any;
  doc_specialization = '';
  HospitalURLS:any;

  doc_spec:any;
  meta_city:any;
  /** Singular hospital type slug from route, e.g. 'clinic', 'hospital' */
  typeSlug: string = 'hospital';
  /** Plural form for listing links, e.g. 'clinics', 'hospitals' */
  typePluralSlug: string = 'hospitals';
  /** Valid parent listing route slug (only 'clinics' or 'hospitals') */
  listingRouteSlug: string = 'hospitals';
  /** Display name for the type, e.g. 'Clinic', 'Hospital' */
  typeDisplayName: string = 'Hospital';
  /** Plural display name, e.g. 'Clinics', 'Hospitals' */
  typePluralDisplayName: string = 'Hospitals';

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public gService: GoogleMapsService,
    private localStorage: LocalStorageService,
    public eventService: EventService,
    public locations: Location,
    private bottomSheet: MatBottomSheet,
    public commonService: CommonService,
    private title: Title,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private formatTime: FormatTimeService,
    private cryptoService: CryptoProvider,
    private hospitalDetailService: HospitalDetailService,
    @Inject(DOCUMENT) public document: any,
    private cdRef: ChangeDetectorRef,
    public searchService: SearchService
  ) {
  }

    ngOnInit(): void {
      this.deviceWidth = this.localStorage.getItem('device')
      if (this.deviceWidth < 767) {
        this.eventService.broadcastEvent("remove-header-mobile", true);
      }

      // ✅ OPTIMIZED: Single API call using slug directly — eliminates slug-for-id round trip
      this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        const docSlug = res?.slug;
        this.meta_city = this.commonService.replaceHyphenWithSpace(res?.city);

        // Extract hospital type from new route pattern /:city/:hospitalType/:slug
        const routeType = res?.hospitalType;
        if (routeType) {
          this.typeSlug = routeType;
          this.typePluralSlug = singularToPlural(routeType);
          this.listingRouteSlug = typeToListingRouteSlug(routeType);
          this.typeDisplayName = typeSlugToDisplayName(routeType);
          this.typePluralDisplayName = typePluralDisplayName(routeType);
        }

        this.selected = 0;
        this.getHospitalDetailBySlug(docSlug);
      });

      this.sub.add(
        this.apiService.data$.subscribe((data) => {
          if (data) {
            this.posts = data as any[];
          }
        })
      );
    }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    fromEvent(window, "scroll")
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => {
        const scrollTop =
          window.scrollY ||
          this.document.documentElement.scrollTop ||
          this.document.body.scrollTop ||
          0;
        this.scrollTop = scrollTop;
      });

    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params["city"]) {
        let city = this.commonService.titleCase(
          this.commonService.replaceHyphenWithSpace(params["city"])
        );
        this.localStorage.setItem("search-address", city);
      }
    });
    this.cdRef.detectChanges();
  }

  settingTagsAndTitles() {
    let titleContent: string;
    let descriptionContent: string;
    // console.log("settingTagsAndTitles hospitalDetail: ",this.hospitalDetail);
    // 1. Check if the hospital name matches the condition
    if (this.hospitalDetail?.name === "Video Consultation Only") {
      // 2. Set the custom title and description for 'Video Consultation'
      titleContent = `${this.doc_fullName} (Video Only) - Best ${this.doc_spec} in ${this.meta_city} | Video Consultation with ${this.doc_fullName} in ${this.meta_city} | Nectarplus.Health`;
      // titleContent = `${DoctorName} (Video Only) - Best ${Specialization} in ${City} | Video Consultation with ${DoctorName} in ${City} | Nectarplus.Health`;

      descriptionContent = `Video Consultation with experienced ${this.doc_spec} ${this.doc_fullName} in ${this.meta_city}. Get compassionate online care for illnesses & wellness for Best Price. Book your video Consultation today | Nectarplus.Health`;
      // descriptionContent = `Video Consultation with experienced ${Specialization} ${DoctorName} in ${City}, ${this.hospitalDetail?.stateName?.name}. Get compassionate online care for illnesses & wellness for just ${Price}. Book your video Consultation today | Nectarplus.Health`;
    } else {
      // 3. Set the default title and description for other hospitals
      titleContent = `${this.hospitalDetail?.name} ${this.hospitalDetail?.hospitalType} in ${this.meta_city} | Book Appointment with ${this.doc_fullName}  (${this.doc_spec || this.doc_specialization}) in ${this.meta_city} | Nectarplus.health`;

      // descriptionContent = `${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city}. Book Appointments Online, View Doctor Fees, address, for ${this.hospitalDetail?.name} in ${this.hospitalDetail?.address?.city} | Nectarplus.health`;

      descriptionContent = `${this.hospitalDetail?.name} in ${this.meta_city}  offers expert care from ${this.doc_fullName}, a renowned ${this.doc_spec || this.doc_specialization}. Visit us at ${this.meta_city} or book an appointment online via Nectarplus.health`;

      // Sanjivani Clinic in Rajeev Nagar, Patna offers expert care from Dr. Ajay Kumar, a renowned General Physician & Diabetologist. Visit us at 10, Rajeev Nagar Rd, Patna, Bihar, or book an appointment online via Nectarplus.health.
    }

    // 4. Apply the chosen title and tags
    this.title.setTitle(titleContent);

    this.seoService.updateTags([
      {
        name: "description",
        content: descriptionContent },
      {
        property: "og:title",
        content: titleContent },
      {
        property: "og:type",
        content: "website" },
      {
        property: "og:url",
        content: this.document.location.href },
      {
        property: "og:image",
        content: this.hospitalDetail?.profilePic },
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
        content: this.document.location.href },
      {
        name: "twitter:title",
        content: titleContent },
      {
        name: "twitter:description",
        content: descriptionContent },
      {
        name: "twitter:image",
        content: this.hospitalDetail?.profilePic },
    ]);
  }

  openLoginDialog() {
    this.dialog.open(LoginModalComponent, {
      disableClose: true,
      data: { type: "hospital" },
      autoFocus: false });
  }
  // ✅ OPTIMIZED: Single API call using slug — eliminates slug-for-id round trip (saves ~55ms)
  getHospitalDetailBySlug(slug: string) {
    if (!slug) return;
this.apiService.get(`${API_ENDPOINTS.patient.hospitalProfile}`, {
        establishmentProfileSlug: slug }).subscribe((res: any) => {
      this.hospitalDetail = res?.result?.[0];

      // Update type info from actual DB data (authoritative)
      if (this.hospitalDetail.hospitalType) {
        const dbTypeSlug = hospitalTypeToSlug(this.hospitalDetail.hospitalType);
        this.typeSlug = dbTypeSlug;
        this.typePluralSlug = singularToPlural(dbTypeSlug);
        this.listingRouteSlug = typeToListingRouteSlug(dbTypeSlug);
        this.typeDisplayName = typeSlugToDisplayName(dbTypeSlug);
        this.typePluralDisplayName = typePluralDisplayName(dbTypeSlug);
      }

      // Extract fields previously from slug-for-id
      this.hospitalId = this.hospitalDetail._id;
      this.doc_fullName = this.hospitalDetail.fullName;
      this.doc_spec = this.hospitalDetail.docSpecializationNames?.[0];
      this.servicesList = this.hospitalDetail.services || [];
      this.isOwnEstablishment = true; // owner establishment by default

      this.Current_hospitalId = this.hospitalId;
      this.Currrent_hospital_location = this.hospitalDetail.location;
      this.hospitalDetailService.setHospitalDetail(this.hospitalDetail);

      if (true && this.Current_hospitalId && this.Currrent_hospital_location) {
        this.FindHospitalsNearMe();
      }


      this.settingTagsAndTitles();
      this.settingCanonicalUrl();
      this.settingSchemaMarkUpForBreadcrumb();
      this.settingSchemaMarkupForProfile();
      this.gettingReviewData();
      this.tabContent[1].count = this.hospitalDetail?.doctorCount;
      this.tabContent[6].count = this.hospitalDetail?.reviews;
    });
  }

  getPlace(data: any) {
    // Now handled by nectar-global-search component
  }

  getCurrentCity() {
    // Now handled by nectar-global-search component
  }

  closeSuggestion(data: string) {
    // Now handled by nectar-global-search component
  }

  focusOnLocation() {
    // Now handled by nectar-global-search component
  }

  getSuggestion(data: any, type: string) {
    // Now handled by nectar-global-search component
  }

  tabChange(num: number) {
    this.selected = num;
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth" });
  }

  scrollToBooking() {
    this.selected = 0;
    setTimeout(() => {
      const el = document.getElementById('list-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  openShareDialog() {
    this.dialog.open(ShareModalComponent, {
      panelClass: "shareModal",
      data: { name: "hospital profile" } });
  }

  ngOnDestroy() {
  // revert mobile header if required
  if (this.deviceWidth < 767) {
    this.eventService.broadcastEvent("remove-header-mobile", false);
  }

  // unsubscribe all tracked subscriptions
  this.sub.unsubscribe();

  // Complete destroy$ to clean up fromEvent and other takeUntil subscriptions
  this.destroy$.next();
  this.destroy$.complete();
}

  openBottomSheet() {
    if (this.deviceWidth < 767) {
      this.bottomSheet.open(SearchSuggestionsMobileComponent, {
        data: { type: "both" },
        panelClass: "search-bottom-sheet" });
    }
  }

  formatName(value: any, maxLength) {
    if (value?.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }

  settingSchemaMarkUpForBreadcrumb() {
    let city = this.commonService.replaceSpaceWithHyphen(
      this.hospitalDetail?.address?.city
    );
    let locality = this.commonService.replaceSpaceWithHyphen(
      this.hospitalDetail?.address?.locality
    );
    const origin = this.document.location.origin;
    const items: any[] = [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@id": origin,
          name: "Home" } },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@id": `${origin}/${city}`,
          name: this.hospitalDetail?.address?.city } },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@id": `${origin}/${city}/${this.listingRouteSlug}`,
          name: this.typePluralDisplayName } },
    ];
    if (this.hospitalDetail?.address?.locality) {
      items.push({
        "@type": "ListItem",
        position: 4,
        item: {
          "@id": `${origin}/${city}/${this.listingRouteSlug}/${locality}`,
          name: this.hospitalDetail?.address?.locality } });
    }
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      item: {
        "@id": this.document.location.href,
        name: this.hospitalDetail?.name } });
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  gettingReviewData() {
    let reviewArray: any;
    this.eventService.getEvent("sharing-reviews").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        reviewArray = res?.map((item: any) => {
          return {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: item?.patientName },
            reviewRating: {
              "@type": "Rating",
              ratingValue: item?.rating },
            reviewBody: item?.feedback };
        });
      }
      // this.settingSchemaMarkupForProfile(reviewArray);
      if (this.hospitalDetail && this.hospitalDetail?.name) {
        this.settingSchemaMarkupForProfile(reviewArray);
      }

    });
  }

  // ✅ SEO: Set canonical URL to avoid duplicate content
  settingCanonicalUrl() {
    this.seoService.setCanonicalUrl();
  }

  settingSchemaMarkupForProfile(reviewArray: any = "") {
    let timeArray: any = [];
    // ✅ OPTIMIZED: Backend now only returns day fields (mon-sun), no filtering needed
    for (let key in this.hospitalDetail?.establishmentTiming) {
      let hrsString;
      let startTime =
        this.hospitalDetail?.establishmentTiming?.[key]?.[0]?.["from"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[1]?.["from"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[2]?.["from"];
      let endTime =
        this.hospitalDetail?.establishmentTiming?.[key]?.[2]?.["to"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[1]?.["to"] ||
        this.hospitalDetail?.establishmentTiming?.[key]?.[0]?.["to"];
      if (startTime && endTime) {
        hrsString = this.formatTime.convertTo24HourFormat(startTime, endTime);
        let timeString = `${key.slice(0, 2)} ${hrsString}`;
        timeArray.push(timeString);
      }
    }
    const aggregateRating =
      this.hospitalDetail?.rating > 0 && this.hospitalDetail?.reviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: this.hospitalDetail?.rating,
            reviewCount: this.hospitalDetail?.reviews }
        : undefined;

    // ✅ OPTIMIZED: Determine schema type from hospitalTypeCategory OR hospitalType string
    const htCat = this.hospitalDetail?.hospitalTypeCategory;
    const htName = (this.hospitalDetail?.hospitalType || '').toLowerCase();
    const schemaType = (htCat == 1 || htName === 'hospital') ? "Hospital" : "MedicalClinic";

    const city = this.commonService.replaceSpaceWithHyphen(this.meta_city || '');
    const canonicalUrl = `${this.document.location.origin}/${city}/${this.typeSlug}/${this.activatedRoute.snapshot.params?.['slug']}`;

    // ✅ ENHANCED: Build sameAs array from social media links
    const sameAsLinks = (this.hospitalDetail?.social || [])
      .map((s: any) => s?.url)
      .filter((url: string) => url && url.startsWith('http'));

    const jsonLdData: any = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "@id": canonicalUrl,
      name: this.hospitalDetail?.name,
      url: canonicalUrl,
      // ✅ ENHANCED: Full PostalAddress with addressCountry
      address: {
        "@type": "PostalAddress",
        streetAddress: this.hospitalDetail?.address?.locality,
        addressLocality: this.hospitalDetail?.address?.city,
        addressRegion: this.hospitalDetail?.address?.state || this.hospitalDetail?.stateName?.name,
        postalCode: this.hospitalDetail?.address?.pincode,
        addressCountry: "IN" },
      openingHours: timeArray,
      medicalSpecialty: this.hospitalDetail?.specialization?.map((item: any) => item?.name),
      review: reviewArray,
      // ✅ ENHANCED: Image as direct URL string array (preferred by Google)
      image: this.hospitalDetail?.profilePic
        ? [this.hospitalDetail.profilePic]
        : undefined,
      geo: {
        "@type": "GeoCoordinates",
        latitude: this.hospitalDetail?.location?.coordinates?.[1],
        longitude: this.hospitalDetail?.location?.coordinates?.[0] },
      // ✅ NEW: isAcceptingNewPatients for medical facilities
      isAcceptingNewPatients: this.hospitalDetail?.claimProfile ? true : undefined };

    // Add sameAs if social links exist
    if (sameAsLinks.length > 0) {
      jsonLdData.sameAs = sameAsLinks;
    }

    // Add aggregateRating if valid
    if (aggregateRating) {
      jsonLdData.aggregateRating = aggregateRating;
    }

    // ✅ NEW: Add availableService for medical specialties
    const specFromPipeline = this.hospitalDetail?.specialization?.map((item: any) => item?.name).filter(Boolean);
    const specialties = specFromPipeline?.length ? specFromPipeline : (this.hospitalDetail?.docSpecializationNames || []);
    if (specialties?.length) {
      jsonLdData.availableService = specialties.map((spec: string) => ({
        "@type": "MedicalTherapy",
        name: spec }));
    }

    // ✅ NEW: Add number of beds for hospitals
    if (this.hospitalDetail?.bedCount) {
      jsonLdData.numberOfBeds = this.hospitalDetail.bedCount;
    }

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  FindHospitalsNearMe() {
  this.apiService
    .getNearByHospital(this.Current_hospitalId, this.Currrent_hospital_location)
    .subscribe((res: any) => {
      this.HospitalURLS = res?.result.slice(0, 15);
      this.hospitalDetailService.setHospitalURLs(this.HospitalURLS);
    });
}

  receiveDocSpec(data: any) {
    this.doc_specialization = data;
  }

  trackByName(index: number, item: any): string { return item?.name || index; }
  trackByIndex(index: number): number { return index; }
}
