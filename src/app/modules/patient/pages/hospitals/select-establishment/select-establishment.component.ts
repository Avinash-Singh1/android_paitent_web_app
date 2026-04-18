import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
} from "@angular/material/bottom-sheet";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { BottomSheetClinicVisitComponent } from "src/app/shared/components/bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";

@Component({
  standalone: false,
  selector: "nectar-select-establishment",
  templateUrl: "./select-establishment.component.html",
  styleUrls: ["./select-establishment.component.scss"],
})
export class SelectEstablishmentComponent implements OnInit {
  constructor(
    public bottomSheet: MatBottomSheet,
    private apiService: ApiService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.doctorId = this?.data?.doctorId;
      this.getDetails();
    }
  }
  doctorId: any;
  doctorData: any;
  getDetails() {
    if (!this.doctorId) return;

    this.apiService
      .get(`${API_ENDPOINTS.patient.doctorDetail}`, { doctorId: this.doctorId })
      .subscribe((res: any) => {
        this.doctorData = res?.result?.[0];

      });
  }

  selectHospital(data: any) {
    if (this.data?.openSheet) {
      this.bottomSheet.open(BottomSheetClinicVisitComponent, {
        data: {
          newsId: this.doctorId,
          establishmentIds: data?._id,
        },
      });
      this.eventService.broadcastEvent("hospital-data", data);
    } else {
      if (this.data?.type == "doctor-listing") {
        this.bottomSheet.dismiss(data);
      } else {
        this.bottomSheet.dismiss();
        this.eventService.broadcastEvent("change-hospital", data?._id);
      }
    }
  }
}
