import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  DOCUMENT
} from "@angular/core";
import { EventService } from "src/app/services/event.service";
import { Subscription } from "rxjs";
import { DatePipe } from "@angular/common";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import  moment from "moment";
import tippy, { hideAll } from "tippy.js";
import { generateMonthTable } from "src/app/utils/helper";
import { PatientListComponent } from "src/app/modules/doctor-hospital-shared/components/patient-list/patient-list.component";

@Component({
  standalone: false,
  selector: "nectar-month-view",
  templateUrl: "./month-view.component.html",
  styleUrls: ["./month-view.component.scss"],
})
export class MonthViewComponent implements OnInit, OnDestroy {
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
  eventSubscription!: Subscription;
  calendarApi$: Subscription;
  weeks: any[] = [];
  constructor(
    private eventService: EventService,
    private datepipe: DatePipe,
    private apiService: ApiService,
    private containerRef: ViewContainerRef,
    @Inject(DOCUMENT) private _document: Document
  ) {}
  private monthIndex: number = 0;
  tooltips: any[] = [];
  today: Date = new Date();
  ngOnInit(): void {
    this.generateMonthTable(this.monthIndex);
    this.getEvents();
  }
  generateMonthTable(index: number) {
    if (index > 2) {
      return;
    }
    this.firstDayOfMonth = moment(new Date())
      .add(index, "M")
      .startOf("M")
      .toDate();
    this.lastDayOfMonth = moment(this.firstDayOfMonth).endOf("M").toDate();
    this.eventService.broadcastEvent(
      "rangeLabel",
      this.datepipe.transform(new Date(this.firstDayOfMonth), "MMMM, yyyy")
    );
    this.weeks = generateMonthTable(this.firstDayOfMonth);
    this.getCalendarData();
  }

  getCalendarData() {
    this.tooltips.forEach((item: any) => {
      item?.destroy();
    });
    const payload = {
      startDate: this.datepipe.transform(this.firstDayOfMonth, "yyyy-MM-dd"),
      endDate: this.datepipe.transform(this.lastDayOfMonth, "yyyy-MM-dd"),
    };
    const flattenArray = this.weeks.flat(1);
    flattenArray.forEach((day: any) => {
      day.appointments = 0;
    });
    this.apiService
      .post(API_ENDPOINTS.doctor.getCalendarData, payload)
      .subscribe((res: any) => {
        res.result.forEach((day: any) => {
          const i = flattenArray.findIndex((item: any) => {
            return (
              this.datepipe.transform(item.date, "yyyy-MM-dd") ==
              this.datepipe.transform(day._id, "yyyy-MM-dd")
            );
          });
          if (i != -1) {
            flattenArray[i].appointments += day.totalCount;
            flattenArray[i].details = [...flattenArray[i].details, ...day.data];
          }
        });
        setTimeout(() => {
          this.attachTooltips();
        });
      });
  }
  getEvents() {
    this.eventSubscription = this.eventService
      .getEvent("rangeChange")
      .subscribe((res: any) => {
        if (res) {
          this.monthIndex += res;
          if (this.monthIndex > 2) {
            this.monthIndex--;
            return;
          }
        } else {
          this.monthIndex = 0;
        }
        this.generateMonthTable(this.monthIndex);
      });
    this.calendarApi$ = this.eventService
      .getEvent("callcalendarapi")
      .subscribe((res: any) => {
        if (
          res &&
          moment(res).valueOf() >= moment(this.firstDayOfMonth).valueOf() &&
          moment(res).valueOf() <= moment(this.lastDayOfMonth).valueOf()
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
  attachTooltips() {
    const cells = Array.from(
      this._document.querySelectorAll(".event-appointment")
    );

    cells.forEach((cell: HTMLElement) => {
      const patientList =
        this.containerRef.createComponent(PatientListComponent);
      patientList.instance.patientList = JSON.parse(
        cell.attributes.getNamedItem("data.patient.list").value
      );
      patientList.changeDetectorRef.detectChanges();
      const tooltip = tippy(cell, {
        content: patientList.location.nativeElement,
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
  }
  ngOnDestroy(): void {
    this.eventSubscription?.unsubscribe();
    this.calendarApi$?.unsubscribe();
  }
}
