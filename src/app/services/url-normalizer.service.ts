import { Inject, Injectable, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlNormalizerService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;

  constructor(
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    if (this.isBrowser) {
      this.normalizeUrlOnNavigation();
    }
  }

  private normalizeUrlOnNavigation(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationStart) => {
        const originalUrl = event.url;
        const normalizedUrl = this.normalizeUrl(originalUrl);

        if (originalUrl !== normalizedUrl) {
          this.router.navigateByUrl(normalizedUrl, { replaceUrl: true });
        }
      });
  }

  public normalizeUrl(url: string): string {
    try {
      const origin = this.isBrowser ? window.location.origin : 'http://localhost';
      const urlObj = new URL(url, origin);
      return urlObj.pathname.toLowerCase() + urlObj.search + urlObj.hash;
    } catch {
      const lowerCasePath = url.split('?')[0].toLowerCase();
      const queryAndHash = url.substring(lowerCasePath.length);
      return lowerCasePath + queryAndHash;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
