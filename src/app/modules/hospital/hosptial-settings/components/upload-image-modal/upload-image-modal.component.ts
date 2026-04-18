import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-upload-image-modal",
  templateUrl: "./upload-image-modal.component.html",
  styleUrls: ["./upload-image-modal.component.scss"],
})
export class UploadImageModalComponent {
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private matdialogRef: MatDialogRef<UploadImageModalComponent>
  ) {}
  imageUrl: string;
  imageFilter = ["image/png", "image/jpg", "image/jpeg"];
  onFileUpload(event: any) {
    if (event instanceof DragEvent) {
      const file = event.dataTransfer.files[0];
      if (!this.imageFilter.includes(file.type)) {
        this.toastr.error("Please upload images in jpeg, jpg or png format.");
        return;
      }
      if (file) {
        this.apiService.fileUpload(file).subscribe({
          next: (res: any) => {
            this.apiService
              .post(API_ENDPOINTS.hospital.addImages, {
                image: { url: res.result.uri.uri },
              })
              .subscribe({
                next: (res: any) => {
                  this.matdialogRef.close(true);
                },
              });
          },
          error: (error: any) => {
          },
        });
      }
      return;
    }
    if (event.target?.files?.length) {
      const file = event.target.files[0];
      if (!this.imageFilter.includes(file.type)) {
        this.toastr.error("Please upload images in jpeg, jpg or png format.");
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          this.apiService
            .post(API_ENDPOINTS.hospital.addImages, {
              image: { url: res.result.uri.uri },
            })
            .subscribe({
              next: (res: any) => {
                this.matdialogRef.close(true);
              },
            });
        },
        error: (error: any) => {
        },
      });
    }
  }
}
