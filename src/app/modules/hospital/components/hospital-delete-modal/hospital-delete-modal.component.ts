import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-hospital-delete-modal",
  templateUrl: "./hospital-delete-modal.component.html",
  styleUrls: ["./hospital-delete-modal.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalDeleteModalComponent {
  constructor(
    public matdialogRef: MatDialogRef<HospitalDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private eventService: EventService
  ) {}

  onDelete() {
    this.eventService.broadcastEvent("entryDeleted", true);
    this.matdialogRef.close(true);
  }
}
