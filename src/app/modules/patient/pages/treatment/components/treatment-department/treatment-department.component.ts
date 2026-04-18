import { Component, Inject, OnInit, Renderer2, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { combineLatest } from 'rxjs';

import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { SeoService } from "src/app/services/seo.service";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: "app-treatment-department",
  templateUrl: "./treatment-department.component.html",
  styleUrls: ["./treatment-department.component.scss"] })
export class TreatmentDepartmentComponent implements OnInit {
  department: any;
  treatments: any[] = [];
  allDepartments: any[] = [];
  city: string = "";
  deptSlug: string = "";
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  activeFilter: 'all' | 'guides' | 'cost' = 'all';

  phoneNumber = environment.mobile;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private seoService: SeoService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any) {}

  ngOnInit(): void {
    const parentParams$ = this.route.parent ? this.route.parent.paramMap : this.route.paramMap;
    combineLatest([this.route.paramMap, parentParams$]).subscribe(([params, parentParams]) => {
      this.deptSlug =
        params.get("department") || "";
      this.city =
        parentParams.get("city") ||
        params.get("city") ||
        "";

      if (this.deptSlug) {
        this.loadDepartment();
        this.loadAllDepartments();
      }
    });
  }

  loadDepartment() {
    const cacheKey = `DEPT_${this.deptSlug}`;
const endpoint = `${API_ENDPOINTS.patient.treatmentDepartment}/${this.deptSlug}`;

    this.apiService.get(endpoint, {})
      .subscribe({
        next: (res: any) => {
          const data = res?.result;
          this.department = data?.department;
          this.treatments = data?.treatments || [];
          if (!this.department) {
            // Backward-compat: old URL without department — try as a treatment slug
            this.tryRedirectAsOldTreatmentUrl();
            return;
          }
          this.setMetaTags();
          this.setJsonLd();
        },
        error: () => {
          this.tryRedirectAsOldTreatmentUrl();
        } });
  }

  loadAllDepartments() {
    const cacheKey = `ALL_DEPTS`;
this.apiService.get(API_ENDPOINTS.patient.getDepartments, {})
      .subscribe({
        next: (res: any) => {
          this.allDepartments = res?.result || [];
        } });
  }

  get otherDepartments(): any[] {
    return this.allDepartments.filter(
      (d: any) => d.slug && d.slug !== this.deptSlug && d.countOfSurgery > 0
    );
  }

  /**
   * Old URLs like /:city/treatment/:slug (no department) now route here.
   * Try to find the treatment by slug and redirect to the new URL.
   */
  private tryRedirectAsOldTreatmentUrl() {
    const endpoint = `${API_ENDPOINTS.patient.treatmentBySlug}/${this.deptSlug}`;
    this.apiService.get(endpoint, {}).subscribe({
      next: (res: any) => {
        const treatment = res?.result;
        if (treatment?.departmentId?.slug) {
          const c = this.city || "delhi";
          this.router.navigate(
            ["/", c, "treatment", treatment.departmentId.slug, treatment.slug],
            { replaceUrl: true }
          );
        }
      },
      error: () => {} });
  }

  get cityLabel(): string {
    if (!this.city) return "India";
    return this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, " ");
  }

  get deptName(): string {
    return this.department?.name || this.deptSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  }

  get publishedCount(): number {
    return this.treatments.filter((t: any) => t.isPublished).length;
  }

  get costCount(): number {
    return this.treatments.filter((t: any) => t.costRange?.min).length;
  }

  get hasCostData(): boolean {
    return this.costCount > 0;
  }

  get filteredTreatments(): any[] {
    if (this.activeFilter === 'guides') return this.treatments.filter((t: any) => t.isPublished);
    if (this.activeFilter === 'cost') return this.treatments.filter((t: any) => t.costRange?.min);
    return this.treatments;
  }

  get whatsappLink(): string {
    const msg = `Hi Nectar+ Health, I'm looking for ${this.deptName} treatment options${this.city ? ' in ' + this.cityLabel : ''}. Can you help me?`;
    return `https://api.whatsapp.com/send?phone=${this.phoneNumber}&text=${encodeURIComponent(msg)}`;
  }

  setFilter(filter: 'all' | 'guides' | 'cost') {
    this.activeFilter = filter;
  }

  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }

  setMetaTags() {
    const c = this.city || "delhi";
    const pageTitle = `${this.deptName} Treatments in ${this.cityLabel} | NectarPlus Health`;

    this.title.setTitle(pageTitle);
    this.seoService.updateTags([
      {
        name: "description",
        content: `Explore ${this.deptName} treatments and procedures in ${this.cityLabel}. Find top doctors, treatment costs, and hospitals. Book appointments at NectarPlus Health.` },
      { property: "og:title", content: pageTitle },
      { property: "og:type", content: "website" },
      { property: "og:url", content: this.document.location.href },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
    ]);

    this.seoService.setCanonicalUrl();
  }

  setJsonLd() {
    const c = this.city || "delhi";
    const cLabel = c.charAt(0).toUpperCase() + c.slice(1);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: { "@id": "https://nectarplus.health/" } },
        {
          "@type": "ListItem",
          position: 2,
          name: cLabel,
          item: { "@id": `https://nectarplus.health/${c}` } },
        {
          "@type": "ListItem",
          position: 3,
          name: "Treatments",
          item: {
            "@id": `https://nectarplus.health/${c}/treatment` } },
        {
          "@type": "ListItem",
          position: 4,
          name: this.deptName,
          item: { "@id": this.document.location.href } },
      ] };

    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${this.deptName} Treatments`,
      description: `All ${this.deptName} treatments and procedures available in ${this.cityLabel}`,
      url: this.document.location.href,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: this.treatments.map((t: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.title,
          url: `https://nectarplus.health/${c}/treatment/${this.deptSlug}/${t.slug}` })) } };

    this.seoService.setJsonLd(this.renderer, breadcrumbSchema);
    this.seoService.setJsonLd(this.renderer, collectionSchema);
  }
}
