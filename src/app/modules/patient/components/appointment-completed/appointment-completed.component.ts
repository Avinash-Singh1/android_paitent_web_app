import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { hospitalTypeToSlug } from 'src/app/config/hospital-types.constant';

@Component({
  standalone: false,
  selector: "nectar-appointment-completed",
  templateUrl: "./appointment-completed.component.html",
  styleUrls: ["./appointment-completed.component.scss"],
})
export class AppointmentCompletedComponent implements OnInit {
  constructor(
    private localStorage: LocalStorageService,
    private datePipe: DatePipe,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private apiService: ApiService,
    private eventService: EventService,
    public gService: GoogleMapsService
  ) {}
  appointmentId: any;
  ngOnInit(): void {
    this.getSavedData();
    this.activateRoute.queryParams.subscribe((res: any) => {
      this.appointmentId = res?.id;
      this.getAppointmentDetail();
    });
  }
  doctorDetail: any;
  timing: any;
  getSavedData() {
    let currentYear = new Date().getFullYear();
    this.doctorDetail =
      JSON.parse(this.localStorage.getItem("doctor-detail")) || {};
    this.timing = JSON.parse(this.localStorage.getItem("appoint-time")) || {};

    this.timing.date = this.datePipe.transform(
      this.timing.date + " " + currentYear,
      "MMM dd, yyyy"
    );
  }
  backToProfile() {
    this.localStorage.removeItem("doctor-detail");
    this.localStorage.removeItem("appoint-time");
    this.router.navigate(["/profile"]);
  }

  establishmentDetail: any;
  details: any;
  getAppointmentDetail() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.getAppoinment}/${this.appointmentId}`, {})
      .subscribe((res: any) => {
        this.establishmentDetail = res?.result[0]?.establishment;
        this.details = res?.result[0];

        if (!this.details?.establishment?.pic) {
          this.details.establishment.pic =
            "assets/images/svg/Nectar Favicon.svg";
        }
      });
  }

  viewDoctor() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.doctorDetail?.city.toLowerCase().replace(" ", "-");
    this.router.navigate([
      `${city}/doctor/${this.doctorDetail?.doctorProfileSlug}`,
    ]);
  }

  viewHospital() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.details?.establishment?.address?.city
      .split(" ")
      .join("-")
      .toLowerCase();
    const hType = hospitalTypeToSlug(this.details?.establishment?.hospitalType || 'Hospital');
    this.router.navigate([
      `${city}/${hType}/${this.details?.establishment?.profileSlug}`,
    ]);
  }

  shareFeedback() {
    this.localStorage.setItem("drName", this.doctorDetail?.fullname);
    this.router.navigate(["/profile/share-feedback"], {
      queryParams: {
        id: this.details?.doctorId,
        appointmentId: this.details._id,
        estId: this.details.establishmentId,
      },
      queryParamsHandling: "merge",
    });
  }
}
