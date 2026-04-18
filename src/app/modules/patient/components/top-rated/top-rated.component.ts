import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, Input, OnInit, ViewChild, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from "@angular/router";
import { OwlOptions } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { DeviceService } from "src/app/services/device.service";
import { SearchService } from "src/app/services/search.service";


@Component({
  standalone: false,
  selector: "nectar-top-rated",
  templateUrl: "./top-rated.component.html",
  styleUrls: ["./top-rated.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush })
export class TopRatedComponent implements OnInit, AfterViewInit {
  width: any = 0;
  cardWidth: any = 310;
  @Input() type = 0;
  @Input() id: any = "";
  totalWidth: any = 0;
  rightButton: boolean = true;
  activeSlideIndex: number = 0;

  leftButtonDisable = true;
  rightButtonDisable = false;
  loading: boolean = true;

  topListing: any[] = [];

  @ViewChild("owlCar") owlCar: any;

  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    dots: false,
    autoWidth: true,
    startPosition: 0,
    margin: 32 };

//   customOptions: OwlOptions = {
//   loop: false,
//   autoplay: false,
//   dots: false,
//   autoWidth: true,
//   margin: 32,
// };

  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));


  constructor(
    private apiService: ApiService,
    private router: Router,
    private commonService: CommonService,
    @Inject(DOCUMENT) private _document: Document,
    private cdr: ChangeDetectorRef,
    private deviceService: DeviceService,
    private searchService: SearchService
  ) {}

  // ngOnInit(): void {

  //  //   if (!this.isBrowser) return;
  //   this.width = this.commonService.gettingWinowWidth();
  //   if (this.width < 767) {
  //     this.cardWidth = 260;
  //   }
  //   console.log("this.width : ",this.width);
  //   this.getTopRatedList();
  // }

  ngOnInit(): void {
  // Use DeviceService for browser-aware width (works on both server & browser)
  this.width = this.deviceService.getWidth();
  if (this.width < 767) {
    this.cardWidth = 260;
  }

  // ✅ Always call this for initial pre-rendering
  this.getTopRatedList();
}

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const val = this._document.getElementById(this.id);
    if (val && val.clientWidth >= val.scrollWidth) {
      this.rightButton = false;
    }
    this.totalWidth = val?.scrollWidth;
  }

  @HostListener("window:resize")
  onResize(): void {
    if (!this.isBrowser) return;
    this.width = this.commonService.gettingWinowWidth();
  }

  getTopRatedList(): void {
    this.loading = true;
    this.apiService.get(API_ENDPOINTS.doctor.topRatedDoctors, { city: this.searchService.currentCity || '' })
      .subscribe({
        next: (res: any) => {
          this.topListing =
            this.type === 0
              ? res?.result?.topDentalDoc || []
              : res?.result?.shortestTimecardiologist || [];
          const isSingleCard = this.topListing.length < 2;
          this.leftButtonDisable = isSingleCard;
          this.rightButtonDisable = isSingleCard;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  scrollRight(id: any): void {
    if (!this.isBrowser) return;

    this.leftButtonDisable = false;
    if (this.topListing.length - 1 > this.activeSlideIndex) {
      this.owlCar?.next();
    } else {
      this.rightButtonDisable = true;
    }
  }

  scrollLeft(id: any): void {
    if (!this.isBrowser) return;

    this.rightButtonDisable = false;
    if (this.activeSlideIndex == 0) {
      this.leftButtonDisable = true;
    }
    this.owlCar?.prev();
  }

  onSlideActivated(event: any): void {
    this.activeSlideIndex = event.startPosition;
  }

  viewDoctor(str: string): void {
    this.router.navigate([
      `/delhi/${str === "dental" ? "dentist" : "orthopedist"}`,
    ]);
  }

  trackById(index: number, item: any): any {
    return item?._id || index;
  }
}
