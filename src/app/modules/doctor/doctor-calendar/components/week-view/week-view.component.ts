import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  Inject,
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
import  moment from "moment";
import { getTimeFromString } from "src/app/services/helper.service";
import { PatientDetialsComponent } from "src/app/modules/doctor-hospital-shared/components/patient-detials/patient-detials.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { environment } from "src/environments/environment";

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
  ) {}
  currentSlot: Subject<number> = new Subject<number>();
  a: number = 0;
  b: number = 0;
  tooltips: any[] = [];
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
  eventSubscription$!: Subscription;
  calendarApi$: Subscription;
  popupClose$: Subscription;
  startOfWeek: Date = new Date();
  endOfWeek: Date = moment(this.startOfWeek).add(6, "days").toDate();
  monthIndex = moment(this.endOfWeek).month();
  tempStart: Date = new Date();
  seletedcell: any = {};
  maxDate = moment(this.startOfWeek).endOf("M").add(2, "M").toDate();
  slotInterval: any;
  ngOnInit(): void {
    this.generateWeekRows();
    this.slotInterval = setInterval(() => {
      this.getCurrentSlotPointer();
    }, 1000);
    this.currentSlot.subscribe((res) => {
      setTimeout(() => {
        const element = this._document
          .getElementsByClassName("currentSlot")
          .item(0);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    for (let i = 0; i < 7; i++) {
      this.weakdays.push(moment(this.startOfWeek).add(i, "days").toDate());
    }
    this.eventService.broadcastEvent(
      "rangeLabel",
      this.weekname(this.startOfWeek, this.endOfWeek)
    );
    this.getEvents();
  }
  ngAfterViewInit(): void {
    this.getCurrentSlotPointer();
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
  weakdays: any = [];
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
      this.weakdays.push(moment(this.startOfWeek).add(i, "days").toDate());
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
          details: null,
        },
        secondday: {
          details: null,
        },
        thirdday: {
          details: null,
        },
        forthday: {
          details: null,
        },
        fifthday: {
          details: null,
        },
        sixthday: {
          details: null,
        },
        seventhday: {
          details: null,
        },
      };
      this.rows.push(row);
    }
    this.getCalendarData();
  }
  rows: any = [];

  weekname(start: Date, end: Date) {
    return (
      start.getDate() +
      " - " +
      end.getDate() +
      " " +
      this.monthNames[end.getMonth()]
    );
  }
  getCalendarData() {
    const payload = {
      startDate: this.datepipe.transform(this.startOfWeek, "yyyy-MM-dd"),
      endDate: this.datepipe.transform(this.endOfWeek, "yyyy-MM-dd"),
    };
    this.apiService
      .post(API_ENDPOINTS.doctor.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          this.rows.forEach((row: any, i: number) => {
            for (let i = 0; i <= 6; i++) {
              delete row[this.daycount[i]].details;
            }
          });
          res.result?.forEach((item: any) => {
            const i =
              (moment(item._id).get("day") -
                moment(this.startOfWeek).get("day") +
                7) %
              7;
            const j =
              (Math.abs(
                moment(item._id).valueOf() -
                  moment(new Date().setHours(0, 0, 0, 0)).valueOf()
              ) /
                environment.DOCTOR_SLOT_TIME) %
              96;
            this.rows[j][this.daycount[i]].details = item.data[0];
          });
          setTimeout(() => {
            this.attachTooltips();
          });
        },
        error: (error: any) => {
          this.rows.forEach((row: any) => {
            for (let i = 0; i <= 6; i++) {
              delete row[this.daycount[i]].details;
            }
          });
        },
      });
  }
  attachTooltips() {
    const cells = Array.from(this._document.querySelectorAll(".week-data"));
    cells.forEach((cell: HTMLElement, i: number) => {
      const component = this.containerRef.createComponent(
        PatientDetialsComponent
      );
      component.instance.data = {
        ...JSON.parse(cell.attributes.getNamedItem("data.details").value),
        userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
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
      this.tooltips.push(tooltip);
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
        if (
          res &&
          moment(new Date(this.startOfWeek).setHours(0, 0, 0, 0)).valueOf() &&
          moment(res).valueOf() <=
            moment(new Date(this.endOfWeek).setHours(24, 0, 0, 0)).valueOf()
        ) {
          this.getCalendarData();
        }
      });
    this.eventService.getEvent("closeTippy").subscribe((res: boolean) => {
      if (res) {
        hideAll();
      }
    });
  }
  ngOnDestroy(): void {
    this.eventSubscription$?.unsubscribe();
    this.calendarApi$?.unsubscribe();
    this.popupClose$?.unsubscribe();
    this.currentSlot?.unsubscribe();
    if (this.slotInterval) {
      clearInterval(this.slotInterval);
    }
  }
}
