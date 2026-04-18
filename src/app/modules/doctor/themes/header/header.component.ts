import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { debounceTime, distinctUntilChanged, fromEvent, map } from "rxjs";
import { EventService } from "src/app/services/event.service";
import { Router } from "@angular/router";
import { EstablishmentRequestComponent } from "../../doctor-settings/pages/establishment/establishment-request/establishment-request.component";
import { MatDialog } from "@angular/material/dialog";
import { CommonService } from "src/app/services/common.service";

@Component({
  standalone: false,
  selector: "nectar-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  hideView: boolean;
  deviceWidth: any;
  constructor(
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private eventService: EventService,
    private router: Router,
    private matdialog: MatDialog,
    private commonService: CommonService,

  ) {}
  doctorDetail: any;
  profilePic: any;
  notificationList: any = [];
  unreadNotification: number;
  notificationCount: number;
  contantsIcon: any;
  @ViewChild("search", { static: true }) search: ElementRef;

  onViewProfile() {
    if (this.redirectCity && this.profileSlug) {
      this.localStorage.setItem("viewDoctorProfileFlag","1")
      const urlSegments = ['/', this.redirectCity, 'doctor', this.profileSlug]; // Ensure the first segment is '/' for absolute path
      this.router.navigate(urlSegments);
    }
  }
  


  
  redirectCity: any;
  establishmentList:any
  getEstablishmentList() {
    this.apiService.get(API_ENDPOINTS.doctor.establishmentList, {}).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          this.establishmentList = data;
  
          this.redirectCity = '';
  
          // Check for isOwner=true, isDeleted=false, and isActive=true
          const ownerActive = data.find(
            (establishment) => 
              establishment.isOwner === true && 
              establishment.isDeleted === false && 
              establishment.isActive === true
          );
  
          if (ownerActive) {
            // Get city and format it
            this.redirectCity = this.formatCityName(ownerActive.hospitalData.address.city);
          } else {
            // Check for isOwner=false, isDeleted=false, and isActive=true
            const notOwnerActive = data.find(
              (establishment) => 
                establishment.isOwner === false && 
                establishment.isDeleted === false && 
                establishment.isActive === true
            );
  
            if (notOwnerActive) {
              // Get city and format it
              this.redirectCity = this.formatCityName(notOwnerActive.hospitalData.address.city);
            }
          }
  
          
        } else {
          this.establishmentList = [];
        }
      },
      error: (error: any) => {
      },
    });
  }
  
  // Helper function to format the city name
  formatCityName(city: string): string {
    return city.toLowerCase().replace(/\s+/g, '-');
  }
  

profileSlug:any
  getSlug() {
    this.apiService
      .get(API_ENDPOINTS.doctor.updateDoctorProfile, {})
      .subscribe((res: any) => {
        this.profileSlug = res?.result[0].doctor.profileSlug;
      });
  }

  ngOnInit(): void {

    this.deviceWidth = this.commonService.gettingWinowWidth();

    const approvalStatus = this.localStorage.getItem("approvalStatus");
    if(approvalStatus==APP_CONSTANTS.PROFILE_STATUS.APPROVE){
      this.hideView=true
    }
    if(approvalStatus==APP_CONSTANTS.PROFILE_STATUS.PENDING ||
       approvalStatus==APP_CONSTANTS.PROFILE_STATUS.DEACTIVATE
       || approvalStatus==APP_CONSTANTS.PROFILE_STATUS.DELETE
       || approvalStatus==APP_CONSTANTS.PROFILE_STATUS.REJECT  ){
      this.hideView=false
    }
    
    this.getSlug()
    this.getEstablishmentList()
    this.searchFunc();
    this.getUserDetail();
    this.getRequestList();
    this.getNotifications();
    this.contantsIcon = APP_CONSTANTS;
    this.profilePic = this.localStorage.getItem("profilePic");
    this.eventService
      .getEvent("profileDetailsChanged")
      .subscribe((res: any) => {
        if (res) {
          this.getUserDetail();
        }
      });
  }





  getUserDetail() {
    this.apiService
      .get(API_ENDPOINTS.doctor.updateDoctorProfile, {})
      .subscribe((res: any) => {
        this.doctorDetail = res?.result[0];
      });
  }
  
  searchFunc() {
    if (this.search) {
      fromEvent(this.search?.nativeElement, "keyup")
        .pipe(
          map((event: any) => {
            return event?.target?.value;
          }),
          debounceTime(200),
          distinctUntilChanged()
        )
        .subscribe((text: string) => {
          let routeArr = this.router.url.split("/");
          if (routeArr[routeArr.length - 1] !== "my-patients" && text.length) {
            this.router.navigate(["/doctor/my-patients"], {
              state: { text: text, type: 2 },
            });
          } else {
            if (text.length > 1) {
              this.eventService.broadcastEvent("tab-change", text);
            } else {
              this.eventService.broadcastEvent("tab-change", "");
            }
          }
        });
    }
  }
  onLogout() {
    this.apiService.logout();
  }
  payload: any = {
    page: 1,
    size: 30,
  };
  getNotifications(scroll: boolean = false) {
    this.apiService
      .get(API_ENDPOINTS.COMMON.getNotification, this.payload)
      .subscribe({
        next: (res: any) => {
          this.unreadNotification = res?.result?.unreadNotification;
          if (scroll) {
            this.notificationList.push(...res?.result?.data);
          } else {
            this.notificationList = res?.result?.data;
          }

          this.notificationCount = res?.result?.count;
        },
        error: (err: any) => {
        },
      });
  }
  onScroll(e: any) {
    if (this.notificationCount > this.notificationList.length) {
      this.payload.page = this.payload.page + 1;
      this.getNotifications(true);
    }
  }
  deleteNotification(data: any) {
    this.apiService
      .putParams(
        API_ENDPOINTS.COMMON.getNotification,
        { isDeleted: true },
        { notificationId: data?._id }
      )
      .subscribe((res: any) => {
        this.getNotifications();
      });
  }

  readNotification(data: any) {
    this.apiService
      .putParams(
        API_ENDPOINTS.COMMON.getNotification,
        { isRead: true },
        { notificationId: data?._id }
      )
      .subscribe((res: any) => {
        this.getNotifications();
      });
  }

  clearAllNotification() {
    this.apiService
      .put(API_ENDPOINTS.COMMON.getNotification, { isClear: true })
      .subscribe((res: any) => {
        this.getNotifications();
      });
  }

  // hospital 's  request
  requestList: any;
  totalRequest: number;
  onOpenRequestDialog() {
    const requestDialog = this.matdialog.open(EstablishmentRequestComponent, {
      width: "90vw",
      data: {
        tableData: this.requestList,
        totalItems: this.totalRequest,
      },
    });
    requestDialog.afterClosed().subscribe({
      next: (res: any) => {
        this.getRequestList();
      },
      error: (error: any) => {
      },
    });
  }
  getRequestList() {
    this.apiService
      .get(API_ENDPOINTS.doctor.establishmentRequestList, {})
      .subscribe({
        next: (res: any) => {
          this.requestList = res.result[0].data;
          this.totalRequest = res.result[0].count;
        },
        error: (error: any) => {
        },
      });
  }
}
