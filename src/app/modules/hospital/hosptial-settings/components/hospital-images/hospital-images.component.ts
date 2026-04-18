import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { HospitalDeleteModalComponent } from "../../../components/hospital-delete-modal/hospital-delete-modal.component";
import { UploadImageModalComponent } from "../upload-image-modal/upload-image-modal.component";

@Component({
  standalone: false,
  selector: "nectar-hospital-images",
  templateUrl: "./hospital-images.component.html",
  styleUrls: ["./hospital-images.component.scss"],
})
export class HospitalImagesComponent implements OnInit {
  constructor(private apiService: ApiService, private matdialog: MatDialog) {}

  ngOnInit(): void {
    this.getImageList();
  }
  imageList = [];
  getImageList() {
    this.apiService.get(API_ENDPOINTS.hospital.getImagesList, {}).subscribe({
      next: (res: any) => {
        this.imageList = res.result;
      },
      error: () => {
        this.imageList = [];
      },
    });
  }
  onDelete(index: number, imageId) {
    const deleteDialog = this.matdialog.open(HospitalDeleteModalComponent, {
      data: {
        heading: "Delete from Hospital profile?",
        message: `The image will be removed permanently. Do you want to delete?`,
      },
    });
    deleteDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.apiService
          .delteParams(API_ENDPOINTS.hospital.deleteImages, { imageId })
          .subscribe({
            next: (res: any) => {
              this.imageList.splice(index, 1);
            },
          });
      }
    });
  }
  onAddImage() {
    const addDialog = this.matdialog.open(UploadImageModalComponent, {
      width: "600px",
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getImageList();
      }
    });
  }
}
