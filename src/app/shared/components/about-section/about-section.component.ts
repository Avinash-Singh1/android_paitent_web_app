import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, inject, PLATFORM_ID } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { ClinicappointmentComponent } from "../clinicappointment/clinicappointment.component";
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ImageViewModalComponent } from "../../image-view-modal/image-view-modal.component";
import { BottomSheetClinicVisitComponent } from "../bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { CommonService } from "src/app/services/common.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-about-section",
  templateUrl: "./about-section.component.html",
  styleUrls: ["./about-section.component.scss"],
})
export class AboutSectionComponent implements OnInit {
  private isBrowser: boolean;
  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private router: Router,
    private formatTime: FormatTimeService,
    public gService: GoogleMapsService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private _bottomSheet: MatBottomSheet,
    private commonService: CommonService,
    private localStorage: LocalStorageService
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    // browser-safe: returns UA-based width (375/768/1440) during initial render,
    // window.innerWidth in browser — so initial render and hydration agree.
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }
  @Input() id: any;
  @Input() city: any;
  @Input() doctorDetail: any;
  isExpanded: boolean = false; // Tracks the current state of expansion.
  @Output() establishEvent = new EventEmitter<string>();
  stateList: any;
  @Output() backdrop = new EventEmitter();
  deviceWidth: number;
  openPanel: string | null = null;

  togglePanel(panel: string): void {
    this.openPanel = this.openPanel === panel ? null : panel;
  }

  get isMobileView(): boolean {
    return this.deviceWidth < 768;
  }

  ngOnInit(): void {
  }
  aboutData: any;

  // getState() {
  //   this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
  //     next: (res) => {
  //       this.stateList = res.result.data;
  //     },
  //     error: (error: any) => {
  //       this.stateList = [];
  //     },
  //   });
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["doctorDetail"] && this.doctorDetail) {
      this.processDoctorData();
    }
  }

//   processDoctorData() {
//     this.aboutData = { ...this.doctorDetail };
//     this.aboutData?.establishmentmaster.forEach((element: any) => {
//       let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
//       if (element.establishmenttiming[0]) {
//         Object.keys(element.establishmenttiming[0]).forEach((key) => {
//           if (!days.includes(key)) delete element.establishmenttiming[0][key];
//         });
//       }
//       element.establishmenttiming = element.establishmenttiming[0];
//       // Assuming you have a dateTimeConversion utility function
//       element.establishmenttiming = this.formatTime.dateTimeConversion(
//         element.establishmenttiming
//       );

//       this.establishEvent.emit(this.aboutData.establishmentmaster[0].name)
//     });

//  }

processDoctorData() {
  this.aboutData = JSON.parse(JSON.stringify(this.doctorDetail)); // deep copy

  this.aboutData.establishmentmaster.forEach((element: any) => {
    let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

    if (Array.isArray(element.establishmenttiming) && element.establishmenttiming[0]) {
      let timingObj = element.establishmenttiming[0];

      Object.keys(timingObj).forEach((key) => {
        if (!days.includes(key)) delete timingObj[key];
      });

      const formattedTiming = this.formatTime.dateTimeConversion(timingObj);

      // 🔥 wrap back into array so *ngFor works
      element.establishmenttiming = Object.values(formattedTiming);
    }
  });

  this.establishEvent.emit(this.aboutData.establishmentmaster[0].name);
}

  getAbout() {

    if (!this.id) return;

    this.apiService
      .get(`${API_ENDPOINTS.patient.doctorDetail}`, {
        doctorId: this.id,
      })
      .subscribe((res: any) => {
        this.aboutData = res?.result[0];
        this.aboutData?.establishmentmaster.forEach((element: any) => {
          let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
          if (element.establishmenttiming[0]) {
            Object.keys(element.establishmenttiming[0]).forEach((key) => {
              if (!days.includes(key))
                delete element.establishmenttiming[0][key];
            });
          }
          element.establishmenttiming = element.establishmenttiming[0];
          element.establishmenttiming = this.formatTime.dateTimeConversion(
            element.establishmenttiming
          );
        });

      });
  }

  bookAppoint(item: any) {
    // Blur active element to prevent aria-hidden conflict when CDK overlay opens
    if (this.isBrowser && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (this.deviceWidth > 1024) {
      this.backdrop.emit(item);
      this.eventService.broadcastEvent("hospital-data", item);
    } else {
      let date = this.datePipe.transform(new Date(), "EEE, d MMM");
      this.dialog.open(ClinicappointmentComponent, {
        width: "490px",
        panelClass: "yespost",
        data: {
          date: date,
          id: this.id,
          establishmentId: item?._id,
        },
        autoFocus: false,
      });
    }
  }

  viewHospital(data: any) {
    if(data.consultationFees!=-1){
      const city = data?.address?.city.split(" ").join("-").toLowerCase();
      this.router.navigate([`${city}/hospital/${data?.profileSlug}`]);
    }

  }

  getCity(item: any): string {
    return item?.address?.city?.split(" ").join("-").toLowerCase() || '';
  }

  viewImage(images: any[], index: number) {
    if (this.isBrowser && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const urls = images.map((img: any) => img?.url).filter(Boolean);
    this.dialog.open(ImageViewModalComponent, {
      data: { images: urls, index },
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy(),
    });
  }

  openBottomSheet(data: any = {}) {
    // Blur active element to prevent aria-hidden conflict when CDK overlay opens
    if (this.isBrowser && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this._bottomSheet.open(BottomSheetClinicVisitComponent, {
      data: {
        newsId: this.id,
        establishmentIds: data?._id,
      },
    });
    this.eventService.broadcastEvent("hospital-data", data);
  }

  openGoogleMaps(item: any): void {

    if(item?.location?.coordinates?.[1]== 28.6448 && item?.location?.coordinates?.[0]== 77.216721)
    {
      const address = `${item?.address?.landmark} ${item?.address?.locality}, ${item?.address?.city}, ${this.getStateName(item?.address?.state)} ${item?.address?.pincode}`;

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

      if (this.isBrowser) {
        window.open(googleMapsUrl, '_blank');
      }
    }
    else{
      this.gService.redirectToGoogleMaps(
        item?.location?.coordinates?.[1] ,
        item?.location?.coordinates?.[0]
      )
    }
  }

  getStateName(stateId: string): string {
    const state = this.stateList.find((s: { _id: string; name: string }) => s._id === stateId);
    return state ? state.name : 'Unknown State'; // Fallback if state not found
  }
  navigateToSearch(routeName: string) {
    const city = this.commonService.replaceSpaceWithHyphen(this.aboutData?.establishmentmaster?.[0]?.address?.city);
    this.router.navigate([city + '/doctors-for-' + routeName]);
  }
  toggleReadMore(): void {
    this.isExpanded = !this.isExpanded;
  }
  get cityName(): string {
    return this.commonService.replaceSpaceWithHyphen(this.aboutData?.establishmentmaster?.[0]?.address?.city);
  }

  formatName(name: string): string {
    if (!name) return '';
    return name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-$/, '');
  }

  trackByName(index: number, item: any): string { return item?.name || index; }
  trackByIndex(index: number): number { return index; }
}

