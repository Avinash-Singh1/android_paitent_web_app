import { Component, Inject, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { LoginModalComponent } from "../login-modal/login-modal.component";
import { EventService } from "src/app/services/event.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";

@Component({
  standalone: false,
  selector: "nectar-verify-modal",
  templateUrl: "./verify-modal.component.html",
  styleUrls: ["./verify-modal.component.scss"],
})
export class VerifyModalComponent implements OnInit {
  otpForm!: FormGroup;
  submitted: boolean = false;
  constructor(
    private matdialogRef: MatDialogRef<VerifyModalComponent>,
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private eventService: EventService) { }

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      otp: ["", [Validators.required, Validators.minLength(6)]],
    });
    this.timer(59);
  }
  get controls() {
    return this.otpForm.controls;
  }
  login() {
    const userType = this.data?.type === 'hospital'
      ? APP_CONSTANTS.USER_TYPES.HOSPITAL
      : this.data?.type === 'doctor'
        ? APP_CONSTANTS.USER_TYPES.DOCTOR
        : APP_CONSTANTS.USER_TYPES.PATIENT;
    this.submitted = true;
    if (this.otpForm.valid) {
      const payload = {
        phone: this.data?.phone,
        userType: userType,
        otp: this.otpForm.value.otp,
        deviceId: "123456",
        deviceToken:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjY5NjQxNTU3LCJpYXQiOjE2Njk1NTUxNTcsImp0aSI6IjRiY2IzMTVmM2M2MzQwYjY5MzM4NDdmYjIwNDk0NTUyIiwidXNlcl9pZCI6IjIxMDA1YmYxLTUzMDEtNDkyMS1iMDM1LWYxMTlhNTJjNzVmMSJ9.louVELbAMWzpUoNxhbF3-bilBFWUUJg4lsTXAIBie6I",
        deviceType: "desktop",
        browser: "chrome",
        os: "windows",
      };
      this.apiService
        .post(API_ENDPOINTS.auth.verifyOtp, payload)
        .subscribe((res: any) => {
          this.localStorage.setItem("token", res?.result?.token);
          this.localStorage.setItem("isLogged", true);
          this.localStorage.setItem("userType", userType);
          this.localStorage.setItem(
            "userDetail",
            JSON.stringify(res?.result?.findUser)
          );
          this.eventService.broadcastEvent("login", true);
          debugger
          if (this.data?.type == "hospital") {
            this.router.navigate(["/register/hospitals/process"]);
          } else if (this.data?.type == "doctor") {
            this.router.navigate(["/doctor/medical-verification"]);
          } else {
            this.eventService.broadcastEvent("reset-header", true);
            if (this.localStorage.getItem("token")) {
              this.router.navigate(["/appointment-booking"]);
            }
            this.dialog.closeAll();
            if (this.isBrowser) {
              setTimeout(() => {
                window.scroll(0, 0);
              }, 500);
            }
          }
          this.matdialogRef.close();
        });
    }
  }

  resendOTP() {
    const userType = this.data?.type === 'hospital'
      ? APP_CONSTANTS.USER_TYPES.HOSPITAL
      : this.data?.type === 'doctor'
        ? APP_CONSTANTS.USER_TYPES.DOCTOR
        : APP_CONSTANTS.USER_TYPES.PATIENT;

    const payload = {
      phone: this.data?.phone,
      userType: userType,
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
    this.matdialogRef.close();
    this.dialog.open(LoginModalComponent, {
      // width: "40vw",
      disableClose: true,
      data: {
        name: this.data?.name,
        phone: this?.data?.phone,
        type: this.data?.type,
      },
    });
  }
}
