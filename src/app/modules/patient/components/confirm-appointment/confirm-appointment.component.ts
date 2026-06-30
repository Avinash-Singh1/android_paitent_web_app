import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { SeoService } from "src/app/services/seo.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { hospitalTypeToSlug } from 'src/app/config/hospital-types.constant';
import { buildMeetUrl as buildMeetUrlHelper } from 'src/app/utils/meet-url.helper';

declare var qp: any; // Declare global function

@Component({
  standalone: false,
  selector: "nectar-confirm-appointment",
  templateUrl: "./confirm-appointment.component.html",
  styleUrls: ["./confirm-appointment.component.scss"],
})
export class ConfirmAppointmentComponent implements OnInit {
  private isBrowser: boolean;
  stateList: any;
  constructor(
    private localStorage: LocalStorageService,
    private datePipe: DatePipe,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private apiService: ApiService,
    private eventService: EventService,
    public gService: GoogleMapsService,
    private renderer: Renderer2,
    private seoService: SeoService,
    private commonService: CommonService) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  /** Builds a Google Meet URL with ?authuser=<email> for the patient. */
  buildMeetUrl(meetUrl: string | null | undefined, email: string | null | undefined): string {
    return buildMeetUrlHelper(meetUrl, email);
  }
  appointmentId: any;
  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe((res: any) => {
      this.appointmentId = res?.id;
      this.getState()
      this.getAppointmentDetail();
      this.seoService.appendScript(
        `gtag('event', 'conversion', {'send_to': 'AW-11399196295/jpDuCJDg9_MYEIfdx7sq'});`,
        this.renderer
      );
      this.trackAppointmentConfirmed();
    });
  }
  doctorDetail: any;
  timing: any;
  getSavedData() {
    if (this.localStorage.getItem("doctor-detail")) {
      this.doctorDetail = JSON.parse(
        this.localStorage.getItem("doctor-detail")
      );
    } else {
      this.getDoctorDetail();
    }
    if (this.localStorage.getItem("appoint-time")) {
      this.timing = JSON.parse(this.localStorage.getItem("appoint-time")) || {};
      this.timing.date = new Date(this.timing?.date);
      this.timing.date = this.datePipe.transform(
        this.timing.date,
        "MMM dd, yyyy"
      );
    } else {
      this.getAppointementSaved();
    }
  }
  backToProfile() {
    this.localStorage.removeItem("doctor-detail");
    this.localStorage.removeItem("appoint-time");
    this.router.navigate(["/profile"]);
  }

  cancelBooking() {
    this.router.navigate(["/cancel-booking"], {
      queryParams: { id: this.appointmentId },
      replaceUrl: true,
    });
  }
  redschduleAppoinment() {
    this.router.navigate(["/reschedule-booking"], {
      queryParams: { id: this.appointmentId },
    });
  }
  details: any;
  getAppointmentDetail() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.getAppoinment}/${this.appointmentId}`, {})
      .subscribe((res: any) => {
        this.details = res?.result[0];
        this.getSavedData();
        if (!this.details?.establishment?.pic) {
          this.details.establishment.pic =
            "assets/images/svg/Nectar Favicon.svg";
        }
      });
  }

  getState() {
    this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
      next: (res) => {
        this.stateList = res.result.data;
      },
      error: (error: any) => {
        this.stateList = [];
      },
    });
  }

  getStateName(stateId: string): string {
    const state = this.stateList.find((s) => s._id === stateId);
    return state ? state.name : 'Unknown State'; // Fallback if state not found
  }

  openGoogleMaps(item: any): void {

    if (item?.location?.coordinates?.[1] == 28.6448 && item?.location?.coordinates?.[0] == 77.216721) {
      const address = `${item?.address?.landmark} ${item?.address?.locality}, ${item?.address?.city}, ${this.getStateName(item?.address?.state)} ${item?.address?.pincode}`;

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

      if (this.isBrowser) {
        window.open(googleMapsUrl, '_blank');
      }
    }
    else {
      this.gService.redirectToGoogleMaps(
        item?.location?.coordinates?.[1],
        item?.location?.coordinates?.[0]
      )
    }
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

  viewHospital() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(
      this.details?.establishment?.address?.city
    );
    const hType = hospitalTypeToSlug(this.details?.establishment?.hospitalType || 'Hospital');
    this.router.navigate([
      `${city}/${hType}/${this.details?.establishment?.profileSlug}`,
    ]);
  }

  getDoctorDetail() {
    if (!this.details?.doctorId) return;

    this.apiService
      .get(
        `${API_ENDPOINTS.patient.doctorDetail}/${this.details?.doctorId}`,
        {}
      )

      .subscribe((res: any) => {
        let data = res?.result?.[0];
        let obj: any = {
          fullname: data?.fullName,
          specialization: data?.specialization,
          address: `${data?.address?.locality || ""}, ${data?.address?.city || ""
            }  `,
          city: data?.address?.city,
          doctorProfileSlug: data?.doctorProfileSlug,
          doctorId: data._id,
          doctorPic: data?.profilePic || "assets/images/svg/Nectar Favicon.svg",
          consultationDetails: data?.consultationDetails,
          videoConsultationFees: data?.videoConsultationFees,
          consultationFees: data?.consultationFees,
          consultationType: data?.consultationType,
          profilePic: this.doctorDetail?.profilePic

        };
        this.doctorDetail = obj;
        this.localStorage.setItem("doctor-detail", JSON.stringify(obj));
      });
  }

  getAppointementSaved() {
    let obj = {
      date: this.datePipe.transform(this.details?.date, "EEE, d MMM"),
      time: { time: this.datePipe.transform(this.details?.date, "h:mm a") },
      establishmentId: this.details?.establishmentId,
      consultFee: this.details?.consultationFees,
    };
    this.localStorage.setItem("appoint-time", JSON.stringify(obj));
  }

  trackAppointmentConfirmed() {
    if (typeof qp === 'function') {
      qp('track', 'GenerateLead');
      // console.log('Quora Pixel GenerateLead event tracked');
    } else {
      console.warn('Quora Pixel is not initialized');
    }
  }
}
