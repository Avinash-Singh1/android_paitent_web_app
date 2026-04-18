import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit, PLATFORM_ID, Renderer2, HostListener } from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { DeviceService } from "src/app/services/device.service";
import { SeoService } from "src/app/services/seo.service";
import { MatExpansionModule } from "@angular/material/expansion";

@Component({
  standalone: true,
  imports: [CommonModule, MatExpansionModule],
  selector: "nectar-faq",
  templateUrl: "./faq.component.html",
  styleUrls: ["./faq.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush })
export class FaqComponent implements OnInit, AfterViewInit {
  isExpanded: boolean[] = [];
  isMobile: boolean = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  constructor(
    private apiService: ApiService,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private commonService: CommonService,
    private deviceService: DeviceService,
    private cdr: ChangeDetectorRef
  ) {

  }
  deviceWidth: any;
  @Input() type = null;
  @Input() id: any = null;
  ngOnInit(): void {
    // Use DeviceService for browser-aware width detection
    this.deviceWidth = this.deviceService.getWidth();
    this.isMobile = this.deviceWidth <= 767;
    if (this.isBrowser) {
      this.getListing();
    }
  }
  ngAfterViewInit(): void {
    if (this.questionArray) {
      this.isExpanded = this.questionArray.map(() => false);
    } else {
      this.isExpanded = [];
    }
  }

  panelOpenState = false;

  questionArray: any = [];
loading: boolean = true; // 🔥 Add this line

getListing() {
  this.loading = true; // show skeletons

  const request$ = !this.type
    ? this.apiService.get(API_ENDPOINTS.patient.faq, {})
    : this.apiService.get(`${API_ENDPOINTS.patient.faqSurgeryWise}`, {
          slug: this.id });

  request$.subscribe({
    next: (res: any) => {
      this.questionArray = res?.result?.data;
      this.settingSchemaMarkUp();
      this.isExpanded = this.questionArray.map(() => false);
      this.loading = false;
      this.cdr.markForCheck();
    },
    error: () => {
      this.loading = false;
      this.cdr.markForCheck();
    }
  });
}

  settingSchemaMarkUp() {
    const entityArray = this.questionArray.map((item: any) => ({
      "@type": "Question",
      name: item?.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item?.answer } }));

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entityArray };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  toggleReadMore(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  @HostListener('window:resize', [])
  onResize() {
    if (!this.isBrowser) return;
    this.deviceWidth = window.innerWidth;
    this.isMobile = this.deviceWidth <= 767;
  }

  trackByIndex(index: number): number {
    return index;
  }

}
