import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { DoctorRequestListComponent } from "../hospital-doctor/components/doctor-request-list/doctor-request-list.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  standalone: false,
  selector: "nectar-hospital-header",
  templateUrl: "./hospital-header.component.html",
  styleUrls: ["./hospital-header.component.scss"],
})
export class HospitalHeaderComponent implements OnInit {
  constructor(
    private localStorage: LocalStorageService,
    private eventService: EventService,
    private apiService: ApiService,
    private matdialog: MatDialog
  ) {}
  showSearch: boolean = false;
  hospitalDetail: any;
  filteredPatients: any[] = [];
  subject = new Subject();
  hospitalName: string;
  profilePic: string;
  notificationList: any = [];
  unreadNotification: number;
  notificationCount: number;
  contantsIcon: any;

  ngOnInit(): void {
    this.getNotifications();
    this.getDoctorRequestList();
    this.profilePic = this.localStorage.getItem("profilePic");
    this.hospitalDetail = JSON.parse(this.localStorage.getItem("userDetail"));
    this.hospitalName = this.localStorage.getItem("establishmentName");
    this.contantsIcon = APP_CONSTANTS;

    this.getEvents();
  }
  onLogout() {
    this.apiService.logout();
  }
  getEvents() {
    this.eventService.getEvent("showDoctorList").subscribe((res: any) => {
      this.showSearch = res;
    });
    this.eventService.getEvent("profilePicChanged").subscribe((res: any) => {
      this.profilePic = res;

      this.localStorage.setItem("profilePic", res);
    });
  }
  onSelectPatient(patients: any) {}

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

  // docotrs request
  totalRequest: number;
  doctorRequestList: any;
  getDoctorRequestList() {
    this.apiService
      .get(API_ENDPOINTS.hospital.doctorRequestList, { page: 1, size: 10 })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            this.totalRequest = count;
            this.doctorRequestList = data;
          } else {
            this.doctorRequestList = [];
            this.totalRequest = 0;
          }
        },
      });
  }

  onRequestList() {
    this.matdialog.open(DoctorRequestListComponent, {
      data: {
        doctorList: this.doctorRequestList,
        totalItems: this.totalRequest,
      },
      autoFocus: false,
    });
  }
}
