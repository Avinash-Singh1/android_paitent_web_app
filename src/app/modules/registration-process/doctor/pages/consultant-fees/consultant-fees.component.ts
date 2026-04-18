import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-consultant-fees",
  templateUrl: "./consultant-fees.component.html",
  styleUrls: ["./consultant-fees.component.scss"],
})
export class ConsultantFeesComponent implements OnInit {
  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private eventService: EventService
  ) {}
  consultantFees: FormControl = new FormControl("", [Validators.required]);
  establishmentType: any = {
    owner: true,
    visitor: false,
  };
  submitted: boolean = false;
  name: string = "";

  sectionC: any = {
    consultationFees: null,
  };
  saveExit$: Subscription;
  routes = {
    process: ROUTE_CONSTANT.DOCTOR.registerProcess,
    back: ROUTE_CONSTANT.DOCTOR.registerSectionc2,
  };
  ngOnInit(): void {
    this.broadcastEvent();
    this.getEvents();
    const sectionA = this.localStorage.getItem("sectionA");
    if (sectionA) {
      const { name } = sectionA.establishmentDetails;
      this.name = name;
    }
    this.sectionC = this.localStorage.getItem("sectionC") ?? this.sectionC;
    if (this.sectionC.consultationFees) {
      this.consultantFees.patchValue(this.sectionC.consultationFees);
    }
  }
  back() {
    this.router.navigate([this.routes.back]);
  }
  next() {
    this.router.navigate(["/register/doctors/process"]);
  }

  patchValue(details) {
    details = JSON.parse(details);
    this.consultantFees.patchValue(details);
  }
  onSubmit() {
    this.submitted = true;
    if (this.consultantFees.valid) {
      const isEdit = this.localStorage.getItem("isEdit");
      this.sectionC = {
        ...this.sectionC,
        consultationFees: this.consultantFees.value,
      };
      const payload = {
        steps: 3,
        isEdit: isEdit && isEdit >= 3 ? true : false,
        isSaveAndExit: false,
        records: {
          ...this.sectionC,
        },
      };
      this.localStorage.setItem("sectionC", this.sectionC);
      this.apiService
        .put(API_ENDPOINTS.doctor.updateProfile, payload)
        .subscribe({
          next: (res: any) => {
            let steps = this.localStorage.getItem("steps") ?? 4;
            if (steps < 4) {
              steps = 4;
            }
            this.localStorage.setItem("steps", steps);
            this.router.navigate(["/register/doctors/process"]);
          },
          error: (error: any) => {
          },
        });
    }
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 3,
      laststep: 3,
    });
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        if (res) {
          const payload = {
            isSaveAndExit: true,
            steps: 3,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.ESTABLISHMENT_FEES,
            records: {
              ...this.sectionC,
              consultationFees: this.consultantFees.valid
                ? this.consultantFees.value
                : null,
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
