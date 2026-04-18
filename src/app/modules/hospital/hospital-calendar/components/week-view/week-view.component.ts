import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  DOCUMENT
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import tippy, { hideAll } from "tippy.js";
import { getTimeFromString } from "src/app/services/helper.service";
import moment from 'moment';
import { PatientDetialsComponent } from "src/app/modules/doctor-hospital-shared/components/patient-detials/patient-detials.component";
import { PatientListComponent } from "src/app/modules/doctor-hospital-shared/components/patient-list/patient-list.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { environment } from "src/environments/environment";

export interface Payload {
  fromDate: string;
  toDate: string;
  doctorId?: string;
}
@Component({
  standalone: false,
  selector: "nectar-week-view",
  templateUrl: "./week-view.component.html",
  styleUrls: ["./week-view.component.scss"],
})
export class WeekViewComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private datepipe: DatePipe,
    private eventService: EventService,
    private apiService: ApiService,
    private containerRef: ViewContainerRef,
    @Inject(DOCUMENT) private _document: Document
  ) { }
  currentSlot: Subject<number> = new Subject<number>();
  slotInterval: any;
  tooltips: HTMLElement[] = [];
  @Input() doctor: { all: boolean; doctorId?: string };
  doctorList: boolean = false;
  a: number = 0;
  b: number = 0;
  monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  daycount = [
    "firstday",
    "secondday",
    "thirdday",
    "forthday",
    "fifthday",
    "sixthday",
    "seventhday",
  ];
  weakdays: any = [];
  eventSubscription$!: Subscription;
  calendarApi$: Subscription;
  changeDoctor$: Subscription;
  popupClose$: Subscription;
  startOfWeek: Date = new Date();
  endOfWeek: Date = this.addDays(this.startOfWeek, 6);
  seletedcell: any = {};
  maxDate = new Date().setHours(0, 0, 0, 0) + 1209600000;
  rows: any = [];
  tempStart: Date = new Date();
  monthIndex = moment(this.endOfWeek).month();
  ngOnInit(): void {
    this.generateWeekRows();
    for (let i = 0; i < 7; i++) {
      this.weakdays.push(this.addDays(this.startOfWeek, i));
    }
    this.eventService.broadcastEvent(
      "rangeLabel",
      this.weekname(this.startOfWeek, this.endOfWeek)
    );
    this.currentSlot.subscribe((res) => {
      setTimeout(() => {
        const element = this._document
          .getElementsByClassName("currentSlot")
          .item(0);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    this.getEvents();
    this.slotInterval = setInterval(() => {
      this.getCurrentSlotPointer();
    }, 1000);
  }
  getCurrentSlotPointer() {
    const currentTime = ~~(moment().valueOf() / 1000);
    for (let i = 0; i < this.rows.length; i++) {
      const timing = ~~(getTimeFromString(this.rows[i].timing) / 1000);
      if (currentTime < timing) {
        this.a = i ? i - 1 : 0;
        if (this.a != this.b) {
          this.b = this.a;
          this.currentSlot.next(i ? i - 1 : 0);
        }

        break;
      } else if (currentTime == timing) {
        this.currentSlot.next(i);
      }
    }
  }
  generateWeekcolumn(res: number) {
    if (res == -1) {
      this.startOfWeek = moment(this.startOfWeek).add(-7, "days").toDate();
    } else {
      this.tempStart = moment(this.endOfWeek).add(1, "days").toDate();
      const index = moment(this.tempStart).month();
      if (index > this.monthIndex + 2) {
        return;
      }
      this.startOfWeek = moment(this.endOfWeek).add(1, "days").toDate();
    }
    this.endOfWeek = moment(this.startOfWeek).add(6, "days").toDate();
    this.weakdays = [];
    for (let i = 0; i < 7; i++) {
      this.weakdays.push(this.addDays(this.startOfWeek, i));
    }
    const value = this.weekname(this.startOfWeek, this.endOfWeek);
    this.getCalendarData();
    this.eventService.broadcastEvent("rangeLabel", value);
  }

  generateWeekRows() {
    const starttime = new Date().setHours(0, 0, 0, 0);
    const endtime = new Date().setHours(23, 45, 0, 0);
    for (let i = starttime; i <= endtime; i += environment.DOCTOR_SLOT_TIME) {
      const row = {
        timing: this.datepipe.transform(new Date(i), "h:mm a"),
        firstday: {
          details: [],
        },
        secondday: {
          details: [],
        },
        thirdday: {
          details: [],
        },
        forthday: {
          details: [],
        },
        fifthday: {
          details: [],
        },
        sixthday: {
          details: [],
        },
        seventhday: {
          details: [],
        },
      };
      this.rows.push(row);
    }
    this.getCalendarData();
  }

  addDays(date: Date, days: number) {
    const temp = new Date(date);
    temp.setDate(temp.getDate() + days);
    return temp;
  }
  weekname(start: Date, end: Date) {
    return (
      start.getDate() +
      " - " +
      end.getDate() +
      " " +
      this.monthNames[end.getMonth()]
    );
  }
  ngOnDestroy(): void {
    this.eventSubscription$?.unsubscribe();
    this.calendarApi$?.unsubscribe();
    this.changeDoctor$?.unsubscribe();
  }
  getCalendarData() {
    const payload = this.generatePayload();
    this.apiService
      .get(API_ENDPOINTS.hospital.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          const { data } = res.result;
          data.forEach((appointment: any) => {
            const i =
              (moment(appointment._id).get("day") -
                moment(this.startOfWeek).get("day") +
                7) %
              7;
            const j =
              (Math.abs(
                moment(appointment._id).valueOf() -
                moment(new Date().setHours(0, 0, 0, 0)).valueOf()
              ) /
                environment.DOCTOR_SLOT_TIME) %
              96;
            this.rows[j][this.daycount[i]].details = appointment.data;
          });
          setTimeout(() => {
            this.attachTooltips();
          });
        },
        error: (error: any) => {
          this.rows.forEach((row: any) => {
            for (let i = 0; i <= 6; i++) {
              row[this.daycount[i]].details = [];
            }
          });
        },
      });
  }
  attachTooltips() {
    const cells = Array.from(this._document.querySelectorAll(".event"));
    cells.forEach((cell: HTMLElement, i: number) => {
      const component = this.containerRef.createComponent(
        PatientDetialsComponent
      );
      component.instance.data = {
        ...JSON.parse(cell.attributes.getNamedItem("data.details").value),
        userType: APP_CONSTANTS.USER_TYPES.HOSPITAL,
      };
      component.changeDetectorRef.detectChanges();
      const tooltip = tippy(cell, {
        content: component.location.nativeElement,
        placement: "bottom-end",
        trigger: "click",
        arrow: false,
        interactive: true,
        offset: [0, 0],
        zIndex: 8,
        maxWidth: 360,
        appendTo: () => this._document.body,
      });

      this.tooltips.push(tooltip.popper);
    });
    const multieventCells = Array.from(
      this._document.querySelectorAll(".multi-event")
    );
    multieventCells.forEach((cell: HTMLElement, i: number) => {
      const patientList =
        this.containerRef.createComponent(PatientListComponent);
      patientList.instance.patientList = JSON.parse(
        cell.attributes.getNamedItem("data-patient-list").value
      );
      patientList.changeDetectorRef.detectChanges();
      const tooltip1 = tippy(cell, {
        content: patientList.location.nativeElement,
        placement: "bottom-end",
        trigger: "click",
        arrow: false,
        interactive: true,
        offset: [0, 0],
        zIndex: 8,
        appendTo: () => this._document.body,
      });
      this.tooltips.push(tooltip1.popper);
    });
  }
  getEvents() {
    this.eventSubscription$ = this.eventService
      .getEvent("rangeChange")
      .subscribe((res: any) => {
        this.generateWeekcolumn(res);
      });
    this.calendarApi$ = this.eventService
      .getEvent("callcalendarapi")
      .subscribe((res: any) => {
        if (res) {
          this.getCalendarData();
        }
      });
    this.eventService.getEvent("closeTippy").subscribe((res: boolean) => {
      hideAll({
        // exclude:document.querySelectorAll(".multievent")
      });
    });
    this.changeDoctor$ = this.eventService
      .getEvent("doctorChange")
      .subscribe((res: any) => {
        const { all, doctorId } = res;
        this.doctor.all = all;
        this.doctor.doctorId = doctorId;
        this.getCalendarData();
      });
  }
  showDoctorList() {
    this.doctorList = !this.doctorList;
    this.eventService.broadcastEvent("showDoctorList", this.doctorList);
  }
  generatePayload() {
    this.rows.forEach((row: any) => {
      Object.keys(row).forEach((key: string) => {
        if (key != "timing") {
          row[key].details = [];
        }
      });
    });
    let payload: Payload = {
      fromDate: new Date(
        new Date(this.startOfWeek).setHours(0, 0, 0, 0)
      ).toISOString(),
      toDate: new Date(
        new Date(this.endOfWeek).setHours(24, 0, 0, 0)
      ).toISOString(),
    };
    if (!this.doctor.all) {
      payload = { ...payload, doctorId: this.doctor.doctorId };
    }

    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    return payload;
  }
  ngAfterViewInit(): void {
    this.getCurrentSlotPointer();
  }
}
