import { Component, OnInit, ViewChild, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { EventService } from 'src/app/services/event.service';
import { LocalStorageService } from 'src/app/services/storage.service';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  standalone: false,
  selector: 'nectar-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss'],
})
export class ThemesComponent implements OnInit, OnDestroy {
  @ViewChild('matdrawer') public matdrawer!: any;
  @ViewChild('matdrawer1') public matdrawer1!: any;

  securityToggle: boolean = false;
  mode: string = '';
  userData: any = null;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private subscriptions: Subscription[] = [];

  // ── Bottom Nav Bar ──
  isMobile = false;
  isLoggedIn = false;
  showLoginModal = false;
  activeBottomTab: 'find-doctors' | 'bookings' | 'profile' | 'menu' | '' = '';

  menus = [
    { name: 'Find the doctors', route: 'hospital-list', icon: 'assets/images/svg/search.svg' },
    { name: 'Surgeries', route: 'treatment', icon: 'assets/images/svg/mat-surgeries.svg' },
    { name: 'Medicines', route: 'medicines', icon: 'assets/images/medicine.svg' },
    { name: 'List your practice for Free', route: 'https://doctor.nectarplus.health/', external: true },
    { name: 'Contact Us', route: '/contact-us', icon: 'assets/images/svg/email.svg' },
    { name: 'Privacy & Policy', route: '/privacy-policy', icon: 'assets/images/svg/mat-privacy.svg' },
    { name: 'Terms & Conditions', route: '/terms-conditions', icon: 'assets/images/svg/mat-terms.svg' },
  ];

  constructor(
    private eventService: EventService,
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private router: Router,
    private commonService: CommonService,
    private deviceService: DeviceService) {}

  ngOnInit(): void {
    // No longer using deviceWidth from localStorage

    // Detect mobile for bottom nav
    this.isMobile = this.deviceService.isMobile();

    // Check login status
    if (this.isBrowser && this.localStorage.getItem('token')) {
      this.isLoggedIn = true;
      this.getUserData();
    }

    // Track active bottom tab based on current URL
    this.updateActiveTab(this.router.url);

    if (this.isBrowser) {
      this.subscriptions.push(
        this.eventService.getEvent('patient-sidenav').subscribe((res: boolean) => {
          if (res) {
            this.matdrawer?.toggle();
          }
        }),

        this.eventService.getEvent('patient-profile-sidenav').subscribe((res: boolean) => {
          if (res) {
            this.matdrawer1?.toggle();
          }
        }),

        this.eventService.getEvent('profile-update').subscribe((res: any) => {
          if (res) {
            this.getUserData();
          }
        }),

        this.eventService.getEvent('login').subscribe((res: any) => {
          if (res) {
            this.getUserData();
          }
        }),

        this.eventService.getEvent('showheader').subscribe((res: string) => {
          if (res) {
            this.mode = res;
          }
        })
      );

      // Listen to route changes to update active bottom tab
      this.subscriptions.push(
        this.router.events.pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd)
        ).subscribe((e) => {
          this.updateActiveTab(e.urlAfterRedirects || e.url);
        })
      );

      // Listen for resize to update mobile state
      this.subscriptions.push(
        this.eventService.getEvent('login').subscribe((res: any) => {
          // Also update isLoggedIn when login event fires
          // (already subscribed above for getUserData, this is a safety net)
          if (res) {
            this.isLoggedIn = true;
          }
        })
      );
    }

    this.setModeFromUrl();
  }

  private setModeFromUrl(): void {
    const segments = this.router.url.split('/');
    this.mode =
      segments[1] === 'register' || segments[2] === 'register' ? 'register' : segments[2] || '';
  }

  private getUserData(): void {
    const userType = this.localStorage.getItem('userType');

    // Only fetch user data if userType is not 1 (patient) or if it's for the mobile view.
    // The desktop view will handle fetching the user data for logged-in users if needed elsewhere.
    // This condition can be refined based on where `userData` is primarily used.
    if (userType === '1') { // Assuming '1' is the patient userType
      this.apiService.get(API_ENDPOINTS.patient.getUserDetail, {}).subscribe({
        next: (res: any) => {
          this.userData = res?.result || null;
        },
        error: (err) => {
          console.error('Failed to fetch user data:', err);
        },
      });
    }
  }

  logout(): void {
    this.apiService.logout();
  }

  onClose(drawerIndex: number): void {
    if (drawerIndex === 1) {
      this.matdrawer?.toggle();
    } else {
      this.matdrawer1?.toggle();
    }
  }

  // ── Bottom Nav Methods ──

  private updateActiveTab(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    if (path.startsWith('/hospital-list')) {
      this.activeBottomTab = 'find-doctors';
    } else if (path === '/profile' || path.startsWith('/profile/')) {
      // Check if it's personal-info specifically
      if (path.startsWith('/profile/personal-info')) {
        this.activeBottomTab = 'profile';
      } else {
        this.activeBottomTab = 'bookings';
      }
    } else {
      this.activeBottomTab = '';
    }
  }

  onBottomNavClick(tab: 'find-doctors' | 'bookings' | 'profile' | 'menu'): void {
    if (tab === 'find-doctors') {
      this.router.navigate(['/hospital-list']);
      return;
    }

    if (tab === 'menu') {
      this.eventService.broadcastEvent('patient-sidenav', true);
      return;
    }

    // Bookings and Profile require login
    if (!this.isLoggedIn) {
      this.showLoginModal = true;
      return;
    }

    if (tab === 'bookings') {
      this.router.navigate(['/profile']);
    } else if (tab === 'profile') {
      this.router.navigate(['/profile/personal-info']);
    }
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  goToLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/auth/patient/login']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
