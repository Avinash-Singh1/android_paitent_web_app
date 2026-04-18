import { ChangeDetectorRef, Component, Input, OnInit, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-faq-section",
  templateUrl: "./faq-section.component.html",
  styleUrls: ["./faq-section.component.scss"],
})
export class FaqSectionComponent implements OnInit {
  @Input() id: any;
  @Input() type: any = "doctor";
  @Input() tab = 1;

  deviceWidth: number;
  isExpanded: boolean[] = [];
  desktopExpanded: boolean[] = [];
  apiData: any = [];
  isBrowser: boolean;

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    // browser-safe: returns UA-based width (375/768/1440) during initial render,
    // window.innerWidth in browser — so initial render and hydration agree.
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }

  ngOnInit(): void {

    // Skip HTTP calls during initial render — FAQ data will load on the client
    if (!this.isBrowser) return;

    if (this.id) {
      this.getFaqs();
    }

    this.eventService.getEvent("doctor-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getFaqs();
      }
    });

    this.eventService.getEvent("hospital-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getFaqs();
      }
    });
  }

  getFaqs() {
    let payload: any = {};
    if (this.type === "doctor") {
      payload.id = this.id;
      payload.userType = 2;
    } else {
      payload.establishmentId = this.id;
      payload.userType = 3;
    }

    this.apiService.get(API_ENDPOINTS.patient.doctorFAQ, payload).subscribe((res: any) => {
      this.apiData = res?.result?.data || [];
      this.isExpanded = this.apiData.map(() => false);
      this.desktopExpanded = this.apiData.map((_: any, i: number) => i === 0);
      this.settingSchemaMarkUp();
      this.cdr.detectChanges();
    });
  }

  settingSchemaMarkUp() {
    if (!this.apiData || this.apiData.length === 0) return;

    const entityArray = this.apiData
      .filter((item: any) => item?.question && item?.answer)
      .map((item: any) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }));

    if (!entityArray.length) return;

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entityArray,
    };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  toggleReadMore(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
    this.cdr.detectChanges();
  }

  toggleDesktopFaq(index: number): void {
    this.desktopExpanded[index] = !this.desktopExpanded[index];
    this.cdr.detectChanges();
  }
}
