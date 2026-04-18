import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CreateFormService } from "src/app/services/create-form.service";
import { FormValidationService } from "src/app/services/form-validation.service";
import { prepareDayTiming } from "src/app/utils/helper";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: "nectar-hospital-add-timing-modal",
  templateUrl: "./hospital-add-timing-modal.component.html",
  styleUrls: ["./hospital-add-timing-modal.component.scss"],
})
export class HospitalAddTimingModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private matdialogRef: MatDialogRef<HospitalAddTimingModalComponent>,
    private createForm: CreateFormService,
    private formValidation: FormValidationService
  ) {}

  timingForm: FormGroup;
  currentDay: number = 0;
  selectedDay = new Set([]);
  establishmentTimingId: string;
  weekArray = [
    {
      name: "Mon",
      selected: this.data.edit ? false : true,
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
  ngOnInit(): void {
    this.validateForm();
    if (this.data.edit) {
      this.timingForm.patchValue({
        ...this.data.timing,
        ...prepareDayTiming(this.data.timing),
      });
      this.maintainSelected();
    }
  }
  generatTimiListing(startTime: number, endTime: number, interval: number) {
    let timeList = [];
    for (let i = startTime; i <= endTime; i += interval) {
      timeList.push({
        name: this.datepipe.transform(new Date(i), "h:mm a"),
        _id: this.datepipe.transform(new Date(i), "h:mm a"),
      });
    }
    return timeList;
  }
  validateForm() {
    this.timingForm = this.fb.group({
      mon: this.createForm.createDay(),
      tue: this.createForm.createDay(),
      wed: this.createForm.createDay(),
      thu: this.createForm.createDay(),
      fri: this.createForm.createDay(),
      sat: this.createForm.createDay(),
      sun: this.createForm.createDay(),
    });
    this.timingForm.setValidators(
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
  }
  get control() {
    return this.timingForm.controls;
  }
  dayControl(day: string) {
    return this.control[day] as FormArray;
  }

  disableControl(...args: string[]) {
    args.forEach((controlName: string) => this.control[controlName].disable());
  }
  maintainSelected() {
    this.weekArray.forEach((day: any) => {
      if (this.dayControl(day.formControlName).valid) {
        this.selectedDay.add(day.id);
        day.selected = true;
        this.currentDay = day.id;
      } else {
        this.control[day.formControlName].disable();
      }
    });
  }
  onSelectDay(data: any, index: number) {
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
        this.disableControl("mon", "tue", "wed", "thu", "fri", "sat", "sun");
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
  onSubmit() {
    this.timingForm.markAllAsTouched();
    if (this.timingForm.valid) {
      this.enableDisableControl();
      if (this.data.edit) {
        this.apiService
          .putParams(
            API_ENDPOINTS.hospital.editHospitalTiming,
            this.timingForm.value,
            { establishmentTimingId: this.data.establishmentTimingId }
          )
          .subscribe({
            next: (res: any) => {
              this.matdialogRef.close(this.timingForm.value);
            },
            error: (error: any) => {
              this.enableDisableControl(true);
            },
          });
        return;
      }
      this.apiService
        .post(API_ENDPOINTS.hospital.addHospitalTiming, this.timingForm.value)
        .subscribe({
          next: (res: any) => {
            this.matdialogRef.close(this.timingForm.value);
          },
          error: (error: any) => {
            this.enableDisableControl(true);
          },
        });
    }
  }
  enableDisableControl(enable: boolean = false) {
    this.weekArray.forEach((day: any) => {
      if (this.control[day.formControlName].status != "DISABLED") {
        this.dayControl(day.formControlName).controls.forEach(
          (slot: any, i: number) => {
            enable
              ? slot.enable()
              : Object.keys(slot.value).forEach((key: any) => {
                  if (slot.value?.[key] == null) {
                    slot.disable();
                  }
                });
          }
        );
      }
    });
  }
}
