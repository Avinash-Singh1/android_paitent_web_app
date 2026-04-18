import { DatePipe } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  DOCUMENT
} from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import tippy, { hideAll } from "tippy.js";
import moment from 'moment';
import { Subscription } from "rxjs";
import { PatientDetialsComponent } from "src/app/modules/doctor-hospital-shared/components/patient-detials/patient-detials.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { MatDrawer } from "@angular/material/sidenav";

@Component({
  standalone: false,
  selector: "nectar-hospital-calendar-container",
  templateUrl: "./hospital-calendar-container.component.html",
  styleUrls: ["./hospital-calendar-container.component.scss"],
})
export class HospitalCalendarContainerComponent implements OnInit, OnDestroy {
  constructor(
    private eventService: EventService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private datepipe: DatePipe,
    private containerRef: ViewContainerRef,
    @Inject(DOCUMENT) private _document: Document
  ) { }
  @ViewChild("matdrawer") public matdrawer: MatDrawer;
  doctorChange$: Subscription;
  caledarApi$: Subscription;
  monthdetails: Date = new Date();
  viewmode: string = "week";
  today: any;
  scheduleDay: any = "Today's Schedule";
  scheduleToday = new Date();
  todayDate: Date = new Date();
  pendingArray: any = [];
  completedArray: any = [];
  cancelledArray: any = [];
  tooltips: HTMLElement[] = [];
  dayname: Date;
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
    this.getEvents();
    this.onChangeSchedule();
  }
  doctor: { all: boolean; doctorId?: string } = {
    all: true,
  };
  onChangeSchedule(res: number = 0, doctorId: string = "") {
    this.dayname = moment(this.todayDate).add(res, "days").toDate();
    const monthIndex = moment(this.dayname).month();
    const index = moment(new Date()).month();
    if (monthIndex > index + 2) {
      return;
    }
    const payload = {
      fromDate: new Date(
        this.addDays(this.todayDate, res).setHours(0, 0, 0, 0)
      ).toISOString(),
      toDate: new Date(
        this.addDays(this.todayDate, res).setHours(24, 0, 0, 0)
      ).toISOString(),
      doctorId,
    };
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.todayDate = this.addDays(this.todayDate, res);
    this.apiService
      .get(API_ENDPOINTS.hospital.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          const { data } = res.result;
          this.appointments = data;
          setTimeout(() => {
            this.attachTooltips();
          });
        },
        error: (error: any) => {
          this.appointments = [];
        },
      });
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
    this.eventService.broadcastEvent("showDoctorList", false);
    this.matdrawer.close();
  }
  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }
  attachTooltips() {
    const cells = Array.from(this._document.querySelectorAll(".event-details"));
    cells.forEach((cell: HTMLElement, i: number) => {
      const component = this.containerRef.createComponent(
        PatientDetialsComponent
      );
      component.instance.data = JSON.parse(
        cell.attributes.getNamedItem("data-details").value
      );
      component.changeDetectorRef.detectChanges();
      const tooltip = tippy(cell, {
        content: component.location.nativeElement,
        placement: "left-start",
        trigger: "mouseenter",
        arrow: false,
        interactive: true,
        offset: [0, 0],
        zIndex: 8,
        appendTo: () => this._document.body,
      });

      this.tooltips.push(tooltip.popper);
    });
  }
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
    this.caledarApi$ = this.eventService
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
    this.eventService.getEvent("showDoctorList").subscribe((res: any) => {
      this.matdrawer.toggle();
    });
    this.eventService.getEvent("closeTippy").subscribe((res: boolean) => {
      if (res) {
        hideAll();
      }
    });
    this.doctorChange$ = this.eventService
      .getEvent("doctorChange")
      .subscribe((res: any) => {
        const { all, doctorId } = res;
        this.doctor.all = all;
        this.doctor.doctorId = doctorId;
        if (!all) {
          this.onChangeSchedule(0, doctorId);
        }
      });
  }

  ngOnDestroy(): void {
    this.caledarApi$?.unsubscribe();
    this.doctorChange$?.unsubscribe();
  }
}
