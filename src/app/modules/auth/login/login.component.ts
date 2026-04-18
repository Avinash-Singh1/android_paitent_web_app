import { Component, EventEmitter, Input, OnInit, Output, Inject, DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CookieService } from "ngx-cookie-service";
import { CryptoProvider } from "src/app/services/crypto.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { EventService } from "src/app/services/event.service";
import { BroadcastChannelService } from "src/app/services/broadcast-channel.service";
import { SeoService } from "src/app/services/seo.service";
import { Meta, Title } from '@angular/platform-browser';

import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: "nectar-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  loginForm!: FormGroup;
  emailVerifyForm!: FormGroup;
  forgotPhoneForm!: FormGroup;
  forgotOtpForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  @Input() userRole: any;
  @Output() emitData: any = new EventEmitter();
  userType: number = 1;
  showPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  loginMode: 'password' | 'otp' = 'password';
  forgotMode: boolean = false;
  forgotStep: 1 | 2 | 3 = 1;
  forgotUserId: string = '';
  forgotPhone: string = '';
  forgotSubmitted: boolean = false;
  resendTimer: number = 0;
  private resendInterval: any;
  constructor(
    private apiSerive: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private localStorage: LocalStorageService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private cryptoService: CryptoProvider,
    private eventService: EventService,
    private broadcastChannelService: BroadcastChannelService,
    private SeoService: SeoService,
    @Inject(DOCUMENT) public document: any


  ) { }
  login: boolean = true;
  routes: any = {
    1: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.patientLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.patientRegister}`,
    },
    2: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.doctorLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.doctorRegister}`,
    },
    3: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.hospitalLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.hospitalRegister}`,
    },
  };

  verifyNumber: boolean = false;
  verifyEmail: boolean = false;
  ngOnInit(): void {
    this.userType = this.activatedRoute.snapshot.data["userType"];
    this.verifyNumber = this.activatedRoute.snapshot.data["verified"];
    this.verifyEmail = this.activatedRoute.snapshot.data["verifiedEmail"];
    this.loginForm = this.fb.group({
      phone: ["", [Validators.required, Validators.minLength(10)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      checkbox: [false],
    });
    if (this.verifyEmail) {
      this.emailVerifyForm = this.fb.group({
        email: [
          "",
          [
            Validators.required,
            Validators.email,
            Validators.pattern(
              "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
            ),
          ],
        ],
      });
    }

    this.getCookiesData();

    // Forgot password forms
    this.forgotPhoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.minLength(10)]],
    });
    this.forgotOtpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]],
    });
    this.forgotPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    this.eventService.getEvent("phone").subscribe((res: any) => {
      if (res) {
        this.login = true;
        this.loginForm.patchValue({ phone: res });
      }
    });
    this.eventService.getEvent("email").subscribe((res: any) => {
      if (res) {
        this.login = true;
        this.emailVerifyForm.patchValue({ email: res });
      }
    });

    this.updateMetaAndTitleBasedOnURL();

    //chnage this titile and meta tags
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateMetaAndTitleBasedOnURL();
      });


  }
  get control() {
    if (this.verifyEmail) {
      return this.emailVerifyForm.controls;
    } else {
      return this.loginForm.controls;
    }
  }
  submitted = false;
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
  Cookiesdata: any;

  getCookiesData() {
    let cokkiesdata = this.cryptoService.decrypt(
      this.cookieService.get("Logindata")
    );
    if (cokkiesdata && !this.verifyNumber) {
      this.Cookiesdata = JSON.parse(cokkiesdata);
      if (this.Cookiesdata.userType == this.userType)
        this.loginForm.patchValue({
          phone: this.Cookiesdata?.phone,
          checkbox: true,
        });
    }
  }

  toggleLoginMode() {
    if (this.loginMode === 'password') {
      this.loginMode = 'otp';
      this.loginForm.get('password')?.clearValidators();
    } else {
      this.loginMode = 'password';
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.loginForm.get('password')?.updateValueAndValidity();
    this.submitted = false;
  }

  submit() {
    this.submitted = true;

    // ── Email verification mode ──
    if (this.verifyEmail && this.emailVerifyForm.valid) {
      const payload = {
        email: this.emailVerifyForm.value.email,
      };
      this.apiSerive
        .post(API_ENDPOINTS.COMMON.UpdatePhoneEmail, payload)
        .subscribe({
          next: (res: any) => {
            this.localStorage.setItem("email", this.emailVerifyForm.value.email);
            this.login = false;
            this.localStorage.setItem("token", res?.result?.token);
            this.broadcastChannelService.publisMessage({
              type: "login",
              payload: "User logged in ",
            });
          },
          error: (error: any) => {
          },
        });
      return;
    }

    // ── Phone number verification mode ──
    if (this.loginForm.valid && this.verifyNumber) {
      const payload = {
        phone: this.loginForm.value.phone,
        countryCode: "+91",
      };
      this.apiSerive
        .post(API_ENDPOINTS.COMMON.UpdatePhoneEmail, payload)
        .subscribe({
          next: (res: any) => {
            this.localStorage.setItem("phone", this.loginForm.value.phone);
            this.login = false;
            this.localStorage.setItem("token", res?.result?.token);
          },
          error: (error: any) => {
          },
        });
      return;
    }

    // ── Password-based login ──
    if (this.loginMode === 'password' && this.loginForm.valid) {
      const payload = {
        phone: this.loginForm.value.phone,
        password: this.loginForm.value.password,
        userType: this.userType,
        countryCode: "+91",
      };
      this.setCookies();
      this.apiSerive.post(API_ENDPOINTS.auth.login, payload).subscribe({
        next: (res: any) => {
          const { token, user } = res?.result || {};
          // Store session data (matching OTP verify flow)
          this.localStorage.setItem("token", token);
          this.localStorage.setItem("phone", this.loginForm.value.phone);
          this.localStorage.setItem("isLogged", true);
          this.localStorage.setItem("userType", user?.userType ?? this.userType);
          this.localStorage.setItem("approvalStatus", res?.result?.approvalStatus || '');
          this.localStorage.setItem("userDetail", JSON.stringify(user || {}));
          // Broadcast login event so header/UI updates
          this.eventService.broadcastEvent("login", true);
          this.broadcastChannelService.publisMessage({
            type: "login",
            payload: "User logged in",
          });
          // Redirect based on user type
          if (user?.userType == 2) {
            this.router.navigate([ROUTE_CONSTANT.DOCTOR.dashboard]);
          } else if (user?.userType == 3) {
            this.router.navigate([ROUTE_CONSTANT.HOSPITAL.dashboard]);
          } else {
            this.router.navigate(["/"]);
          }
        },
        error: (error: any) => {
        },
      });
      return;
    }

    // ── OTP-based login (existing flow) ──
    if (this.loginMode === 'otp' && this.loginForm.valid) {
      const payload = {
        phone: this.loginForm.value.phone,
        userType: this.userType,
        countryCode: "+91",
      };
      this.setCookies();
      this.apiSerive.post(API_ENDPOINTS.auth.login, payload).subscribe({
        next: (res: any) => {
          this.localStorage.setItem("token", res?.result?.token);
          this.login = false;
          this.localStorage.setItem("phone", this.loginForm.value.phone);
        },
        error: (error: any) => {
        },
      });
    }
  }


  //meta tags update 

  // ── Forgot Password Flow ──
  showForgotPassword() {
    this.forgotMode = true;
    this.forgotStep = 1;
    this.forgotSubmitted = false;
    this.forgotPhoneForm.reset();
    this.forgotOtpForm.reset();
    this.forgotPasswordForm.reset();
    // Pre-fill phone if user already typed one
    if (this.loginForm.value.phone) {
      this.forgotPhoneForm.patchValue({ phone: this.loginForm.value.phone });
    }
  }

  backToLogin() {
    this.forgotMode = false;
    this.forgotStep = 1;
    this.forgotSubmitted = false;
    this.clearResendTimer();
  }

  sendForgotOtp() {
    this.forgotSubmitted = true;
    if (this.forgotPhoneForm.invalid) return;

    const phone = this.forgotPhoneForm.value.phone;
    this.forgotPhone = phone;
    const payload = {
      phone,
      userType: this.userType,
      countryCode: '+91',
    };
    this.apiSerive.post(API_ENDPOINTS.new.forgetPhone, payload).subscribe({
      next: (res: any) => {
        this.forgotUserId = res?.result?.userId || res?.result?.data?.userId;
        this.toastr.success('OTP sent to your mobile number');
        this.forgotStep = 2;
        this.forgotSubmitted = false;
        this.startResendTimer();
      },
      error: (error: any) => {
      },
    });
  }

  verifyForgotOtp() {
    this.forgotSubmitted = true;
    if (this.forgotOtpForm.invalid) return;

    const payload = {
      phone: this.forgotPhone,
      userType: this.userType,
      otp: this.forgotOtpForm.value.otp,
    };
    this.apiSerive.post(API_ENDPOINTS.new.verifyForgetPhone, payload).subscribe({
      next: (res: any) => {
        this.toastr.success('OTP verified successfully');
        this.forgotStep = 3;
        this.forgotSubmitted = false;
        this.clearResendTimer();
      },
      error: (error: any) => {
      },
    });
  }

  resetPassword() {
    this.forgotSubmitted = true;
    if (this.forgotPasswordForm.invalid) return;
    if (this.forgotPasswordForm.value.newPassword !== this.forgotPasswordForm.value.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    const payload = {
      password: this.forgotPasswordForm.value.newPassword,
      userId: this.forgotUserId,
    };
    this.apiSerive.post(API_ENDPOINTS.new.changePasswordForgetPhone, payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Password reset successfully! Please login.');
        this.backToLogin();
      },
      error: (error: any) => {
      },
    });
  }

  resendForgotOtp() {
    if (this.resendTimer > 0) return;
    this.sendForgotOtp();
  }

  private startResendTimer() {
    if (!this.isBrowser) return;
    this.resendTimer = 30;
    this.clearResendTimer();
    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.clearResendTimer();
      }
    }, 1000);
  }

  private clearResendTimer() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  get passwordStrength(): 'weak' | 'good' | 'strong' {
    const val = this.forgotPasswordForm?.value?.newPassword || '';
    if (val.length < 6) return 'weak';
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasDigit = /\d/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (score >= 3 && val.length >= 8) return 'strong';
    if (score >= 2) return 'good';
    return 'weak';
  }

  updateMetaAndTitleBasedOnURL(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/auth/patient/login')) {
      this.title.setTitle('Patient Login | NectarPlus.Health');
      this.SeoService.updateTags([
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: this.document.location.href }
      ]);
    } else if (currentUrl.includes('/auth/hospitals/login')) {
      this.title.setTitle('Hospital Login | NectarPlus.Health');
      this.SeoService.updateTags([
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: this.document.location.href }
      ]);

    }

  }



}
