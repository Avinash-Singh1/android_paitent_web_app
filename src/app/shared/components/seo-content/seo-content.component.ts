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
  selector: "nectar-seo-content",
  templateUrl: "./seo-content.component.html",
  styleUrls: ["./seo-content.component.scss"],
})
export class SeoContentComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() allowDescription = true;
  @Input() data: any = "";
  @Input() city = "";
  @Input() doctorState = "";
  @Input() locality = "";
  @Input() search = "";
  @Input() doctorDetail: any = {};
  @Input() HospitalURLS: any[] = [];

  @ViewChildren('linksList') linksListElements!: QueryList<ElementRef>;

  // Screen detection
  isDesktop = false;
  isMobile = false;
  private screenWidth = 0;
  deviceWidth: number = 375;

  DocHospitalURLS: any[] = [];
  isExpanded = false;
  seo_citys: any[] = [];
  localityWiseData: any[] = [];
  cityDoctors: string[] = [];
  citySpecialization: any[] = [];
  validServices: any[] = [];

  private destroy$ = new Subject<void>();
  private _specializationName: string | null = null;
  private boundOnResize: () => void;
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
  ) {}

  ngOnInit(): void {
    this.updateScreenType();
    this.city = this.capitalizeFirstLetter(this.city);
    this.locality = this.capitalizeFirstLetter(this.locality);

    this.boundOnResize = this.onResize.bind(this);
    if (this.isBrowser) {
      window.addEventListener('resize', this.boundOnResize, { passive: true });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctorDetail']?.currentValue?.specialization?.[0]?._id) {
      this._specializationName = null;
      this.seoLinksLoaded = false;
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
    }

    if (changes['data'] || changes['search']) {
      this.cdr.markForCheck();
    }

    this.getNearbyHospitals();

    // Load all validated SEO links in a single call
    if (!this.seoLinksLoaded) {
      this.loadValidatedSeoLinks();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      requestAnimationFrame(() => this.applyStyles());
      this.linksListElements.changes
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          requestAnimationFrame(() => this.applyStyles());
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.isBrowser && this.boundOnResize) {
      window.removeEventListener('resize', this.boundOnResize);
    }
  }

  private updateScreenType(): void {
    this.screenWidth = this.isBrowser
      ? window.innerWidth
      : 375;

    this.isDesktop = this.screenWidth >= 768;
    this.isMobile = !this.isDesktop;
    this.deviceWidth = this.screenWidth;
    this.cdr.markForCheck();
  }

  private resizeTimer: any;
  private onResize(): void {
    // Debounce to avoid scroll-triggered thrashing on mobile (URL bar hide/show)
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.updateScreenType(), 150);
  }

  shouldRenderDesktop(): boolean {
    return this.isDesktop;
  }

  shouldRenderMobile(): boolean {
    return this.isMobile;
  }

  getFilteredLinks(content: string): string[] {
    return content ? content.split('<br>').filter(l => l && l.trim()) : [];
  }

  getSpecializationName(): string {
    if (this._specializationName === null) {
      this._specializationName = this.doctorDetail[0]?.specialization?.[0]?.name || '';
    }
    return this._specializationName;
  }

  get specializationIds(): string[] {
    return this.doctorDetail[0]?.specialization?.map((item: any) => item._id) ?? [];
  }

  getLocalityRouterLink(locality: string): any[] {
    return ['/', this.formatdata(this.city), this.formatdata(this.getSpecializationName()), this.formatdata(locality)];
  }

  getCitySpecializationLink(name: string): any[] {
    return ['/', this.formatdata(this.city), this.formatdata(name)];
  }

  getSeoCitiesLink(city: string): any[] {
    return ['/', this.formatdata(city), this.formatdata(this.getSpecializationName())];
  }

  getCityDoctorsLink(cityItem: string): any[] {
    return ['/', this.formatdata(cityItem), 'doctors'];
  }

  getServiceLink(name: string): any[] {
    return ['/', this.formatdata(this.city), 'doctors-for-' + this.formatdata(name)];
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
    const specializationIds = this.specializationIds;
    const services = this.doctorDetail?.[0]?.service?.map((s: any) => s.name) || [];
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

  capitalizeFirstLetter(text: string | null | undefined): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Accordion state for mobile sections
  openAccordion: string | null = null;
  openSectionIndex: number | null = null;

  toggleAccordion(id: string): void {
    this.openAccordion = this.openAccordion === id ? null : id;
  }

  toggleSectionAccordion(index: number): void {
    this.openSectionIndex = this.openSectionIndex === index ? null : index;
  }

  toggleDescription(): void {
    this.isExpanded = !this.isExpanded;
    this.cdr.markForCheck();
  }

  formatdata(name: string | null | undefined = ''): string {
    if (!name) return '';
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  trackBySlug(index: number, item: any): string {
    return typeof item?.profileSlug === 'string' ? item.profileSlug : index.toString();
  }

  triggerScrollToTop(): void {
    this.eventService.broadcastEvent('list-scroll', true);
    if (this.isBrowser) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }
}
