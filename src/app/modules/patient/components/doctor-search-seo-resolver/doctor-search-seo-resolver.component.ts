import { Injectable, inject, Renderer2, RendererFactory2, DOCUMENT } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SeoService } from 'src/app/services/seo.service';
import { CommonService } from 'src/app/services/common.service';


@Injectable({
  providedIn: 'root',
})
export class DoctorSearchSeoResolver implements Resolve<boolean> {
  private titleService = inject(Title);
  private seoService = inject(SeoService);
  private commonService = inject(CommonService);
  private document = inject(DOCUMENT);
  private renderer: Renderer2;

  constructor() {
    const rendererFactory = inject(RendererFactory2);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const { city, service, speciality, locality } = route.params;

    // Process service/speciality
    let search = '';
    let symptomps = '';
    let isService = false;
    let isSpeciality = false;

    if (service && service !== 'doctors') {
      search = this.commonService.replaceHyphenWithSpace(service);
      symptomps = search;
      isService = true;
    } else if (speciality && speciality !== 'doctors') {
      search = this.commonService.replaceHyphenWithSpace(speciality);
      symptomps = search;
      isSpeciality = true;
    }

    // Process city and locality
    const cityName = city ? this.commonService.replaceHyphenWithSpace(city) : '';
    const localityName = locality ? this.commonService.replaceHyphenWithSpace(locality) : '';

    const locationLabel = localityName ? `${localityName}, ${cityName}` : cityName;
    const fullTitle = `Best ${symptomps} Doctors in ${locationLabel} | Book Appointment Online | Nectar Health`;
    const description = `Find the best ${symptomps} doctors in ${locationLabel}. Book appointments online 24x7, view fees, patient reviews, and clinic addresses. Nectar Plus Health.`;

    this.titleService.setTitle(fullTitle);

    // SEO: speciality/service listing pages should be indexed
    this.seoService.indexAndFollowRobot();

    const canonicalUrl = `https://nectarplus.health${state.url.split('?')[0]}`;

    this.seoService.updateTags([
      {
        name: 'description',
        content: description,
      },
      {
        property: 'og:title',
        content: fullTitle,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: canonicalUrl,
      },
      {
        property: 'og:image',
        content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png',
      },
      {
        property: 'og:description',
        content: description,
      },
      {
        property: 'og:image:alt',
        content: `Best ${symptomps} doctors in ${locationLabel}`,
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '628',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:site',
        content: '@nectarhealth_IN',
      },
      {
        name: 'twitter:title',
        content: fullTitle,
      },
      {
        name: 'twitter:description',
        content: description,
      },
      {
        name: 'twitter:image',
        content: 'https://nectarplus.health/assets/images/svg/nectarLogo.png',
      },
    ]);

    // ── MedicalWebPage structured data for speciality/service listing ──
    const medicalWebPage: any = {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: fullTitle,
      description,
      url: canonicalUrl,
      about: {
        '@type': 'MedicalSpecialty',
        name: symptomps,
      },
      mainEntity: {
        '@type': 'ItemList',
        name: `${symptomps} Doctors in ${locationLabel}`,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
      },
    };
    this.seoService.setJsonLd(this.renderer, medicalWebPage, 'schema-medicalwebpage');

    // ── BreadcrumbList for speciality/service pages ──
    const breadcrumbs: any[] = [
      { '@type': 'ListItem', position: 1, item: { '@id': 'https://nectarplus.health/', name: 'Home' } },
    ];
    if (city) {
      breadcrumbs.push({
        '@type': 'ListItem', position: 2,
        item: { '@id': `https://nectarplus.health/${city}`, name: cityName },
      });
    }
    if (symptomps) {
      breadcrumbs.push({
        '@type': 'ListItem', position: breadcrumbs.length + 1,
        item: { '@id': canonicalUrl, name: `${symptomps} Doctors` },
      });
    }
    if (locality) {
      breadcrumbs.push({
        '@type': 'ListItem', position: breadcrumbs.length + 1,
        item: { '@id': canonicalUrl, name: localityName },
      });
    }

    this.seoService.setJsonLd(this.renderer, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs,
    }, 'schema-breadcrumblist');

    return true;
  }
}
