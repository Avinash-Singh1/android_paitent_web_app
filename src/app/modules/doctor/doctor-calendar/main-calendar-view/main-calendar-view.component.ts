import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Renderer2, ViewContainerRef, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import tippy, { hideAll } from "tippy.js";
import moment from 'moment';
import { Subscription } from "rxjs";
import { PatientDetialsComponent } from "src/app/modules/doctor-hospital-shared/components/patient-detials/patient-detials.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { LocalStorageService } from "src/app/services/storage.service";
import { buildMeetUrl } from "src/app/utils/meet-url.helper";

@Component({
  standalone: false,
  selector: "nectar-main-calendar-view",
  templateUrl: "./main-calendar-view.component.html",
  styleUrls: ["./main-calendar-view.component.scss"],
})
export class MainCalendarViewComponent implements OnInit, OnDestroy {
  hideView: boolean;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** The logged-in doctor's email, used to append ?authuser= to Meet links. */
  doctorEmail: string = '';

  constructor(
    private eventService: EventService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private renderer: Renderer2,
    private datepipe: DatePipe,
    private containerRef: ViewContainerRef,
    private localStorage: LocalStorageService,

    @Inject(DOCUMENT) private _document: Document) { }
  monthdetails: Date = new Date();
  viewmode: string = "month";
  today: any;
  scheduleDay: any = "Today's Schedule";
  scheduleToday = new Date();
  todayDate: Date = new Date();
  tooltips: HTMLElement[] = [];
  dayname: Date;
  calendarApi$: Subscription;
  appointments: any[] = [];
  appointmentConstant = [
    {
      status: APP_CONSTANTS.BOOKING_STATUS.BOOKED,
      label: "PENDING",
      icon: "assets/images/svg/Pending actions.svg",
    },
    {
      status: APP_CONSTANTS.BOOKING_STATUS.COMPLETE,
      label: "COMPLETED",
      icon: "assets/images/svg/check-circle.svg",
    },
    {
      status: APP_CONSTANTS.BOOKING_STATUS.CANCEL,
      label: "CANCELLED",
      icon: "assets/images/svg/Cancel.svg",
    },
  ];
  ngOnInit(): void {
    const approvalStatus = this.localStorage.getItem("approvalStatus");

    if(approvalStatus==APP_CONSTANTS.PROFILE_STATUS.APPROVE){
      this.hideView=false
    }
    if(approvalStatus==APP_CONSTANTS.PROFILE_STATUS.PENDING ||
       approvalStatus==APP_CONSTANTS.PROFILE_STATUS.DEACTIVATE
       || approvalStatus==APP_CONSTANTS.PROFILE_STATUS.DELETE
       || approvalStatus==APP_CONSTANTS.PROFILE_STATUS.REJECT  ){
      this.hideView=true
    }

    // Load doctor's registered email for Meet authuser param.
    try {
      const userDetailRaw = this.localStorage.getItem('userDetail');
      const userDetail = typeof userDetailRaw === 'string'
        ? JSON.parse(userDetailRaw)
        : userDetailRaw;
      if (userDetail?.email) {
        this.doctorEmail = userDetail.email;
      }
    } catch {
      // doctorEmail stays '' — Meet link opens without authuser.
    }

    this.getEvents();
    this.onChangeSchedule();
  }
  onChangeSchedule(res: number = 0) {
    this.dayname = moment(this.todayDate).add(res, "days").toDate();
    const monthIndex = moment(this.dayname).month();
    const index = moment(new Date()).month();
    if (monthIndex > index + 2) {
      return;
    }
    const payload = {
      today: this.datepipe.transform(
        moment(this.todayDate).add(res, "days").toDate(),
        "yyyy-MM-dd"
      ),
    };
    this.todayDate = moment(this.todayDate).add(res, "days").toDate();
    this.apiService
      .post(API_ENDPOINTS.doctor.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          this.appointments = res.result;
          // console.log('appppooittmentt listttt', this.appointments)
          setTimeout(() => {
            this.attachTooltips();
          });
        },
        error: (error: any) => {
          this.appointments = [];
        },
      });
  }

  onCloseMenuClick() {
    if (!this.isBrowser) return;
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }

  // toggle modal
  openModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");

    }
  }

  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
  }

  onChangingMonth(value: number) {
    if (!value) {
      if (this.viewmode != "day") {
        this.viewmode = "day";
        return;
      }
    }
    this.eventService.broadcastEvent("rangeChange", value);
  }
  onChangingMode(value: string) {
    if (value != "month") {
      this.today = new Date();
    }
    this.viewmode = value;
  }
  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }
  selected: any = {};
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  addDays(date: Date, days: number) {
    const temp = new Date(date);
    temp.setDate(temp.getDate() + days);
    return temp;
  }
  getEvents() {
    this.eventService.getEvent("rangeLabel").subscribe((res: any) => {
      if (res) {
        this.monthdetails = res;
      }
    });
    this.eventService.getEvent("viewmode").subscribe((res: any) => {
      if (this.viewmode == "month") {
        this.today = new Date(res.value);
      }
      this.viewmode = res.mode;
    });
    this.calendarApi$ = this.eventService
      .getEvent("callcalendarapi")
      .subscribe((res: any) => {
        if (res) {
          if (
            this.datepipe.transform(res, "yyyy-MM-dd") ==
            this.datepipe.transform(this.todayDate, "yyyy-MM-dd")
          ) {
            this.onChangeSchedule();
          }
        }
      });
    this.eventService.getEvent("closeTippy").subscribe((res: boolean) => {
      if (res) {
        hideAll();
      }
    });
  }

  attachTooltips() {
    const cells = Array.from(this._document.querySelectorAll(".event-details"));
    cells.forEach((cell: HTMLElement, i: number) => {
      const component = this.containerRef.createComponent(PatientDetialsComponent);
      component.instance.data = JSON.parse(
        cell.attributes.getNamedItem("data-details").value
      );
      component.changeDetectorRef.detectChanges();
      const tooltip = tippy(cell, {
        content: component.location.nativeElement,
        placement: "top",  // Place the tooltip at the top initially
        trigger: "mouseenter",
        arrow: false,
        interactive: true,
        offset: [0, 0],
        zIndex: 8,
        appendTo: () => this._document.body,
        popperOptions: {
          modifiers: [
            {
              name: "flip",
              options: {
                fallbackPlacements: ["bottom", "left", "right"], // Center tooltip even if "top" placement fails
              },
            },
            {
              name: "offset",
              options: {
                offset: [0, 10],  // Adjust offset as needed for vertical centering
              },
            },
          ],
        },
      });

      this.tooltips.push(tooltip.popper);
    });
  }

  ngOnDestroy(): void {
    this.calendarApi$?.unsubscribe();
  }

  onMenuClick() {
    if (!this.isBrowser) return;
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu) {
      if (sideMenu.classList.contains("mobileMenu")) {
        this.renderer.removeClass(sideMenu, "mobileMenu");
      } else {
        this.renderer.addClass(sideMenu, "mobileMenu");
      }
    }
  }

  /**
   * Builds a Google Meet URL with ?authuser=<doctorEmail>.
   * Delegates to the standalone buildMeetUrl utility.
   */
  buildMeetUrl(meetUrl: string | null | undefined): string {
    return buildMeetUrl(meetUrl, this.doctorEmail);
  }

}