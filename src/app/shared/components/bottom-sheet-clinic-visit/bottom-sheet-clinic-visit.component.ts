import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";

@Component({
  standalone: false,
  selector: "nectar-bottom-sheet-clinic-visit",
  templateUrl: "./bottom-sheet-clinic-visit.component.html",
})
export class BottomSheetClinicVisitComponent {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
  }
}
