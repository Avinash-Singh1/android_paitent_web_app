import { Component, OnInit, Inject, DOCUMENT } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { ApiService } from "src/app/services/api.service";
import { TermsConditionComponent } from "../terms-condition/terms-condition.component";
import { NgDialogAnimationService } from "ng-dialog-animation";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { LocalStorageService } from "src/app/services/storage.service";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { InputValidationService } from "src/app/services/input-validation.service";
import { EventService } from "src/app/services/event.service";
import { CommonService } from "src/app/services/common.service";
import { SeoService } from "src/app/services/seo.service";
import { Meta, Title } from '@angular/platform-browser';

import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: "nectar-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;
  deviceWidth: any;
  constructor(
    private apiSerive: ApiService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private ngdialog: NgDialogAnimationService,
    private localStorage: LocalStorageService,
    public cValidator: InputValidationService,
    private eventService: EventService,
    private commonService: CommonService,
    private apiService: ApiService,
    private SeoService: SeoService,
    private title: Title,
    private router: Router,

    @Inject(DOCUMENT) public document: any

  ) { }
  signup: boolean = true;
  routes: any = {
    1: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.patientLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.patientRegister}`,
      verifyOtp: `/auth/${ROUTE_CONSTANT.AUTH.patientverifyOtp}`,
    },
    2: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.doctorLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.doctorRegister}`,
      verifyOtp: `/auth/${ROUTE_CONSTANT.AUTH.doctorverifyOtp}`,
    },
    3: {
      login: `/auth/${ROUTE_CONSTANT.AUTH.hospitalLogin}`,
      register: `/auth/${ROUTE_CONSTANT.AUTH.hospitalRegister}`,
      verifyOtp: `/auth/${ROUTE_CONSTANT.AUTH.doctorverifyOtp}`,
    },
  };
  userType: number = 1;
  terms: boolean = false;
  showPassword: boolean = false;


  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.userType = this.activatedRoute.snapshot.data["userType"];
    this.signupForm = this.fb.group({
      phone: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      fullName: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      permission: [false],
    });
    this.getLocalData();
    this.eventService.getEvent("phone").subscribe((res: any) => {
      if (res) {
        this.signup = true;
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

  getLocalData() {
    let data = this.localStorage.getItem("signupForm");
    if (data) {
      data = JSON.parse(data);
      if (data.userType == this.userType) {
        this.signupForm.patchValue({
          phone: data?.phone,
          fullName: data?.fullName?.replace(/dr./i, ""),
          permission: data?.permission || false,
        });
      }
    }
  }

  get control() {
    return this.signupForm.controls;
  }
  submitted = false;
  submit() {
    this.submitted = true;

    if (this.userType == 2 && !this.signupForm.value.permission) {
      return;
    }
    if (this.signupForm.valid) {
      const payload: any = {
        fullName:
          this.userType == 2
            ? `Dr. ${this.signupForm.value.fullName}`
            : this.signupForm.value.fullName,
        phone: this.signupForm.value.phone,
        password: this.signupForm.value.password,
        userType: this.userType,
        countryCode: "+91",
      };
      this.apiSerive.post(API_ENDPOINTS.auth.register, payload).subscribe({
        next: (res) => {
          payload.permission = this.signupForm.value.permission;
          payload.phone = this.signupForm.value.phone;
          this.localStorage.setItem("signupForm", JSON.stringify(payload));
          this.localStorage.setItem("phone", this.signupForm.value.phone);

          this.signup = false;
        },
        error: (err) => {
        },
      });
    }
  }

  openDialog(value: boolean) {
    if (this.signupForm.value.permission || value) {
      const dialogRef = this.ngdialog.open(TermsConditionComponent, {
        width: "80vw",
        animation: {
          to: "top",
          incomingOptions: {
            keyframeAnimationOptions: { duration: 150 },
          },
          outgoingOptions: {
            keyframeAnimationOptions: { duration: 150 },
          },
        },
      });
      dialogRef.afterClosed().subscribe((res: number) => {
        if (res == 0 || res == 1)
          this.signupForm.get("permission").setValue(res);
        this.terms = Boolean(res);
      });
    }
  }

// meta tags update 
  updateMetaAndTitleBasedOnURL(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/auth/patient/register')) {
      this.title.setTitle('Patient Registration | NectarPlus.Health');
      this.SeoService.updateTags([
        { name: 'robots', content: 'index, follow' },
        { name: 'description', content: 'Register for the Nectar Plus Health Portal to manage your health, book appointments, and access securehealthcare services tailored for you' },
        { property: 'og:url', content: this.document.location.href }
      ]);
    } else if (currentUrl.includes('/auth/hospitals/register')) {
      this.title.setTitle('Hospital Registration | NectarPlus.Health');
      this.SeoService.updateTags([
        { name: 'robots', content: 'index, follow' },
        { name: 'description', content: 'Register your hospital on the NectarPlus Health Portal to securely manage patient care, appointments, andhospital services with' },
        { property: 'og:url', content: this.document.location.href }
      ]);
    }
  }
}