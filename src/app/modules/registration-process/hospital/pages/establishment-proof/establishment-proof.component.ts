import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-establishment-proof",
  templateUrl: "./establishment-proof.component.html",
  styleUrls: ["./establishment-proof.component.scss"],
})
export class EstablishmentProofComponent implements OnInit {
  constructor(
    private router: Router,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  routes = {
    back: ROUTE_CONSTANT.HOSPITAL.registerProcess,
    process: ROUTE_CONSTANT.HOSPITAL.registerProcess,
  };
  img: { url: any; fileType: string }[] = [];
  submitted: boolean = false;
  doctorname: string;
  propertyStatus: string;
  sectionB: any;
  saveExit$: Subscription;
  isOwner: boolean;
  statusObj = {
    true: "owner",
    false: "rented",
  };
  ngOnInit(): void {
    this.broadcastEvent();
    this.getEvents();
    this.sectionB =
      this.localStorage.getItem("sectionBHospital") ?? this.sectionB;
    if (this.sectionB) {
      const { establishmentProof, isOwner } = this.sectionB;
      this.img = establishmentProof ? establishmentProof : [];
      this.propertyStatus = this.statusObj?.[isOwner];
    }
    this.doctorname = this.localStorage.getItem("userDetail")
      ? JSON.parse(this.localStorage.getItem("userDetail")).fullName
      : "";
  }
  selectFile(event: any) {
    if (event.target?.files?.length) {
      this.apiService.fileUpload(event.target.files[0]).subscribe({
        next: (res: any) => {
          const data = {
            url: res.result.uri.uri,
            fileType: res.result.uri.mimeType.includes("image")
              ? "image"
              : "pdf",
          };
          this.img.push(data);
          this.toastr.success("File uploaded");
        },
        error: (error: any) => {
        },
      });
    }
  }

  removeFile(index: number) {
    this.img.splice(index, 1);
  }
  next() {
    this.router.navigate([this.routes.process]);
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 1,
      laststep: 1,
    });
  }
  onNext() {
    this.submitted = true;
    if (this.img.length && this.propertyStatus) {
      this.img.forEach((item: any) => {
        delete item._id;
      });
      this.sectionB = {
        ...this.sectionB,
        establishmentProof: this.img,
        isOwner: this.propertyStatus == "owner" ? true : false,
      };
      const isEdit = this.localStorage.getItem("isEdit");
      this.localStorage.setItem("sectionBHospital", this.sectionB);
      const payload = {
        steps: 2,
        isEdit: isEdit && isEdit >= 2 ? true : false,
        isSaveAndExit: false,
        records: {
          ...this.sectionB,
        },
      };

      this.apiService
        .put(API_ENDPOINTS.hospital.updateProfile, payload)
        .subscribe({
          next: (res: any) => {
            const step = this.localStorage.getItem("steps") ?? 3;
            this.localStorage.setItem("steps", step);
            this.router.navigate([this.routes.process]);
          },
          error: (error: any) => {
          },
        });
    }
  }

  back() {
    this.router.navigate([this.routes.back]);
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        if (res) {
          const isEdit = this.localStorage.getItem("isEdit") ?? 0;
          const payload = {
            isSaveAndExit: true,
            steps: 2,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.HOSPITAL_SCREENS.ESTABLISHMENT_PROOF,
            records: {
              ...this.sectionB,
              establishmentProof: this.img,
              isOwner: this.propertyStatus == "owner" ? true : false,
            },
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
