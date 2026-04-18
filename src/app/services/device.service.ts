import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Centralized device detection service.
 * Browser: uses window.innerWidth for viewport-based detection.
 * SSR: parses User-Agent header to detect mobile devices.
 */
@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request: Request | null = inject(REQUEST, { optional: true });

  /** Cached SSR mobile detection result */
  private _ssrIsMobile: boolean | null = null;

  /** Check User-Agent for mobile patterns during SSR */
  private get ssrIsMobile(): boolean {
    if (this._ssrIsMobile === null) {
      const ua = this.request?.headers?.get('user-agent') || '';
      this._ssrIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua);
    }
    return this._ssrIsMobile;
  }

  /** Whether the current device is a mobile phone (<768px) */
  isMobile(): boolean {
    return this.isBrowser ? window.innerWidth < 768 : this.ssrIsMobile;
  }

  /** Whether the current device is a tablet (768–1023px) */
  isTablet(): boolean {
    if (!this.isBrowser) return false;
    const w = window.innerWidth;
    return w >= 768 && w < 1024;
  }

  /** Whether the current device is desktop (≥1024px) */
  isDesktop(): boolean {
    return this.isBrowser ? window.innerWidth >= 1024 : !this.ssrIsMobile;
  }

  /** Get viewport width */
  getWidth(): number {
    if (this.isBrowser) return window.innerWidth;
    return this.ssrIsMobile ? 375 : 1024;
  }

  /** Whether code is running in a browser */
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
