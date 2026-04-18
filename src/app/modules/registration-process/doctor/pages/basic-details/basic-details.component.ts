import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, Subscription, debounceTime, tap } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-basic-details",
  templateUrl: "./basic-details.component.html",
  styleUrls: ["./basic-details.component.scss"],
})
export class BasicDetailsComponent implements OnInit {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private eventService: EventService
  ) {}
  routes = {
    sectionA2: ROUTE_CONSTANT.DOCTOR.registerSectionA2,
    hospitalSectionA: ROUTE_CONSTANT.HOSPITAL.registerSectionA1,
  };
  basicDetailsForm: FormGroup;
  specializationList: any = [];
  genderList = [
    { label: "Male", value: 1 },
    { label: "Female", value: 2 },
    { label: "Other", value: 3 },
  ];
  type = {
    true: "owner",
    false: "owner",
  };
  doctorname: string;
  sectionA: any = {
    basicDetails: null,
  };
  saveExit$: Subscription;
  emialSubject = new Subject();
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$/;
  ngOnInit(): void {
    this.broadcastEvent();
    this.validateForm();
    const userDetail = JSON.parse(this.localStorage.getItem("userDetail"));
    if (userDetail) {
      this.doctorname = userDetail.fullName;
    }
    this.sectionA = this.localStorage.getItem("sectionA") ?? this.sectionA;
    if (this.sectionA.basicDetails) {
      this.patchValue(this.sectionA.basicDetails);
    }
    this.getListing();
    this.getEvents();
    this.uniqueEmail();
  }
  validateForm() {
    this.basicDetailsForm = this.fb.group({
      fullName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      gender: ["", Validators.required],
      specialization: [null, Validators.required],
      email: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
          ),
        ],
      ],
      city: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
    });
  }
  get control() {
    return this.basicDetailsForm.controls;
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.specialization, {}).subscribe({
      next: (res: any) => {
        this.specializationList = res.result?.data;
      },
      error: (error: any) => {
      },
    });
  }
  patchValue(details) {
    this.basicDetailsForm.patchValue(details);
  }
  onSubmit() {
    this.basicDetailsForm.markAllAsTouched();
    if (this.basicDetailsForm.valid) {
      this.sectionA = {
        ...this.sectionA,
        basicDetails: this.basicDetailsForm.value,
      };
      this.localStorage.setItem("sectionA", this.sectionA);
      this.router.navigate([this.routes.sectionA2]);
    }
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 1,
      laststep: 5,
    });
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        this.sectionA = {
          ...this.sectionA,
          basicDetails: this.basicDetailsForm.valid
            ? this.basicDetailsForm.value
            : null,
        };
        let flag = false;
        Object.keys(this.sectionA).forEach((key: any) => {
          if (this.sectionA[key] != null) {
            flag = true;
          }
        });
        if (!flag) {
          this.localStorage.removeItems([
            "sectionA",
            "sectionB",
            "sectionC",
            "steps",
            "isEdit",
            "token",
            "userType",
            "isLogged",
          ]);
          this.router.navigate(["/"]);
          this.eventService.broadcastEvent("showheader", "normalheader");
          this.eventService.broadcastEvent("footer", "normal");
          return;
        }
        if (res) {
          const payload = {
            isSaveAndExit: true,
            steps: 1,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.DOCTOR_DETAILS,
            records: {
              ...this.sectionA,
              basicDetails: this.basicDetailsForm.valid
                ? this.basicDetailsForm.value
                : null,
              establishmentDetails: !isEdit
                ? null
                : this.sectionA.establishmentDetails,
            },
          };

          this.apiService.saveAndExit(payload);
        }
      },
    });
  }
  notDoctor() {
    this.localStorage.removeItems([
      "sectionA",
      "sectionB",
      "sectionC",
      "isEdit",
      "steps",
    ]);
    this.router.navigate([this.routes.hospitalSectionA]);
  }
  ngOnDestroy(): void {
    if (this.saveExit$) {
      this.saveExit$.unsubscribe();
    }
  }
  uniqueEmail() {
    this.emialSubject
      .pipe(
        debounceTime(500),
        tap((email: string) => {})
      )
      .subscribe((email: string) => {
        this.apiService
          .get(API_ENDPOINTS.COMMON.emailExist, { search: email })
          .subscribe({
            next: (res: any) => {
              const { isTaken } = res.result;
              if (isTaken) {
                this.control["email"].setErrors({ alreadyExist: true });
              }
            },
          });
      });
  }
  searchUniqueEmail(event: any) {
    if (this.control["email"].valid) {
      this.emialSubject.next(this.control["email"].value);
    }
  }
}
