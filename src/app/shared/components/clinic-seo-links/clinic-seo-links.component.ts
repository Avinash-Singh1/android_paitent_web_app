import {
  Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges,
  ChangeDetectorRef, inject, PLATFORM_ID, ChangeDetectionStrategy
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Subject, takeUntil } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";

@Component({
  standalone: false,
  selector: "nectar-clinic-seo-links",
  templateUrl: "./clinic-seo-links.component.html",
  styleUrls: ["./clinic-seo-links.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicSeoLinksComponent implements OnInit, OnChanges, OnDestroy {
  @Input() city = "";
  @Input() locality = "";

  topLocalities: string[] = [];
  topCities: string[] = [];
  topSpecializations: { slug: string; clinicType: string }[] = [];

  openAccordion: string | null = null;

  isDesktop = false;
  isMobile = false;

  private destroy$ = new Subject<void>();
  private loaded = false;
  private boundOnResize: (() => void) | null = null;
  private resizeTimer: any;
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.updateScreenType();
    if (this.isBrowser) {
      this.boundOnResize = this.onResize.bind(this);
      window.addEventListener("resize", this.boundOnResize, { passive: true });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["city"]?.currentValue) {
      this.city = this.capitalizeFirst(changes["city"].currentValue);
      this.loaded = false;
    }
    if (changes["locality"]?.currentValue) {
      this.locality = this.capitalizeFirst(changes["locality"].currentValue);
    }
    if (!this.loaded && this.city) {
      this.loadLinks();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.isBrowser && this.boundOnResize) {
      window.removeEventListener("resize", this.boundOnResize);
    }
  }

  private loadLinks(): void {
    this.loaded = true;
    this.http
      .post<any>(API_ENDPOINTS.patient.clinicSeoLinks, { city: this.city })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = res?.data || {};
          this.topLocalities = data.topLocalities || [];
          this.topCities = data.topCities || [];
          this.topSpecializations = data.topSpecializations || [];
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  private updateScreenType(): void {
    const w = this.isBrowser ? window.innerWidth : 375;
    this.isDesktop = w >= 768;
    this.isMobile = !this.isDesktop;
    this.cdr.markForCheck();
  }

  private onResize(): void {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.updateScreenType(), 150);
  }

  // --- Link builders ---

  getLocalityLink(loc: string): any[] {
    return ["/", this.formatSlug(this.city), "clinics", this.formatSlug(loc)];
  }

  getCityClinicsLink(cityName: string): any[] {
    return ["/", this.formatSlug(cityName), "clinics"];
  }

  getSpecLink(slug: string): any[] {
    return ["/", this.formatSlug(this.city), "clinics", slug];
  }

  getCityHospitalsLink(): any[] {
    return ["/", this.formatSlug(this.city), "hospitals"];
  }

  getCityDoctorsLink(): any[] {
    return ["/", this.formatSlug(this.city), "doctors"];
  }

  // --- Helpers ---

  toggleAccordion(id: string): void {
    this.openAccordion = this.openAccordion === id ? null : id;
  }

  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }

  formatSlug(name: string): string {
    if (!name) return "";
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  capitalizeFirst(text: string): string {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
