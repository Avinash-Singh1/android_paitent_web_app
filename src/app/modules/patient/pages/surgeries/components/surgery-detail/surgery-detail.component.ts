import { Component, Inject, OnInit, Renderer2, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer, SafeHtml, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { ImageViewModalComponent } from "src/app/shared/image-view-modal/image-view-modal.component";
import { environment } from "src/environments/environment";
import { EnquiryComponent } from "../enquiry/enquiry.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { surgeriesData, cardsection, rattingclient, compersion_list } from "./contantsurgres"  // Import the data
import { CommonService } from "src/app/services/common.service";

@Component({
  standalone: false,
  selector: "nectar-surgery-detail",
  templateUrl: "./surgery-detail.component.html",
  styleUrls: ["./surgery-detail.component.scss"] })
export class SurgeryDetailComponent implements OnInit {
  public surgeries = surgeriesData;
  public cardscontent = cardsection;
  public reviewratting = rattingclient;
  public compersion = compersion_list;
  public city_id = "";
  linkArray: { url: string, title: string }[] = [];

  componentArray: any;
  mobileseolink: string='';
  datastring: string = "";
  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private bottomSheet: MatBottomSheet,
    private eventService: EventService,
    private title: Title,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private router: Router,
    private datePipe: DatePipe,
    private commonService: CommonService,
    @Inject(DOCUMENT) public document: any) { }

  deviceWidth: any;
  payload: any = {
    page: 1,
    size: 14,
    sort: "title",
    sortOrder: "ASC" };
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.payload.size = this.deviceWidth > 767 ? 14 : 10;

    this.activateRoute.paramMap.subscribe((res: any) => {
      if (res?.params?.slug) {
        // console.log("res?.params: ",res?.params);
        this.surgeryId = res?.params?.slug;
        if (res?.params?.city)
          this.city_id = res?.params?.city;
        this.getDetail();
        this.getListing();
        this.getFAQ();
        this.getoverviewFAQ();
      }
    });

    this.isExpanded = this.faqOverviewArray.map(() => false);

  }

  popular_sergury:any;
  data: any;
  surgeryCount: number;
  getListing() {
this.apiService.get(API_ENDPOINTS.patient.getSurgeryList, this.payload).subscribe((res: any) => {
      this.surgeryCount = res?.result?.count;
      this.popular_sergury= res?.result?.data;
      if (this.payload.size) {
        this.data = res?.result?.data.slice(0, this.payload.size);
      } else {
        this.data = res?.result?.data;
      }
    });
  }

  settingTagsAndTitles() {
    this.title.setTitle(this.surgeryDetail?.seoTitle + ` in ${this.city_id}`);
    this.seoService.updateTags([
      {
        name: "description",
        content: this.surgeryDetail?.seoDescription || "" },
      {
        property: "og:title",
        content: this.surgeryDetail?.seoTitle },
      {
        property: "og:type",
        content: "website" },
      {
        property: "og:url",
        content: this.document.location.href },
      {
        property: "og:image",
        content: this.surgeryDetail?.components?.[0]?.image[0] },
      {
        property: "og:description",
        content: this.surgeryDetail?.seoDescription || "" },
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
        content: this.surgeryDetail?.seoTitle },
      {
        name: "twitter:description",
        content: this.surgeryDetail?.seoDescription || "" },
      {
        name: "twitter:image",
        content: this.surgeryDetail?.components?.[0]?.image[0] },
    ]);
  }

  faqArray: any = [];
  faqOverviewArray: any[] = [];
  surgeryId: any;
  surgeryDetail: any;
  isExpanded: boolean[] = [];

  getDetail() {
this.apiService.get(`${API_ENDPOINTS.patient.viewSurgery}`, { slug: this.surgeryId }).subscribe((res: any) => {
        this.surgeryDetail = res?.result;
        this.datastring = this.surgeryDetail?.mobileseolink;
        this.linkArray = this.extractLinks(this.datastring);
        // this.mobileseolink = this.surgeryDetail?.mobileseolink;
        this.settingSchemaMarkUp();
        this.settingTagsAndTitles();
        this.message = `Hi Nectar+ Health, I'm interested in learning more about the treatment/surgery(${this.surgeryDetail?.title}). Can you provide me with some more information?`;
      });
  }

  viewImage(url: any) {
    this.dialog.open(ImageViewModalComponent, {
      data: url,
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy() });
  }

  phoneNumber = environment.mobile;
  message: any;
  get whatsappLink(): string {
    return `https://api.whatsapp.com/send?phone=${this.phoneNumber}&text=${encodeURIComponent(this.message)}`;
  }
  setdigitalSCript() {
    if (this.isBrowser) {
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
  }
  sanitizedDescription(data: any): SafeHtml {
    const unsafeDescription = data || "";
    return this.sanitizer.bypassSecurityTrustHtml(unsafeDescription);
  }

  openBottomSheet() {
    this.bottomSheet.open(EnquiryComponent, {
      panelClass: 'enq-sheet-panel' });
    this.eventService.broadcastEvent("remove-margin", true);
  }

  getFAQ() {
this.apiService.get(`${API_ENDPOINTS.patient.faqSurgeryWise}`, {
        slug: this.surgeryId }).subscribe((res: any) => {
      this.faqArray = res?.result?.data;
    });
  }
  getoverviewFAQ() {
this.apiService.get(`${API_ENDPOINTS.patient.OverviewfaqSurgeryWise}`, {
        slug: this.surgeryId }).subscribe((res: any) => {
      this.faqOverviewArray = res?.result?.data;
    });
  }
  formatDateWithTimezone(date: string | Date): string {
    const dt = new Date(date);
    return (
      dt.toISOString().split(".")[0] + // Format date as `YYYY-MM-DDTHH:mm:ss`
      new Intl.DateTimeFormat("en", { timeZoneName: "shortOffset" })
        .formatToParts(dt)
        .find((part) => part.type === "timeZoneName")?.value
    );
  }
  settingSchemaMarkUp() {
    const c = this.city_id || 'delhi';
    const breadcrumbs = [
      { position: 1, name: 'Home', item: '/' },
      { position: 2, name: c.charAt(0).toUpperCase() + c.slice(1), item: `/${c}` },
      { position: 3, name: 'Surgeries', item: `/${c}/treatment` },
      ...(this.surgeryDetail?.title
        ? [{ position: 4, name: this.surgeryDetail?.title, item: this.router.url }]
        : []),
    ];

    const breadcrumbSchema = {
      "@context": "http://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((breadcrumb) => ({
        "@type": "ListItem",
        position: breadcrumb.position,
        name: breadcrumb.name,
        item: {
          "@id": breadcrumb.item } })) };
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": this.router.url },
      headline: this.surgeryDetail?.title,
      description: this.surgeryDetail?.seoDescription || "",
      image: this.surgeryDetail?.imageUrl,
      author: {
        "@type": "Person",
        name: "Admin",
        url: "https://nectarplus.health/" },
      publisher: {
        "@type": "Organization",
        name: "nectarplus.health",
        logo: {
          "@type": "ImageObject",
          url: "https://nectorplus.s3.ap-south-1.amazonaws.com/aa697f30-31bb-11ee-a0c0-ad1b782616cb-Nectar%20Logo.png" } },
      datePublished: this.formatDateWithTimezone(this.surgeryDetail?.createdAt),
      dateModified: this.formatDateWithTimezone(this.surgeryDetail?.updatedAt) };
    this.seoService.setJsonLd(this._renderer2, jsonLdData);
    this.seoService.setJsonLd(this._renderer2, breadcrumbSchema);
  }
  myformroute(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  // send to convert this code mobile seo link in array form
  extractLinks(input: string) {
    if (typeof input !== 'string') {
      return [];
    }
    const regex = /<a href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    let matches;
    const links = [];
    while ((matches = regex.exec(input)) !== null) {
      links.push({ url: matches[1], title: matches[2] });
    }

    return links;
  }

  toggleReadMore(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
  }

}
