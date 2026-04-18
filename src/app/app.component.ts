import { Component, Inject, inject, NgZone, OnInit, PLATFORM_ID, Renderer2, AfterViewInit, OnDestroy, DOCUMENT, afterNextRender } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import {
  NavigationEnd,
  Router,
  RouterModule
} from "@angular/router";
import { SeoService } from "./services/seo.service";
import { LocalStorageService } from "./services/storage.service";
import { CommonService } from "./services/common.service";
import { fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { UrlNormalizerService } from "./services/url-normalizer.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [RouterModule],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = "nectar";

  isBrowser: boolean;
  deviceSize: number;
  resizeSubscription: Subscription;
  showScrollTop = false;
  private googleMapsScriptLoaded: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private seoService: SeoService,
    private renderer: Renderer2,
    private translate: TranslateService,
    private localStorage: LocalStorageService,
    private commonService: CommonService,
    private urlNormalizerService: UrlNormalizerService,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private _document: any){
     this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
     translate.use("en");

     // Set up scroll-to-top button AFTER hydration completes
     afterNextRender(() => {
       // Check initial scroll position immediately
       this.showScrollTop = window.scrollY > 300;

       // Listen for scroll events (outside zone for performance)
       this.ngZone.runOutsideAngular(() => {
         fromEvent(window, 'scroll')
           .pipe(debounceTime(100), takeUntil(this.destroy$))
           .subscribe(() => {
             const show = window.scrollY > 300;
             if (show !== this.showScrollTop) {
               this.ngZone.run(() => {
                 this.showScrollTop = show;
               });
             }
           });
       });
     });
  }

  ngOnInit(): void {
    this.setInitialDeviceSize();

    // Universal: update canonical + reset robots on every navigation (SSR + browser)
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.seoService.setCanonicalUrl();
          this.seoService.indexAndFollowRobot();
        }
      });

    if (this.isBrowser) {
      // Subscribe to window resize outside Angular zone
      this.ngZone.runOutsideAngular(() => {
        this.resizeSubscription = fromEvent(window, 'resize')
          .pipe(debounceTime(300))
          .subscribe(() => {
            this.ngZone.run(() => this.updateDeviceSize());
          });
      });
    }


  }

  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Fallback: force scroll if smooth doesn't work
      setTimeout(() => {
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
      }, 600);
    }
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    if (!this.googleMapsScriptLoaded) {
      // Defer Google Maps until first user interaction to improve LCP/TBT
      const loadMapsOnce = () => {
        this.loadGoogleMapsScript();
        ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt =>
          window.removeEventListener(evt, loadMapsOnce, { capture: true })
        );
      };
      ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt =>
        window.addEventListener(evt, loadMapsOnce, { capture: true, once: true, passive: true } as AddEventListenerOptions)
      );
    }
  }

  private setInitialDeviceSize(): void {
    if (!this.isBrowser) return;
    const cachedDeviceSize = this.localStorage.getItem('device');
    const width = this.commonService.gettingWinowWidth();

    if (!cachedDeviceSize) {
      this.localStorage.setItem('device', width);
    }

    this.deviceSize = width;
    // console.log('Initial device size:', this.deviceSize);
  }

  private updateDeviceSize(): void {
    const width = this.commonService.gettingWinowWidth();
    this.deviceSize = width;
    this.localStorage.setItem('device', this.deviceSize);
    // console.log('Device size updated on resize:', this.deviceSize);
  }



  // Load Google Maps script only if not already loaded
  loadGoogleMapsScript() {
    if (!this.isBrowser) return;
    if (this.googleMapsScriptLoaded) return;
    if (window['google']?.maps) {
      this.googleMapsScriptLoaded = true;
      return;
    }
    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'src',
      `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_API_KEY}&libraries=places&loading=async`);
    this.renderer.setAttribute(script, 'async', 'true');
    this.renderer.setAttribute(script, 'defer', 'true');
    script.onload = () => {
      this.googleMapsScriptLoaded = true;
    };
    this.renderer.appendChild(this._document.body, script);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }

    if (this.isBrowser) {
      this.localStorage.removeItem("device");
    }
  }
}
