import { Location, isPlatformBrowser } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { Subscription } from "rxjs";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { SeoService } from "src/app/services/seo.service";
export let browserRefresh = false;
@Component({
  standalone: false,
  selector: "nectar-verify-otp",
  templateUrl: "./verify-otp.component.html",
  styleUrls: ["./verify-otp.component.scss"],
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  constructor(
    private router: Router,
    private apiSerive: ApiService,
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private activatedRoute: ActivatedRoute,
    public location: Location,
    private toaster: ToastrService,
    private eventService: EventService,
    private seoService: SeoService,
    private renderer: Renderer2) { }
  otpForm!: FormGroup;
  // mode: any = "login";
  userRole: any;
  mobileNumber: number;
  submitted = false;
  active = 0;
  showOtp = false;
  data: any = {};
  userType: number = 1;
  @Input() updateExistUser: boolean = false;
  @Input() patientSignup: boolean = false;

  paramsData: any; // in case of email templates
  routes = {
    1: {
      home: "/",
    },
    2: {
      home: "/doctor",
      1: ROUTE_CONSTANT.DOCTOR.registerSectionA1,
      2: ROUTE_CONSTANT.DOCTOR.registerSectionA2,
      3: ROUTE_CONSTANT.DOCTOR.registerSectionA3,
      4: ROUTE_CONSTANT.DOCTOR.registerSectionA4,
      5: ROUTE_CONSTANT.DOCTOR.registerSectionA5,
      6: ROUTE_CONSTANT.DOCTOR.registerSectionB1,
      7: ROUTE_CONSTANT.DOCTOR.registerSectionB2,
      8: ROUTE_CONSTANT.DOCTOR.registerSectionB3,
      9: ROUTE_CONSTANT.DOCTOR.registerSectionc1,
      10: ROUTE_CONSTANT.DOCTOR.registerSectionc2,
      11: ROUTE_CONSTANT.DOCTOR.registerSectionc3,
      12: ROUTE_CONSTANT.DOCTOR.registerProcess,
      process: ROUTE_CONSTANT.DOCTOR.registerProcess,
    },
    3: {
      home: "/hospital",
      1: ROUTE_CONSTANT.HOSPITAL.registerSectionA1,
      2: ROUTE_CONSTANT.HOSPITAL.registerSectionB1,
      3: ROUTE_CONSTANT.HOSPITAL.registerSectionC1,
      4: ROUTE_CONSTANT.HOSPITAL.registerSectionC2,
      5: ROUTE_CONSTANT.HOSPITAL.registerProcess,
      process: ROUTE_CONSTANT.HOSPITAL.registerProcess,
    },
  };
  isEmailVerify: any;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      otp: ["", [Validators.required, Validators.minLength(6)]],
    });
    this.timer(59);

    this.data.phone = this.localStorage.getItem("phone");
    this.userType = this.activatedRoute.snapshot.data["userType"];
    this.isEmailVerify = this.localStorage.getItem("email");

    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params.isEmail && params.user) {
        this.paramsData = params;
      }
    });
  }

  get control() {
    return this.otpForm.controls;
  }

  routeTo(val: any) {
    if (val == 0) {
      this.router.navigate([`${this.userRole}/login`]);
    } else if (val == 1) {
      this.router.navigate([`${this.userRole}/register`]);
    }
  }

  emitData(event: any) {
    this.showOtp = true;
    this.data = event;
  }
  emitDataSignup(event: any) {
    this.showOtp = true;
    this.data = event;
  }

  onEdit() {
    if (this.isEmailVerify) {
      this.eventService.broadcastEvent("email", this.isEmailVerify);
    } else {
      this.eventService.broadcastEvent("phone", this.data?.phone);
    }
  }
  login() {
    this.submitted = true;
    if (!this.otpForm.valid) {
      return;
    }
    let payload: any = {
      otp: this.otpForm.value.otp,
      deviceId: "123456",
      deviceToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjY5NjQxNTU3LCJpYXQiOjE2Njk1NTUxNTcsImp0aSI6IjRiY2IzMTVmM2M2MzQwYjY5MzM4NDdmYjIwNDk0NTUyIiwidXNlcl9pZCI6IjIxMDA1YmYxLTUzMDEtNDkyMS1iMDM1LWYxMTlhNTJjNzVmMSJ9.louVELbAMWzpUoNxhbF3-bilBFWUUJg4lsTXAIBie6I",
      deviceType: "desktop",
      browser: "chrome",
      os: "windows",
    };
    if (this.isEmailVerify) {
      payload.email = this.isEmailVerify;
      this.patientUpdateEmail(payload);
      return;
    } else if (this.updateExistUser) {
      payload.phone = this.data.phone;
      this.patientUpdateMobile(payload);
      return;
    }

    payload.phone = this.data.phone;
    payload.userType = this.userType;
    this.apiSerive.post(API_ENDPOINTS.auth.verifyOtp, payload).subscribe({
      next: (res: any) => {
        this.localStorage.removeItem("phone");
        this.localStorage.removeItem("signupForm");
        this.localStorage.setItem("isLogged", true);
        const { userType, findUser, token, approvalStatus } = res.result;
        this.localStorage.setItem("userType", userType);
        this.localStorage.setItem("approvalStatus", approvalStatus);
        this.localStorage.setItem("token", token);
        this.localStorage.setItem("userDetail", JSON.stringify(findUser));
        if (this.patientSignup && this.isBrowser) {
          this.seoService.appendScript(
            `function gtag_report_conversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-11399196295/8oDZCIu-9PMYEIfdx7sq',
      'event_callback': callback
  });
  return false;
}
            `,
            this.renderer
          );
        }
        // subscribing current route in case of templates
        if (this.paramsData?.isEmail && this.paramsData?.user) {
          this.eventService.broadcastEvent("login", true);
          this.router.navigate([`/${this.paramsData.route}`], {
            queryParams: { id: this.paramsData.id },
          });
          return;
        }

        // redirecting to  book appointment
        if (this.localStorage.getItem("appointmentBooking")) {
          this.eventService.broadcastEvent("login", true);
          this.router.navigate(["/appointment-booking"]);
          return;
        }

        if (userType == 2) {
          this.localStorage.setItem("findUserId", res?.result?.findUser?._id);
          this.localStorage.setItem("faqId", res?.result?.doctorId);
          this.handleDoctorUser(approvalStatus);
          return;
        }

        if (userType == 3) {
          this.localStorage.setItem("profilePic", res?.result?.profilePic);
          this.handleHospitalUser(payload, res.result);
          return;
        }

        this.router.navigate(["/"]);
        this.eventService.broadcastEvent("login", true);
      },
      error: (error: any) => {
      },
    });
  }

  // patient can uodate their email
  patientUpdateEmail(payload: any) {
    this.apiSerive
      .post(API_ENDPOINTS.COMMON.VerifyPhoneEmail, payload)
      .subscribe({
        next: (res) => {
          this.router.navigate(["/profile/personal-info"]);
          this.eventService.broadcastEvent("profile-update", true);
          this.localStorage.removeItem("phone");
          this.localStorage.removeItem("email");
          this.localStorage.removeItem("signupForm");

          this.localStorage.setItem("token", res?.result?.token);
          this.localStorage.setItem(
            "userDetail",
            JSON.stringify(res?.result?.findUser)
          );
          this.localStorage.setItem("findUserId", res?.result?.findUser?._id);
        },
        error: (err: any) => {
        },
      });
  }

  // patient can update their existing phone number
  patientUpdateMobile(payload: any) {
    this.apiSerive
      .post(API_ENDPOINTS.COMMON.VerifyPhoneEmail, payload)
      .subscribe({
        next: (res) => {
          this.router.navigate(["/profile/personal-info"]);
          this.eventService.broadcastEvent("profile-update", true);
          this.localStorage.removeItem("phone");
          this.localStorage.removeItem("signupForm");
          this.localStorage.setItem("token", res?.result?.token);
          this.localStorage.setItem(
            "userDetail",
            JSON.stringify(res?.result?.findUser)
          );
          this.localStorage.setItem("faqId", res?.result?.doctorId);
          this.localStorage.setItem("findUserId", res?.result?.findUser?._id);
        },
        error: (err: any) => {
        },
      });
  }

  handleDoctorUser(approvalStatus: number) {
    switch (approvalStatus) {
      case 2:
        this.router.navigate([this.routes[this.userType].home]);
        break;
      case 1:
        this.apiSerive
          .get(API_ENDPOINTS.doctor.getProfile, { type: 1 })
          .subscribe({
            next: (res: any) => {
              const { steps, profileScreen } = res.result;
              this.handleDoctorProfile(
                approvalStatus,
                steps,
                profileScreen,
                res.result
              );
            },
          });
        break;
    }
  }

  handleDoctorProfile(
    approvalStatus: number,
    steps: number,
    profileScreen: string,
    result: any
  ) {
    this.eventService.broadcastEvent("showheader", "register");
    this.eventService.broadcastEvent("footer", "register");
    if (steps == 4) {
      this.router.navigate([this.routes[this.userType].process]);
      return;
    }
    this.setLocalStorage(result);
    this.router.navigate([this.routes[this.userType][profileScreen]]);
  }

  handleHospitalUser(payload: any, result: any) {
    this.localStorage.setItem("establishmentName", result?.establishmentName);
    this.localStorage.setItem("hospitalTiming", result?.hospitalTiming);

    const params = {
      hospitalId: result?.findUser._id,
      type: 2,
    };

    this.apiSerive.get(API_ENDPOINTS.hospital.getProfile, params).subscribe({
      next: (res: any) => {
        const { approvalStatus, steps, profileScreen } = res.result;
        this.handleHospitalProfile(
          approvalStatus,
          steps,
          profileScreen,
          res.result
        );
      },
      error: (error: any) => {
      },
    });
  }

  handleHospitalProfile(
    approvalStatus: number,
    steps: number,
    profileScreen: string,
    result: any
  ) {
    switch (approvalStatus) {
      case 2:
        this.router.navigate([this.routes[this.userType].home]);
        break;
      case 1:
        this.setHospitalData(result);
        this.eventService.broadcastEvent("showheader", "register");
        this.eventService.broadcastEvent("footer", "register");
        if (steps == 4) {
          this.router.navigate([this.routes[this.userType].process]);
          return;
        }
        this.router.navigate([this.routes[this.userType][profileScreen]]);
        break;
    }
  }

  resendOTP() {
    this.otpForm.get("otp").setValue("");
    const payload: any = {
      userType: this.userType,
      countryCode: "+91",
    };

    if (this.isEmailVerify) {
      payload.email = this.isEmailVerify;
    } else {
      payload.phone = this.data.phone;
    }
    if (this.isEmailVerify || this.updateExistUser) {
      payload.isLogin = false;
    }
    this.apiSerive
      .post(API_ENDPOINTS.auth.resendOtp, payload)
      .subscribe((res: any) => {
        this.timer(59);
        this.toaster.success(res?.message);
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
  doctorRouting() {
    this.apiSerive.get(API_ENDPOINTS.doctor.getProfile, { type: 1 }).subscribe({
      next: (res: any) => {
        this.setLocalStorage(res.result);
      },
    });
  }
  setLocalStorage(result) {
    let { steps, sectionA, sectionB, sectionC } = result;
    sectionA = {
      ...sectionA,
      basicDetails: {
        ...sectionA.basicDetails,
        specialization: sectionA.basicDetails?.specialization?.[0],
      },
      education: sectionA.education.education.length
        ? {
          ...sectionA.education.education[0],
          experience: sectionA.education.experience,
        }
        : null,
      medicalRegistration: sectionA.medicalRegistration.length
        ? { ...sectionA.medicalRegistration[0] }
        : null,
    };
    delete sectionA.education?._id;
    delete sectionA.medicalRegistration?._id;
    delete sectionA.establishmentDetails?.establishmentType;
    delete sectionA.establishmentDetails?.establishmentTypeId;
    this.localStorage.setItem("sectionA", sectionA);
    this.localStorage.setItem("steps", steps);
    this.localStorage.setItem("sectionB", sectionB);
    sectionC = {
      ...sectionC,
      address: { ...sectionC.address },
      consultationFees: sectionC.establishmentTiming?.consultationFees
        ? sectionC.establishmentTiming?.consultationFees
        : null,
    };

    this.localStorage.setItem("sectionC", sectionC);
  }
  setHospitalData(result) {
    let { sectionA, sectionB, sectionC, steps } = result;
    this.localStorage.setItem("steps", steps);
    this.localStorage.setItem("sectionAHospital", sectionA);
    this.localStorage.setItem("sectionBHospital", sectionB);
    sectionC = {
      ...sectionC,
      address: { ...sectionC.address, state: sectionC.address?.stateId },
    };
    delete sectionC.address.stateId;
    this.localStorage.setItem("sectionCHospital", sectionC);
  }

  otpOnCall() {
    let payload: any = {
      phone: this.data.phone,
      userType: this.userType,
      countryCode: "+91",
      isLogin: !this.updateExistUser,
    };
    this.apiSerive
      .post(API_ENDPOINTS.auth.otpViaCall, payload)
      .subscribe((res: any) => {
        this.toaster.success(res?.message);
      });
  }

  ngOnDestroy(): void {
    this.localStorage.removeItem("email");
  }
}
