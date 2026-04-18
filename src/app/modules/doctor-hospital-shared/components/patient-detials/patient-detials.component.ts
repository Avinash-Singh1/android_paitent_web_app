import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EditAppointmentModalComponent } from "../edit-appointment-modal/edit-appointment-modal.component";
import { DeleteAppointmentModalComponent } from "../delete-appointment-modal/delete-appointment-modal.component";
import { CancelAppointmentModalComponent } from "../cancel-appointment-modal/cancel-appointment-modal.component";
import { EventService } from "src/app/services/event.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { LocalStorageService } from "src/app/services/storage.service";
import moment from 'moment';

@Component({
  standalone: false,
  selector: "nectar-patient-detials",
  templateUrl: "./patient-detials.component.html",
  styleUrls: ["./patient-detials.component.scss"],
})
export class PatientDetialsComponent implements OnInit {
  @Input() data: any;
  futureDate: boolean = false;

  constructor(
    private matdialog: MatDialog,
    private eventService: EventService,
    private apiService: ApiService,
    private datepipe: DatePipe,
    private router: Router,
    private localStorage: LocalStorageService
  ) { }
  weekCode = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  @Output() closePopup: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.futureDate =
      moment(this.data?.date).valueOf() >
      moment(new Date().setHours(24, 0, 0, 0)).valueOf();
  }
  loader: boolean = false;
  chekedout: boolean = false;
  avaliableDay = [];
  onOpenDialog(type: string) {
    switch (type) {
      case "edit":
        this.matdialog.open(EditAppointmentModalComponent, {
          panelClass: "edit-appointment-modal",
          width: "720px",
          data: {
            patientDetails: {
              fullName: this.data?.patient?.patientName ?? this.data.fullName,
              phone: this.data?.patient?.patientPhone ?? this.data.phone,
              email: this.data?.patient?.patientEmail ?? this.data.email,
              date: this.datepipe.transform(
                this.data.date,
                "yyyy-MM-dd",
                "+0530"
              ),
              time: this.datepipe.transform(this.data.date, "h:mm a", "+0530"),
              appointmentId: this.data._id,
            },
            establishmentTiming: this.data.establishmentTiming,
            doctor: this.data?.doctor,
            appointmentId: this.data._id,
            userType: this.data?.userType || 2,
          },
          
          autoFocus: false,

          
        });

        
        break;
      case "delete":
        this.matdialog.open(DeleteAppointmentModalComponent, {
          panelClass: "delete-appointment-modal",
          width: "567px",
          data: {
            appointmentId: this.data._id,
            date: this.data.date,
          },
        });
        break;
      case "cancel":
        this.matdialog.open(CancelAppointmentModalComponent, {
          panelClass: "cancel-appointment-modal",
          width: "567px",
          data: {
            appointmentId: this.data._id,
            date: this.data.date,
          },
          autoFocus: false,
        });
    }
  }
  onClosePopup(event: MouseEvent) {
    event.stopPropagation();
    this.eventService.broadcastEvent("closeTippy", true);
  }
  onComplete() {
    const appointmentDate = new Date(this?.data?.date);
    const currentDate = new Date();
    if (appointmentDate > currentDate) {
      return;
    } else {
      this.loader = true;
      this.apiService
        .putParams(
          API_ENDPOINTS.hospital.changeAppointmentStatus,
          { status: 1 },
          {
            appointmentId: this.data._id,
          }
        )
        .subscribe({
          next: (res: any) => {
            this.loader = false;
            this.data.status = 1;
            this.eventService.broadcastEvent(
              "callcalendarapi",
              this.data?.date
            );
          },
          error: (error: any) => {
            this.loader = false;
          },
        });
    }
  }
  onRouting() {
    this.router.navigate(["/hospital/patients"], {
      state: {
        patientId: this.data.patientId,
      },
    });
  }
}
