import { Component, Inject, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { EventService } from 'src/app/services/event.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SeoService } from 'src/app/services/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { Renderer2, RendererFactory2 } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { hospitalTypeToSlug, VALID_PLURAL_TYPE_SLUGS, pluralToSingular } from 'src/app/config/hospital-types.constant';

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
  selector: 'nectar-hospital-type-list',
  templateUrl: './hospital-type-list.component.html',
  styleUrls: ['./hospital-type-list.component.scss'],
})
export class HospitalTypeListComponent implements OnInit {
  isBrowser = false;
  city = 'delhi';
  typeSlug = '';
  typePluralSlug = '';
  typeName = '';
  locality = '';

  /* ── Hospital Types ─────────────── */
  hospitalTypes: HospitalType[] = [];

  /* ── Specialization Filtering ───── */
  availableSpecializations: { _id: string; name: string }[] = [];
  selectedSpecId: string | null = null;

  /* ── Establishments ─────────────── */
  allEstablishments: Establishment[] = [];
  filteredEstablishments: Establishment[] = [];
  loading = true;

  /** Pretty locality name resolved from first matching establishment */
  localityDisplay = '';

  /* ── Pagination ─────────────────── */
  currentPage = 1;
  pageSize = 12;

  /* ── SEO ────────────────────────── */
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
      let typeSlug = params['type'] || '';
      // Store the original plural slug for breadcrumb links
      this.typePluralSlug = typeSlug;
      // Handle plural type slugs (e.g., multi-speciality-clinics → multi-speciality-clinic)
      if (VALID_PLURAL_TYPE_SLUGS.has(typeSlug)) {
        typeSlug = pluralToSingular(typeSlug);
      }
      this.typeSlug = typeSlug;
      this.locality = params['locality'] || '';
      this.localityDisplay = '';
      this.loadHospitalTypes();
      this.loadEstablishments();
      if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'instant' });
    });
    this.eventService.broadcastEvent('view-doctor', true);
  }

  /* ═══════════════════════════════════
     Data Loading
     ═══════════════════════════════════ */

  loadHospitalTypes(): void {
    this.http.get<any>(API_ENDPOINTS.MASTER.hospitalType).subscribe(
      (res) => {
        const list = Array.isArray(res)
          ? res
          : res?.result?.data || res?.data || [];
        this.hospitalTypes = list;

        // Resolve type name from slug
        const matched = this.hospitalTypes.find(
          (t) => this.nameToSlug(t.name) === this.typeSlug
        );
        this.typeName = matched?.name || this.slugToDisplay(this.typeSlug);

        // Re-apply filter now that we know the type name
        this.applyFilter();
        this.settingTagsAndTitles();
        this.settingSchemaMarkUp();
      },
      () => {
        this.hospitalTypes = [];
        this.typeName = this.slugToDisplay(this.typeSlug);
        this.settingTagsAndTitles();
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
            education: row.education || [],
            isVerified: row.isVerified || 0,
          });
          est.totalDoctor = est.docList.length;
        }
      }
    });

    return Array.from(estMap.values());
  }

  /* ═══════════════════════════════════
     Filtering
     ═══════════════════════════════════ */

  selectSpecialization(specId: string | null): void {
    this.selectedSpecId = specId;
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.allEstablishments];

    // Always exclude establishments with no doctors
    result = result.filter((e) => e.docList?.length > 0);

    // Filter by the current hospital type
    if (this.typeName) {
      result = result.filter((e) =>
        e.hospitalType?.some(
          (ht) => ht.name?.toLowerCase() === this.typeName.toLowerCase()
        )
      );
    }

    // Filter by locality if present (from breadcrumb routes like /:city/:type/:locality)
    if (this.locality) {
      const slugNorm = this.locality.toLowerCase();
      result = result.filter((e) => {
        const dbLocality = e.address?.locality || '';
        // Slugify the DB value the same way the URL was generated: lowercase, strip non-alphanumeric, replace spaces with hyphens
        const dbSlug = dbLocality.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
        return dbSlug === slugNorm || dbSlug.includes(slugNorm) || slugNorm.includes(dbSlug);
      });

      // Resolve a pretty locality name from the first matching result
      if (result.length > 0 && !this.localityDisplay) {
        this.localityDisplay = result[0].address?.locality || this.slugToDisplay(this.locality);
      }
    }

    // Filter by doctor specialization
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

    // Fallback: resolve locality display from slug if no results matched
    if (this.locality && !this.localityDisplay) {
      this.localityDisplay = this.slugToDisplay(this.locality);
    }
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
    // Build from type-filtered establishments only
    const typeFiltered = this.allEstablishments.filter(
      (e) =>
        e.docList?.length > 0 &&
        e.hospitalType?.some(
          (ht) => ht.name?.toLowerCase() === this.typeName?.toLowerCase()
        )
    );

    const specMap = new Map<string, { _id: string; name: string }>();
    typeFiltered.forEach((est) => {
      (est.docList || []).forEach((doc) => {
        (doc.specialization || []).forEach((sp) => {
          if (sp._id && sp.name && !specMap.has(sp._id)) {
            specMap.set(sp._id, { _id: sp._id, name: sp.name });
          }
        });
      });
    });
    this.availableSpecializations = Array.from(specMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  /* ═══════════════════════════════════
     Pagination
     ═══════════════════════════════════ */

  get pagedEstablishments(): Establishment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEstablishments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEstablishments.length / this.pageSize);
  }

  getSpecCount(specId: string): number {
    const specName = this.availableSpecializations.find(
      (s) => s._id === specId
    )?.name;

    // Count within type-filtered establishments
    return this.allEstablishments.filter(
      (e) =>
        e.docList?.length > 0 &&
        e.hospitalType?.some(
          (ht) => ht.name?.toLowerCase() === this.typeName?.toLowerCase()
        ) &&
        e.docList.some((doc) =>
          doc.specialization?.some((sp) => sp.name === specName)
        )
    ).length;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    if (this.isBrowser) {
      const el = this.document.querySelector('.htl__results');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ═══════════════════════════════════
     Helpers
     ═══════════════════════════════════ */

  nameToSlug(name: string): string {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  slugToDisplay(slug: string): string {
    return (slug || '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

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
      'multi-speciality clinic': 'domain',
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

  capitalizeWords(str: string): string {
    if (!str) return '';
    return str
      .replace(/-/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
  getTypeSlug(est: any): string {
    return hospitalTypeToSlug(est?.hospitalType?.[0]?.name || 'Hospital');
  }

  /* ═══════════════════════════════════
     SEO
     ═══════════════════════════════════ */

  settingTagsAndTitles(): void {
    if (true && this.initialSeoSet) return;

    const cityName = this.capitalizeWords(this.city || 'Delhi');
    const type = this.typeName || 'Hospitals';
    const locationStr = this.localityDisplay ? `${this.localityDisplay}, ${cityName}` : cityName;
    const titleStr = `Best ${type} in ${locationStr} — Top-Rated ${type} | NectarPlus Health`;
    const description = `Find the best ${type.toLowerCase()} in ${locationStr}. Compare ratings, doctors, specializations, and book appointments at trusted healthcare facilities on NectarPlus Health.`;

    this.title.setTitle(titleStr);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: titleStr });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({
      property: 'og:url',
      content: true
        ? this.document.location.href
        : `https://nectarplus.health/${cityName.toLowerCase()}/hospital-type/${this.typeSlug}`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://nectarplus.health/favicon.ico',
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: titleStr });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({
      name: 'twitter:image',
      content: 'https://nectarplus.health/favicon.ico',
    });

    this.initialSeoSet = true;
  }

  settingSchemaMarkUp(): void {
    if (!this.isBrowser) return;

    const cityName = this.capitalizeWords(this.city);
    const origin = 'https://nectarplus.health';

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: { '@id': origin, name: 'Home' },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': `${origin}/${this.city.toLowerCase()}`,
            name: cityName,
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@id': `${origin}/${this.city.toLowerCase()}/hospitals`,
            name: `Hospitals & Clinics in ${cityName}`,
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@id': `${origin}/${this.city.toLowerCase()}/hospital-type/${this.typeSlug}`,
            name: this.typeName,
          },
        },
      ],
    };

    this.seoService.setJsonLd(this._renderer2, jsonLd);
  }
}
