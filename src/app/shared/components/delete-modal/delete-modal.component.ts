import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-delete-modal",
  templateUrl: "./delete-modal.component.html",
  styleUrls: ["./delete-modal.component.scss"],
})
export class DeleteModalComponent {
  constructor(
    private matdialogRef: MatDialogRef<DeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public matdata: any,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    public closeModal: MatDialogRef<DeleteModalComponent>
  ) {}

  deleteService() {
    let param = {
      recordId: this.matdata?.id,
    };
    let data = {
      type: this?.data?.type ? this?.data?.type : 5,
      isEdit: true,
      isDeleted: true,
    };
    if (this.data?.type == 5 || !this.data?.type) {
      this.apiService
        .putSetting(API_ENDPOINTS.doctor.settingList, data, param)
        .subscribe((res: any) => {
          if (res?.success) {
            this.closeModal.close(true);
          }
        });
    } else {
      this.apiService
        .delete(API_ENDPOINTS.doctor.procedures, this.matdata?.id)
        .subscribe((res: any) => {
          if (res?.success) {
            this.closeModal.close(true);
          }
        });
    }
  }

  yes() {
    this.matdialogRef.close(true);
  }
  no() {
    this.matdialogRef.close(false);
  }
}
