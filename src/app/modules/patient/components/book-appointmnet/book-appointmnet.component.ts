import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { hospitalTypeToSlug } from 'src/app/config/hospital-types.constant';

@Component({
  standalone: false,
  selector: "nectar-book-appointmnet",
  templateUrl: "./book-appointmnet.component.html",
  styleUrls: ["./book-appointmnet.component.scss"],
})
export class BookAppointmnetComponent implements OnInit {
  bookingForm!: FormGroup;
  submitted: boolean;
  appoitmentType: any;

  customName:any
  stateList: any;
  private isBrowser: boolean;
  constructor(
    private locaStorage: LocalStorageService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private eventService: EventService,
    public gService: GoogleMapsService) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }
  type = "self";

  consultationType: any

  onNameChange(newName: string) {
    // this.bookingForm.patchValue({ patientName: newName });
    this.bookingForm.get('name')?.setValue(newName)
  }


  ngOnInit(): void {
    if (this.isBrowser) {
      window.scrollTo(0, 0);
    }

      this.bookingForm = this.fb.group({
        phone: ["", [Validators.required, Validators.minLength(10)]],
        name: [{ value: "", disabled: true }],
        patientName: ["", [Validators.required]],
        email: [
          "",
          [
            Validators.email,
          Validators.pattern(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
          ),
        ],
      ],
    });
    this.getState()
    this.getUserDetail();
    this.getSavedData();
  }
  getType(e: any) {
    this.type = e;
    if (e !== "self") {
      this.bookingForm.patchValue({ email: "" });
      this.bookingForm.controls["email"].enable();
    } else {
      if (this.patientEmail) {
        this.bookingForm.patchValue({ email: this.patientEmail });
        this.bookingForm.controls["email"].disable();
      }
    }
  }

  getAppoinmentType(e: any) {
    this.appoitmentType = e;
    this.locaStorage.setItem("appoint-type", e)
  }
  get control() {
    return this.bookingForm.controls;
  }
  doctorDetail: any;
  timing: any;
  patientDetail: any;
  isLoggedin:any
  getSavedData() {
    this.doctorDetail =
      JSON.parse(this.locaStorage.getItem("doctor-detail")) || {};
    this.appoitmentType =
      JSON.parse(this.locaStorage.getItem("appoint-type")) || {};
    this.timing = JSON.parse(this.locaStorage.getItem("appoint-time")) || {};
    this.timing.date = new Date(this.timing?.date);
    this.timing.date = this.datePipe.transform(
      this.timing.date,
      "MMM dd, yyyy"
    );
    this.patientDetail =
      JSON.parse(this.locaStorage.getItem("userDetail")) || {};
    this.bookingForm.patchValue({ name: this.patientDetail?.fullName });
    this.getHospitalDetail();

    this.isLoggedin=this.locaStorage.getItem("isLogged") || false

  }

  confirmBooking() {
    this.submitted = true;
    let slot: number;
    if (this.timing.shift == "morning") {
      slot = 1;
    } else if (this.timing.shift == "afternoon") {
      slot = 2;
    } else {
      slot = 3;
    }
    let payload: any = {
      doctorId: this.doctorDetail?.doctorId,
      establishmentId: this.timing?.establishmentId,
      slot: slot,
      consultationFees: this.appoitmentType == 1 ? Number(this.doctorDetail?.consultationFees) : Number(this.doctorDetail?.videoConsultationFees),
      self: this.type == "self" ? true : false,
      date: this.timing?.date,
      time: this.timing?.time?.time,
      profileName: this.customName!='' ? this.customName : ''
    };
    if (this.type !== "self" && this.bookingForm.valid) {
      payload.fullName = this.bookingForm.value.patientName;
      payload.phone = this.bookingForm.value.phone;
    } else if (this.type !== "self" && this.bookingForm.invalid) {
      return;
    }
    if (this.bookingForm.value.email) {
      payload.email = this.bookingForm.value.email;
    }
    if (this.appoitmentType == '1') {
      payload.consultationType = APP_CONSTANTS.CONSULTATION_TYPES.IN_CLINIC;
    }
    if (this.appoitmentType == '2') {
      payload.consultationType = APP_CONSTANTS.CONSULTATION_TYPES.VIDEO

    }

    this.apiService
      .post(API_ENDPOINTS.patient.bookAppointment, payload)
      .subscribe((res: any) => {
        this.eventService.broadcastEvent("login", true);
        this.router.navigate(["/confirm-booking"], {
          queryParams: { id: res?.result?._id },
          replaceUrl: true,
        });
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

    if(item?.location?.coordinates?.[1]== 28.6448 && item?.location?.coordinates?.[0]== 77.216721)
    {
      const address = `${item?.address?.landmark} ${item?.address?.locality}, ${item?.address?.city}, ${this.getStateName(item?.address?.state)} ${item?.address?.pincode}`;

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

      if (this.isBrowser) {
        window.open(googleMapsUrl, '_blank');
      }
    }
    else{
      this.gService.redirectToGoogleMaps(
        item?.location?.coordinates?.[1] ,
        item?.location?.coordinates?.[0]
      )
    }
  }

  viewDoctor() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.doctorDetail?.city.split(" ").join("-").toLowerCase();
    this.router.navigate([
      `${city}/doctor/${this.doctorDetail?.doctorProfileSlug}`,
    ]);
  }

  viewHospital() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.details?.address?.city.split(" ").join("-").toLowerCase();
    const hType = hospitalTypeToSlug(this.details?.hospitalType || 'Hospital');
    this.router.navigate([`${city}/${hType}/${this.details?.profileSlug}`]);
  }
  details: any;
  getHospitalDetail() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.getEstablishmentDetail}`, {
        recordId: this.timing?.establishmentId,
      })
      .subscribe((res: any) => {
        this.details = res?.result;

        if (
          !this.details?.hospital?.profilePic ||
          !this.details?.hospital?.profilePic.includes("s3") ||
          !this.details?.hospital
        ) {
          this.details.hospital.profilePic =
            "assets/images/svg/Nectar Favicon.svg";
        }
      });
  }
  patientEmail: any;
  patientProfielName:any
  getUserDetail() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.getUserDetail}`, {})
      .subscribe((res: any) => {
        this.patientProfielName=res?.result?.fullName

        if(res?.result?.fullName!=''||res?.result?.fullName!=null ){
          this.bookingForm.patchValue({ name: res?.result?.fullName });
          this.customName=res?.result?.fullName
        }
        if (res?.result?.patient?.email && this.type == "self") {
          this.patientEmail = res?.result?.patient?.email;
          this.bookingForm.patchValue({ email: res?.result?.patient?.email });
          this.bookingForm.controls["email"].disable();
        }
      });
  }
}
