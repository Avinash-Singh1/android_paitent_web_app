import { Component, Inject, OnInit, DOCUMENT } from "@angular/core";
import { AbstractControlOptions, FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DeleteModalComponent } from "src/app/shared/components/delete-modal/delete-modal.component";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { FormValidationService } from "src/app/services/form-validation.service";
import { CommonService } from "src/app/services/common.service";


@Component({
  standalone: false,
  selector: "nectar-my-feedback",
  templateUrl: "./my-feedback.component.html",
  styleUrls: ["./my-feedback.component.scss"],
})
export class MyFeedbackComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private apiService: ApiService,
    private formvalidation: FormValidationService,
    private commonService: CommonService,
    @Inject(DOCUMENT) private _document: Document
  ) {}
  deviceWidth: any;
  upcoming: boolean = true;
  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.validateForm();
    this.getListing();
  }
  payload: any = {
    page: 1,
    size: 5,
  };

  filterForm: FormGroup;
  validateForm() {
    this.filterForm = this.fb.group(
      {
        fromDate: [],
        toDate: [],
      },
      {
        validator: [this.formvalidation.fromToValidation("fromDate", "toDate")],
      } as AbstractControlOptions
    );
  }
  yearWiseData: any;
  totalCount: any;
  getListing() {
    if (this.payload.toDate) {
      this.payload.toDate = this.payload.toDate.toISOString();
    }
    if (this.payload.fromDate) {
      this.payload.fromDate = this.payload.fromDate.toISOString();
    }
    this.apiService
      .get(`${API_ENDPOINTS.patient.myFeedbacks}`, this.payload)
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

  deleteFeedback(i: any) {
    const dialogref = this.dialog.open(DeleteModalComponent, {
      data: {
        heading: "Delete Feedback",
        message:
          "Your entire feedback will be deleted. Would you like to continue?",
        type: "patient",
      },
    });
    dialogref.afterClosed().subscribe((data: any) => {
      if (data) {
        this.apiService
          .put(`${API_ENDPOINTS.patient.deleteFeedback}?feedbackId=${i?._id}`, {
            isDeleted: true,
          })
          .subscribe((res: any) => {
            this.getListing();
          });
      }
    });
  }
}
