import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-common-add-modal",
  templateUrl: "./common-add-modal.component.html",
  styleUrls: ["./common-add-modal.component.scss"],
})
export class CommonAddModalComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    public matdialogRef: MatDialogRef<CommonAddModalComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  recordId: FormControl = new FormControl(null, [Validators.required]);
  suggestionList = [];
  placeHolder: string = "Select Speciality";
  ngOnInit(): void {
    if (this.data.addKey == "procedureList") {
      this.placeHolder = "Select Procedure";
    }
    this.getSpecialityList();
  }
  getSpecialityList() {
    this.apiService
      .get(API_ENDPOINTS.MASTER[this.data.masterKey], {})
      .subscribe({
        next: (res: any) => {
          const { data } = res.result;
          this.suggestionList = data;
        },
        error: (error: any) => {
          this.suggestionList = [];
        },
      });
  }

  onSave() {
    if (this.recordId.valid && this.recordId)
      this.apiService
        .post(API_ENDPOINTS.hospital[this.data.addKey], {
          recordId: this.recordId.value,
        })
        .subscribe({
          next: (res: any) => {
            this.matdialogRef.close(true);
            this.toastr.success("Speciality added successfully.");
          },
          error: (error: any) => {
          },
        });
  }
}
