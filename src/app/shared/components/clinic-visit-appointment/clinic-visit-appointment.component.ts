import { DatePipe, isPlatformBrowser } from "@angular/common";
import { ChangeDetectorRef, Component, inject, Input, OnInit, PLATFORM_ID, ViewChild } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { CarouselComponent, OwlOptions } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { SelectEstablishmentComponent } from "src/app/modules/patient/pages/hospitals/select-establishment/select-establishment.component";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { getCurrentOrNextYear } from "src/app/services/helper.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { MatDialog } from '@angular/material/dialog';
import { LoginModalComponent } from "src/app/modules/patient/pages/hospitals/login-modal/login-modal.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
  standalone: false,
  selector: "nectar-clinic-visit-appointment",
  templateUrl: "./clinic-visit-appointment.component.html",
  styleUrls: ["./clinic-visit-appointment.component.scss"],
})
export class ClinicVisitAppointmentComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private doctorDetailSubject = new BehaviorSubject<any>(null);
  doctorDetail$: Observable<any> = this.doctorDetailSubject.asObservable();
  toggle: boolean = false;
  selectedTab: number = 1;
  stateList: any;

  @ViewChild("carousel") carousel: CarouselComponent;
  @Input() newsId: any;
  @Input() establishmentIds: any;
  @Input() date: any = null;
  @Input() type: string = "component";

  hospitaldata: any = {};

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    startPosition: 0,
    margin: 0,
    center: true,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1.8,
      },
      300: {
        items: 3,
      },
    },
    nav: true,
  };
  focusDate: any;
  constructor(
    private datepipe: DatePipe,
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private router: Router,
    private datePipe: DatePipe,
    private eventService: EventService,
    public gService: GoogleMapsService,
    public _bottomSheet: MatBottomSheet,
    private commonService: CommonService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef) {
    // browser-safe: returns UA-based width during initial render, window.innerWidth in browser
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }
  timing: unknown[] = [];
  slots: any = [];
  deviceWidth: number;
  ngOnInit(): void {
    // Skip HTTP calls during initial render — appointment slots are non-critical for initial page render

    // this.getState()
    this.getFutureDates();
    if (this.date) {
      let currentYear = new Date().getFullYear();
      if (this.dates.indexOf(this.date) != -1) {
        this.customOptions.startPosition = this.dates.indexOf(this.date);
      } else if (
        new Date(this.date + " " + currentYear).getDate() ==
        new Date().getDate()
      ) {
        this.customOptions.startPosition = 0;
      } else {
        this.customOptions.startPosition = 1;
      }
      this.focusDate = this.date.toString();
    } else {
      // console.log("else this data: ",this.date);
      let date = new Date();
      this.focusDate = this.datePipe.transform(date, "EEE, d MMM");
    }

    this.eventService.getEvent("doctor-clinic").subscribe((res: any) => {
      if (res) {
        this.newsId = res?.id;
        this.establishmentIds = res?.establishmentId;
        this.selectedHospital = { _id: this.establishmentIds };
        this.getDoctorDetails();
        this.cdr.markForCheck();
      }
    });

    this.getDoctorDetails();

    this.eventService.getEvent("hospital-data").subscribe((res: any) => {
      if (res) {
        this.selectHospital(res);
        this.toggle = !this.toggle;
        this.cdr.markForCheck();
      }
    });

  }
  onCarouselInitialized(event: any) { }

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

  getStateName(stateId: string): string {
    const state = this.stateList.find((s: { _id: string; name: string }) => s._id === stateId);
    return state ? state.name : 'Unknown State'; // Fallback if state not found
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

  selectTab(tabNumber: number) {



    if(this.establishmentDetail[0]?.consultationFees==-1 || this.establishmentDetail[0]?.consultationFees==0 || this.establishmentDetail[0]?.consultationFees==null || this.establishmentDetail[0]?.consultationFees==undefined){
      this.selectedTab=2
      this.hideFlagTab=1
    }
    if(this.establishmentDetail[0]?.videoConsultationFees==-1 || this.establishmentDetail[0]?.videoConsultationFees==0 || this.establishmentDetail[0]?.videoConsultationFees==null || this.establishmentDetail[0]?.videoConsultationFees==undefined){
      this.selectedTab=1
      this.hideFlagTab=2
    }

    if(this.hideFlagTab!=tabNumber)
    this.selectedTab = tabNumber;
  }


  carouselChange(event: any) {
    this.changeHospitalFlag=true

    this.focusDate = this.dates[event?.startPosition];
    if (this.focusDate == "Today") {
      let date = new Date();
      this.focusDate = this.datepipe.transform(date, "EEE, d MMM");
    } else if (this.focusDate == "Tomorrow") {
      let today = new Date();
      today.setDate(today.getDate() + 1);
      this.focusDate = this.datepipe.transform(today, "EEE, d MMM");
    }
    this.getDoctorDetails();
  }

  dates: any = [];
  getFutureDates() {
    let today = new Date();

    for (let i = 0; i < 14; i++) {
      let date: any = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      date = this.datepipe.transform(date, "EEE, d MMM");
      this.dates.push(date);
    }
    this.dates[0] = "Today";
    this.dates[1] = "Tomorrow";
  }
  establishmentDetail: any = [];
  morningSlots: any = [];
  noonSlots: any = [];
  eveSlots: any = [];
  availableSlots: any;
  doctorDetail: any;
  hideFlagTab:any=0
  getDoctorDetails(obj: any = {}) {

    this.localStorage.removeItem("loginUserDetails")

    let params: any = {
      dateString: this.focusDate + ", " + getCurrentOrNextYear(this.focusDate),
      docId: this.newsId,
    };

    if (obj?.establishmentId) {
      params.establishmentId = obj.establishmentId;
    } else if (this.selectedHospital) {
      params.establishmentId = this.selectedHospital._id;
    } else {
      params.establishmentId = this.establishmentIds;
    }

    this.apiService
      .get(`${API_ENDPOINTS.patient.clinicVisitAppointment}`, params)
      .subscribe((res: any) => {
        // console.log("clinic visit appointment res: ",res);

        this.doctorDetail = res?.result?.doctors?.[0];
        this.localStorage.setItem("loginUserDetails", JSON.stringify(this.doctorDetail))

        this.establishmentDetail =
        res?.result?.doctors[0]?.establishmentDetails;

        if(!this.changeHospitalFlag){
          if(this.establishmentDetail[0]?.consultationType=='video'){
            this.selectedTab=1
            this.hideFlagTab=2
          }
          if(this.establishmentDetail[0]?.videoConsultationFees==null){
            this.selectedTab=1
            this.hideFlagTab=2
          }
          if(this.establishmentDetail[0]?.consultationType=='In-clinic' && this.establishmentDetail[0]?.consultationDetails.isVideo==false ){
            this.selectedTab=1
            this.hideFlagTab=2
          }



          if(this.establishmentDetail[0]?.consultationFees==-1 || this.establishmentDetail[0]?.consultationFees==0 || this.establishmentDetail[0]?.consultationFees==null || this.establishmentDetail[0]?.consultationFees==undefined){
            this.selectedTab=2
            this.hideFlagTab=1
          }
          if(this.establishmentDetail[0]?.videoConsultationFees==-1 || this.establishmentDetail[0]?.videoConsultationFees==0 || this.establishmentDetail[0]?.videoConsultationFees==null || this.establishmentDetail[0]?.videoConsultationFees==undefined){
            this.selectedTab=1
            this.hideFlagTab=2
          }
        }

        this.changeHospitalFlag=false



        if (this.selectedHospital) {
          let index = this.establishmentDetail.findIndex(
            (x: any) => x._id == this.selectedHospital._id
          );

          let temp = this.establishmentDetail[0];
          this.establishmentDetail[0] = this.establishmentDetail[index];
          this.establishmentDetail[index] = temp;
        }

        this.morningSlots = res?.result?.timeSlot?.morningSlots;
        this.noonSlots = res?.result?.timeSlot?.afternoonSlots;
        this.eveSlots = res?.result?.timeSlot?.eveningSlots;
        this.availableSlots = res?.result?.availableSlot;

        this.cdr.markForCheck();
      });
  }

  selectedHospital: any
  changeHospitalFlag: boolean=false;
  selectHospital(data: any ) {

    this.changeHospitalFlag=true
    this.selectedHospital = data;

    if(data?.consultationFees==-1  ) {
      this.selectedTab=2
      this.hideFlagTab=1

    }

    else if(data?.videoConsultationFees==-1 ) {
      this.selectedTab=1
      this.hideFlagTab=2

    }
    else{
      this.hideFlagTab=3
    }

    this.getDoctorDetails({ establishmentId: data._id });

    this.toggle = !this.toggle;
  }

  selectTime(time: any, shift: string) {
    if (this.deviceWidth < 767) {
      this._bottomSheet.dismiss();
    }

    this.localStorage.removeItem("appoint-time")
    this.localStorage.removeItem("appoint-type")
    const userType = this.localStorage.getItem("userType");

    let obj = {
      date: this.focusDate + ", " + getCurrentOrNextYear(this.focusDate),
      time: time,
      establishmentId:
        this.selectedHospital?._id ?? this.establishmentDetail[0]?._id,
      consultFee:
        this.selectedHospital?.consultationFees ??
        this.establishmentDetail[0]?.consultationFees,
      consultVideoFee:
        this.selectedHospital?.videoConsultationFees ??
        this.establishmentDetail[0]?.videoConsultationFees,
    };
    this.localStorage.setItem("appoint-time", JSON.stringify(obj));
    this.localStorage.setItem("appoint-type", JSON.stringify(this.selectedTab));

    if (userType == APP_CONSTANTS.USER_TYPES.PATIENT) {

      if (this.localStorage.getItem("token")) {
        this.router.navigate(["/appointment-booking"]);
        if (this.isBrowser) window.scrollTo(0, 0);
      } else {
        this.localStorage.setItem("appointmentBooking", true);
        this.router.navigate(["/auth/patient/login"]);
      }
    } else {
      this.dialog.open(LoginModalComponent, {
        width: '484px', // Adjust the size as per your needs
        disableClose: true,
        data: {
          type: 'patient', // Or other data you want to pass to the modal
          // name: this.doctorDetail?.name, // Example of data being passed
        },
      });
      return;
    }

  }

  getClickedDate(data: any) {
    this.carousel.to(data);
  }

  changeClinicMobile() {
    this._bottomSheet.open(SelectEstablishmentComponent, {
      data: { doctorId: this.newsId, openSheet: true },
    });
  }

  shouldShowInClinicField(): boolean {

    const doctorDetail = JSON.parse(this.localStorage.getItem("doctor-detail")) || {};
    const isTrue = doctorDetail?.consultationType === 'In-clinic' &&
      doctorDetail.consultationDetails?.isInClinic;
    return isTrue
  }

  shouldShowVideoField(): boolean {
    const doctorDetail = JSON.parse(this.localStorage.getItem("doctor-detail")) || {};
    if (doctorDetail?.consultationType === 'video') {
      return true;
    }
    const isTrue = doctorDetail?.consultationType === 'In-clinic' &&
      doctorDetail?.consultationDetails?.isVideo;
    return isTrue;
  }

  trackByIndex(index: number): number { return index; }
}
