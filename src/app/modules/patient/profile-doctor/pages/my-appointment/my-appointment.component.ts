import { DatePipe, isPlatformBrowser } from "@angular/common";
import { Component, OnInit, ViewChild, inject, PLATFORM_ID } from "@angular/core";
import { AbstractControlOptions, FormBuilder, FormGroup } from "@angular/forms";
import { MatMenuTrigger } from "@angular/material/menu";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { FormValidationService } from "src/app/services/form-validation.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-my-appointment",
  templateUrl: "./my-appointment.component.html",
  styleUrls: ["./my-appointment.component.scss"],
})
export class MyAppointmentComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  constructor(
    private apiService: ApiService,
    private datepipe: DatePipe,
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private router: Router,
    private formvalidation: FormValidationService,
    private eventService: EventService,
    private commonService: CommonService) {}
  @ViewChild('filterTrigger') filterTrigger: MatMenuTrigger;
  deviceWidth: any;
  upcoming: boolean = true;
  status = "upcoming";
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
        status: [],
        from: [],
        to: [],
      },
      {
        validator: [this.formvalidation.fromToValidation("from", "to")],
      } as AbstractControlOptions
    );
  }

  yearWiseData: any;
  totalCount: number;
  getListing() {
    if (this.payload.to) {
      this.payload.to = this.payload.to.toISOString();
    }
    if (this.payload.from) {
      this.payload.from = this.payload.from.toISOString();
    }
    this.apiService
      .get(`${API_ENDPOINTS.patient.myAppointments}`, this.payload)
      .subscribe((res: any) => {
        this.yearWiseData = res?.result?.data;
        this.totalCount = res?.result?.count;
      });
  }

  onFiltering() {
    if (this.filterForm.valid) {
      delete this.payload.status;
      delete this.payload.from;
      delete this.payload.to;
      this.payload.page = 1;
      for (let key in this.filterForm.value) {
        if (this.filterForm.value[key] !== null && this.filterForm.value[key] !== undefined) {
          this.payload[key] = this.filterForm.value[key];
        }
      }
      this.getListing();
      this.filterTrigger?.closeMenu();
    }
  }
  onResetForm() {
    this.filterForm.reset();
    this.payload = {
      page: 1,
      size: 5,
    };
    this.getListing();
    this.filterTrigger?.closeMenu();
  }
  changingPage(e: any) {
    this.payload.page = e;
    this.getListing();
    if (this.isBrowser) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  viewDetails(data: any) {
    let obj: any = {
      fullname: data?.fullName,
      specialization: data?.specialization,
      address: `${data?.docAddress?.locality || ""}, ${
        data?.docAddress?.city
      } ${data?.docAddress?.pincode || ""}  `,
      doctorId: data.doctorId,
      city: data?.docAddress?.city,
      doctorProfileSlug: data?.doctorProfileSlug,
      doctorPic: data?.profilePic || "assets/images/svg/Nectar Favicon.svg",
      consultationFees: data?.consultationFees,
      videoConsultationFees: data?.videoConsultationFees,
      profilePic: data?.profilePic || "assets/images/svg/Nectar Favicon.svg"
    };

    this.localStorage.setItem("doctor-detail", JSON.stringify(obj));
    let date = this.datepipe.transform(data.date, "MMM d,y");
    let time = this.datepipe.transform(data.date, "h:mm a");
    let obj1 = {
      date: date,
      time: { time: time, status: 1 },
      establishmentId: data?.establishmentId,
      consultFee: data?.consultationFees,
    };
    this.localStorage.setItem("appoint-time", JSON.stringify(obj1));

    if (data.status == 0) {
      this.router.navigate(["/confirm-booking"], {
        queryParams: { id: data?._id },
      });
    } else if (data.status == -1) {
      this.router.navigate(["/cancel-booking"], {
        queryParams: { id: data?._id },
      });
    } else {
      this.router.navigate(["/appointment-completed"], {
        queryParams: { id: data?._id },
      });
    }
  }

  bookAgain(data: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = data?.docAddress?.city?.split(" ").join("-").toLowerCase();
    this.router.navigate([`${city}/doctor/${data?.doctorProfileSlug}`]);
  }

  shareFeedback(data: any) {
    this.localStorage.setItem("drName", data?.fullName);
    this.router.navigate(["/profile/share-feedback"], {
      queryParams: {
        id: data?.doctorId,
        appointmentId: data._id,
        estId: data.establishmentId,
      },
      queryParamsHandling: "merge",
    });
  }
}
