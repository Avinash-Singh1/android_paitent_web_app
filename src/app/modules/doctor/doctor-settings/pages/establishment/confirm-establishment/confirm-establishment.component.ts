import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { AddEstablishmentComponent } from "src/app/modules/doctor/doctor-settings/pages/establishment/add-establishment/add-establishment.component";

@Component({
  standalone: false,
  selector: "nectar-confirm-establishment",
  templateUrl: "./confirm-establishment.component.html",
  styleUrls: ["./confirm-establishment.component.scss"],
})
export class ConfirmEstablishmentComponent implements OnInit {
  constructor(
    private matdialog: MatDialog,
    private matdialogRef: MatDialogRef<ConfirmEstablishmentComponent>,
    @Inject(MAT_DIALOG_DATA) public matdata: any
  ) {}
  heading = "Add Establishment";
  isOwner: number = 2;
  sumbitted: boolean = false;
  ngOnInit(): void {
    if (this.matdata.ownerList) {
      this.isOwner = 0;
    }
  }
  onSave() {
    this.sumbitted = true;
    if (this.isOwner == 1 || this.isOwner == 0) {
      this.matdialog.open(AddEstablishmentComponent, {
        panelClass: "add-establishment",
        data: {
          edit: this.matdata.edit ? true : false,
          establishmentDetail: {
            ...this.matdata?.establishmentDetail,
            isOwner: this.isOwner,
          },
        },
        autoFocus: false,
      });

      this.matdialogRef.close(true);
    }
  }
  onCloseDialog() {
    this.matdialogRef.close();
  }
}
