import { Component, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-establishment-basic-details",
  templateUrl: "./establishment-basic-details.component.html",
  styleUrls: ["./establishment-basic-details.component.scss"],
})
export class EstablishmentBasicDetailsComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private eventService: EventService,
    private seoService: SeoService,
    private renderer: Renderer2

  ) { }

  establishmentBasicDetails: FormGroup;

  sectionA: any;
  hospitalType: { name: string; _id: string }[];
  routes = {
    process: ROUTE_CONSTANT.HOSPITAL.registerProcess,
  };
  saveExit$: Subscription;
  ngOnInit(): void {
    this.getEvents();
    this.broadcastEvent();
    this.getListing();
    this.validateForm();
    this.sectionA =
      this.localStorage.getItem("sectionAHospital") ?? this.sectionA;
    if (this.sectionA) {
      this.patchValue(this.sectionA);
    }
    this.seoService.appendScript(
      `gtag('event', 'conversion', {'send_to': 'AW-11399196295/7JnICLy5-PMYEIfdx7sq'});`,
      this.renderer
    );
  }

  validateForm() {
    this.establishmentBasicDetails = this.fb.group({
      fullName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      hospitalType: [null, Validators.required],
    });
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.hospitalType, {}).subscribe({
      next: (res: any) => {
        this.hospitalType = res.result.data;
      },
      error: (error: any) => {
        this.hospitalType = [];
      },
    });
  }

  get control() {
    return this.establishmentBasicDetails.controls;
  }
  patchValue(details) {
    this.establishmentBasicDetails.patchValue(details);
  }
  onSubmit() {
    this.establishmentBasicDetails.markAllAsTouched();
    if (this.establishmentBasicDetails.valid) {
      const isEdit = this.localStorage.getItem("isEdit");
      this.sectionA = {
        ...this.sectionA,
        ...this.establishmentBasicDetails.value,
      };
      const payload = {
        steps: 1,
        isEdit: isEdit && isEdit >= 1 ? true : false,
        isSaveAndExit: false,
        records: {
          ...this.sectionA,
        },
      };
      this.localStorage.setItem("sectionAHospital", this.sectionA);

      this.apiService
        .put(API_ENDPOINTS.hospital.updateProfile, payload)
        .subscribe({
          next: (res: any) => {
            const step = this.localStorage.getItem("steps") ?? 2;
            this.localStorage.setItem("steps", step);
            this.router.navigate([this.routes.process]);
          },
          error: (error: any) => {
          },
        });
    }
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 1,
      laststep: 1,
    });
  }

  //

  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        if (res) {
          const payload = {
            isSaveAndExit: true,
            steps: 1,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.HOSPITAL_SCREENS.ESTABLISHMENT_DETAILS,
            records: this.establishmentBasicDetails.valid
              ? {
                ...this.sectionA,
                ...this.establishmentBasicDetails.value,
              }
              : {},
          };
          this.apiService.saveAndExitHospital(payload);
        }
      },
    });
  }
  ngOnDestroy(): void {
    this.saveExit$?.unsubscribe();
  }
}
