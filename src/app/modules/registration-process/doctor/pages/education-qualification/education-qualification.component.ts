import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { generateYearList } from "src/app/services/helper.service";
import { Subscription } from "rxjs";

@Component({
  standalone: false,
  selector: "nectar-education-qualification",
  templateUrl: "./education-qualification.component.html",
  styleUrls: ["./education-qualification.component.scss"],
})
export class EducationQualificationComponent implements OnInit {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private eventService: EventService
  ) {}
  educationalQualification: FormGroup;
  submitted: boolean = false;
  routes = {
    registerSectionA2: ROUTE_CONSTANT.DOCTOR.registerSectionA2,
    registerSectionA4: ROUTE_CONSTANT.DOCTOR.registerSectionA4,
  };
  yearList = [];
  yearofExperienceList: { name: number; _id: string }[] = [];
  sectionA: any = {
    education: null,
  };
  saveExit$: Subscription;
  ngOnInit(): void {
    this.broadcastEvent();
    this.validateForm();
    this.getEvents();
    this.sectionA = this.localStorage.getItem("sectionA") ?? this.sectionA;
    for (let i = 0; i <= 70; i++) {
      this.yearofExperienceList.push({ name: i, _id: String(i) });
    }
    this.yearList = generateYearList(new Date().getFullYear());
    if (this.sectionA.education) this.patchValue(this.sectionA.education);

    if (this.sectionA.education) this.patchValue(this.sectionA.education);
  }
  validateForm() {
    this.educationalQualification = this.fb.group({
      degree: [
        null,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      college: [null, [Validators.required, Validators.minLength(2)]],
      year: [null, [Validators.required]],
      experience: [null, [Validators.required]],
    });
  }
  get control() {
    return this.educationalQualification.controls;
  }
  patchValue(details) {
    this.educationalQualification.patchValue(details);
  }

  back() {
    this.router.navigate([this.routes.registerSectionA2]);
  }
  onSubmit() {
    this.submitted = true;
    this.educationalQualification.markAllAsTouched();
    if (this.educationalQualification.valid) {
      this.sectionA = {
        ...this.sectionA,
        education: this.educationalQualification.value,
      };
      this.localStorage.setItem("sectionA", this.sectionA);
      this.router.navigate([this.routes.registerSectionA4]);
    }
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 3,
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
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.EDUCATION,
            records: {
              ...this.sectionA,
              education: this.educationalQualification.valid
                ? this.educationalQualification.value
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
    if (this.saveExit$) {
      this.saveExit$.unsubscribe();
    }
  }
}
