import { Component, Inject, OnInit, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { EventService } from 'src/app/services/event.service';

import { SeoService } from 'src/app/services/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { Renderer2, RendererFactory2 } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { hospitalTypeToSlug } from 'src/app/config/hospital-types.constant';

/* ── Interfaces ──────────────────────────────────── */
interface HospitalType {
  _id: string;
  name: string;
  active: boolean;
  category: number;
}

interface Doctor {
  _id: string;
  doctorName: string;
  doctorProfilePic: string;
  doctorProfileSlug: string;
  doctorRecommended: number;
  specialization: { _id: string; name: string }[];
  experience: number;
  consultationFees: number;
  videoConsultationFees?: number;
  education: any[];
  isVerified: number;
}

interface Establishment {
  _id: string;
  name: string;
  profilePic: string;
  rating: number;
  address: {
    landmark: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
  };
  hospitalType: { name: string }[];
  totalBed: number;
  ambulance: number;
  totalDoctor: number;
  establishmentProfileSlug: string;
  docList: Doctor[];
}

@Component({
  standalone: false,
  selector: 'nectar-healthcare-finder-component',
  templateUrl: './healthcare-finder-component.component.html',
  styleUrls: ['./healthcare-finder-component.component.scss'],
})
export class HealthcareFinderComponentComponent implements OnInit {
  isBrowser = false;
  city = 'delhi';

  /* ── Type Filtering ──────────────── */
  hospitalTypes: HospitalType[] = [];
  selectedTypeId: string | null = null;
  videoOnly = false;

  /* ── Specialization Filtering ─────── */
  availableSpecializations: { _id: string; name: string }[] = [];
  selectedSpecId: string | null = null;

  /* ── Establishments ──────────────── */
  allEstablishments: Establishment[] = [];
  filteredEstablishments: Establishment[] = [];
  loading = true;

  /* ── Pagination ──────────────────── */
  currentPage = 1;
  pageSize = 12;

  /* ── Existing Data ───────────────── */
  selectedCategory = 'doctors';
  selectedCategoryDisplay = 'doctors';
  currentSpecialties: any[] = [];
  topLocalities: any[] = [];
  clinicLocalities: { name: string; slug: string }[] = [];
  hospitalLocalities: { name: string; slug: string }[] = [];
  selectedSpecializationSlug = '';

  /* ── SEO ─────────────────────────── */
  private initialSeoSet = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    public eventService: EventService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private title: Title,
    private meta: Meta,
    private seoService: SeoService,
    private rendererFactory: RendererFactory2
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this._renderer2 = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.city = params['city'] || 'delhi';
      this.loadHospitalTypes();
      this.loadEstablishments();
      this.fetchSpecialties('doctors');
      this.fetchAdditionalLocalities();
      this.settingTagsAndTitles();
      this.settingSchemaMarkUp();
      if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'instant' });
    });
    this.eventService.broadcastEvent('view-doctor', true);
  }

  /* ═══════════════════════════════════
     Type Filtering & Establishments
     ═══════════════════════════════════ */

  loadHospitalTypes(): void {
    this.http.get<any>(API_ENDPOINTS.MASTER.hospitalType).subscribe(
      (res) => {
        const list = Array.isArray(res)
          ? res
          : res?.result?.data || res?.data || [];
        this.hospitalTypes = list;
      },
      () => {
        this.hospitalTypes = [];
      }
    );
  }

  loadEstablishments(): void {
    this.loading = true;
    const cityEnc = encodeURIComponent(this.city);
    const hospitalUrl = `${API_ENDPOINTS.patient.getAllHospitals2}?city=${cityEnc}&page=1&size=200`;
    const clinicUrl = `${API_ENDPOINTS.patient.getAllclinics}?city=${cityEnc}&page=1&size=200`;

    const hospitals$ = this.http.post<any>(hospitalUrl, {}).pipe(
      catchError(() => of({ result: { data: [] } }))
    );
    const clinics$ = this.http.post<any>(clinicUrl, {}).pipe(
      catchError(() => of({ result: { data: [] } }))
    );

    forkJoin([hospitals$, clinics$]).subscribe(([hRes, cRes]) => {
      const hospitalData: Establishment[] = hRes?.result?.data || hRes?.data || [];
      const clinicRaw: any[] = cRes?.result?.data || cRes?.data || [];

      // Normalize flat clinic rows into grouped Establishment shape
      const clinicData = this.normalizeClinicsData(clinicRaw);

      // Merge & deduplicate by _id (hospitals take priority)
      const merged = new Map<string, Establishment>();
      hospitalData.forEach((e) => merged.set(e._id, e));
      clinicData.forEach((e) => {
        if (!merged.has(e._id)) {
          merged.set(e._id, e);
        } else {
          // Merge docList from clinic data into existing entry
          const existing = merged.get(e._id)!;
          const existingIds = new Set((existing.docList || []).map((d) => d._id));
          (e.docList || []).forEach((doc) => {
            if (!existingIds.has(doc._id)) {
              existing.docList.push(doc);
            }
          });
        }
      });

      this.allEstablishments = Array.from(merged.values());
      this.buildSpecializationList();
      this.applyFilter();
      this.loading = false;
    });
  }

  /** Normalize flat clinic rows (1 row per doctor) into grouped Establishment objects */
  private normalizeClinicsData(rows: any[]): Establishment[] {
    const estMap = new Map<string, Establishment>();

    rows.forEach((row) => {
      const estId = row.establishmentId || row._id;
      if (!estMap.has(estId)) {
        estMap.set(estId, {
          _id: estId,
          name: row.name || '',
          profilePic: row.profilePic || '',
          rating: row.rating || 0,
          address: row.address || {},
          hospitalType: row.hospitalType || [],
          totalBed: row.totalBed || 0,
          ambulance: row.ambulance || 0,
          totalDoctor: 0,
          establishmentProfileSlug: row.establishmentProfileSlug || '',
          docList: [],
        });
      }

      const est = estMap.get(estId)!;

      // Build a doctor entry from the flat row
      if (row.doctorId || row.doctorName) {
        const docAlreadyAdded = est.docList.some(
          (d) => d._id === (row.doctorId || row._id + '_doc')
        );
        if (!docAlreadyAdded) {
          est.docList.push({
            _id: row.doctorId || row._id + '_doc',
            doctorName: row.doctorName || '',
            doctorProfilePic: row.doctorProfilePic || '',
            doctorProfileSlug: row.doctorProfileSlug || '',
            doctorRecommended: row.doctorRecommended || 0,
            specialization: (row.specialization || []).map((s: any) => ({
              _id: s._id || '',
              name: s.name || '',
            })),
            experience: parseInt(row.experience, 10) || 0,
            consultationFees: row.consultationFees || 0,
            videoConsultationFees: row.videoConsultationFees ?? null,
            education: row.education || [],
            isVerified: row.isVerified || 0,
          });
          est.totalDoctor = est.docList.length;
        }
      }
    });

    return Array.from(estMap.values());
  }

  selectType(typeId: string | null): void {
    this.selectedTypeId = typeId;
    this.videoOnly = false;
    this.currentPage = 1;
    this.applyFilter();
  }

  selectVideoOnly(): void {
    this.videoOnly = !this.videoOnly;
    if (this.videoOnly) {
      this.selectedTypeId = null;
    }
    this.currentPage = 1;
    this.applyFilter();
  }

  selectSpecialization(specId: string | null): void {
    this.selectedSpecId = specId;
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.allEstablishments];

    // Always exclude establishments with no doctors
    result = result.filter((e) => e.docList?.length > 0);

    // Filter by hospital type
    if (this.selectedTypeId) {
      const typeName = this.hospitalTypes.find(
        (t) => t._id === this.selectedTypeId
      )?.name;
      result = result.filter((e) =>
        e.hospitalType?.some((ht) => ht.name === typeName)
      );
    }

    // Filter by video consultation only (establishments named "Video Consultation Only")
    if (this.videoOnly) {
      result = result.filter((e) => e.name === 'Video Consultation Only');
    }

    // Filter by doctor specialization — only keep establishments
    // that have at least one doctor with the selected specialization
    if (this.selectedSpecId) {
      const specName = this.availableSpecializations.find(
        (s) => s._id === this.selectedSpecId
      )?.name;
      result = result.filter((e) =>
        e.docList?.some((doc) =>
          doc.specialization?.some((sp) => sp.name === specName)
        )
      );
    }

    this.filteredEstablishments = result;
  }

  /** Returns only matching doctors when spec filter is active, otherwise all */
  getFilteredDocList(est: Establishment): Doctor[] {
    if (!est.docList?.length) return [];
    if (!this.selectedSpecId) return est.docList;

    const specName = this.availableSpecializations.find(
      (s) => s._id === this.selectedSpecId
    )?.name;
    if (!specName) return est.docList;

    return est.docList.filter((doc) =>
      doc.specialization?.some((sp) => sp.name === specName)
    );
  }

  buildSpecializationList(): void {
    const specMap = new Map<string, { _id: string; name: string }>();
    this.allEstablishments.forEach((est) => {
      (est.docList || []).forEach((doc) => {
        (doc.specialization || []).forEach((sp) => {
          if (sp._id && sp.name && !specMap.has(sp._id)) {
            specMap.set(sp._id, { _id: sp._id, name: sp.name });
          }
        });
      });
    });
    this.availableSpecializations = Array.from(specMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get pagedEstablishments(): Establishment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEstablishments.slice(start, start + this.pageSize);
  }

  get allEstablishmentsWithDoctors(): number {
    return this.allEstablishments.filter((e) => e.docList?.length > 0).length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEstablishments.length / this.pageSize);
  }

  /** Count of unique doctors in "Video Consultation Only" establishments */
  get videoConsultationDoctorCount(): number {
    const seen = new Set<string>();
    for (const est of this.allEstablishments) {
      if (est.name === 'Video Consultation Only') {
        for (const doc of est.docList || []) {
          seen.add(doc._id);
        }
      }
    }
    return seen.size;
  }

  /** Count of "Video Consultation Only" establishments */
  get videoEstablishmentCount(): number {
    return this.allEstablishments.filter(
      (e) => e.docList?.length > 0 && e.name === 'Video Consultation Only'
    ).length;
  }

  hasVideoConsultation(doc: Doctor): boolean {
    return (
      doc.videoConsultationFees !== null &&
      doc.videoConsultationFees !== undefined &&
      doc.videoConsultationFees !== -1 &&
      doc.videoConsultationFees !== 0
    );
  }

  getTypeCount(typeId: string): number {
    const typeName = this.hospitalTypes.find((t) => t._id === typeId)?.name;
    return this.allEstablishments.filter(
      (e) => e.docList?.length > 0 && e.hospitalType?.some((ht) => ht.name === typeName)
    ).length;
  }

  getSpecCount(specId: string): number {
    const specName = this.availableSpecializations.find(
      (s) => s._id === specId
    )?.name;
    return this.allEstablishments.filter(
      (e) =>
        e.docList?.length > 0 &&
        e.docList.some((doc) =>
          doc.specialization?.some((sp) => sp.name === specName)
        )
    ).length;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    if (this.isBrowser) {
      const el = this.document.querySelector('.cp__results');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ═══════════════════════════════════
     Helpers
     ═══════════════════════════════════ */

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getRatingClass(rating: number): string {
    if (rating >= 4) return 'excellent';
    if (rating >= 3) return 'good';
    return 'average';
  }

  getTypeIcon(typeName: string): string {
    const icons: Record<string, string> = {
      hospital: 'local_hospital',
      clinic: 'medical_services',
      'nursing home': 'home_health',
      'diagnostic centre': 'biotech',
      'multi speciality hospital': 'domain',
      'super speciality hospital': 'stars',
    };
    return icons[typeName?.toLowerCase()] || 'local_hospital';
  }

  getEducation(doc: Doctor): string {
    if (!doc.education || !doc.education.length) return '';
    return doc.education
      .map((e: any) => e.degree || e.name || '')
      .filter(Boolean)
      .join(', ');
  }

  trackByEstId(_index: number, item: Establishment): string {
    return item._id;
  }

  trackByDocId(_index: number, item: Doctor): string {
    return item._id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  /** Get URL-safe singular type slug from establishment data */
  getTypeSlug(est: Establishment): string {
    return hospitalTypeToSlug(est?.hospitalType?.[0]?.name || 'Hospital');
  }

  capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/,/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-')
      .trim();
  }

  /* ═══════════════════════════════════
     Existing Specialty / Locality APIs
     ═══════════════════════════════════ */

  fetchSpecialties(type: string): void {
    const url = `${API_ENDPOINTS.patient.getcity}/${this.city}?type=${type}`;
    this.http.get<any[]>(url).subscribe(
      (data) => {
        let processedData = data;
        if (type !== 'doctors') {
          const uniqueMap = new Map<string, any>();
          data.forEach((item) => {
            const key = `${item.c_type}_${item.h_type}`;
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
          });
          processedData = Array.from(uniqueMap.values());
        }

        this.currentSpecialties = processedData.map((s) => ({
          _id: s._id,
          name: s.name,
          c_type: s.c_type,
          h_type: s.h_type,
          count: 0,
          image: s.image,
          slug: s.slug,
          localities: (s.localities || []).filter(
            (l: string) => l && l.trim()
          ),
        }));

        const localityMap: Record<
          string,
          { count: number; specSlug: string }
        > = {};
        data.forEach((spec) => {
          const specSlug = this.slugify(spec.name);
          (spec.localities || []).forEach((loc: string) => {
            const trimmed = loc.trim();
            if (trimmed) {
              const key = trimmed.toLowerCase();
              if (!localityMap[key]) {
                localityMap[key] = { count: 1, specSlug };
              } else {
                localityMap[key].count += 1;
              }
            }
          });
        });

        this.topLocalities = Object.entries(localityMap)
          .map(([name, d]) => ({
            name,
            count: d.count,
            specSlug: d.specSlug,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      },
      () => {
        this.currentSpecialties = [];
        this.topLocalities = [];
      }
    );
  }

  fetchAdditionalLocalities(): void {
    const baseUrl = `${API_ENDPOINTS.patient.findadditionaLocality}/${this.city}`;
    forkJoin({
      clinics: this.http.get<{ name: string; count: number }[]>(`${baseUrl}?category=clinics`).pipe(catchError(() => of([]))),
      hospitals: this.http.get<{ name: string; count: number }[]>(`${baseUrl}?category=hospitals`).pipe(catchError(() => of([])))
    }).subscribe(({ clinics, hospitals }) => {
      this.clinicLocalities = clinics
        .filter(loc => loc.name && loc.name.trim())
        .map(loc => ({ name: loc.name.trim(), slug: this.toSlug(loc.name.trim()) }));
      this.hospitalLocalities = hospitals
        .filter(loc => loc.name && loc.name.trim())
        .map(loc => ({ name: loc.name.trim(), slug: this.toSlug(loc.name.trim()) }));
    });
  }

  /* ═══════════════════════════════════
     Link Generators
     ═══════════════════════════════════ */

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  generateLink2(spec: { _id: string; name: string; slug: string }): string[] {
    return ['/', this.city, this.toSlug(spec.name)];
  }

  generateLocalityLink(locName: string, specSlug: string): string[] {
    return ['/', this.slugify(this.city), specSlug, this.slugify(locName)];
  }

  /* ═══════════════════════════════════
     SEO
     ═══════════════════════════════════ */

  settingTagsAndTitles(): void {
    if (true && this.initialSeoSet) return;

    const cityName = this.capitalizeWords(this.city || 'Delhi');
    const titleStr = `Top Doctors, Clinics & Diagnostic Centers in ${cityName} | NectarPlus Health`;
    const description = `Discover trusted doctors, clinics, and diagnostic centers across ${cityName}. Browse by specialty, locality, or treatment, and read verified patient reviews on NectarPlus Health.`;

    this.title.setTitle(titleStr);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: titleStr });
    this.meta.updateTag({
      property: 'og:description',
      content: description,
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({
      property: 'og:url',
      content: true
        ? this.document.location.href
        : `https://nectarplus.health/${cityName.toLowerCase()}`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png',
    });
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: titleStr });
    this.meta.updateTag({
      name: 'twitter:description',
      content: description,
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png',
    });

    this.initialSeoSet = true;
  }

  settingSchemaMarkUp(): void {
    if (!this.isBrowser) return;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': this.document.location.origin,
            name: 'Home',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': `${this.document.location.origin}/${this.city.toLowerCase()}`,
            name: this.capitalizeWords(this.city),
          },
        },
      ],
    };

    this.seoService.setJsonLd(this._renderer2, jsonLd);
  }
}
