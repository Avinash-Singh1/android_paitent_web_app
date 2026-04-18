import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-practice-connect",
  templateUrl: "./practice-connect.component.html",
  styleUrls: ["./practice-connect.component.scss"],
})
export class PracticeConnectComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private eventService: EventService,
    private apiService: ApiService
  ) {}
  saveExit$: Subscription;
  sectionA: any = {
    establishmentDetails: null,
  };

  routes = {
    registerSectionA3: ROUTE_CONSTANT.DOCTOR.registerSectionA3,
    registerSectionA5: ROUTE_CONSTANT.DOCTOR.registerSectionA5,
  };
  isOwner: FormControl = new FormControl(["", [Validators.required]]);
  previousValue: boolean;
  ngOnInit(): void {
    this.broadcastEvent();
    this.sectionA = this.localStorage.getItem("sectionA") ?? this.sectionA;
    if (this.sectionA.establishmentDetails) {
      this.isOwner.setValue(this.sectionA.establishmentDetails.isOwner);
      this.previousValue = this.sectionA.establishmentDetails.isOwner;
    }

    this.getEvents();
  }
  back() {
    this.router.navigate([this.routes.registerSectionA3]);
  }
  next() {
    this.isOwner.markAsTouched();
    if (this.isOwner.valid) {
      if (this.previousValue != this.isOwner.value) {
        this.sectionA = {
          ...this.sectionA,
          establishmentDetails: { isOwner: this.isOwner.value },
        };
      } else {
        this.sectionA = {
          ...this.sectionA,
          establishmentDetails: {
            ...this.sectionA.establishmentDetails,
            isOwner: this.isOwner.value,
          },
        };
      }
      this.localStorage.setItem("sectionA", this.sectionA);
      const steps = this.localStorage.getItem("steps") ?? 2;
      this.localStorage.setItem("steps", steps);
      this.router.navigate([this.routes.registerSectionA5]);
    }
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 4,
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
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.ESTABLISHMENT_OWNER,
            records: {
              ...this.sectionA,
              establishmentDetails: this.isOwner.valid
                ? {
                    ...this.sectionA.establishmentDetails,
                    isOwner: this.isOwner.value,
                  }
                : null,
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
}
