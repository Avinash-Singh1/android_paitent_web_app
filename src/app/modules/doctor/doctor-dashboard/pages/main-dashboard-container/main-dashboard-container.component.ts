import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit, Renderer2, DOCUMENT } from "@angular/core";
import { AbstractControlOptions, FormBuilder, FormGroup } from "@angular/forms";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { ngxCsv } from "ngx-csv/ngx-csv";
import { FormValidationService } from "src/app/services/form-validation.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-main-dashboard-container",
  templateUrl: "./main-dashboard-container.component.html",
  styleUrls: ["./main-dashboard-container.component.scss"],
})
export class MainDashboardContainerComponent implements OnInit {
  hideView: boolean;
  constructor(
    private eventService: EventService,
    private apiService: ApiService,
    private datepipe: DatePipe,
    private fb: FormBuilder,
    private formvalidation: FormValidationService,
    private renderer: Renderer2,
    private localStorage: LocalStorageService,
    private seoService: SeoService,

    @Inject(DOCUMENT) private _document: Document
  ) { }



  filterForm: FormGroup;
  today: Date = new Date();
  upcoming: boolean = false;
  payload: any = {
    page: 1,
    size: 5,
  };
  BOOKING_STATUS = {
    0: "Pending",
    1: "Completed",
    2: "Pending",
    "-1": "Cancelled",
    "-2": "Rescheduled",
  };
  totalItems: number = 0;
  cardsArray: any = [
    {
      label: "Completed",
      count: 0,
      class: "completed",
      icon: "assets/images/svg/bluetick.svg",
      upcoming: false,
    },
    {
      label: "Pending",
      count: 0,
      class: "pending",
      icon: "assets/images/svg/Pending actions.svg",
      upcoming: false,
    },
    {
      label: "Total Appointment",
      count: 0,
      class: "total-appointment",
      upcoming: false,
    },
    {
      label: "Total Appointment",
      count: 0,
      class: "total-appointment",
      upcoming: true,
    },
  ];
  appointmentList = [];
  validateForm() {
    this.filterForm = this.fb.group(
      {
        status: [],
        fromDate: [],
        toDate: [],
      },
      {
        validator: [this.formvalidation.fromToValidation("fromDate", "toDate")],
      } as AbstractControlOptions
    );
  }

  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
  }

  ngOnInit(): void {
    const approvalStatus = this.localStorage.getItem("approvalStatus");
    if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.APPROVE) {
      this.hideView = false
    }
    if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.PENDING ||
      approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DEACTIVATE
      || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DELETE
      || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.REJECT) {
      this.hideView = true
    }


    this.getCardsData();
    this.getAppointmentList();
    this.validateForm();
    this.filterForm.valueChanges.subscribe((res: any) => { });
    //marketing tags 
    this.seoService.appendScript(
      `gtag('event', 'conversion', {'send_to': 'AW-11399196295/DCIpCKeS-PMYEIfdx7sq'});`,
      this.renderer
    );
  }
  changingPage(event: any) {
    this.payload.page = event;
    setTimeout(() => {
      this._document.getElementById("appointmentList-table")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
    this.getAppointmentList();
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  getCardsData() {
    this.apiService
      .post(API_ENDPOINTS.doctor.appointmentCount, {
        today: this.datepipe.transform(new Date(), "yyyy-MM-dd"),
      })
      .subscribe({
        next: (res: any) => {
          this.cardsArray[0].count = res.result?.todayData ?? 0;
          this.cardsArray[1].count = res.result?.pendingData ?? 0;
          this.cardsArray[2].count = res.result?.todayTotalCount ?? 0;
          this.cardsArray[3].count = res.result?.totalData ?? 0;
        },
        error: (error: any) => {
        },
      });
  }
  changingView(upcoming: boolean = true) {
    this.filterForm.reset();
    this.payload = {
      page: 1,
      size: 5,
    };
    this.upcoming = upcoming;
    this.getAppointmentList();
  }
  getAppointmentList() {
    const payload = JSON.parse(JSON.stringify(this.payload));
    for (let key in payload) {
      if (!payload[key] && payload[key] != 0) {
        delete payload[key];
      }
    }
    this.apiService
      .get(API_ENDPOINTS.doctor.appointmentList, {
        upcoming: this.upcoming,
        ...payload,
      })
      .subscribe({
        next: (res: any) => {
          if (res.result) {
            const { count, data } = res.result;
            this.appointmentList = data;
            this.totalItems = count ?? 0;
          }
        },
        error: (error: any) => {
          this.appointmentList = [];
          this.totalItems = 0;
        },
      });
  }
  onFiltering() {
    if (this.filterForm.valid) {
      for (let key in this.filterForm.value) {
        if (this.filterForm.value[key] != null) {
          this.payload[key] = this.filterForm.value[key];
        }
      }
      this.getAppointmentList();
    }
  }



  formatDate(date:any){

    // console.log('data from dashboard',date)
    const time = this.datepipe.transform(date, "h:mm a", "+0530");

    // console.log('formated time from dashboard',time)
    return time


  }
  onResetForm() {
    this.filterForm.reset();
    this.payload = {
      page: 1,
      size: 5,
    };
    this.getAppointmentList();
  }
  onExport() {
    const options = {
      headers: [
        "Patient Name",
        "Appointment Date",
        "Timing",
        "Establishment Name",
        "Appointment Fees",
        "Status",
      ],
    };
    const payload = JSON.parse(JSON.stringify(this.payload));
    delete payload.page;
    delete payload.size;
    payload.isExport = true;
    this.apiService
      .get(API_ENDPOINTS.doctor.appointmentList, {
        ...payload,
        upcoming: this.upcoming,
      })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            const csvData = data.map((appointment: any) => {
              return {
                patientName: appointment.fullName,
                appointmentDate: this.datepipe.transform(
                  appointment.date,
                  "dd, EEE yyyy"
                ),
                appointmentTime: this.datepipe.transform(
                  appointment.date,
                  "h:mm a"
                ),
                hospitalName: appointment.hospitalName,
                appointmentFees: appointment.consultationFees,
                status: this.BOOKING_STATUS[appointment.status],
              };
            });
            return new ngxCsv(csvData, "AppointmentList", options);
          }
          return null;
        },
        error: (error: any) => {
        },
      });
  }

  // added by Yaser
  //custom js start
  // constructor(private renderer: Renderer2) {}
  onMenuClick() {
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu) {
      if (sideMenu.classList.contains("mobileMenu")) {
        this.renderer.removeClass(sideMenu, "mobileMenu");
      } else {
        this.renderer.addClass(sideMenu, "mobileMenu");
      }
    }
  }

  onCloseMenuClick() {
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }
  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent the default action of the anchor tag

    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;

    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display =
        submenu.style.display === "block" ? "none" : "block";

      // Optionally hide other submenus if needed
      const allSubmenus = document.querySelectorAll(".submenu");
      allSubmenus.forEach((sm) => {
        if (sm !== submenu) {
          (sm as HTMLElement).style.display = "none";
        }
      });
    }
  }
  //custom js end
}
