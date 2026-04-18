import { DatePipe, isPlatformBrowser } from "@angular/common";
import { Component, OnInit, inject, PLATFORM_ID } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-patient-login",
  templateUrl: "./patient-login.component.html",
  styleUrls: ["./patient-login.component.scss"],
})
export class PatientLoginComponent implements OnInit {
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  submitted: boolean = false;
  constructor(
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private localStorage: LocalStorageService,
    private eventService: EventService) {}
  mode = "login";
  ngOnInit(): void {
    this.getSavedData();
    this.loginForm = this.fb.group({
      phone: ["", [Validators.required, Validators.minLength(10)]],
    });
    this.otpForm = this.fb.group({
      otp: ["", [Validators.required, Validators.minLength(6)]],
    });
  }
  get control() {
    return this.loginForm.controls;
  }
  get controls() {
    return this.otpForm.controls;
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

  continue() {
    this.submitted = true;
    if (this.mode == "login" && this.loginForm.valid) {
      const payload = {
        phone: `${this.loginForm.value.phone}`,
        userType: 1,
      };
      this.apiService.post(API_ENDPOINTS.auth.login, payload).subscribe({
        next: (res: any) => {
          this.mode = "verify";
          this.submitted = false;
          this.toastr.success("Otp sent successfully");
          this.timer(59);
        },
        error: (error: any) => {
          this.mode = "login";
        },
      });
    } else {
      this.submitted = true;
      if (this.otpForm.valid) {
        const payload = {
          phone: this.loginForm.value.phone,
          userType: 1,
          otp: this.otpForm.value.otp,
        };
        this.apiService
          .post(API_ENDPOINTS.auth.verifyOtp, payload)
          .subscribe((res: any) => {
            this.localStorage.setItem("token", res?.result?.token);
            this.localStorage.setItem("isLogged", true);
            this.localStorage.setItem("userType", res?.result?.userType);
            this.localStorage.setItem(
              "approvalStatus",
              res?.result?.approvalStatus
            );
            this.localStorage.setItem(
              "userDetail",
              JSON.stringify(res?.result?.findUser)
            );
            this.eventService.broadcastEvent("login", true);
            this.router.navigate(["/appointment-booking"]);
          });
      }
    }
  }

  resendOTP() {
    const payload = {
      phone: this.loginForm.value.phone,
      userType: APP_CONSTANTS.USER_TYPES.PATIENT,
      countryCode: "+91",
    };
    this.apiService
      .post(API_ENDPOINTS.auth.resendOtp, payload)
      .subscribe((res: any) => {
        this.timer(59);
        this.toastr.success(res?.message);
      });
  }

  resendTime: any;
  resendOtpVlaue: boolean = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  timer(time: any) {
    if (!this.isBrowser) return;
    let min: any = Math.floor(time / 60);
    let sec: any = time % 60;

    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
    this.resendTime = min + ":" + sec;
    time -= 1;

    if (time >= 0) {
      this.resendOtpVlaue = true;
      setTimeout((x: any) => {
        this.timer(time);
      }, 1000);
      return;
    }
    this.resendTime = "";
    this.resendOtpVlaue = false;
  }
  edit() {
    this.mode = "login";
    this.resendTime = 0;
  }
}
