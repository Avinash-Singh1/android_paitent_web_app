import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-cancel-appointment",
  templateUrl: "./cancel-appointment.component.html",
  styleUrls: ["./cancel-appointment.component.scss"],
})
export class CancelAppointmentComponent implements OnInit, OnDestroy {
  constructor(
    private localStorage: LocalStorageService,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.getSavedData();
    this.activateRoute.queryParams.subscribe((res: any) => {
      this.cancelAppointment(res?.id);
    });
  }
  doctorDetail: any;
  timing: any;
  getSavedData() {
    this.doctorDetail =
      JSON.parse(this.localStorage.getItem("doctor-detail")) || {};
    this.timing = JSON.parse(this.localStorage.getItem("appoint-time")) || {};

    this.timing.date = new Date(this.timing?.date);
    this.timing.date = this.datePipe.transform(
      this.timing.date,
      "MMM dd, yyyy"
    );
  }
  ngOnDestroy(): void {
    this.localStorage.removeItem("doctor-detail");
    this.localStorage.removeItem("appoint-time");
  }
  userData: any;
  cancelAppointment(id: any) {
    this.apiService
      .put(`${API_ENDPOINTS.patient.cancelAppointment}/${id}`, {})
      .subscribe((res: any) => {
        this.userData = res?.result;
      });
  }

  viewDoctor() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(
      this.doctorDetail?.city
    );
    this.router.navigate([
      `${city || "NA"}/doctor/${this.doctorDetail?.doctorProfileSlug}`,
    ]);
  }
}
