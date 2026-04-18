import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from "@angular/router";
import { Subscription } from "rxjs";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private eventService: EventService,
    private http: HttpClient) {}

  footer: boolean = true;
  mode: string = "patient";
  newLogin = false;
  newRegister = false;
  eventService$: Subscription;
  routerEvents$: Subscription;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Accordion state for mobile footer sections */
  openAccordion: number | null = null;

  /** Newsletter email field */
  newsletterEmail = '';

  year = new Date().getFullYear();

  /** Consolidated footer link sections */
  footerSections: { title: string; data: { name: string; route: string; external?: boolean }[] }[] = [
    {
      title: 'Company',
      data: [
        { name: 'Find Doctors', route: '/hospital-list' },
        { name: 'Medicines', route: '/medicines' },
        { name: 'About Us', route: '/about-us/about' },
        { name: 'Contact Us', route: '/contact-us' },
        { name: 'Surgeries', route: '/delhi/treatment' },
        { name: 'Treatments', route: '/delhi/treatment' },
      ],
    },
    {
      title: 'For Patients',
      data: [
        { name: 'Search Doctors', route: '/hospital-list' },
        { name: 'Search Clinics', route: '/hospital-list' },
        { name: 'Search Hospitals', route: '/hospital-list' },
      ],
    },
    {
      title: 'For Providers',
      data: [
        { name: 'Doctor Login', route: 'https://doctor.nectarplus.health/', external: true },
        { name: 'Clinic Login', route: 'https://doctor.nectarplus.health/', external: true },
        { name: 'Hospital Login', route: 'https://doctor.nectarplus.health/', external: true },
      ],
    },
    {
      title: 'Legal',
      data: [
        { name: 'Privacy Policy', route: '/privacy-policy' },
        { name: 'Terms & Conditions', route: '/terms-conditions' },
      ],
    },
  ];

  /** Kept for backward compatibility */
  listing: any = this.footerSections;

  ngOnInit(): void {
    if (this.isBrowser) {
      this.routerEvents$ = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.checkRoute();
        }
      });
      this.getEvents();
    }
    this.checkRoute();
  }

  checkRoute(): void {
    const currentUrl = this.router.url;
    this.newLogin = false;
    this.newRegister = false;

    const data = currentUrl.split('/');
    this.mode = data[1] === 'register' ? 'register' : 'normal';
  }

  ngOnDestroy(): void {
    if (this.routerEvents$) {
      this.routerEvents$.unsubscribe();
    }
    if (this.eventService$) {
      this.eventService$.unsubscribe();
    }
  }

  getEvents() {
    this.eventService$ = this.eventService
      .getEvent("footer")
      .subscribe((res: string) => {
        if (res) {
          this.mode = res;
        }
      });
  }

  /** Toggle mobile accordion section */
  toggleAccordion(index: number): void {
    this.openAccordion = this.openAccordion === index ? null : index;
  }

  /** Handle newsletter subscription */
  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    if (!this.newsletterEmail) return;
    // TODO: Connect to real newsletter API endpoint
    if (this.isBrowser) {
      alert('Thank you for subscribing!');
    }
    this.newsletterEmail = '';
  }

  scrollOnTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    this.eventService.broadcastEvent("reset-header", true);
  }

  redirection(data: any) {
    if (data?.name === "Blog") {
      if (this.isBrowser) {
        window.open("https://blog.nectarplus.health/", "_blank");
      }
    } else if (data?.route) {
      this.router.navigate([data?.route]);
      this.scrollOnTop();
    }
  }

  syncSitemap() {
    if (!this.isBrowser) return;
    this.http.get('/sync-sitemap').subscribe({
      next: (res) => alert('✅ Sitemap synced successfully'),
      error: (err) => alert('❌ Failed to sync sitemap'),
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
