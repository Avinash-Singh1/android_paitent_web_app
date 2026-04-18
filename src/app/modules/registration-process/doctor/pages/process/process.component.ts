import { Component, OnInit, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-process",
  templateUrl: "./process.component.html",
  styleUrls: ["./process.component.scss"],
})
export class ProcessComponent implements OnInit {
  step1: boolean = true;

  constructor(
    private router: Router,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private renderer: Renderer2,
    private seoService: SeoService
  ) {}
  step: number;
  changeRoutes = {
    1: ROUTE_CONSTANT.DOCTOR.registerSectionA1,
    2: ROUTE_CONSTANT.DOCTOR.registerSectionB1,
    3: ROUTE_CONSTANT.DOCTOR.registerSectionc1,
  };
  saveExit$: Subscription;
  ngOnInit(): void {
    this.broadcastEvent();
    this.step = this.localStorage.getItem("steps");
    this.localStorage.setItem("isEdit", 0);
    this.getProfileData();

    this.getEvents();
    if (this.step == 4) {
      this.seoService.appendScript(
        `gtag('event', 'conversion', {'send_to': 'AW-11399196295/DCIpCKeS-PMYEIfdx7sq'});`,
        this.renderer
      );
    }
  }
  backToHome() {
    this.eventService.broadcastEvent("showheader", "normalheader");
    const keys = [
      "sectionA",
      "sectionB",
      "sectionC",
      "isEdit",
      "steps",
      "token",
      "isLogged",
      "userType",
    ];
    this.clearLocalStorage(keys);
    this.eventService.broadcastEvent("footer", "normal");
    this.router.navigate(["/"]);
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: false,
    });
  }
  getProfileData() {
    const params = {
      type: 1,
    };
    this.apiService.get(API_ENDPOINTS.doctor.getProfile, params).subscribe({
      next: (res: any) => {
        this.setLocalStorage(res.result);
      },
      error: (res: any) => {},
    });
  }
  setLocalStorage(result) {
    let { steps, sectionA, sectionB, sectionC } = result;
    this.step = steps;
    sectionA = {
      ...sectionA,
      basicDetails: {
        ...sectionA.basicDetails,
        specialization: sectionA.basicDetails?.specialization[0],
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
    delete sectionA.education._id;
    delete sectionA.medicalRegistration._id;
    delete sectionA.establishmentDetails.establishmentType;
    delete sectionA.establishmentDetails.establishmentTypeId;
    sectionC = {
      ...sectionC,
      address: { ...sectionC.address },
      consultationFees: sectionC.establishmentTiming?.consultationFees
        ? sectionC.establishmentTiming?.consultationFees
        : null,
    };
    this.localStorage.setItem("steps", steps);
    this.localStorage.setItem("sectionA", sectionA);
    this.localStorage.setItem("sectionB", sectionB);
    this.localStorage.setItem("sectionC", sectionC);
  }
  onChangeRoute(value: number, isEdit: boolean = false) {
    if (isEdit) {
      this.localStorage.setItem("isEdit", value);
    }
    this.router.navigate([this.changeRoutes[value]]);
  }
  clearLocalStorage(keys: string[]) {
    keys.forEach((value: string) => {
      this.localStorage.removeItem(value);
    });
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        if (res) {
          this.router.navigate([""]);
          this.eventService.broadcastEvent("showheader", "normalheader");
          this.eventService.broadcastEvent("footer", "normal");
          this.localStorage.removeItems([
            "sectionA",
            "sectionB",
            "sectionC",
            "isEdit",
            "steps",
            "userType",
            "token",
            "isLogged",
          ]);
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
