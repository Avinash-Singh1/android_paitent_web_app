import { Component, OnInit, Inject, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { BroadcastChannelService } from 'src/app/services/broadcast-channel.service';
import { CookieService } from 'ngx-cookie-service';
import { CryptoProvider } from 'src/app/services/crypto.service';
import { LocalStorageService } from 'src/app/services/storage.service';
import { Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';
import { ROUTE_CONSTANT } from 'src/app/config/route.constant';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from 'src/app/services/seo.service';


declare var $: any; // Declare jQuery

@Component({
  standalone: false,
  selector: 'nectar-new-login',
  templateUrl: './new-login.component.html',
  styleUrls: ['./new-login.component.scss']
})
export class NewLoginComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  loginForm!: FormGroup;
  verifyNumber: boolean = false;
  verifyEmail: boolean = false;
  userType: number = 2;
  profileId: any;

  constructor(
    private router: Router,
    private eventService: EventService,
    private apiSerive: ApiService,

    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private broadcastChannelService: BroadcastChannelService,
    private cookieService: CookieService,
    private cryptoService: CryptoProvider,
    private localStorage: LocalStorageService,
    private meta: Meta,
    private title: Title,
    private SeoService: SeoService,
    @Inject(DOCUMENT) public document: any
  ) { }

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
    this.initializeLoginForm();
    this.getCookiesData();
    this.settingTagsAndTitles();
  }

  Cookiesdata: any;

  getCookiesData() {
    let cokkiesdata = this.cryptoService.decrypt(
      this.cookieService.get("Logindata")
    );
    if (cokkiesdata && !this.verifyNumber) {
      this.Cookiesdata = JSON.parse(cokkiesdata);
      if (this.Cookiesdata.userType == this.userType)
        this.loginForm.setValue({
          phone: this.Cookiesdata?.phone,
          checkbox: true,
        });
    }
  }

  setCookies() {
    if (this.loginForm.value.checkbox) {
      let loginData: any = {
        phone: this.loginForm.value.phone,
        userType: this.userType,
      };
      this.cookieService.set(
        "Logindata",
        this.cryptoService.encrypt(JSON.stringify(loginData))
      );
    } else {
      this.cookieService.delete("Logindata");
    }
  }
  initializeLoginForm(): void {
    this.loginForm = this.fb.group({
      phoneOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  isPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  isPasswordVisibleconfirm1 = false;

  togglePasswordVisibilityconfirm1() {
    this.isPasswordVisibleconfirm1 = !this.isPasswordVisibleconfirm1;
  }
  isPasswordVisibleconfirm2 = false;

  togglePasswordVisibilityconfirm2() {
    this.isPasswordVisibleconfirm2 = !this.isPasswordVisibleconfirm2;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData = this.processLoginData();

    this.apiService.post(API_ENDPOINTS.new.login, loginData).subscribe({
      next: (res: any) => {

        // console.log('res', res)
        if (res.success == 'false') {
          this.toastr.error("Login failed. Please check your credentials.");

        }
        else {
          this.toastr.success("Login successful.");

          this.localStorage.setItem('token', res?.result?.token);
          this.localStorage.setItem('phone', loginData.phone);
          this.localStorage.setItem("isLogged", true);
          const { userType, user, token, approvalStatus } = res.result;
          this.localStorage.setItem("userType", userType);
          this.localStorage.setItem("approvalStatus", approvalStatus);
          // console.log('approvalll ', approvalStatus)
          this.localStorage.setItem("token", token);
          this.localStorage.setItem("userDetail", JSON.stringify(user));
          this.localStorage.setItem("findUserId", res?.result?.user?._id);
          this.localStorage.setItem("faqId", res?.result?.doctorId);
          this.handleDoctorUser(approvalStatus);

          this.broadcastChannelService.publisMessage({
            type: "login",
            payload: "User logged in",
          });

        }

      },
      error: (error: any) => {
        this.toastr.error("Login failed. Please check your credentials.");
      }
    });
  }

  handleDoctorUser(approvalStatus: number) {
    this.router.navigate(['/doctor/dashboard']);

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
      this.router.navigate(['register/doctors/process']);

      return;
    }
    this.setLocalStorage(result);
    this.router.navigate([this.routes[this.userType][profileScreen]]);
  }

  processLoginData(): any {
    const input = this.loginForm.value.phoneOrEmail;
    let loginData: any = {
      password: this.loginForm.value.password,
      userType: 2,
      countryCode: '+91',
      deviceId: "123456",
      deviceToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjY5NjQxNTU3LCJpYXQiOjE2Njk1NTUxNTcsImp0aSI6IjRiY2IzMTVmM2M2MzQwYjY5MzM4NDdmYjIwNDk0NTUyIiwidXNlcl9pZCI6IjIxMDA1YmYxLTUzMDEtNDkyMS1iMDM1LWYxMTlhNTJjNzVmMSJ9.louVELbAMWzpUoNxhbF3-bilBFWUUJg4lsTXAIBie6I",
      deviceType: "desktop",
      browser: "chrome",
      os: "windows",
    };

    if (/^\d+$/.test(input)) {
      // Input is considered a phone number
      loginData.phone = input;
      loginData.email = 'null@gmail.com';
    } else if (input.includes('@')) {
      // Input is considered an email
      loginData.email = input;
      loginData.phone = 'null';
    } else {
      this.toastr.error("Please enter a valid phone number or email.");
      return null;
    }

    return loginData;
  }

  updatedValue: string = ''; // To store the updated phone/email value
  otp: string = ''; // To store OTP input
  ForgetNewPassword: any
  ForgetConfrimPassword: any

  sendOTP() {
    if (this.updatedValue.length < 10) {
      this.toastr.error('Phone Number Should be 10 letters.');

    }
    else if (this.updatedValue.length > 10) {
      this.toastr.error('Phone Number Should be 10 letters.');

    }
    else {

      const payload = {
        phone: this.updatedValue,
        userType: 2,
        countryCode: '+91'
      };

      this.apiService.post(API_ENDPOINTS.new.forgetPhone, payload).subscribe(
        (res: any) => {
          if (res.success) {
            this.toastr.success('OTP Sent');
            this.profileId = res?.result.userId

            this.closeModal('edit_phone_email_modal');
            this.openModal('otp_verification_modal');
          }
        },
        (err) => {
        }
      );
    }

  }

  verifyOTP() {

    const payload = { phone: this.updatedValue, otp: this.otp, userType: 2, };

    this.apiService.post(API_ENDPOINTS.new.verifyForgetPhone, payload).subscribe(
      (res: any) => {
        if (res.success) {
          this.toastr.success(`Otp Verified successfully`);
          this.closeModal('otp_verification_modal');
          this.openModal('change_password_modal');

          // Update form with new value
        } else {
          this.toastr.error('OTP verification failed');
        }
      },
      (err) => {
        this.toastr.error('Failed to verify OTP');
      }
    );
  }

  changePassword() {

    if (this.ForgetConfrimPassword.length < 6 || this.ForgetNewPassword.length < 6) {
      this.toastr.error('Min 6 char required.');
    }

    else if (this.ForgetNewPassword != this.ForgetConfrimPassword) {
      this.toastr.error('Password dont match!.');

    }
    else {
      const payload = { password: this.ForgetConfrimPassword, userType: 2, userId: this.profileId };

      this.apiService.post(API_ENDPOINTS.new.changePasswordForgetPhone, payload).subscribe(
        (res: any) => {
          if (res.success) {
            this.toastr.success(`Password Changed successfully`);
            this.closeModal('change_password_modal');
            this.openModal('change_password_confirmation_modal');

            // Update form with new value
          } else {
            this.toastr.error('Faied To change password');
          }
        },
        (err) => {
          this.toastr.error('Failed to Change Password');
        }
      );
    }

  }

  changePhoneOrEmail() {
    this.closeModal('otp_verification_modal'); // Close the OTP modal
    this.openModal('edit_phone_email_modal'); // Reopen the edit modal
  }

  // toggle modal
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


  settingTagsAndTitles() {
    this.title.setTitle(
      "Doctor Login | NectarPlus.Health"
    );
    this.SeoService.updateTags([
      {
        name: "robots",
        content: "noindex, follow"
      },
      {
        name: "description",
        content: "Login to the Nectar Plus Health Portal for doctors to access and manage patient information securely.Join our network and enhance patient care."
      },
      {
        property: "og:url",
        content: this.document.location.href,
      },
    ]);
  }

}
