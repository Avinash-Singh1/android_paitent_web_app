import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { HospitalAddTimingModalComponent } from "../hospital-add-timing-modal/hospital-add-timing-modal.component";

@Component({
  standalone: false,
  selector: "nectar-hospital-timing",
  templateUrl: "./hospital-timing.component.html",
  styleUrls: ["./hospital-timing.component.scss"],
})
export class HospitalTimingComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private formatTime: FormatTimeService
  ) {}

  ngOnInit(): void {
    this.getTiming();
  }
  timing = [];
  deleteSubscription$: Subscription;
  selectedId: string;
  hospitalTiming: any;
  establishmentTimingId: string;
  getTiming() {
    this.apiService.get(API_ENDPOINTS.hospital.hospitalTiming, {}).subscribe({
      next: (res: any) => {
        const data = res.result;
        this.establishmentTimingId = res.result._id;
        this.hospitalTiming = data;
        delete data._id;
        this.timing = this.formatTime.dateTimeConversion(data);
      },
      error: () => {
        this.timing = [];
      },
    });
  }
  onAddTiming(edit: boolean = false) {
    const addEditDialog = this.matdialog.open(HospitalAddTimingModalComponent, {
      autoFocus: false,
      data: {
        edit,
        timing: this.hospitalTiming,
        establishmentTimingId: this.establishmentTimingId,
      },
    });
    addEditDialog.afterClosed().subscribe((res: any) => {
      if (res) {
        this.hospitalTiming = res;
        this.timing = this.formatTime.dateTimeConversion(res);
      }
    });
  }
  onEditTiming() {}
}
