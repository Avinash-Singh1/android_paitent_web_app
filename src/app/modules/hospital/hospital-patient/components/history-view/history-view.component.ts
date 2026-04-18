import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subject, debounceTime } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-history-view",
  templateUrl: "./history-view.component.html",
  styleUrls: ["./history-view.component.scss"],
})
export class HistoryViewComponent implements OnInit {
  constructor(
    public matdialogRef: MatDialogRef<HistoryViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private apiService: ApiService
  ) {}
  searchSubject = new Subject();

  ngOnInit(): void {
    this.searchPatient();
  }
  payload: any = {
    page: 1,
    size: 10,
    patientId: this.data.patientId,
  };
  statusObj = {
    0: { label: "Pending", icon: "assets/images/svg/Pending actions.svg" },
    "-1": { label: "Cancelled", icon: "assets/images/svg/Cancel.svg" },
    1: {
      label: "Completed",
      icon: "assets/images/svg/Checkmark-green.svg",
    },
    2: { label: "Pending", icon: "assets/images/svg/Checkmark.svg" },
    "-2": { label: "Rescheduled", icon: "assets/images/svg/Checkmark.svg" },
  };
  onSearch(event: any) {
    const search = event.target.value;
    this.searchSubject.next(search);
  }
  getPatientHistory() {
    const payload = JSON.parse(JSON.stringify(this.payload));
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.apiService
      .get(API_ENDPOINTS.hospital.patientHistory, payload)
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            this.data.patientHistory = data;
          } else {
            this.data.patientHistory = [];
          }
        },
      });
  }
  searchPatient() {
    this.searchSubject.pipe(debounceTime(500)).subscribe((search: string) => {
      this.payload.page = 1;
      this.payload.search = search;
      this.getPatientHistory();
    });
  }
  onPageChange(event: any) {
    this.payload.page = event;
    this.getPatientHistory();
  }
}
