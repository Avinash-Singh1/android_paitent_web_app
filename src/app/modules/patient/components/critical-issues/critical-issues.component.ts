import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/device.service';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { API_ENDPOINTS } from 'src/app/config/api.constant';

@Component({
  standalone: false,
  selector: 'nectar-critical-issues',
  templateUrl: './critical-issues.component.html',
  styleUrls: ['./critical-issues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush })
export class CriticalIssuesComponent implements OnInit {
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  isMobileView: boolean = false;
  cardWidth: number = 200;
  apiData: any = [];
  loading: boolean = true;


  constructor(
    private apiService: ApiService,
    private router: Router,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    // Use DeviceService for browser-aware mobile detection
    const width = this.deviceService.getWidth();
    this.isMobileView = width < 767;
    if (this.isMobileView) this.cardWidth = 135;

    this.getListing();
  }

  getListing() {
    this.loading = true;
    this.apiService.get(API_ENDPOINTS.patient.criticalIssuesHome, {})
      .subscribe({
        next: (res: any) => {
          const result = res?.result || [];

          if (this.isMobileView) {
            const grouped = [];
            for (let i = 0; i < result.length; i += 2) {
              grouped.push([result[i], result[i + 1]]);
            }
            this.apiData = grouped;
          } else {
            this.apiData = result;
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  viewDoctor(name: string) {
    const hyphenated = this.commonService.replaceSpaceWithHyphen(name);
    this.router.navigate([`/delhi/${hyphenated}`]);
  }

  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    center: false,
    dots: false,
    mouseDrag: true,
    margin: 24,
    navText: [
      '<img src="assets/images/homepage/purple arrow right.svg" alt="Previous" width="42" height="42">',
      '<img src="assets/images/homepage/purple arrow right.svg" alt="Next" width="42" height="42">',
    ],
    autoWidth: true,
    responsive: {
      0: { items: 2, nav: true },
      768: { items: 2, nav: true },
      1200: { items: 6 },
      1440: { items: 7 } } };

  trackByIndex(index: number): number {
    return index;
  }
}
