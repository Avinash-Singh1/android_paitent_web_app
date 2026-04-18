import { Component, Input, ViewChildren, QueryList, OnInit, AfterViewInit, OnChanges, OnDestroy, ElementRef, Renderer2, SimpleChanges, ChangeDetectorRef, inject, PLATFORM_ID } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Subject, takeUntil } from "rxjs";

import { CommonService } from "src/app/services/common.service";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: 'nectar-seo-section',
  templateUrl: './seo-section.component.html',
  styleUrls: ['./seo-section.component.scss'],
})
export class SeoSectionComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() allowDescription = true;
  @Input() data: any = "";
  @Input() city = "";
  @Input() doctorState = "";
  @Input() locality = "";
  @Input() search = "";
  @Input() doctorDetail: any = {};
  @Input() HospitalURLS: any[] = [];
  @Input() isDoctorSearchPage: boolean = false;

  @ViewChildren('linksList') linksListElements!: QueryList<ElementRef>;

  DocHospitalURLS: any[] = [];
  isExpanded = false;
  deviceWidth: number = 375;
  seo_citys: any;
  localityWiseData: any;
  cityDoctors: string[] = [];
  citySpecialization: any;
  validServices: any[] = [];

  private destroy$ = new Subject<void>();
  private seoLinksLoaded = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private sanitizer: DomSanitizer,
    private commonService: CommonService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public eventService: EventService,
    private apiService: ApiService,
    private renderer: Renderer2
  ) {
    // browser-safe: returns UA-based width during initial render, window.innerWidth in browser
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }

  ngOnInit(): void {

    this.city = this.capitalizeFirstLetter(this.city);
    this.locality = this.capitalizeFirstLetter(this.locality);

    // Load all validated SEO links in one call (browser only)
    this.loadValidatedSeoLinks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctorDetail']?.currentValue?.specialization?.[0]?._id) {
      this.seoLinksLoaded = false;
      // Only fetch in browser — not needed for initial render
      this.getNearbyHospitals();
    }

    if (changes['city']?.currentValue) {
      this.city = this.capitalizeFirstLetter(changes['city'].currentValue);
      this.seoLinksLoaded = false;
    }

    if (changes['locality']?.currentValue) {
      this.locality = this.capitalizeFirstLetter(changes['locality'].currentValue);
    }
    if (changes['doctorState']?.currentValue) {
      this.locality = this.capitalizeFirstLetter(changes['doctorState'].currentValue);
    }

    if (changes['HospitalURLS']) {
      const value = changes['HospitalURLS'].currentValue;
      this.HospitalURLS = Array.isArray(value) ? [...value] : [];
      if (!Array.isArray(value)) {
        console.warn('HospitalURLS is not an array:', value);
      }
    }

    if (changes['data'] || changes['search']) {
      this.cdr.markForCheck();
    }

    // Reload validated SEO links when city or specialization changes
    if (!this.seoLinksLoaded && true) {
      this.loadValidatedSeoLinks();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      requestAnimationFrame(() => this.applyStyles());

      this.linksListElements.changes.subscribe(() => {
        requestAnimationFrame(() => this.applyStyles());
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getSpecializationIds(): string[] {
    return this.doctorDetail?.specialization?.map((item: any) => item._id) ?? [];
  }

  private applyStyles(): void {
    this.linksListElements.forEach((liRef: ElementRef) => {
      const paragraphs = liRef.nativeElement.querySelectorAll('p');
      paragraphs.forEach((p: HTMLElement) => this.setParagraphStyles(p));

      const anchors = liRef.nativeElement.querySelectorAll('a');
      anchors.forEach((a: HTMLElement) => this.setAnchorStyles(a));
    });
  }

  private setParagraphStyles(p: HTMLElement): void {
    this.renderer.setStyle(p, 'position', 'relative');
    this.renderer.setStyle(p, 'margin-left', '1.2em');
    this.renderer.setStyle(p, 'padding-left', '0.5em');
    this.renderer.setStyle(p, 'text-indent', '-0.5em');
    this.renderer.setStyle(p, 'display', 'list-item');
    this.renderer.setStyle(p, 'list-style-type', 'none');
  }

  private setAnchorStyles(a: HTMLElement): void {
    this.renderer.setStyle(a, 'color', '#212529');
    this.renderer.setStyle(a, 'font-weight', '500');
    this.renderer.setStyle(a, 'font-size', '14px');
    this.renderer.setStyle(a, 'text-decoration', 'none');
    this.renderer.setStyle(a, 'padding', '0.5rem 0');
    this.renderer.setStyle(a, 'display', 'inline-block');
    this.renderer.setStyle(a, 'cursor', 'pointer');
  }

  private handleError(context: string, err: any): void {
    console.error(`Error ${context}:`, err.message ?? err);
    if (err.status === 0) {
      console.error('Network error or CORS issue');
    } else if (err.status >= 400 && err.status < 500) {
      console.error('Client-side error');
    } else if (err.status >= 500) {
      console.error('Server-side error');
    } else {
      console.error('Unexpected error occurred');
    }
  }

  getNearbyHospitals(): void {
    const master = this.doctorDetail?.establishmentmaster?.[0];
    if (!master?._id || !master?.location) return;

    this.apiService.getNearByHospital(master._id, master.location).subscribe({
      next: res => {
        this.DocHospitalURLS = res?.result?.slice(0, 15) ?? [];
        this.cdr.markForCheck();
      },
      error: err => this.handleError('fetching nearby hospitals', err)
    });
  }

  /**
   * Single validated endpoint: fetches all SEO link data in one call.
   * Backend guarantees every returned combination has ≥1 verified doctor.
   */
  private loadValidatedSeoLinks(): void {
    const specializationIds = this.getSpecializationIds();
    const services = this.doctorDetail?.service?.map((s: any) => s.name) || [];
    const city = this.city;

    if (!city && !specializationIds.length) return;

    this.seoLinksLoaded = true;

    this.http.post<any>(API_ENDPOINTS.patient.seoLinks, {
      city,
      specializationIds,
      services,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.localityWiseData = data.localities || [];
        this.citySpecialization = data.citySpecializations || [];
        this.seo_citys = data.citiesForSpec || [];
        this.cityDoctors = data.topCities || [];
        this.validServices = data.validServices || [];
        this.cdr.markForCheck();
      },
      error: (err: any) => this.handleError('fetching validated SEO links', err),
    });
  }

  // sanitizeHtml(html: string): SafeHtml {
  //   if (!html) return '';

  //   html = html
  //     .replace(/@variable/g, this.city)
  //     .replace(/&amp;nbsp;/g, "&nbsp;")
  //     .replace(/<span[^>]*style="[^"]*background-color:[^;"]*;?[^"]*"[^>]*>/gi, match =>
  //       match.replace(/background-color:[^;"]*;?/gi, '')
  //     )
  //     .replace(/<a\s+(.*?)href="(?!http)(.*?)"/g, '<a $1href="https://$2"')
  //     .replace(/<a\s+(.*?)>/g, '<a $1 target="_blank" rel="noopener noreferrer">');

  //   return this.sanitizer.bypassSecurityTrustHtml(html);
  // }

  sanitizeHtml(html: string): SafeHtml {
  if (!html) return '';

  html = html
    .replace(/@variable/g, this.city)
    .replace(/@state/g, this.doctorState)
    .replace(/&amp;nbsp;/g, "&nbsp;")
    .replace(/<span[^>]*style="[^"]*background-color:[^;"]*;?[^"]*"[^>]*>/gi, match =>
      match.replace(/background-color:[^;"]*;?/gi, '')
    )
    .replace(/<a\s+(.*?)href="(?!http)(.*?)"/g, '<a $1href="https://$2"')
    .replace(/<a\s+(.*?)>/g, '<a $1 target="_blank" rel="noopener noreferrer">');

  return this.sanitizer.bypassSecurityTrustHtml(html);
}

  // capitalizeFirstLetter(text: string = ''): string {
  //   return text.charAt(0).toUpperCase() + text.slice(1);
  // }
  capitalizeFirstLetter(text: string | null | undefined): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

  toggleDescription(): void {
    this.isExpanded = !this.isExpanded;
  }

  formatdata(name: string | null | undefined = ''): string {
    if (!name) return '';
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  trackBySlug(index: number, item: any): string {
    return typeof item?.profileSlug === 'string' ? item.profileSlug : index.toString();
  }

    DummyData:any = [
      {
        name: 'Apollo Hospital',
        profileSlug: 'apollo-hospital',
        address: {
          city: 'Delhi'
        }
      },
      {
        name: 'Fortis Healthcare',
        profileSlug: 'fortis-healthcare',
        address: {
          city: 'Mumbai'
        }
      },
      {
        name: 'AIIMS',
        profileSlug: 'aiims',
        address: {
          city: 'New Delhi'
        }
      }
  ];

triggerScrollToTop() {
  this.eventService.broadcastEvent('list-scroll', true);
  if (this.isBrowser) {
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
  }
}
// Add this getter to your component
get isMobileView(): boolean {
  return this.deviceWidth < 768;
}

openSeoPanel: string | null = null;

toggleSeoPanel(panel: string): void {
  this.openSeoPanel = this.openSeoPanel === panel ? null : panel;
}

  // Add to your component class
isDoctorDetailsPage(): boolean {
  if (!this.isBrowser) return false;
  const currentUrl = window.location.pathname;
  return currentUrl.includes('/doctor/');
}
}
