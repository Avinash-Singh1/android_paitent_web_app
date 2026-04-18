
import { afterNextRender, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild, DOCUMENT } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { SeoService } from "src/app/services/seo.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-home-wrapper",
  templateUrl: "./home-wrapper.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeWrapperComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Below-fold sections: start TRUE on both server & client to prevent
   * hydration mismatch (server renders them, client must match).
   * On SPA navigations (no pre-rendered HTML), IntersectionObserver lazy-loads them.
   */
  showBelowFold = true;
  @ViewChild('belowFoldSentinel') belowFoldSentinel!: ElementRef;
  private observer?: IntersectionObserver;
  private isInitialRender = true;

  constructor(
    private title: Title,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private router: Router,
    @Inject(DOCUMENT) public document: any,
    private localStorage: LocalStorageService,
    private cdr: ChangeDetectorRef,
  ) {
    // After the first render (hydration) completes, mark initial render done.
    // On subsequent SPA navigations, IntersectionObserver will handle lazy loading.
    afterNextRender(() => {
      this.isInitialRender = false;
    });
  }


  // ngOnInit(): void {

  //   const routes = {
  //     2: ROUTE_CONSTANT.DOCTOR.dashboard,
  //     3: ROUTE_CONSTANT.HOSPITAL.dashboard,
  //   };

  //   const isLogged = this.localStorage.getItem("isLogged");
  //   const userType = this.localStorage.getItem("userType");

  //   if(isLogged && userType){
  //     this.router.navigate([routes[userType]])
  //   }
  //   this.addingTagsAndTitle();
  //   this.settingSchemaMarkups();
  // }


ngOnInit(): void {
  // Redirect logic removed — UserGuard already handles doctor/hospital redirects
  // at the route level, preventing duplicate navigation that caused double page load.

  this.addingTagsAndTitle();
  this.settingSchemaMarkups();
  this.settingHomeSchema();
}

  ngAfterViewInit(): void {
    // On the initial initial render page load, below-fold content is already in the DOM
    // (rendered by the server), so we skip IntersectionObserver to avoid a flash.
    // On SPA navigations, use IntersectionObserver for lazy loading.
    if (this.belowFoldSentinel && !this.isInitialRender) {
      this.showBelowFold = false;
      this.cdr.markForCheck();
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.showBelowFold = true;
            this.cdr.markForCheck();
            this.observer?.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      this.observer.observe(this.belowFoldSentinel.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private readonly SITE_URL = 'https://nectarplus.health';

  addingTagsAndTitle() {
    this.title.setTitle(
      "NectarPlus.Health | Online Doctor Consultation & Hospital Booking in India"
    );

    this.seoService.updateTags([
      {
        name: "description",
        content:
          "Book online doctor consultations & hospital appointments across India. Connect with top-rated doctors, access quality healthcare from home.",
      },
      {
        property: "og:title",
        content:
          "NectarPlus.Health | Online Doctor Consultation & Hospital Booking in India",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: this.SITE_URL,
      },
      {
        property: "og:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png",
      },
      {
        property: "og:description",
        content:
          "Book online doctor consultations & hospital appointments across India. Connect with top-rated doctors, access quality healthcare from home.",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@nectarhealth_IN",
      },
      {
        name: "twitter:title",
        content:
          "NectarPlus.Health | Online Doctor Consultation & Hospital Booking in India",
      },
      {
        name: "twitter:description",
        content:
          "Book online doctor consultations & hospital appointments across India. Connect with top-rated doctors, access quality healthcare from home.",
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png",
      },
    ]);
  }

  settingSchemaMarkups() {
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nectar Plus Health",
      url: this.SITE_URL,
      logo: "https://d2vcw1dhwod4x6.cloudfront.net/aa697f30-31bb-11ee-a0c0-ad1b782616cb-Nectar%20Logo.png",
      description:
        "We are a leading healthcare organization dedicated to providing quality medical services.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+918810232143",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "1032, 11th Floor, Westend Mall, Janakpuri West",
        addressLocality: "Janakpuri",
        addressRegion: "New Delhi",
        postalCode: "110058",
        addressCountry: "India",
      },
      sameAs: [
        "https://www.facebook.com/nectarplushealth",
        "https://twitter.com/nectarhealth_IN",
        "https://www.instagram.com/nectarplushealth/",
        "https://www.youtube.com/@nectarplushealth",
        "https://www.linkedin.com/company/nectar-plus-health/about/",
      ],
    };
    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  settingHomeSchema() {
    let content = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Nectar Plus Health",
      url: this.SITE_URL,
      description:
        "We are a leading healthcare organization dedicated to providing quality medical services.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${this.SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      sameAs: [
        "https://www.facebook.com/nectarplushealth",
        "https://twitter.com/nectarhealth_IN",
        "https://www.instagram.com/nectarplushealth/",
        "https://www.youtube.com/@nectarplushealth",
        "https://www.linkedin.com/company/nectar-plus-health/about/",
      ],
      image: [
        {
          "@type": "ImageObject",
          url: "https://d2vcw1dhwod4x6.cloudfront.net/aa697f30-31bb-11ee-a0c0-ad1b782616cb-Nectar%20Logo.png",
        },
      ],
    };
    this.seoService.setJsonLd(this._renderer2, content);
  }
}
