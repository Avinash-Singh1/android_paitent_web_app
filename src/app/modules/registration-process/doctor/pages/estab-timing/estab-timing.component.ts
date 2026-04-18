import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ApiService } from "src/app/services/api.service";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { Subscription } from "rxjs";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { FormValidationService } from "src/app/services/form-validation.service";
import { CreateFormService } from "src/app/services/create-form.service";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: "nectar-estab-timing",
  templateUrl: "./estab-timing.component.html",
  styleUrls: ["./estab-timing.component.scss"],
})
export class EstabTimingComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private datepipe: DatePipe,
    private localStorage: LocalStorageService,
    private router: Router,
    private apiService: ApiService,
    private createForm: CreateFormService,
    private formValidation: FormValidationService
  ) {}
  currentDay: number = 0;
  establishmentTiming: FormGroup;
  weekArray = [
    {
      name: "Mon",
      selected: this.localStorage.getItem("isEdit") ? false : true,
      id: 0,
      formControlName: "mon",
    },
    { name: "Tue", selected: false, id: 1, formControlName: "tue" },
    { name: "Wed", selected: false, id: 2, formControlName: "wed" },
    { name: "Thu", selected: false, id: 3, formControlName: "thu" },
    { name: "Fri", selected: false, id: 4, formControlName: "fri" },
    { name: "Sat", selected: false, id: 5, formControlName: "sat" },
    { name: "Sun", selected: false, id: 6, formControlName: "sun" },
  ];

  selectedDay = new Set([0]);
  currentIndex: number = 0;
  name: string = "";
  sectionC: any = {
    establishmentTiming: null,
  };
  saveExit$: Subscription;
  submitted: boolean = false;
  routes = {
    back: ROUTE_CONSTANT.DOCTOR.registerSectionc1,
    next: ROUTE_CONSTANT.DOCTOR.registerSectionc3,
  };
  ngOnInit(): void {
    this.validateestablishmentTimingForm();
    this.establishmentTiming.setValidators(
      this.formValidation.atleastOneDay(
        "mon",
        "tue",
        "wed",
        "thu",
        "fri",
        "sat",
        "sun"
      )
    );
    this.broadcastEvent();
    const sectionA = this.localStorage.getItem("sectionA");
    if (sectionA) {
      const { name } = sectionA.establishmentDetails;
      this.name = name;
    }
    this.sectionC = this.localStorage.getItem("sectionC") ?? this.sectionC;

    this.getEvents();
    if (this.sectionC.establishmentTiming) {
      this.establishmentTiming.patchValue(this.sectionC.establishmentTiming);
    }
    this.maintainSelected();
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 2,
      laststep: 3,
    });
  }
  validateestablishmentTimingForm() {
    this.establishmentTiming = this.fb.group({
      mon: this.createForm.createDay(),
      tue: this.createForm.createDay(),
      wed: this.createForm.createDay(),
      thu: this.createForm.createDay(),
      fri: this.createForm.createDay(),
      sat: this.createForm.createDay(),
      sun: this.createForm.createDay(),
    });
  }
  maintainSelected() {
    if (this.localStorage.getItem("isEdit")) {
      this.weekArray.forEach((day: any) => {
        if (this.dayControl(day.formControlName).valid) {
          day.selected = true;
          this.currentDay = day.id;
          this.selectedDay.add(day.id);
        } else {
          this.control[day.formControlName].disable();
        }
      });
      return;
    }
    this.weekArray.forEach((day: any) => {
      if (!day.selected) this.control[day.formControlName].disable();
    });
  }
  dayControl(day: string) {
    return this.control[day] as FormArray;
  }
  generatTimiListing(startTime: number, endTime: number, interval: number) {
    let timeList = [];
    for (let i = startTime; i <= endTime; i += interval) {
      timeList.push({
        name: this.datepipe.transform(new Date(i), "hh:mm a"),
        _id: new Date(i),
      });
    }
    return timeList;
  }
  timingArray = {
    0: this.generatTimiListing(
      new Date().setHours(0, 0, 0, 0),
      new Date().setHours(11, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
    1: this.generatTimiListing(
      new Date().setHours(12, 0, 0, 0),
      new Date().setHours(16, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
    2: this.generatTimiListing(
      new Date().setHours(17, 0, 0, 0),
      new Date().setHours(23, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
  };
  onSelectDay(data: any, index: number) {
    this.submitted = false;
    const { selected } = this.weekArray[index];
    if (selected && index == this.currentDay) {
      this.weekArray[index].selected = false;
      this.control[data.formControlName].reset();
      this.control[data.formControlName].disable();
      this.selectedDay.delete(data.id);
      if (this.selectedDay.size) {
        this.currentDay = [...this.selectedDay].pop();
        this.weekArray[this.currentDay].selected = true;
      } else {
        this.currentDay = 0;
        this.establishmentTiming.disable();
      }
      return;
    }
    const previousDay = this.weekArray.findIndex((day: any) => {
      return day.id == this.currentDay;
    });
    if (previousDay != -1) {
      const error =
        this.control[this.weekArray[previousDay].formControlName].hasError(
          "atleatOnetiming"
        );
      if (error) {
        this.weekArray[previousDay].selected = false;
        this.selectedDay.delete(this.currentDay);
        this.control[this.weekArray[previousDay].formControlName].disable();
      }
      this.weekArray[index].selected = true;
      this.control[data.formControlName].enable();
      this.currentDay = data.id;
      this.selectedDay.add(data.id);
    }
  }
  get control() {
    return this.establishmentTiming.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.establishmentTiming.markAllAsTouched();
    if (this.establishmentTiming.valid) {
      this.enableDisableControl();
      this.sectionC = {
        ...this.sectionC,
        establishmentTiming: this.establishmentTiming.value,
      };
      this.localStorage.setItem("sectionC", this.sectionC);
      this.router.navigate([this.routes.next]);
    }
  }
  getEvents() {
    this.saveExit$ = this.saveExit$ = this.eventService
      .getEvent("saveExit")
      .subscribe({
        next: (res: boolean) => {
          const isEdit = this.localStorage.getItem("isEdit") ?? 0;
          if (res) {
            const payload = {
              isSaveAndExit: true,
              steps: 3,
              isEdit: isEdit ? true : false,
              profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.ESTABLISHMENT_TIMING,
              records: {
                ...this.sectionC,
                establishmentTiming: this.establishmentTiming.valid
                  ? (this.enableDisableControl(),
                    this.establishmentTiming.value)
                  : null,
              },
            };
            this.apiService.saveAndExit(payload);
          }
        },
      });
  }
  back() {
    this.router.navigate([this.routes.back]);
  }
  enableDisableControl(enable: boolean = false) {
    this.weekArray.forEach((day: any) => {
      if (this.control[day.formControlName].status != "DISABLED") {
        this.dayControl(day.formControlName).controls.forEach(
          (slot: any, i: number) => {
            enable
              ? slot.enable()
              : Object.keys(slot.value).forEach((key: any) => {
                  if (slot.value?.[key] == null) slot.disable();
                });
          }
        );
      }
    });
  }
  ngOnDestroy(): void {
    this.saveExit$?.unsubscribe();
  }
}
