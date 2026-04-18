import { Component, OnDestroy, OnInit, ViewChild, Renderer2, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { Subject, Subscription, filter, takeUntil } from "rxjs";

import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-themes",
  templateUrl: "./themes.component.html",
  styleUrls: ["./themes.component.scss"],
})
export class ThemesComponent implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  @ViewChild("matdrawer") public matdrawer;
  matDrawer$: Subscription;
  private destroy$ = new Subject<void>();
  open: boolean = false;
  subheader: boolean = false;
  showHeader: boolean = true;

  constructor(
    private eventService: EventService,
    private router: Router,
    private seoService: SeoService,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    this.seoService.noIndexRobot();
    this.getEvents();
    this.showHeader = this.router.url != "/doctor/calendar";
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd && this.isBrowser) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
  }

  onClose() {
    this.matdrawer.toggle();
  }

  ngOnDestroy(): void {
    this.matDrawer$?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.indexAndFollowRobot();
  }

  getEvents() {
    this.matDrawer$ = this.eventService
      .getEvent("sidenav")
      .subscribe((res: boolean) => {
        if (res) {
          this.matdrawer.toggle();
        }
      });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart), takeUntil(this.destroy$))
      .subscribe((event: NavigationStart) => {
        const { url } = event;
        this.showHeader = url != "/doctor/calendar";
      });
  }
}
