import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-delete-appointment-modal",
  templateUrl: "./delete-appointment-modal.component.html",
  styleUrls: ["./delete-appointment-modal.component.scss"],
})
export class DeleteAppointmentModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public matdata: any,
    public matdialogRef: MatDialogRef<DeleteAppointmentModalComponent>,
    private apiService: ApiService,
    private eventService: EventService
  ) {}

  data = {
    heading: "Delete appointment",
    message: " Are you sure you want to delete appointment permanently?",
  };
  onDelete() {
    this.apiService
      .putParams(
        API_ENDPOINTS.hospital.changeAppointmentStatus,
        { isDeleted: true },
        { appointmentId: this.matdata.appointmentId }
      )
      .subscribe({
        next: (res: any) => {
          this.eventService.broadcastEvent(
            "callcalendarapi",
            this.matdata.date
          );
          this.matdialogRef.close();
        },
      });
  }
}
