import { Location } from "@angular/common";
import { Component, Inject, OnInit, DOCUMENT } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DeleteModalComponent } from "src/app/shared/components/delete-modal/delete-modal.component";
import { ShareModalComponent } from "src/app/shared/components/share-modal/share-modal.component";
import { AddMedicalComponent } from "../add-medical/add-medical.component";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { HttpClient } from "@angular/common/http";

@Component({
  standalone: false,
  selector: "nectar-view-medical",
  templateUrl: "./view-medical.component.html",
  styleUrls: ["./view-medical.component.scss"],
})
export class ViewMedicalComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    public location: Location,
    private activateRoute: ActivatedRoute,
    private apiService: ApiService,
    private http: HttpClient,
    @Inject(DOCUMENT) private _document: Document
  ) {}
  backdropEnable: boolean = false;
  recordId: any;
  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe((res: any) => {
      if (res?.id) {
        this.recordId = res?.id;
        this.getData();
      }
    });
  }
  records: any;
  detail: any;
  getData() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.viewMedicalRecord}/${this.recordId}`, {})
      .subscribe((res: any) => {
        this.detail = res?.result;
        this.records = res?.result?.url.filter((el: any) => {
          if (el.status != 1) {
            return el;
          }
        });
      });
  }

  deleteRecord(data: any) {
    const dialogref = this.dialog.open(DeleteModalComponent, {
      data: {
        heading: "Delete Report",
        message: "Are you sure you want to delete this record?",
        type: "patient",
      },
    });
    dialogref.afterClosed().subscribe((res: any) => {
      if (res) {
        this.apiService
          .delete(`${API_ENDPOINTS.patient.viewMedicalRecord}`, data?._id)
          .subscribe((res: any) => {
            this.getData();
          });
      }
    });
  }

  openShareDialog(data: any) {
    this.dialog.open(ShareModalComponent, {
      panelClass: "sharePanel",
      data: { type: "medical", url: data?.url },
    });
  }

  addMoreMedical() {
    const dialogRef = this.dialog.open(AddMedicalComponent, {
      autoFocus: false,
      maxWidth: "400px",
      data: {
        recordType: this.detail.type,
        title: this.detail.title,
        id: this.recordId,
      },
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      this.getData();
    });
  }
  selectedData: any;
  dataType: string;
  openBackdrop(data: any) {
    this.backdropEnable = !this.backdropEnable;
    this.selectedData = data;
    if (this.selectedData.url.endsWith("pdf")) {
      this.dataType = "pdf";
    } else {
      this.dataType = "image";
    }
  }
  openIframe(e: any, data: any) {
    e.preventDefault();
    this.openBackdrop(data);
  }

  download(url: string) {
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "title";
    // document.body.appendChild(a);
    // a.click();
    this.http.get(url, { responseType: "blob" }).subscribe((response: Blob) => {
      // Generate a unique filename or use the original filename from the S3 URL
      const filename = "image.jpg";

      // Create a temporary anchor element
      const link = this._document.createElement("a");
      link.href = URL.createObjectURL(response);
      link.download = filename;

      // Simulate a click on the anchor element to trigger the download
      link.click();

      // Clean up the temporary anchor element
      URL.revokeObjectURL(link.href);
      link.remove();
    });
  }
}
