
import { Component, Inject, OnInit, DOCUMENT } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ImageViewModalComponent } from "src/app/shared/image-view-modal/image-view-modal.component";

@Component({
  standalone: false,
  selector: "nectar-doctor-profile",
  templateUrl: "./doctor-profile.component.html",
  styleUrls: ["./doctor-profile.component.scss"],
})
export class DoctorProfileComponent implements OnInit {
  constructor(
    public matdialogRef: MatDialogRef<DoctorProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    @Inject(DOCUMENT) public _document: Document
  ) {}

  ngOnInit(): void {
    this.doctorDetail = this.data.doctorDetail;
  }
  doctorDetail: any = {};
  viewImage(url: any) {
    this.dialog.open(ImageViewModalComponent, {
      data: url,
      autoFocus: false,
    });
  }

  openIframe(e: any, data: any) {
    e.preventDefault();
    this.viewImage(data);
  }
}
