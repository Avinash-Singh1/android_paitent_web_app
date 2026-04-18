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
import tippy, { hideAll } from "tippy.js";
import  moment from "moment";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { PatientDetialsComponent } from "src/app/modules/doctor-hospital-shared/components/patient-detials/patient-detials.component";
import { environment } from "src/environments/environment";

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
  ) {}

  @Input() today: any;
  eventSubscription$!: Subscription;
  calendarApi$!: Subscription;
  currentDay = new Date();
  dayname = new Date();
  rows: any = [];
  showDayname = new Date();
  tooltips: any[] = [];
  currentSlot: Subject<number> = new Subject<number>();
  slotInterval: any;
  a: number = 0;
  b: number = 0;
  ngOnInit(): void {
    if (this.today) {
      this.showDayname = new Date(this.today);
      this.dayname = new Date(this.today);
    }
    this.generateDayRow();
    this.eventService.broadcastEvent(
      "rangeLabel",
      this.datepipe.transform(this.dayname, "d MMMM, yyyy")
    );
    this.getEvents();
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
  }
  ngAfterViewInit(): void {
    this.getCurrentSlotPointer();
  }
  generateDayRow() {
    const starttime = new Date().setHours(0, 0, 0, 0);
    const endtime = new Date().setHours(23, 45, 0, 0);
    for (let i = starttime; i <= endtime; i += environment.DOCTOR_SLOT_TIME) {
      const data = {
        timing: new Date(i),
        details: null,
      };
      this.rows.push(data);
    }
    this.getCalendarData();
  }

  getCalendarData() {
    this.tooltips.forEach((item: any) => {
      item?.destroy();
    });
    this.rows.forEach((item: any) => {
      item.details = null;
    });
    const payload = {
      today: this.datepipe.transform(this.dayname, "yyyy-MM-dd"),
    };
    this.apiservice
      .post(API_ENDPOINTS.doctor.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          res.result.forEach((item: any) => {
            const i =
              (Math.abs(
                moment(item._id).valueOf() -
                  moment(new Date().setHours(0, 0, 0, 0)).valueOf()
              ) /
                environment.DOCTOR_SLOT_TIME) %
              96;
            this.rows[i].details = { ...item.data[0] };
          });
          setTimeout(() => {
            this.attachTooltips();
          });
        },
        error: (error: any) => {
          this.rows.forEach((item: any) => {
            item.details = null;
          });
        },
      });
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
        if (
          res &&
          moment(res).format("YYYY-MM-DD") ==
            moment(this.dayname).format("YYYY-MM-DD")
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
    if (this.slotInterval) {
      clearInterval(this.slotInterval);
    }
  }
  attachTooltips() {
    const cells = Array.from(this._document.querySelectorAll(".day-data"));
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
        placement: "bottom-start",
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
}
