import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
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
  @ViewChild("upload") myInputVariable1!: ElementRef;
  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}
  routes = {
    back: ROUTE_CONSTANT.DOCTOR.registerSectionB2,
    process: ROUTE_CONSTANT.DOCTOR.registerProcess,
  };
  file: any;
  img: { url: any; fileType: string }[] = [];
  submitted: boolean = false;
  doctorname: string;
  propertyStatus: number = 0;
  sectionB: any = {
    establishmentDetail: null,
  };
  saveExit$: Subscription;
  isOwner: boolean;
  ngOnInit(): void {
    this.broadcastEvent();
    this.getEvents();
    this.sectionB = this.localStorage.getItem("sectionB") ?? this.sectionB;
    const sectionA = this.localStorage.getItem("sectionA");
    if (this.sectionB?.establishmentDetail) {
      this.img = this.sectionB.establishmentDetail?.establishmentProof ?? [];
      this.propertyStatus = this.sectionB.establishmentDetail.propertyStatus;
    }
    if (sectionA) {
      this.isOwner = sectionA.establishmentDetails?.isOwner;
      if (this.isOwner) {
        this.propertyStatus = 1;
      } else {
        this.propertyStatus = 3;
      }
    }
    this.doctorname = this.localStorage.getItem("userDetail")
      ? JSON.parse(this.localStorage.getItem("userDetail")).fullName
      : null;
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
      currentstep: 3,
      laststep: 3,
    });
  }
  onNext() {
    this.submitted = true;
    if (this.img.length && this.propertyStatus >= 1) {
      this.img.forEach((item: any) => {
        delete item._id;
      });
      const isEdit = this.localStorage.getItem("isEdit");

      this.sectionB = {
        ...this.sectionB,
        establishmentDetail: {
          ...this.sectionB.establishmentDetail,
          establishmentProof: this.img,
          propertyStatus: this.propertyStatus,
        },
      };
      this.localStorage.setItem("sectionB", this.sectionB);
      const payload = {
        steps: 2,
        isEdit: isEdit && isEdit >= 2 ? true : false,
        isSaveAndExit: false,
        records: {
          ...this.sectionB,
        },
      };

      this.apiService
        .put(API_ENDPOINTS.doctor.updateProfile, payload)
        .subscribe({
          next: (res: any) => {
            let steps = this.localStorage.getItem("steps") ?? 3;
            if (steps < 3) {
              steps = 3;
            }
            this.localStorage.setItem("steps", steps);
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
            profileScreen:
              APP_CONSTANTS.DOCTOR_SCREENS.DOCTOR_ESTABLISHMENT_PROOF,
            records: {
              ...this.sectionB,
              establishmentDetail: {
                ...this.sectionB.establishmentDetail,
                establishmentProof: this.img,
                propertyStatus: this.propertyStatus,
              },
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
