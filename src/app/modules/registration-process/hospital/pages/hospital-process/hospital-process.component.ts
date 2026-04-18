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
  selector: "nectar-hospital-process",
  templateUrl: "./hospital-process.component.html",
  styleUrls: ["./hospital-process.component.scss"],
})
export class HospitalProcessComponent implements OnInit {
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
    1: ROUTE_CONSTANT.HOSPITAL.registerSectionA1,
    2: ROUTE_CONSTANT.HOSPITAL.registerSectionB1,
    3: ROUTE_CONSTANT.HOSPITAL.registerSectionC1,
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
        `gtag('event', 'conversion', {'send_to': 'AW-11399196295/7JnICLy5-PMYEIfdx7sq'});`,
        this.renderer
      );
    }
  }
  backToHome() {
    this.eventService.broadcastEvent("showheader", "normalheader");
    this.eventService.broadcastEvent("footer", "normal");
    this.clearLocalStorage([
      "sectionA",
      "sectionB",
      "sectionC",
      "isEdit",
      "steps",
      "token",
      "isLogged",
      "userType",
    ]);
    this.router.navigate(["/"]);
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: false,
    });
  }
  getProfileData() {
    const params = {
      hospitalId: JSON.parse(this.localStorage.getItem("userDetail"))?._id,
      type: 2,
    };
    this.apiService.get(API_ENDPOINTS.hospital.getProfile, params).subscribe({
      next: (res: any) => {
        this.setHospitalData(res.result);
      },
      error: (res: any) => {},
    });
  }
  setHospitalData(result) {
    let { sectionA, sectionB, sectionC, steps } = result;
    this.step = steps;
    this.localStorage.setItem("steps", steps);
    this.localStorage.setItem("sectionAHospital", sectionA);
    this.localStorage.setItem("sectionBHospital", sectionB);
    sectionC = {
      ...sectionC,
      address: { ...sectionC.address, state: sectionC.address?.stateId },
    };
    delete sectionC.address.stateId;
    this.localStorage.setItem("sectionCHospital", sectionC);
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
          this.backToHome();
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
