import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  standalone: false,
  selector: "nectar-confirm-cosultation",
  templateUrl: "./confirm-cosultation.component.html",
  styleUrls: ["./confirm-cosultation.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmCosultationComponent {
  constructor(
    private matdialogRef: MatDialogRef<ConfirmCosultationComponent>,
    @Inject(MAT_DIALOG_DATA) public matdata: any,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.matdialogRef.close();
  }
}
