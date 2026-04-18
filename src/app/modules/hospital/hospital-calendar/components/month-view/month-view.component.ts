import {
  Component,
  Inject,
  Input,
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
import moment from 'moment';
import tippy, { hideAll } from "tippy.js";
import { generateMonthTable } from "src/app/utils/helper";
import { PatientListComponent } from "src/app/modules/doctor-hospital-shared/components/patient-list/patient-list.component";
export interface Payload {
  fromDate: string;
  toDate: string;
  doctorId?: string;
}
@Component({
  standalone: false,
  selector: "nectar-month-view",
  templateUrl: "./month-view.component.html",
  styleUrls: ["./month-view.component.scss"],
})
export class MonthViewComponent implements OnInit, OnDestroy {
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
  eventSubscription$: Subscription;
  weeks: any[] = [];
  @Input() doctor: { all: boolean; doctorId?: string };
  changeDoctor$: Subscription;
  today: Date = new Date();
  constructor(
    private eventService: EventService,
    private datepipe: DatePipe,
    private apiService: ApiService,
    private containerRef: ViewContainerRef,
    @Inject(DOCUMENT) private _document: Document
  ) { }
  private monthIndex: number = 0;
  doctorList: boolean = false;
  tooltips: any[] = [];
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
    this.weeks.forEach((week: any) => {
      week.forEach((day) => {
        day.appointments = 0;
        day.details = [];
      });
    });
    this.tooltips.forEach((item: any) => {
      item?.destroy();
    });
    let payload: Payload = {
      fromDate: new Date(
        this.firstDayOfMonth.setHours(0, 0, 0, 0)
      ).toISOString(),
      toDate: new Date(this.lastDayOfMonth.setHours(24, 0, 0, 0)).toISOString(),
    };
    if (this.doctor.doctorId) {
      payload = { ...payload, doctorId: this.doctor.doctorId };
    }

    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.apiService
      .get(API_ENDPOINTS.hospital.getCalendarData, payload)
      .subscribe((res: any) => {
        const { count, data } = res.result;
        if (count) {
          const flattenArray = this.weeks.flat(1);
          data.forEach((day: any) => {
            const i = flattenArray.findIndex((item: any) => {
              return (
                this.datepipe.transform(new Date(item.date), "yyyy-MM-dd") ==
                this.datepipe.transform(day._id, "yyyy-MM-dd")
              );
            });
            if (i != -1) {
              flattenArray[i].appointments =
                day.totalCount + (flattenArray[i].appointments ?? 0);
              flattenArray[i].details = [
                ...flattenArray[i].details,
                ...day.data,
              ];
            }
          });
          setTimeout(() => {
            this.attachTooltips();
          });
        }
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
    this.eventService.getEvent("showArrow").subscribe((res: boolean) => {
      this.doctorList = res;
    });
    this.changeDoctor$ = this.eventService
      .getEvent("doctorChange")
      .subscribe((res: any) => {
        const { all, doctorId } = res;
        this.doctor.all = all;
        this.doctor.doctorId = doctorId;
        this.getCalendarData();
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

    cells.forEach((cell: HTMLElement, i: number) => {
      const patientList =
        this.containerRef.createComponent(PatientListComponent);
      patientList.instance.patientList = JSON.parse(
        cell.attributes.getNamedItem("data-patient-list").value
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
    this.eventSubscription$?.unsubscribe();
    this.changeDoctor$?.unsubscribe();
  }
}
