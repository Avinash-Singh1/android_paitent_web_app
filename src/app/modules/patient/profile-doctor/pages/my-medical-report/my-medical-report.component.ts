import { Component, Inject, OnInit, DOCUMENT } from "@angular/core";
import { AbstractControlOptions, FormBuilder, FormGroup } from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import { AddMedicalComponent } from "../add-medical/add-medical.component";
import { MatDialog } from "@angular/material/dialog";
import { DeleteModalComponent } from "src/app/shared/components/delete-modal/delete-modal.component";
import { ShareModalComponent } from "src/app/shared/components/share-modal/share-modal.component";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { Router } from "@angular/router";
import { FormValidationService } from "src/app/services/form-validation.service";


@Component({
  standalone: false,
  selector: "nectar-my-medical-report",
  templateUrl: "./my-medical-report.component.html",
  styleUrls: ["./my-medical-report.component.scss"],
})
export class MyMedicalReportComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private formvalidation: FormValidationService,
    @Inject(DOCUMENT) private _document: Document
  ) {}
  upcoming: boolean = true;
  totalCount = 1;
  payload: any = {
    page: 1,
    size: 5,
  };
  ngOnInit(): void {
    this.validateForm();
    this.getListing();
  }
  filterForm: FormGroup;
  validateForm() {
    this.filterForm = this.fb.group(
      {
        from: [],
        to: [],
      },
      {
        validator: [this.formvalidation.fromToValidation("from", "to")],
      } as AbstractControlOptions
    );
  }

  yearWiseData: any;
  getListing() {
    if (this.payload.to) {
      this.payload.to = this.payload.to.toISOString();
    }
    if (this.payload.from) {
      this.payload.from = this.payload.from.toISOString();
    }
    this.apiService
      .get(`${API_ENDPOINTS.patient.myMedicalRecords}`, this.payload)
      .subscribe((res: any) => {
        this.yearWiseData = res?.result?.data;
        this.totalCount = res?.result?.count;
      });
  }

  onFiltering() {
    if (this.filterForm.valid) {
      for (let key in this.filterForm.value) {
        if (this.filterForm.value[key]) {
          this.payload[key] = this.filterForm.value[key];
        }
      }
      this.getListing();
    }
  }
  onResetForm() {
    this.filterForm.reset();
    this.payload = {
      page: 1,
      size: 5,
    };
    this.getListing();
  }
  changingPage(e: any) {
    this.payload.page = e;
    this.getListing();
    const element = this._document.getElementById("content");
    element?.scrollIntoView();
  }

  addMedical() {
    const dialogRef = this.dialog.open(AddMedicalComponent, {
      autoFocus: false,
      maxWidth: "400px",
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      this.getListing();
    });
  }

  deleteRecord(i: any) {
    const dialogref = this.dialog.open(DeleteModalComponent, {
      data: {
        heading: "Delete Report",
        message: "Are you sure you want to delete this record?",
        type: "patient",
      },
    });
    dialogref.afterClosed().subscribe((data: any) => {
      if (data) {
        this.apiService
          .delete(`${API_ENDPOINTS.patient.MedicalRecord}/report`, i?._id)
          .subscribe((res: any) => {
            this.getListing();
          });
      }
    });
  }

  viewMedicalRecord(data: any) {
    this.router.navigate(["/profile/medical-reports/view-medical-reports"], {
      queryParams: { id: data._id },
      queryParamsHandling: "merge",
    });
  }

  openShareDialog(data: any) {
    let arr = [];
    data?.url.forEach((el: any) => {
      arr.push(el.url);
    });

    this.dialog.open(ShareModalComponent, {
      panelClass: "sharePanel",
      data: { type: "medical", url: arr.join(`\n`) },
    });
  }
}
