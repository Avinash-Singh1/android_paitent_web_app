import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { HospitalDeleteModalComponent } from "../../../components/hospital-delete-modal/hospital-delete-modal.component";

@Component({
  standalone: false,
  selector: "nectar-hospital-add-socialmedia",
  templateUrl: "./hospital-add-socialmedia.component.html",
  styleUrls: ["./hospital-add-socialmedia.component.scss"],
})
export class HospitalAddSocialmediaComponent implements OnInit {
  constructor(
    public matdialogRef: MatDialogRef<HospitalAddSocialmediaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private apiService: ApiService,
    private matdialog: MatDialog
  ) {}
  socialMediaForm: FormGroup;
  socialMediaList: any = [];
  ngOnInit(): void {
    this.validateForm();
    this.getListing();
    if (this.data.edit) {
      this.socialMediaForm.patchValue(this.data.patchValue);
    }
  }
  validateForm() {
    this.socialMediaForm = this.fb.group({
      social: this.fb.group({
        type: [null, [Validators.required]],
        url: ["", [Validators.required]],
      }),
    });
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.social, {}).subscribe({
      next: (res: any) => {
        const { data } = res.result;
        this.socialMediaList = data;
      },
      error: (error: any) => {
        this.socialMediaList = [];
      },
    });
  }
  onDelete() {
    this.matdialogRef.close();
    setTimeout(() => {
      this.matdialog.open(HospitalDeleteModalComponent, {
        data: {
          heading: "Delete from Hospital profile?",
          message: `The social profile will be removed permanently. Do you want to delete?`,
        },
      });
    }, 100);
  }
  onSubmit() {
    this.socialMediaForm.markAllAsTouched();
    if (this.socialMediaForm.valid) {
      if (this.data.edit) {
        this.apiService
          .putParams(
            API_ENDPOINTS.hospital.editSocialMedia,
            this.socialMediaForm.value,
            { socialId: this.data.patchValue.social._id }
          )
          .subscribe({
            next: (res: any) => {
              this.matdialogRef.close(true);
            },
          });
        return;
      }
      this.apiService
        .post(API_ENDPOINTS.hospital.addSocialMedia, this.socialMediaForm.value)
        .subscribe({
          next: (res: any) => {
            this.matdialogRef.close(true);
          },
        });
    }
  }
}
