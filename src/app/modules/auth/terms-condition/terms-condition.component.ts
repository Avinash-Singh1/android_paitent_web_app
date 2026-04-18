import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  standalone: false,
  selector: "nectar-terms-condition",
  templateUrl: "./terms-condition.component.html",
  styleUrls: ["./terms-condition.component.scss"],
})
export class TermsConditionComponent {
  constructor(private matdialogRef: MatDialogRef<TermsConditionComponent>) {}

  onCloseDialog(value: number = 1) {
    this.matdialogRef.close(value);
  }
}
