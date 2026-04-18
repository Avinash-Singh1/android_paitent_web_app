import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-establishment-request",
  templateUrl: "./establishment-request.component.html",
  styleUrls: ["./establishment-request.component.scss"],
})
export class EstablishmentRequestComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialogRef: MatDialogRef<EstablishmentRequestComponent>,
    private eventService: EventService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  payload: any = {
    page: 1,
    size: 10,
  };
  totalItems: number = 0;
  statusObj = {
    1: "Pending",
    2: "Accepted",
    3: "Rejected",
  };
  statusArray = [
    { label: "Accept", value: 2 },
    { label: "Reject", value: 3 },
  ];
  statusChange: boolean = false;
  ngOnInit(): void {
    this.requestList = this.data.tableData;
    this.totalItems = this.data.totalItems;
    this.matdialogRef.afterClosed().subscribe((res: any) => {
      this.eventService.broadcastEvent("statusChanged", this.statusChange);
    });
  }
  requestList: any = [];
  changingPage(event: any) {
    this.payload.page = event;
    this.getRequestList();
  }
  getRequestList() {
    this.apiService
      .get(API_ENDPOINTS.doctor.establishmentRequestList, this.payload)
      .subscribe({
        next: (res: any) => {
          this.requestList = res.result[0].data;
          this.totalItems = res.result[0].count;
        },
        error: (error: any) => {
        },
      });
  }

  onSorting(columnName: string, order: string) {
    if (this.requestList.length) {
      this.payload.sortBy = columnName;
      this.payload.order = order;
      this.payload.page = 1;
      this.getRequestList();
    }
  }
  onChangeStatus(status: number, details: any, i: number) {
    const payload = {
      isVerified: status,
    };

    const params = {
      establishmentId: String(details.establishmentId),
    };
    this.apiService
      .patchParams(
        API_ENDPOINTS.doctor.changeEstablishmentStatus,
        payload,
        params
      )
      .subscribe({
        next: (res: any) => {
          details.isVerified = status;
          this.statusChange = true;
          this.getRequestList();
        },
        error: (error: any) => {
        },
      });
  }
}
