import { Component, Inject, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-cancel-appointment-modal",
  templateUrl: "./cancel-appointment-modal.component.html",
  styleUrls: ["./cancel-appointment-modal.component.scss"],
})
export class CancelAppointmentModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<CancelAppointmentModalComponent>,
    private apiService: ApiService,
    private eventService: EventService
  ) {}
  cancelAppointmentForm: FormGroup;
  submitted: boolean = false;
  ngOnInit(): void {
    this.validateForm();
    const checkArray: FormArray = this.cancelAppointmentForm.get(
      "mode"
    ) as FormArray;
    [1, 2].forEach((item) => {
      checkArray.push(new FormControl(item));
    });
  }
  options = [
    {
      label: "Patient No-Show",
      id: "Patient No-Show",
    },
    {
      label: "Doctor Unavailable/Busy",
      id: "Doctor Unavailable/Busy",
    },
    {
      label: "Patient Ask To Cancelled",
      id: "Patient Ask To Cancelled",
    },
  ];
  validateForm() {
    this.cancelAppointmentForm = this.fb.group({
      reason: [null, [Validators.required]],
      mode: this.fb.array([], [Validators.required]),
    });
  }
  onSubmit() {
    this.submitted = true;
    if (this.cancelAppointmentForm.valid) {
      const payload = {
        status: -1,
        ...this.cancelAppointmentForm.value,
      };
      this.apiService
        .putParams(API_ENDPOINTS.hospital.changeAppointmentStatus, payload, {
          appointmentId: this.data.appointmentId,
        })
        .subscribe({
          next: (res: any) => {
            this.eventService.broadcastEvent("callcalendarapi", this.data.date);
            this.matdialogRef.close();
          },
          error: (error: any) => {
          },
        });
    }
  }
  onCheckboxChange(e: any) {
    this.cancelAppointmentForm.get("mode").markAsTouched();
    const checkArray: FormArray = this.cancelAppointmentForm.get(
      "mode"
    ) as FormArray;
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      checkArray.controls.forEach((item: any) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }
  get control() {
    return this.cancelAppointmentForm.controls;
  }
  get modecontrol() {
    return this.cancelAppointmentForm.get("mode") as FormArray;
  }
}
