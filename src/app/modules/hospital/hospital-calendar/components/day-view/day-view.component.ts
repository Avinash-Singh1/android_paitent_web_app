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
import { EventService } from "src/app/services/event.service";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import tippy, { hideAll, Instance } from "tippy.js";
import moment from 'moment';
import { PatientListComponent } from "src/app/modules/doctor-hospital-shared/components/patient-list/patient-list.component";
import { PatientDetialsComponent } from "src/app/modules/doctor-hospital-shared/components/patient-detials/patient-detials.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { environment } from "src/environments/environment";

export interface Payload {
  fromDate: string;
  toDate: string;
  doctorId?: string;
}
@Component({
  standalone: false,
  selector: "nectar-day-view",
  templateUrl: "./day-view.component.html",
  styleUrls: ["./day-view.component.scss"],
})
export class DayViewComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private datepipe: DatePipe,
    private eventService: EventService,
    private apiservice: ApiService,
    private containerRef: ViewContainerRef,
    @Inject(DOCUMENT) private _document: Document
  ) { }
  @Input() today: any;
  tooltips: Instance[] = [];
  multiEventTooltips: Instance[] = [];
  eventSubscription$!: Subscription;
  calendarApi$!: Subscription;
  currentDay = new Date();
  dayname = new Date();
  rows: any = [];
  showDayname = new Date();
  doctorList: boolean = false;
  changeDoctor$: Subscription;
  currentSlot: Subject<number> = new Subject<number>();
  slotInterval: any;
  a: number = 0;
  b: number = 0;
  @Input() doctor: { all: boolean; doctorId?: string };
  ngOnInit(): void {
    if (this.today) {
      this.showDayname = new Date(this.today);
      this.dayname = new Date(this.today);
    }
    this.generateDayRow();
    this.eventService.broadcastEvent(
      "rangeLabel",
      this.datepipe.transform(this.showDayname, "d MMMM, yyyy")
    );
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
    this.getEvents();
  }
  getCurrentSlotPointer() {
    const currentTime = ~~(moment().valueOf() / 1000);
    for (let i = 0; i < this.rows.length; i++) {
      const timing = ~~(this.rows[i].timing.getTime() / 1000);
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
  generateDayRow() {
    const starttime = new Date().setHours(0, 0, 0, 0);
    const endtime = new Date().setHours(23, 45, 0, 0);
    for (let i = starttime; i <= endtime; i += environment.DOCTOR_SLOT_TIME) {
      const data = {
        timing: new Date(i),
        selected: false,
        positionY: "bottom",
        details: [],
      };
      this.rows.push(data);
    }
    this.getCalendarData();
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
        placement: "bottom-start",
        trigger: "click",
        arrow: false,
        interactive: true,
        offset: [0, 0],
        zIndex: 8,
        appendTo: () => this._document.body,
      });

      this.tooltips.push(tooltip);
    });
    const multieventCells = Array.from(
      this._document.querySelectorAll(".multi-event")
    );

    multieventCells.forEach((cell: HTMLElement, i: number) => {
      const patientList =
        this.containerRef.createComponent(PatientListComponent);
      patientList.instance.patientList = {
        ...JSON.parse(cell.attributes.getNamedItem("data-patient-list").value),
        userType: APP_CONSTANTS.USER_TYPES.HOSPITAL,
      };
      patientList.changeDetectorRef.detectChanges();
      const tooltip1 = tippy(cell, {
        content: patientList.location.nativeElement,
        placement: "bottom-start",
        trigger: "click",
        arrow: false,
        interactive: true,
        offset: [0, 0],
        zIndex: 8,
        appendTo: () => this._document.body,
      });
      this.multiEventTooltips.push(tooltip1);
    });
  }

  getCalendarData() {
    this.rows.forEach((slot) => {
      slot.details = [];
      this.multiEventTooltips.forEach((item) => item.destroy());
    });
    let payload: Payload = {
      fromDate: new Date(
        new Date(this.showDayname).setHours(0, 0, 0, 0)
      ).toISOString(),
      toDate: new Date(
        new Date(this.showDayname).setHours(24, 0, 0, 0)
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
    this.apiservice
      .get(API_ENDPOINTS.hospital.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            data.forEach((slot: any) => {
              const i = this.rows.findIndex((item: any) => {
                return (
                  this.datepipe.transform(item.timing, "h:mm a", "+0530") ==
                  this.datepipe.transform(slot._id, "h:mm a", "+0530")
                );
              });
              if (i != -1) {
                this.rows[i].details = slot.data;
              }
            });
            setTimeout(() => {
              this.attachTooltips();
            });
          }
        },
        error: (error: any) => {
          this.rows.forEach((item: any) => {
            delete item.details;
          });
        },
      });
  }
  showDoctorList() {
    this.doctorList = !this.doctorList;
    this.eventService.broadcastEvent("showDoctorList", this.doctorList);
  }
  getEvents() {
    this.eventSubscription$ = this.eventService
      .getEvent("rangeChange")
      .subscribe((res: any) => {
        if (res) {
          this.dayname = moment(this.showDayname).add(res, "days").toDate();
          const monthIndex = moment(this.dayname).month();
          const index = moment(new Date()).month();

          if (monthIndex > index + 2) {
            return;
          }
          this.showDayname = moment(this.showDayname).add(res, "days").toDate();
        } else {
          this.showDayname = new Date();
        }
        this.getCalendarData();
        this.eventService.broadcastEvent(
          "rangeLabel",
          this.datepipe.transform(this.showDayname, "d MMMM, yyyy")
        );
      });
    this.calendarApi$ = this.eventService
      .getEvent("callcalendarapi")
      .subscribe((res: any) => {
        if (res) {
          this.getCalendarData();
        }
      });
    this.eventService.getEvent("closeTippy").subscribe((res: boolean) => {
      hideAll();
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
  ngOnDestroy(): void {
    this.eventSubscription$?.unsubscribe();
    this.calendarApi$?.unsubscribe();
    this.changeDoctor$?.unsubscribe();
    clearInterval(this.slotInterval);
  }
  stringify(value: any) {
    return JSON.stringify(value);
  }
  ngAfterViewInit(): void {
    this.getCurrentSlotPointer();
  }
}
