import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCalendarCellCssClasses } from "@angular/material/datepicker";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { getTimeFromStringDate } from "src/app/services/helper.service";
import moment from 'moment';
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: "nectar-edit-appointment-modal",
  templateUrl: "./edit-appointment-modal.component.html",
  styleUrls: ["./edit-appointment-modal.component.scss"],
})
export class EditAppointmentModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<EditAppointmentModalComponent>,
    private apiService: ApiService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private eventService: EventService,
    private localStorage: LocalStorageService
  ) { }
  dateFilter = (date: Date) => {
    const day = date.getDay();
    return day !== 1;
  };
  editAppointmentForm: FormGroup;
  timingArray: any = [];
  heading = "Edit Appointment";
  submitted: boolean = false;
  today: Date = new Date();
  maxDate = moment(this.today).endOf("M").add(2, "M").toDate();
  routes = {
    2: {
      getAppointment: API_ENDPOINTS.doctor.getCalendarData,
    },
    3: {
      getAppointment: API_ENDPOINTS.hospital.getCalendarData,
    },
  };
  date = new Date();
  dayCode = {
    0: "sun",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
  };
  avaliableDay = [];
  ngOnInit(): void {
    Object.keys(this.dayCode).forEach((key: string) => {
      if (this.data.establishmentTiming?.[this.dayCode[key]].length) {
        this.avaliableDay.push(Number(key));
      }
    });
    const patchdata = { ...this.data.patientDetails };
    this.validateForm();
    this.editAppointmentForm.patchValue(patchdata);
    this.getTodayAppointment(new Date(this.control["date"].value));
  }
  timespendArray = [{ label: "15 min", id: 15 }];
  validateForm() {
    this.editAppointmentForm = this.fb.group({
      fullName: [{ value: "", disabled: true }],
      patientId: ["P123456"],
      phone: [{ value: "", disabled: true }],
      email: [{ value: "", disabled: true }],
      date: [null, [Validators.required]],
      time: [null, Validators.required],
      timespend: [{ value: 15, disabled: true }],
      notes: ["", [Validators.required]],
      appointmentId: [],
    });
  }
  get control() {
    return this.editAppointmentForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.editAppointmentForm.valid) {
      const timeString = this.control["time"].value;
      const timeComponents = timeString.split(":");
      let hour = parseInt(timeComponents[0], 10);
      let minute = parseInt(timeComponents[1].split(" ")[0], 10);

      // Adjust the hour value for AM/PM
      if (timeString.indexOf("PM") !== -1 && hour < 12) {
        hour += 12;
      } else if (timeString.indexOf("AM") !== -1 && hour === 12) {
        hour = 0;
      }

      const payload = {
        date: new Date(
          new Date(this.control["date"].value).setHours(hour, minute, 0, 0)
        ).toISOString(),
        notes: this.control["notes"].value,
      };
      this.apiService
        .postParams(API_ENDPOINTS.hospital.rescheduleAppointment, payload, {
          appointmentId: this.data.appointmentId,
        })
        .subscribe({
          next: (res: any) => {
            this.eventService.broadcastEvent(
              "callcalendarapi",
              this.control["date"].value
            );
            this.matdialogRef.close();
          },
          error: (error: any) => {
          },
        });
    }
  }
  bookedSlot = [];

  getTodayAppointment(date) {
    this.generateList(date);
    this.date = date;

    if (this.data?.userType == APP_CONSTANTS.USER_TYPES.HOSPITAL) {
      this.getHospitalCalendarData();
    } else {
      this.getDoctorCalendarData();
    }
  }

  getHospitalCalendarData() {
    const fromDate = new Date(
      new Date(this.date).setHours(0, 0, 0, 0)
    ).toISOString();
    const toDate = new Date(
      new Date(this.date).setHours(24, 0, 0, 0)
    ).toISOString();
    const doctorId =
      this.data?.doctor?.doctorId || this.localStorage.getItem("faqId");

    const payload = {
      fromDate,
      toDate,
      doctorId,
    };

    this.apiService
      .get(API_ENDPOINTS.hospital.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          this.processHospitalCalendarData(res);
        },
        error: (error: any) => {
        },
      });
  }

  processHospitalCalendarData(res) {
    const { count, data } = res.result;
    if (count) {
      data.forEach((slot: any) => {
        const { data } = slot;
        if (data.status != -1) {
          const slotTime = this.datepipe.transform(slot.date, "h:mm a");
          if (slotTime != this.control["time"].value) {
            this.bookedSlot = [...this.bookedSlot, slotTime];
          }
        }
      });
    }
  }

  getDoctorCalendarData() {
    const payload = {
      today: this.datepipe.transform(new Date(this.date), "yyyy-MM-dd"),
    };

    this.apiService
      .post(API_ENDPOINTS.doctor.getCalendarData, payload)
      .subscribe({
        next: (res: any) => {
          this.processDoctorCalendarData(res);
        },
        error: (error: any) => {
        },
      });
  }

  processDoctorCalendarData(res) {
    res.result?.forEach((appointment: any) => {
      if (appointment.data[0].status != -1) {
        const slotTime = this.datepipe.transform(appointment._id, "h:mm a");
        if (slotTime != this.control["time"].value) {
          this.bookedSlot = [...this.bookedSlot, slotTime];
        }
      }
    });
  }

  disableDay = (date: Date): MatCalendarCellCssClasses => {
    return !this.avaliableDay.includes(date.getDay()) ? "disable" : "";
  };

  generateList(date: Date) {
    const day = this.dayCode[new Date(date).getDay()];
    const doctorDay = this.data.establishmentTiming?.[day];
    this.timingArray = [];
    if (doctorDay?.length) {
      doctorDay.forEach((slot: any) => {
        const starttime = getTimeFromStringDate(slot.from, date);
        const endtime = getTimeFromStringDate(slot.to, date);
        this.timingArray.push(...this.getTimeListing(starttime, endtime));
      });
    }
  }
  getTimeListing(
    startTime,
    lastTime,
    interval: number = environment.DOCTOR_SLOT_TIME
  ) {
    let temp = [];
    for (let i = startTime; i <= lastTime; i += interval) {
      temp.push({
        label: this.datepipe.transform(new Date(i), "h:mm a"),
      });
    }
    return temp;
  }
}
