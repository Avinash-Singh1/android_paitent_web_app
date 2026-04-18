import { Component, Inject, OnInit, Renderer2, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer, SafeHtml, Title } from "@angular/platform-browser";
import { combineLatest } from 'rxjs';

import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { SeoService } from "src/app/services/seo.service";
import { CommonService } from "src/app/services/common.service";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: "app-treatment-page",
  templateUrl: "./treatment-page.component.html",
  styleUrls: ["./treatment-page.component.scss"] })
export class TreatmentPageComponent implements OnInit {
  treatment: any;
  slug: string = "";
  city: string = "";
  department: string = "";
  faqArray: any[] = [];
  faqOverviewArray: any[] = [];
  doctors: any[] = [];
  hospitals: any[] = [];
  reviews: any[] = [];
  relatedTreatments: any[] = [];
  cityCustomContent: string = "";
  isExpanded: boolean[] = [];
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  activeSection = "overview";

  phoneNumber = environment.mobile;
  message = "";

  // Sidebar lead form (desktop)
  sidebarForm = { name: '', phone: '', city: '' };
  sidebarFormSubmitted = false;

  // Mobile lead form
  mobileForm = { name: '', phone: '', city: '' };
  mobileFormSubmitted = false;
  showMobileForm = false;

  // Table of contents sections — dynamically filtered
  allTocSections = [
    { id: "overview", label: "Overview", key: "description" },
    { id: "symptoms", label: "Symptoms", key: "symptoms" },
    { id: "types", label: "Types", key: "typesOfSurgery" },
    { id: "procedure", label: "Procedure", key: "procedureSteps" },
    { id: "benefits", label: "Benefits", key: "benefits" },
    { id: "recovery", label: "Recovery", key: "recoveryTimeline" },
    { id: "cost", label: "Cost", key: "costRange" },
    { id: "doctors", label: "Doctors", key: "_doctors" },
    { id: "faq", label: "FAQ", key: "_faq" },
  ];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private title: Title,
    private seoService: SeoService,
    private renderer: Renderer2,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: any) {}

  ngOnInit(): void {
    const parentParams$ = this.route.parent ? this.route.parent.paramMap : this.route.paramMap;
    combineLatest([this.route.paramMap, parentParams$]).subscribe(([params, parentParams]) => {
      this.slug = params.get("slug") || "";
      this.city = parentParams.get("city") || params.get("city") || "";
      this.department = params.get("department") || "";

      if (this.slug) {
        this.loadTreatment();
        this.loadDoctors();
        this.loadHospitals();
        this.loadFaqs();
        this.loadReviews();
      }
    });
  }

  loadTreatment() {
    const cacheKey = this.city
      ? `TREATMENT_${this.slug}_${this.city}`
      : `TREATMENT_${this.slug}`;
const endpoint = this.city
      ? `${API_ENDPOINTS.patient.treatmentBySlug}/${this.slug}/city/${this.city}`
      : `${API_ENDPOINTS.patient.treatmentBySlug}/${this.slug}`;

    this.apiService.get(endpoint, {})
      .subscribe((res: any) => {
        this.treatment = res?.result;
        this.relatedTreatments = this.treatment?.relatedTreatments || [];
        this.cityCustomContent = this.treatment?.cityData?.customContent || '';
        this.message = `Hi Nectar+ Health, I'm interested in learning more about ${this.treatment?.title}. Can you provide me with some more information?`;

        // Redirect to canonical URL if department in URL doesn't match
        // the treatment's actual department (e.g. /general-surgery/dental-implants -> /dentistry/dental-implants)
        const actualDeptSlug = this.treatment?.departmentId?.slug;
        if (actualDeptSlug && this.department && actualDeptSlug !== this.department) {
          this.department = actualDeptSlug;
          const c = this.city || 'delhi';
          this.router.navigate(['/', c, 'treatment', actualDeptSlug, this.slug], { replaceUrl: true });
          return;
        }
        if (actualDeptSlug && !this.department) {
          this.department = actualDeptSlug;
        }

        this.setMetaTags();
        this.setJsonLd();
      });
  }

  loadDoctors() {
    const endpoint = `${API_ENDPOINTS.patient.treatmentDoctors}/${this.slug}/doctors`;
    const params: any = { page: 1, size: 6 };
    if (this.city) params.city = this.city;
this.apiService.get(endpoint, params)
      .subscribe((res: any) => {
        this.doctors = res?.result?.data || [];
      });
  }

  loadHospitals() {
    const endpoint = `${API_ENDPOINTS.patient.treatmentHospitals}/${this.slug}/hospitals`;
    const params: any = { page: 1, size: 6 };
    if (this.city) params.city = this.city;
this.apiService.get(endpoint, params)
      .subscribe((res: any) => {
        this.hospitals = res?.result?.data || [];
      });
  }

  loadFaqs() {
this.apiService.get(API_ENDPOINTS.patient.faqSurgeryWise, { slug: this.slug })
      .subscribe((res: any) => {
        this.faqArray = res?.result?.data || [];
        this.isExpanded = this.faqArray.map(() => false);
      });
this.apiService.get(API_ENDPOINTS.patient.OverviewfaqSurgeryWise, { slug: this.slug })
      .subscribe((res: any) => {
        this.faqOverviewArray = res?.result?.data || [];
      });
  }

  loadReviews() {
this.apiService.get(API_ENDPOINTS.doctor.pateintReview, { slug: this.slug, city: this.city || '' })
      .subscribe({
        next: (res: any) => {
          this.reviews = res?.result?.data || res?.result || [];
        },
        error: () => {
          this.reviews = [];
        }
      });
  }

  setMetaTags() {
    const t = this.treatment;
    const cityLabel = this.city
      ? this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, ' ')
      : "India";

    // Task 3: City-specific title & description for unique SEO per city
    const pageTitle =
      t?.seoTitle ||
      `${t?.title} in ${cityLabel} - Cost, Doctors & Hospitals | NectarPlus`;

    const description =
      t?.seoDescription ||
      `Find the best ${t?.title} doctors & hospitals in ${cityLabel}. ` +
      `Compare costs${t?.costRange?.min ? ' (₹' + t.costRange.min.toLocaleString('en-IN') + ' - ₹' + (t.costRange?.max || '').toLocaleString('en-IN') + ')' : ''}, ` +
      `read patient reviews, and book a free consultation.`;

    this.title.setTitle(pageTitle);
    this.seoService.updateTags([
      { name: "description", content: description },
      { property: "og:title", content: pageTitle },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://nectarplus.health/${this.city}/treatment/${this.department}/${this.slug}` },
      { property: "og:image", content: t?.imageUrl || "" },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: t?.imageUrl || "" },
      { name: "geo.region", content: "IN" },
      { name: "geo.placename", content: cityLabel },
    ]);

    // Ensure indexable
    this.seoService.indexAndFollowRobot();
    // City-specific canonical URL
    this.setCityCanonical();
    // hreflang tags for city variants
    this.setHreflangTags();
  }

  private setCityCanonical() {
    const canonicalUrl = `https://nectarplus.health/${this.city}/treatment/${this.department}/${this.slug}`;
    this.seoService.setCanonicalUrl(canonicalUrl);
  }

  private setHreflangTags() {
    // Remove old hreflang tags
    this.document.querySelectorAll('link[hreflang]').forEach((el: Element) => el.remove());
    const head = this.document.head;
    const topCities = [
      'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai',
      'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow',
    ];
    for (const c of topCities) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', 'en-IN');
      link.setAttribute('href', `https://nectarplus.health/${c}/treatment/${this.department}/${this.slug}`);
      head.appendChild(link);
    }
    // x-default
    const xDefault = this.document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', `https://nectarplus.health/delhi/treatment/${this.department}/${this.slug}`);
    head.appendChild(xDefault);
  }

  setJsonLd() {
    const t = this.treatment;
    if (!t) return;

    const cityLabel = this.city
      ? this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, ' ')
      : 'India';

    // Task 3: City-specific MedicalProcedure schema with areaServed
    const procedureSchema: any = {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      name: `${t.title} in ${cityLabel}`,
      description: t.seoDescription || "",
      image: t.imageUrl || "",
      url: `https://nectarplus.health/${this.city}/treatment/${this.department}/${this.slug}`,
      areaServed: {
        "@type": "City",
        name: cityLabel,
        containedInPlace: { "@type": "Country", name: "India" } } };

    if (t.createdAt) {
      procedureSchema.datePublished = new Date(t.createdAt).toISOString().split('T')[0];
    }
    if (t.updatedAt) {
      procedureSchema.dateModified = new Date(t.updatedAt).toISOString().split('T')[0];
    }

    if (t.costRange?.min || t.costRange?.max) {
      procedureSchema.offers = {
        "@type": "AggregateOffer",
        priceCurrency: t.costRange?.currency || "INR",
        lowPrice: t.costRange?.min,
        highPrice: t.costRange?.max,
        areaServed: cityLabel };
    }

    // BreadcrumbList schema
    const c = this.city || 'delhi';
    const breadcrumbs = [
      { position: 1, name: "Home", item: "https://nectarplus.health/" },
      {
        position: 2,
        name: c.charAt(0).toUpperCase() + c.slice(1),
        item: `https://nectarplus.health/${c}` },
      {
        position: 3,
        name: "Treatments",
        item: `https://nectarplus.health/${c}/treatment` },
    ];
    if (t.departmentId?.name) {
      breadcrumbs.push({
        position: breadcrumbs.length + 1,
        name: t.departmentId.name,
        item: `https://nectarplus.health/${c}/treatment/${this.department || t.departmentId?.slug || ''}` });
    }
    breadcrumbs.push({
      position: breadcrumbs.length + 1,
      name: t.title,
      item: `https://nectarplus.health/${c}/treatment/${this.department || t.departmentId?.slug || ''}/${this.slug}` });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b) => ({
        "@type": "ListItem",
        position: b.position,
        name: b.name,
        item: { "@id": b.item } })) };

    this.seoService.setJsonLd(this.renderer, procedureSchema);
    this.seoService.setJsonLd(this.renderer, breadcrumbSchema);

    // FAQPage schema
    if (this.faqArray?.length) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: this.faqArray.map((f: any) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer } })) };
      this.seoService.setJsonLd(this.renderer, faqSchema);
    }

    // Physician schema for medical reviewer
    if (t.medicalReviewer?.name) {
      const physicianSchema: any = {
        "@context": "https://schema.org",
        "@type": "Physician",
        name: t.medicalReviewer.name };
      if (t.medicalReviewer.qualification) {
        physicianSchema.description = t.medicalReviewer.qualification;
      }
      if (t.medicalReviewer.specialization) {
        physicianSchema.medicalSpecialty = t.medicalReviewer.specialization;
      }
      this.seoService.setJsonLd(this.renderer, physicianSchema);
    }

    // Hospital schema for top hospitals
    if (this.hospitals?.length) {
      this.hospitals.slice(0, 3).forEach((hosp: any) => {
        const hospitalSchema: any = {
          "@context": "https://schema.org",
          "@type": "Hospital",
          name: hosp.hospitalName };
        if (hosp.address?.city) {
          hospitalSchema.address = {
            "@type": "PostalAddress",
            addressLocality: hosp.address.city };
          if (hosp.address.locality) {
            hospitalSchema.address.streetAddress = hosp.address.locality;
          }
        }
        if (hosp.profilePic) {
          hospitalSchema.image = hosp.profilePic;
        }
        this.seoService.setJsonLd(this.renderer, hospitalSchema);
      });
    }
  }

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || "");
  }

  get whatsappLink(): string {
    return `https://api.whatsapp.com/send?phone=${this.phoneNumber}&text=${encodeURIComponent(this.message)}`;
  }

  get cityLabel(): string {
    return this.city
      ? this.city.charAt(0).toUpperCase() + this.city.slice(1)
      : "India";
  }

  get visibleTocSections(): Array<{ id: string; label: string }> {
    return this.allTocSections.filter((s) => {
      if (s.key === "_doctors") return this.doctors?.length > 0;
      if (s.key === "_faq") return this.faqArray?.length > 0;
      if (s.key === "costRange") return this.treatment?.costRange?.min || this.treatment?.costRange?.max;
      return !!this.treatment?.[s.key];
    });
  }

  onEnquirySubmit(data: { name: string; phone: string; city: string }): void {
    const endpoint = API_ENDPOINTS.patient.surgeryEnquiry;
    const body = {
      name: data.name,
      phone: data.phone,
      city: data.city,
      surgeryName: this.treatment?.title || this.slug };
    this.apiService.post(endpoint, body).subscribe();
  }

  submitSidebarForm(): void {
    if (!this.sidebarForm.name || !this.sidebarForm.phone) return;
    if (!this.sidebarForm.city) this.sidebarForm.city = this.city;
    this.onEnquirySubmit(this.sidebarForm);
    this.sidebarFormSubmitted = true;
  }

  submitMobileForm(): void {
    if (!this.mobileForm.name || !this.mobileForm.phone) return;
    if (!this.mobileForm.city) this.mobileForm.city = this.city;
    this.onEnquirySubmit(this.mobileForm);
    this.mobileFormSubmitted = true;
  }

  scrollTo(id: string) {
    if (this.isBrowser) {
      const el = this.document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      this.activeSection = id;
    }
  }

  toggleFaq(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }
}
