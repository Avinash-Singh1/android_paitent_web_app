import { DeviceService } from "src/app/services/device.service";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Renderer2, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { ShareModalComponent } from "src/app/shared/components/share-modal/share-modal.component";
import { LoginModalComponent } from "../login-modal/login-modal.component";
import { LocalStorageService } from "src/app/services/storage.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { Observable, Subject, debounceTime, fromEvent, takeUntil } from "rxjs";
import { SearchService } from "src/app/services/search.service";
import { NgZone } from "@angular/core";
import { CommonModule, DatePipe, Location, isPlatformBrowser } from '@angular/common';
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { SelectEstablishmentComponent } from "../select-establishment/select-establishment.component";
import { BottomSheetClinicVisitComponent } from "src/app/shared/components/bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { SearchSuggestionsMobileComponent } from "src/app/shared/components/search-suggestions-mobile/search-suggestions-mobile.component";
import { CommonService } from "src/app/services/common.service";
import { Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";
import { FormatarrayPipe } from "src/app/shared/pipes/formatarray.pipe";
import { FormatTimeService } from "src/app/services/format-time.service";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';
import { SharedModule } from "src/app/shared/shared.module";
import { AngularSvgIconModule } from "angular-svg-icon";
import { DoctorProfileSkeletonComponent } from "./doctor-profile-skeleton/doctor-profile-skeleton.component";
// import { AppState } from "src/app/store/counter.state";
// import { Store } from "@ngrx/store";
// import { selectDeviceWidth, selectGeolocation } from "src/app/store/app.selectors";

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, AngularSvgIconModule, DoctorProfileSkeletonComponent],
  selector: "nectar-doctor-details",
  templateUrl: "./doctor-details.component.html",
  styleUrls: ["./doctor-details.component.scss"],
  providers: [] })
export class DoctorDetailsComponent implements OnInit, OnDestroy {
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  public readonly deviceService = inject(DeviceService);
  private destroy$ = new Subject<void>();
  bookAppointment: boolean = false;
  currentCity: any;
  isScrolled: boolean = false;

  deviceWidth$: Observable<number>;
  geolocation$: Observable<{ latitude: number; longitude: number }>;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private localStorage: LocalStorageService,
    private eventService: EventService,
    private gService: GoogleMapsService,
    public locations: Location,
    private _bottomSheet: MatBottomSheet,
    private datePipe: DatePipe,
    public commonService: CommonService,
    private title: Title,
    private seoService: SeoService,
    private formatPipe: FormatarrayPipe,
    private _renderer2: Renderer2,
    private formatTime: FormatTimeService,
    // private store: Store<{ app: AppState }>,
    @Inject(DOCUMENT) public document: any,
    private http: HttpClient,
    private ngZone: NgZone,
    public searchService: SearchService
  ) {

    // browser-safe: returns UA-based width (375/768/1440) during initial render,
    // window.innerWidth in browser — so initial render and hydration agree.
    this.deviceWidth = this.commonService.gettingWinowWidth();

  }

  doctorId: any;
  userId: any;

  estabId: string;
  docSlug: string;
  deviceWidth: number; // Set in constructor via commonService.gettingWinowWidth()
  doctor_Specialization: any;
  city: any;
  message: string;
  oninitLocationFocusFlag: any = true
  phoneNumber = environment.mobile;

  ngOnInit(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.localStorage.removeItem("viewDoctorProfileFlag")
    this.getCurrentCity();
    this.activateRoute.params.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.docSlug = res?.slug;
      this.city = this.commonService.replaceHyphenWithSpace(res?.city);
      this.selected = 0;

      // ✅ OPTIMIZED: Call doctorAboutUs directly with slug — eliminates slug-for-id round trip
      this.getDoctorDetail();
      this.cdr.markForCheck();
    });

    // Hide global mobile header — this page renders its own mobile header via CSS
    this.eventService.broadcastEvent("remove-header-mobile", true);

    // this.get_All_procedure();
  }

metatitleText:string;
metadescription:string
settingTagsAndTitles() {
  const fullName = this.doctorDetail?.fullName || '';
  const specialization = this.formatPipe.transform(this.doctorDetail?.specialization, "name") || '';
  const locality = this.selectedHospital?.address?.locality || '';
  const city = this.selectedHospital?.address?.city || '';
  const state = this.doctorDetail?.state || '';

  // console.log("state: ",this.doctorDetail);
  const locationText = locality
    ? `${locality}, ${city}, ${state}`
    : `${city}, ${state}`;

  const fee = this.doctorDetail?.videoConsultationFees ?? 500;

  // const description = `Consult experienced ${specialization} ${fullName} at ${this.establishmentName}, ${locationText} (${this.doctorDetail.experience}+ years). Get compassionate online care for illnesses & wellness for just ₹${this.doctorDetail.videoConsultationFees}. Book your in-clinic/video Consultation today | Nectarplus.health`;

  // const description = `Consult experienced ${specialization} ${fullName} in ${locationText} (${this.doctorDetail.experience}+ years). Get compassionate online care for illnesses & wellness for just ₹${this.doctorDetail.videoConsultationFees}. Book your in-clinic/video Consultation today | Nectarplus.health`;
  // const description = `${fullName} is ${specialization} in ${locationText}. Book appointments Online, View Fees, Patient Testimonials for ${fullName} | Nectar Health`;
  if(this.establishmentName!="Video Consultation Only"){

  this.metatitleText = `${fullName}- Best ${specialization} at ${this.establishmentName}, ${locationText} | Nectarplus.health`;

   this.metadescription = `Consult experienced ${specialization} ${fullName} at ${this.establishmentName}, ${locationText} (${this.doctorDetail?.experience}+ years). Get compassionate online care for illnesses & wellness for just ₹${fee}. Book your in-clinic/video Consultation today at ${this.establishmentName}| Nectarplus.health`;
  }
  else{
    this.metatitleText = `${fullName}- Best ${specialization}, ${locationText} | Nectarplus.health`;

   this.metadescription = `Consult experienced ${specialization} ${fullName}, ${locationText} (${this.doctorDetail?.experience}+ years). Get compassionate online care for illnesses & wellness for just ₹${fee}. Book your in-clinic/video Consultation today at ${this.establishmentName}| Nectarplus.health`;

  }
  // const titleText = `${fullName}- Best ${specialization} at ${this.establishmentName}, ${locationText} - Online Doctor Consultation in ${city}| Nectarplus.health`;

  this.title.setTitle(this.metatitleText);

  this.seoService.updateTags([
    { name: "description", content: this.metadescription },
    { property: "og:title", content: this.metatitleText },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: `https://nectarplus.health/${this.city}/doctor/${this.docSlug}` },
    { property: "og:image", content: this.doctorDetail?.profilePic || 'https://nectarplus.health/assets/images/svg/nectarLogo.png' },
    { property: "og:description", content: this.metadescription },
    { property: "og:image:alt", content: "A photo of a doctor looking at a computer." },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "628" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: `https://nectarplus.health/${this.city}/doctor/${this.docSlug}` },
    { name: "twitter:title", content: this.metatitleText },
    { name: "twitter:description", content: this.metadescription },
    { name: "twitter:image", content: this.doctorDetail?.profilePic || 'https://nectarplus.health/assets/images/svg/nectarLogo.png' },
  ]);
}
settingTagsAndTitles_original() {
  const fullName = this.doctorDetail?.fullName || '';
  const specialization = this.formatPipe.transform(this.doctorDetail?.specialization, "name") || '';
  const locality = this.selectedHospital?.address?.locality || '';
  const city = this.selectedHospital?.address?.city || '';
  const state = this.doctorDetail?.state || '';

  // console.log("state: ",this.doctorDetail);
  const locationText = locality
    ? `${locality}, ${city}, ${state}`
    : `${city}, ${state}`;

  const description = `${fullName} is ${specialization} in ${locationText}. Book appointments Online, View Fees, Patient Testimonials for ${fullName} | Nectar Health`;

  const titleText = `${fullName}- ${specialization} - Book Doctor Appointment Online, View Fees, Patient Stories | Nectar Health`;

  this.title.setTitle(titleText);

  this.seoService.updateTags([
    { name: "description", content: description },
    { property: "og:title", content: titleText },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: `https://nectarplus.health/${this.city}/doctor/${this.docSlug}` },
    { property: "og:image", content: this.doctorDetail?.profilePic || 'https://nectarplus.health/assets/images/svg/nectarLogo.png' },
    { property: "og:description", content: description },
    { property: "og:image:alt", content: "A photo of a doctor looking at a computer." },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "628" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: `https://nectarplus.health/${this.city}/doctor/${this.docSlug}` },
    { name: "twitter:title", content: titleText },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: this.doctorDetail?.profilePic || 'https://nectarplus.health/assets/images/svg/nectarLogo.png' },
  ]);
}

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, "scroll")
        .pipe(debounceTime(100), takeUntil(this.destroy$))
        .subscribe(() => {
          const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
          this.ngZone.run(() => {
            this.scrollTop = scrollPosition;
            this.isScrolled = scrollPosition > 100;
            this.cdr.markForCheck();
          });
        });
    });

    this.activateRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params["city"]) {
        let city = this.commonService.titleCase(
          this.commonService.replaceHyphenWithSpace(params["city"])
        );

        if (params["locality"]) {
          let locality = this.commonService.titleCase(
            this.commonService.replaceHyphenWithSpace(params["locality"])
          );
        }

        setTimeout(() => {
          this.localStorage.setItem("search-address", city);
        });
      }
    });
  }

  selected = 0;

  tabContent: any = [
    {
      name: "About",
      img: "assets/images/svg/info-icon.svg" },
    {
      name: "Services",
      img: "assets/images/svg/services.svg" },
    // {
    //   name: "Procedure",
    //   img: "assets/images/svg/services.svg",
    //   count: 0,
    // },
    {
      name: "Videos",
      img: "assets/images/svg/videos.svg" },
    {
      name: "FAQs",
      img: "assets/images/svg/faq.svg" },
    {
      name: "Review",
      img: "assets/images/svg/review.svg",
      count: 0 }

  ];

  openShareDialog() {
    this.dialog.open(ShareModalComponent, {
      panelClass: "shareModal",
      data: { name: "doctor profile" },
      scrollStrategy: new NoopScrollStrategy() });
  }

  openLoginDialog() {
    this.dialog.open(LoginModalComponent, {
      disableClose: true,
      data: {
        name: JSON.stringify(this.doctorDetail?.fullName),
        type: "doctor",
        claimProfile: true,
        profile: this.doctorDetail?.profilePic, // Send the entire doctor profile
        specializationName: this.doctorDetail?.specialization[0]?.name // Send Specialization.name
      },
      autoFocus: false });
  }
doctorDetail: any;
selectedHospital: any;
dataLoaded = false;
  // At the top of your component.ts
doctorDetailSubject = new BehaviorSubject<any>(null);
selectedHospitalSubject = new BehaviorSubject<any>(null);
doctorDetail$ = this.doctorDetailSubject.asObservable();
selectedHospital$ = this.selectedHospitalSubject.asObservable();

// SEO properties
seoData: any[] = [];
doctorSearchTerm: string = '';
hospitalURLs: any[] = [];

getDoctorDetail() {
  if (!this.docSlug) return;

  // Avoid loader flicker during fast profile transitions.

  this.apiService.get(`${API_ENDPOINTS.patient.doctorDetail}`, {
        doctorProfileSlug: this.docSlug })
    .subscribe((res: any) => {
      this.doctorDetail = res?.result[0];

      if (!this.doctorDetail) {
        this.router.navigate(["/404"]);
        return;
      }

      // ✅ Extract doctorId from response — no separate slug-for-id call needed
      this.doctorId = this.doctorDetail._id;

      // ✅ Find establishment matching the URL city
      const cityLower = this.city?.toLowerCase();
      const matchingEstab = this.doctorDetail?.establishmentmaster?.find(
        (e: any) => e?.address?.city?.toLowerCase() === cityLower
      );
      this.selectedHospital = matchingEstab || this.doctorDetail?.establishmentmaster?.[0];

      if (!this.selectedHospital) {
        this.router.navigate(["/404"]);
        return;
      }

      this.estabId = this.selectedHospital?._id;

      // ✅ SEO CRITICAL: Prepare SEO data IMMEDIATELY for View Source
      this.prepareSeoData();

      // ✅ OLD BehaviorSubject code (comment out - causes render timing issues)
      // this.doctorDetailSubject.next(this.doctorDetail);
      // this.selectedHospitalSubject.next(this.selectedHospital);

      // Loader removed — no overlay flash needed
      this.dataLoaded = true;
      this.cdr.markForCheck();

      // Set canonical URL and robots for SEO
      this.seoService.setCanonicalUrl();
      this.seoService.indexAndFollowRobot();

      this.getAppointmentCounts(this.doctorId, this.selectedHospital?._id);
      this.settingSchemaMarkUpForBreadcrumb();
      this.settingSchemaMarkupForProfile();
      this.gettingReviewData();

      if (!this.doctorDetail.profilePic) {
        this.doctorDetail.profilePic = "assets/images/svg/Nectar Favicon.svg";
      }

      this.tabContent[4].count = this.doctorDetail?.totalReview || 0;
      this.doctor_Specialization = this.doctorDetail?.specialization;

      this.localStorage.removeItem("doctor-detail");

      let obj: any = {
        fullname: this.doctorDetail?.fullName,
        specialization: this.doctorDetail?.specialization,
        address: `${this.selectedHospital?.address?.locality || ""}, ${this.selectedHospital?.address?.city || ""}`,
        city: this.selectedHospital?.address?.city,
        doctorProfileSlug: this.doctorDetail?.doctorProfileSlug,
        doctorId: this.doctorId,
        doctorPic: this.doctorDetail?.profilePic,
        consultationFees: this.doctorDetail?.consultationFees,
        videoConsultationFees: this.doctorDetail?.videoConsultationFees,
        consultationDetails: this.doctorDetail?.consultationDetails,
        consultationType: this.doctorDetail?.consultationType,
        profilePic: this.doctorDetail?.profilePic
      };

      this.localStorage.setItem("doctor-detail", JSON.stringify(obj));
      this.localStorage.setItem("doctorInformation", JSON.stringify(obj));

      this.message = `Hi Nectar+ Health, I'm interested in booking a appointment with ${this.doctorDetail?.fullName} (${window?.location}). Can you provide me with some more information?`;

      // Defer non-critical API calls to browser — they don't need to block initial render
      if (this.isBrowser) {
        this.get_All_procedure();
      }
    });
}

/**
 * ✅ SEO-CRITICAL: Prepares SEO data for View Source visibility
 */
private prepareSeoData(): void {
  // 1. SEO Description Data (VIEW SOURCE VISIBLE)
  if (this.doctorDetail?.specialization?.length) {
    const specializationNames = this.formatPipe.transform(this.doctorDetail.specialization, "name") || '';
    const city = this.selectedHospital?.address?.city || '';
    const locality = this.selectedHospital?.address?.locality || '';

    this.seoData = [{
      description: `Find the best ${specializationNames} doctors in ${city}${locality ? `, ${locality}` : ''}. Book appointments online with top-rated specialists.`,
      sections: [
        {
          title: "Why Choose Our Doctors",
          content: `${specializationNames} in ${city}<br>Top-rated specialists<br>Online & in-clinic consultations<br>Verified credentials`
        },
        {
          title: "Services Offered",
          content: this.doctorDetail?.service?.map((s: any) => s.name).join('<br>') || ''
        }
      ]
    }];
  }

  // 2. Doctor search term (VIEW SOURCE VISIBLE)
  this.doctorSearchTerm = this.formatPipe.transform(this.doctorDetail?.specialization, "name") || '';

  // 3. Hospital URLs (VIEW SOURCE VISIBLE)
  if (this.doctorDetail?.establishmentmaster?.length) {
    this.hospitalURLs = this.doctorDetail.establishmentmaster.slice(0, 10).map((hospital: any) => ({
      name: hospital.name || 'Hospital',
      profileSlug: hospital.establishmentProfileSlug || hospital._id,
      address: {
        city: hospital.address?.city || this.city || 'City',
        locality: hospital.address?.locality || ''
      }
    }));
  }

  // 4. Trigger change detection
  this.cdr.markForCheck();
}

  setdigitalSCript() {
    this.seoService.appendScript(
      ` function gtag_report_conversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-11399196295/UzysCPutmPgYEIfdx7sq',
      'event_callback': callback
  })
`,
      this._renderer2
    );
  }

  hospitalData: any;
  enableBackdrop(e: any) {
    this.hospitalData = e;
    this.bookAppointment = true;
    if (this.isBrowser) {
      window.scroll(0, 0);
    }
  }

  getCurrentCity() {
    this.activateRoute.params.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res.city) {
        this.searchService.currentCity = res.city;
        this.currentCity = res.city;
        this.localStorage.setItem("city", res.city);
      }
      if (res.locality) {
        this.searchService.currentCity = res.locality;
        this.currentCity = res.locality;
        this.localStorage.setItem("locality", res.locality);
      }
    });
  }

  tabChange(index: number) {
    this.selected = index;
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  tabChangeReview() {
    this.tabChange(4);
  }

  openBottomSheet(type: any, data: any = {}, date1: any = new Date()) {
    // Blur active element to prevent aria-hidden conflict when CDK overlay opens
    if (this.isBrowser && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    let date = this.datePipe.transform(date1 || new Date(), "EEE, d MMM");

    if (type == "Hospital") {
      let bottomsheet = this._bottomSheet.open(SelectEstablishmentComponent, {
        data: { doctorId: this.doctorId, type: "doctor-listing" } });

      bottomsheet.afterDismissed().subscribe((res: any) => {
        if (res) {
          this.selectedHospital = this.doctorDetail?.establishmentmaster.find(
            (obj) => obj._id === res._id
          );
          this.getAppointmentCounts(this.doctorId, this.selectedHospital._id);
          this.cdr.markForCheck();
        }
      });
    } else {
      this._bottomSheet.open(BottomSheetClinicVisitComponent, {
        data: {
          newsId: this.doctorId,
          establishmentIds: this.estabId,
          date } });
      // this.eventService.broadcastEvent("hospital-data", { _id: this.estabId });
    }
  }

  dateRange: any = [];
  getAppointmentCounts(doctorId, hospitalId) {
    if (this.isBrowser && this.deviceWidth < 767) {
      let payload = {
        doctorId: doctorId,
        establishmentId: hospitalId };
      this.apiService
        .get(`${API_ENDPOINTS.patient.getAppointmentCountsDaily}`, payload)
        .subscribe({
          next: (res: any) => {
            this.dateRange = res?.result?.dateRange;
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.dateRange = [];
            this.cdr.markForCheck();
          } });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Restore global mobile header when leaving this page
    this.eventService.broadcastEvent("remove-header-mobile", false);
  }

  openBottomSheet1() {
    if (this.deviceWidth < 767) {
      this._bottomSheet.open(SearchSuggestionsMobileComponent, {
        data: { type: "both" },
        panelClass: "search-bottom-sheet" });
    }
  }

  scrollTop: any;

  scrollToBooking() {
    if (!this.isBrowser) return;
    const sidebar = document.querySelector('.doctor-details__sidebar');
    if (sidebar) {
      sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  formatName(value: any, maxLength) {
    if (value?.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }

  breadcrumbRedirection(type: any) {
    const city = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail?.establishmentmaster[0]?.address?.city
    );
    const specailization = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail.specialization?.[0]?.name
    );
    if (type != "city") {
      const locality = this.commonService.replaceSpaceWithHyphen(
        this.doctorDetail?.establishmentmaster[0]?.address?.locality
      );
      this.localStorage.setItem("search-address", locality);
      this.router.navigate([`/${city}/${specailization}/${locality}`]);
    } else {
      this.localStorage.setItem("search-address", city);
      this.router.navigate([`/${city}/${specailization}`]);
    }
  }

settingSchemaMarkUpForBreadcrumb() {
  const baseUrl = 'https://nectarplus.health';
  const city = this.commonService.replaceSpaceWithHyphen(
    this.doctorDetail?.establishmentmaster[0]?.address?.city || ''
  );
  const specialization = this.commonService.replaceSpaceWithHyphen(
    this.doctorDetail?.specialization?.[0]?.name || ''
  );
  const locality = this.commonService.replaceSpaceWithHyphen(
    this.selectedHospital?.address?.locality || ''
  );
  const doctorSlug = this.doctorDetail?.doctorProfileSlug || '';

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@id": `${baseUrl}/`,
          "@type": "WebPage",
          name: "Home" } },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@id": `${baseUrl}/${city}/${specialization}`,
          "@type": "WebPage",
          name: `${this.selectedHospital?.address?.city || city.replace(/-/g, ' ')} ${this.doctorDetail?.specialization[0]?.name || ''}` } },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@id": `${baseUrl}/${city}/${specialization}/${locality || ''}`.replace(/\/$/, ''),
          "@type": "WebPage",
          name: this.selectedHospital?.address?.locality || 'Locality' } },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@id": `${baseUrl}/${city}/doctor/${doctorSlug}`,
          "@type": "ProfilePage",
          name: this.doctorDetail?.fullName || '' } },
    ] };

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
      if (this.doctorDetail && this.doctorDetail?.name) {
        this.settingSchemaMarkupForProfile(reviewArray);
      }

    });
  }

  // settingSchemaMarkupForProfile_orignal(reviewArray: any = []) {

  //   const doc = this.doctorDetail;
  //   const hospital = doc?.establishmentmaster?.[0];

  //   // Format opening hours
  //   const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  //   const timing = hospital?.establishmenttiming?.[0] || {};
  //   const openingHours = [];

  //   for (const day of days) {
  //     const slots = timing[day];
  //     if (slots?.length) {
  //       slots.forEach((slot: any) => {
  //         const from = this.convertTo24HourFormatOnly(slot?.from);
  //         const to = this.convertTo24HourFormatOnly(slot?.to);
  //         if (from && to) {
  //           openingHours.push(`${day.slice(0, 2).toUpperCase()} ${from}-${to}`);
  //         }
  //       });
  //     }
  //   }

  //   const address: any = {
  //     "@type": "PostalAddress",
  //     "streetAddress": `${hospital?.address?.landmark}, ${hospital?.address?.locality}`,
  //     "addressLocality": hospital?.address?.city,
  //     "addressRegion": hospital?.stateName?.[0],
  //     "addressCountry": "IN"
  //   };

  //   if (hospital?.address?.pincode) {
  //     address.postalCode = hospital.address.pincode;
  //   }

  //   const jsonLdData: any = {
  //     "@context": "https://schema.org",
  //     "@type": "Physician",
  //     "name": doc?.fullName,
  //     "description": doc?.about,
  //     "url": this.document.location.href,
  //     "image": doc?.profilePic,
  //     "telephone": doc?.phone,
  //     "email": doc?.email,
  //     "hasCertification": doc?.medicalRegistration?.[0]?.registrationNumber
  //       ? `Certified by ${doc?.medicalRegistration?.[0]?.council}, Reg# ${doc?.medicalRegistration?.[0]?.registrationNumber}`
  //       : undefined,
  //     "isAcceptingNewPatients": true,
  //     "medicalSpecialty": doc?.specialization?.map((spec: any) => spec.name),
  //     "availableService": doc?.service?.map((srv: any) => ({
  //       "@type": "MedicalProcedure",
  //       "name": srv.name
  //     })),
  //     "hospitalAffiliation": hospital
  //       ? {
  //           "@type": "Hospital",
  //           "name": hospital.name,
  //           "address": address
  //         }
  //       : undefined,
  //       "address": hospital ? address : undefined,
  //     "geo": {
  //       "@type": "GeoCoordinates",
  //       "latitude": hospital?.location?.coordinates?.[1],
  //       "longitude": hospital?.location?.coordinates?.[0]
  //     },
  //     "openingHours": openingHours.length ? openingHours : undefined,
  //     "priceRange": `₹${doc?.consultationFees}`,
  //     ...(doc?.rating > 0 && doc?.totalReview > 0 && {
  //       aggregateRating: {
  //         "@type": "AggregateRating",
  //         ratingValue: doc.rating,
  //         reviewCount: doc.totalReview
  //       }
  //     }),
  //     ...(reviewArray?.length > 0 && {
  //       review: reviewArray
  //     }),
  //     "sameAs": doc?.social?.map((s: any) => s?.url)
  //   };
  //   this.seoService.setJsonLd(this._renderer2, jsonLdData);
  // }

  settingSchemaMarkupForProfile(reviewArray: any[] = []): void {
  if (!this.doctorDetail) return;

  const doc = this.doctorDetail;
  const hospital = doc?.establishmentmaster?.[0];

  /* ---------------- VALID medicalSpecialty ENUM ---------------- */
  const allowedSpecialties: Record<string, string> = {
    orthopedics: "https://schema.org/Orthopedic",
    orthopedic: "https://schema.org/Orthopedic",
    dentist: "https://schema.org/Dentistry",
    dermatologist: "https://schema.org/Dermatology",
    cardiologist: "https://schema.org/Cardiovascular"
  };

  const medicalSpecialty = doc?.specialization
    ?.map((s: any) => {
      const key = s?.name?.toLowerCase();
      return allowedSpecialties[key];
    })
    .filter(Boolean);

  /* ---------------- Opening Hours (FIXED) ---------------- */
  const dayMap: any = {
    mon: "https://schema.org/Monday",
    tue: "https://schema.org/Tuesday",
    wed: "https://schema.org/Wednesday",
    thu: "https://schema.org/Thursday",
    fri: "https://schema.org/Friday",
    sat: "https://schema.org/Saturday",
    sun: "https://schema.org/Sunday"
  };

  const openingHoursSpecification: any[] = [];
  const timing = hospital?.establishmenttiming?.[0];

  if (timing) {
    Object.keys(dayMap).forEach((day) => {
      const slots = timing[day];
      if (Array.isArray(slots)) {
        slots.forEach((slot: any) => {
          const opens = this.convertTo24HourFormatOnly(slot?.from);
          const closes = this.convertTo24HourFormatOnly(slot?.to);

          if (opens && closes) {
            openingHoursSpecification.push({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: dayMap[day],
              opens,
              closes
            });
          }
        });
      }
    });
  }

  /* ---------------- Address FIX ---------------- */
  const address = hospital?.address
    ? {
        "@type": "PostalAddress",
        streetAddress: [
          hospital.address.landmark,
          hospital.address.locality
        ].filter(Boolean).join(", "),
        addressLocality: hospital.address.city,
        addressRegion: hospital.stateName?.[0], // STATE ONLY
        postalCode: hospital.address.pincode,
        addressCountry: "IN"
      }
    : undefined;

  /* ---------------- Physician Schema ---------------- */
  const jsonLdData: any = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${this.document.location.href}#physician`,
    name: doc.fullName,
    description: doc.about,
    url: this.document.location.href,
    image: doc.profilePic,

    medicalSpecialty: medicalSpecialty?.length ? medicalSpecialty : undefined,

    isAcceptingNewPatients: true,

    priceRange:
      doc?.consultationFees && doc.consultationFees > 0
        ? `₹${doc.consultationFees}`
        : undefined,

    address,
    geo: hospital?.location?.coordinates
      ? {
          "@type": "GeoCoordinates",
          latitude: hospital.location.coordinates[1],
          longitude: hospital.location.coordinates[0]
        }
      : undefined,

    openingHoursSpecification:
      openingHoursSpecification.length > 0
        ? openingHoursSpecification
        : undefined,

    hospitalAffiliation: hospital
      ? {
          "@type": "Hospital",
          name: hospital.name,
          address
        }
      : undefined,

    availableService: doc?.service?.map((srv: any) => ({
      "@type": "MedicalProcedure",
      name: srv.name
    })),

    ...(doc?.rating > 0 &&
      doc?.totalReview > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: doc.rating,
          reviewCount: doc.totalReview
        }
      }),

    ...(reviewArray?.length > 0 && { review: reviewArray }),

    sameAs: doc?.social?.map((s: any) => s.url).filter(Boolean)
  };

  this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  convertTo24HourFormatOnly(timeStr: string): string {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  menus: any = [
    {
      name: "Find the doctors",
      route: "/hospital-list",
      icon: "assets/images/svg/search.svg" },
    {
      name: "Surgeries",
      route: "/delhi/treatment",
      icon: "assets/images/svg/mat-surgeries.svg" },
    {
      name: "Medicines",
      route: "/medicines",
      icon: "assets/images/medicine.svg" },
    {
      name: "Blog/News",
      route: "https://blog.nectarplus.health/",
      icon: "assets/images/svg/blog.svg" },
    {
      name: "List your practice for Free",
      route: "https://doctor.nectarplus.health/",
      // icon: "assets/images/svg/mat-per.svg"
    },
    {
      name: "Contact Us",
      route: "/contact-us",
      icon: "assets/images/svg/email.svg" },
    {
      name: "Privacy & Policy",
      route: "/privacy-policy",
      icon: "assets/images/svg/mat-privacy.svg" },
    {
      name: "Terms & Conditions",
      route: "/terms-conditions",
      icon: "assets/images/svg/mat-terms.svg" },
  ];

  filteredDocProcedure$ = new BehaviorSubject<any[]>([]);

  get_All_procedure() {
    const url = `${API_ENDPOINTS.MASTER.procedure}`;
    this.http.get<any>(url).subscribe((res) => {
      if (res.result) {
        const specializationIds = this.doctor_Specialization.map(specialization => specialization._id);
        const filteredProcedures = res.result.data.filter((procedure: any) =>
          specializationIds.includes(procedure.specializationId)
        );

        this.filteredDocProcedure$.next([...filteredProcedures]);
        this.cdr.markForCheck();
      }
    });
  }

  establishmentName:string;
  receive_EstablishEvent(val:any){
    this.establishmentName=val;
    this.settingTagsAndTitles();
  }

  trackByName(index: number, item: any): string { return item?.name || index; }
  trackByIndex(index: number): number { return index; }
}
