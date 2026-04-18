import { Component, Inject, OnInit, Renderer2, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer, SafeHtml, Title } from "@angular/platform-browser";
import { combineLatest } from 'rxjs';

import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { SeoService } from "src/app/services/seo.service";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: "app-treatment-subtopic",
  templateUrl: "./treatment-subtopic.component.html",
  styleUrls: ["./treatment-subtopic.component.scss"] })
export class TreatmentSubtopicComponent implements OnInit {
  treatment: any;
  slug: string = "";
  city: string = "";
  department: string = "";
  subtopic: string = "";
  subtopicContent: string = "";
  subtopicLabel: string = "";
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  phoneNumber = environment.mobile;
  message = "";

  private subtopicLabels: Record<string, string> = {
    cost: "Cost Guide",
    recovery: "Recovery Guide",
    procedure: "Procedure Details",
    risks: "Risks & Complications",
    "success-rate": "Success Rate" };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private title: Title,
    private seoService: SeoService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any) {}

  ngOnInit(): void {
    const parentParams$ = this.route.parent ? this.route.parent.paramMap : this.route.paramMap;
    combineLatest([this.route.paramMap, parentParams$]).subscribe(([params, parentParams]) => {
      this.slug = params.get("slug") || "";
      this.city = parentParams.get("city") || params.get("city") || "";
      this.department = params.get("department") || "";
      this.subtopic = params.get("subtopic") || "";
      this.subtopicLabel =
        this.subtopicLabels[this.subtopic] || this.subtopic;

      if (this.slug && this.subtopic) {
        this.loadSubtopic();
      }
    });
  }

  loadSubtopic() {
    const cacheKey = `TREATMENT_SUB_${this.slug}_${this.subtopic}`;
const endpoint = `${API_ENDPOINTS.patient.treatmentBySlug}/${this.slug}/${this.subtopic}`;

    this.apiService.get(endpoint, {})
      .subscribe((res: any) => {
        this.treatment = res?.result?.treatment;
        this.subtopicContent = res?.result?.content || "";
        this.message = `Hi Nectar+ Health, I'm interested in ${this.treatment?.title} ${this.subtopicLabel}. Can you provide more information?`;
        this.setMetaTags();
        this.setJsonLd();
      });
  }

  setMetaTags() {
    const t = this.treatment;
    if (!t) return;

    const cityLabel = this.city
      ? this.city.charAt(0).toUpperCase() + this.city.slice(1)
      : "India";
    const pageTitle = `${t.title} ${this.subtopicLabel} in ${cityLabel} | NectarPlus`;

    this.title.setTitle(pageTitle);
    this.seoService.updateTags([
      { name: "description", content: `${this.subtopicLabel} for ${t.title} in ${cityLabel}. Comprehensive guide.` },
      { property: "og:title", content: pageTitle },
      { property: "og:type", content: "article" },
      { property: "og:url", content: this.document.location.href },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
    ]);
  }

  setJsonLd() {
    const t = this.treatment;
    if (!t) return;
    const c = this.city || 'delhi';

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
          name: (c.charAt(0).toUpperCase() + c.slice(1)),
          item: { "@id": `https://nectarplus.health/${c}` } },
        {
          "@type": "ListItem",
          position: 3,
          name: "Treatments",
          item: { "@id": `https://nectarplus.health/${c}/treatment` } },
        ...(t.departmentId?.name ? [{
          "@type": "ListItem" as const,
          position: 4,
          name: t.departmentId.name,
          item: { "@id": `https://nectarplus.health/${c}/treatment/${this.department || t.departmentId?.slug || ''}` } }] : []),
        {
          "@type": "ListItem",
          position: t.departmentId?.name ? 5 : 4,
          name: t.title,
          item: { "@id": `https://nectarplus.health/${c}/treatment/${this.department || t.departmentId?.slug || ''}/${this.slug}` } },
        {
          "@type": "ListItem",
          position: t.departmentId?.name ? 6 : 5,
          name: this.subtopicLabel,
          item: { "@id": this.document.location.href } },
      ] };

    this.seoService.setJsonLd(this.renderer, breadcrumbSchema);
  }

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || "");
  }

  get cityLabel(): string {
    return this.city
      ? this.city.charAt(0).toUpperCase() + this.city.slice(1)
      : "India";
  }

  get whatsappLink(): string {
    return `https://api.whatsapp.com/send?phone=${this.phoneNumber}&text=${encodeURIComponent(this.message)}`;
  }

  get parentLink(): any[] {
    return ["/", this.city || "delhi", "treatment", this.department, this.slug];
  }
}
