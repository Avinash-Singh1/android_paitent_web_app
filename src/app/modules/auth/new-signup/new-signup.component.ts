import { Component, OnInit, Inject, Input, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { BroadcastChannelService } from "src/app/services/broadcast-channel.service";
import { CookieService } from "ngx-cookie-service";
import { CryptoProvider } from "src/app/services/crypto.service";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { Meta, Title } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";

import { MatDialog } from "@angular/material/dialog";
import { TermsConditionComponent } from "../terms-condition/terms-condition.component";
// import { states } from "src/app/utils/Statecity";
import { states } from "src/app/utils/Statecity";
declare var $: any; // Declare jQuery

@Component({
  standalone: false,
  selector: "nectar-new-signup",
  templateUrl: "./new-signup.component.html",
  styleUrls: ["./new-signup.component.scss"],
})
export class NewSignupComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  signupForm!: FormGroup;
  otpForm!: FormGroup; // OTP form
  showOtpModal = false; // Control for showing OTP modal
  userType: number = 2;
  // cities: string[] = [];
  filteredCities: string[] = [];
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public toastr: ToastrService,
    private localStorage: LocalStorageService,
    private router: Router,
    private eventService: EventService,
    private apiSerive: ApiService,

    private broadcastChannelService: BroadcastChannelService,
    private cookieService: CookieService,
    private cryptoService: CryptoProvider,
    private meta: Meta,
    private title: Title,
    private SeoService: SeoService,
    private dialog: MatDialog,

    @Inject(DOCUMENT) public document: any
  ) {
    this.generateExperienceYears();
  }

  isPasswordVisibleconfirm1 = false;

  togglePasswordVisibilityconfirm1() {
    this.isPasswordVisibleconfirm1 = !this.isPasswordVisibleconfirm1;
  }
  isPasswordVisibleconfirm2 = false;

  togglePasswordVisibilityconfirm2() {
    this.isPasswordVisibleconfirm2 = !this.isPasswordVisibleconfirm2;
  }

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

  ngOnInit(): void {
    this.initializeSignupForm();
    this.initializeOtpForm();
    this.specialization();
    // this.getCities();
    this.settingTagsAndTitles();
  }
  onCitySearch(event: any): void {
    const inputValue = event.target.value.toLowerCase();
    this.filteredCities = this.cities.filter((city) =>
      city.toLowerCase().includes(inputValue)
    );
  }
  experinenceYear = [];

  generateExperienceYears() {
    for (let i = 1; i <= 50; i++) {
      this.experinenceYear.push({
        label: `${i} Years of Experience`,
        value: i.toString(),
      });
    }
  }
  // Initialize the signup form
  initializeSignupForm() {
    this.signupForm = this.fb.group({
      title: ["", Validators.required],
      specialization: ["", Validators.required],
      name: ["", [Validators.required, Validators.minLength(3)]],
      gender: ["", Validators.required],
      yearsOfExperience: ["", Validators.required],
      education: this.fb.group({
        degree: ["", Validators.required],
        college: ["", Validators.required],
        year: [
          '',
          [Validators.required, this.futureYearValidator]
        ],
      }),
      state: [null, Validators.required],
      city: [{ value: null, disabled: true }, Validators.required],
      phoneNumber: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern("^[0-9]*$"), // Only allow digits
        ],
      ],
      emailAddress: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: [
        "",
        [Validators.required, this.passwordMatchValidator.bind(this)],
      ],
      consent: [false, Validators.requiredTrue],
    });

    // this.signupForm.reset();
  }

  // futureYearValidator(control: any) {
  //   const currentYear = new Date().getFullYear();
  //   if (control.value && control.value > currentYear) {
  //     return { futureYear: true }; // Invalid if year is in the future
  //   }
  //   return null; // Valid year
  // }

  futureYearValidator(control: AbstractControl): ValidationErrors | null {
    const currentYear = new Date().getFullYear();
    const year = control.value;

    if (!/^\d+$/.test(year)) {
      return { invalidYear: 'Only numeric values are allowed' };
    }

    const numericYear = Number(year);
    if (numericYear < 1900 || numericYear > currentYear) {
      return { invalidYear: `Year must be between 1900 and ${currentYear}` };
    }

    return null;
  }



  // Initialize OTP form
  initializeOtpForm() {
    this.otpForm = this.fb.group({
      otpCode: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(
    control: FormControl
  ): { [key: string]: boolean } | null {
    const password = this.signupForm?.get("password")?.value;
    if (password !== control.value) {
      return { mismatch: true };
    }
    return null;
  }

  //chaneg to proper case
  private toProperCase(input: string): string {
    return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // onSubmit(): void {
  //   if (this.signupForm.invalid) {
  //     this.signupForm.markAllAsTouched();
  //     return;
  //   }
  //   const title = this.toProperCase(this.signupForm.get("title")?.value || "");
  //   const name = this.toProperCase(this.signupForm.get("name")?.value || "");
  //   const combinedName = `${title} ${name}`.trim();
  //   const payload: any = {
  //     fullName: combinedName,
  //     phone: this.signupForm.value.phoneNumber,
  //     userType: 2,
  //     countryCode: "+91",
  //     experience: this.signupForm.value.yearsOfExperience,
  //     gender: this.signupForm.value.gender,
  //     city: this.signupForm.value.city.name,
  //     email: this.signupForm.value.emailAddress,
  //     password: this.signupForm.value.password,
  //     specialization: this.signupForm.value.specialization,
  //     education: [
  //       {
  //         degree: this.signupForm.value.education.degree,
  //         college: this.signupForm.value.education.college,
  //         year: this.signupForm.value.education.year,
  //       },
  //     ],
  //   };
  //   console.log("payload", payload);
  //   this.apiService.post(API_ENDPOINTS.new.newRegister, payload).subscribe({
  //     next: (res: any) => {
  //       payload.permission = this.signupForm.value.permission;
  //       payload.phone = this.signupForm.value.phone;
  //       this.localStorage.setItem("signupForm", JSON.stringify(payload));
  //       this.localStorage.setItem("phone", this.signupForm.value.phone);
  //       this.toastr.success("OTP sent to your phone!");
  //       this.openModal("otpModal"); // Open OTP modal
  //     },
  //     error: (error: any) => {
  //       this.toastr.error("Registration failed");
  //     },
  //   });
  // }
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    if (!this.signupForm.value.city) {
      this.toastr.error("Please select a city before submitting.");
      return;
    }

    const payload: any = {
      fullName: `${this.toProperCase(this.signupForm.get("title")?.value || "")} ${this.toProperCase(this.signupForm.get("name")?.value || "")}`.trim(),
      phone: this.signupForm.value.phoneNumber,
      userType: 2,
      countryCode: "+91",
      experience: this.signupForm.value.yearsOfExperience,
      gender: this.signupForm.value.gender,
      city: this.signupForm.value.city.name, // Ensure city is selected
      state: this.signupForm.value.state.name, // Ensure city is selected
      email: this.signupForm.value.emailAddress,
      password: this.signupForm.value.password,
      specialization: this.signupForm.value.specialization,
      education: [
        {
          degree: this.signupForm.value.education.degree,
          college: this.signupForm.value.education.college,
          year: this.signupForm.value.education.year,
        },
      ],
    };

    this.apiService.post(API_ENDPOINTS.new.newRegister, payload).subscribe({
      next: (res: any) => {
        payload.permission = this.signupForm.value.permission;
        payload.phone = this.signupForm.value.phone;
        this.localStorage.setItem("signupForm", JSON.stringify(payload));
        this.localStorage.setItem("phone", this.signupForm.value.phone);
        this.toastr.success("OTP sent to your phone!");
        this.openModal("otpModal"); // Open OTP modal
      },
      error: (error: any) => {
        this.toastr.error("Registration failed");
      },
    });
  }


  specializationList: any;

  specialization() {
    this.apiService
      .get(API_ENDPOINTS.MASTER.specialization, "")
      .subscribe((res: any) => {
        this.specializationList = res?.result?.data;
      });
  }

  // getCities() {
  //   this.apiService
  //     .getCitiesByCountry('india')
  //     .subscribe((res: any) => {
  //       this.cities = res.data;
  //     });
  // }

  onVerifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    let payload: any = {
      otp: this.otpForm.get("otpCode")?.value,
      deviceId: "123456",
      deviceToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjY5NjQxNTU3LCJpYXQiOjE2Njk1NTUxNTcsImp0aSI6IjRiY2IzMTVmM2M2MzQwYjY5MzM4NDdmYjIwNDk0NTUyIiwidXNlcl9pZCI6IjIxMDA1YmYxLTUzMDEtNDkyMS1iMDM1LWYxMTlhNTJjNzVmMSJ9.louVELbAMWzpUoNxhbF3-bilBFWUUJg4lsTXAIBie6I",
      deviceType: "desktop",
      browser: "chrome",
      os: "windows",
    };
    payload.phone = this.signupForm.get("phoneNumber")?.value;
    payload.userType = 2;
    payload.countryCode = "+91";

    this.apiService.post(API_ENDPOINTS.new.verifyOtp, payload).subscribe({
      next: (res: any) => {

        this.toastr.success("Registration successful.");
        this.closeModal("otpModal"); // Close OTP modal
        this.signupForm.reset(); // Optional: Reset form
        // Redirect user or take further action

        this.localStorage.setItem("token", res?.result?.token);
        this.localStorage.setItem("isLogged", true);
        const { userType, findUser, token, approvalStatus } = res.result;
        this.localStorage.setItem("userType", userType);
        this.localStorage.setItem("approvalStatus", approvalStatus);
        this.localStorage.setItem("token", token);
        this.localStorage.setItem("userDetail", JSON.stringify(findUser));
        this.localStorage.setItem("findUserId", res?.result?.findUser?._id);
        this.localStorage.setItem("faqId", res?.result?.doctorId);
        this.handleDoctorUser(approvalStatus);

        this.broadcastChannelService.publisMessage({
          type: "login",
          payload: "User logged in",
        });

        this.router.navigate(["/doctor/medical-verification"]);
      },
      error: (error: any) => {

        this.toastr.error("OTP verification failed");
      },
    });
  }

  handleDoctorUser(approvalStatus: number) {
    this.router.navigate(["/doctor/medical-verification"]);
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

  handleDoctorProfile(
    approvalStatus: number,
    steps: number,
    profileScreen: string,
    result: any
  ) {
    this.eventService.broadcastEvent("showheader", "register");
    this.eventService.broadcastEvent("footer", "register");
    if (steps == 4) {
      this.router.navigate(["register/doctors/process"]);
      return;
    }
    this.setLocalStorage(result);
    this.router.navigate([this.routes[this.userType][profileScreen]]);
  }

  openModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }
  }

  closeModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");
    }
  }
  openDialog(value: boolean) {
    this.dialog.open(TermsConditionComponent, {
      width: "1000px",
      data: { isAccepted: value }, // Pass data if needed
    });
  }

  settingTagsAndTitles() {
    this.title.setTitle("Register as a Doctor | NectarPlus.Health");
    this.SeoService.updateTags([
      {
        name: "robots",
        content: "noindex, follow",
      },
      {
        name: "description",
        content:
          "Register as a doctor on Nectar Plus Health to connect with patients, manage appointments, and grow your practice. Sign up now to join our healthcare platform.",
      },
      {
        property: "og:url",
        content: this.document.location.href,
      },
    ]);
  }
  //resend otp
  isEmailVerify: any;
  @Input() updateExistUser: boolean = false;
  data: any = {};

  resendOtp() {
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

  //Get cities work
  states = states;
  selectedState: any = null;
  selectedCity: any = null;
  cities: any[] = [];
  // onStateChange(state: any) {
  //   if (state) {
  //     this.cities = state.cities || [];
  //   } else {
  //     this.cities = [];
  //   }
  //   this.selectedCity = null; // Reset city when state changes
  // }
  isCityDisabled: boolean = true;

  onStateChange(state: any) {
    if (state) {
      this.cities = state.cities || [];
      this.signupForm.controls['city'].enable(); // Enable city dropdown
      this.isCityDisabled = false;
      this.selectedCity = this.cities.length > 0 ?"Select the City" : 'Default City'; // Set default city
      this.signupForm.controls['city'].setValue(this.selectedCity);
    } else {
      this.cities = [];
      this.signupForm.controls['city'].disable(); // Disable city dropdown
      this.isCityDisabled = true;
      this.selectedCity = null;
      this.signupForm.controls['city'].setValue(''); // Reset city selection
    }
  }
}