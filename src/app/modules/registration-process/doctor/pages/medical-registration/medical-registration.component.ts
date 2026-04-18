import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { generateYearList } from "src/app/services/helper.service";
import { ApiService } from "src/app/services/api.service";
import { Subscription } from "rxjs";
import { APP_CONSTANTS } from "src/app/config/app.constant";
interface MedicalRegistrationDetails {
  registrationNumber: string;
  council: string;
  year: string;
}
@Component({
  standalone: false,
  selector: "nectar-medical-registration",
  templateUrl: "./medical-registration.component.html",
  styleUrls: ["./medical-registration.component.scss"],
})
export class MedicalRegistrationComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private eventService: EventService,
    private apiService: ApiService
  ) {}
  medicalRegistrationForm: FormGroup;
  submitted: boolean = false;
  sectionA: any = {
    medicalRegistration: null,
  };
  registrationYear = [];

  routes = {
    registerSectionA1: ROUTE_CONSTANT.DOCTOR.registerSectionA1,
    registerSectionA3: ROUTE_CONSTANT.DOCTOR.registerSectionA3,
    hospitalSectionA: ROUTE_CONSTANT.HOSPITAL.registerSectionA1,
  };
  saveExit$: Subscription;
  ngOnInit(): void {
    this.broadcastEvent();
    this.validateForm();
    this.getEvents();
    this.registrationYear = generateYearList(new Date().getFullYear());
    this.sectionA = this.localStorage.getItem("sectionA") ?? this.sectionA;
    if (this.sectionA.medicalRegistration) {
      this.patchValue(this.sectionA.medicalRegistration);
    }
  }
  back() {
    this.router.navigate([this.routes.registerSectionA1]);
  }
  next() {
    this.router.navigate([this.routes.registerSectionA3]);
  }
  validateForm() {
    this.medicalRegistrationForm = this.fb.group({
      registrationNumber: [
        "",
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
        ],
      ],
      council: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(100),
        ],
      ],
      year: [null, [Validators.required]],
    });
  }
  get control() {
    return this.medicalRegistrationForm.controls;
  }
  patchValue(details: MedicalRegistrationDetails) {
    this.medicalRegistrationForm.patchValue(details);
  }
  onSubmit() {
    this.medicalRegistrationForm.markAllAsTouched();
    if (this.medicalRegistrationForm.valid) {
      this.sectionA = {
        ...this.sectionA,
        medicalRegistration: this.medicalRegistrationForm.value,
      };
      this.localStorage.setItem("sectionA", this.sectionA);
      this.next();
    }
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 2,
      laststep: 5,
    });
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        if (res) {
          const payload = {
            isSaveAndExit: true,
            steps: 1,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.MEDICAL_REGISTRATION,
            records: {
              ...this.sectionA,
              medicalRegistration: this.medicalRegistrationForm.valid
                ? this.medicalRegistrationForm.value
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
  ngOnDestroy(): void {
    this.saveExit$?.unsubscribe();
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
}
