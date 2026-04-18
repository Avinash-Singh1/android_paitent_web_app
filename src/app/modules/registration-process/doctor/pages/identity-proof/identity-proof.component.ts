import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-identity-proof",
  templateUrl: "./identity-proof.component.html",
  styleUrls: ["./identity-proof.component.scss"],
})
export class IdentityProofComponent implements OnInit {
  @ViewChild("upload") myInputVariable1!: ElementRef;
  constructor(
    private eventService: EventService,
    private apiService: ApiService,
    private toastr: ToastrService,
    private localStorage: LocalStorageService,
    private router: Router
  ) {}
  img: { url: any; fileType: string }[] = [];
  doctorname: string;
  submitted: boolean = false;
  sectionB: any = {
    doctor: null,
  };
  saveExit$: Subscription;
  routes: {
    back: "";
  };
  ngOnInit(): void {
    this.broadcastEvent();
    this.sectionB = this.localStorage.getItem("sectionB") ?? this.sectionB;
    if (this.sectionB.doctor?.identityProof) {
      this.img = this.sectionB.doctor.identityProof ?? [];
    }
    this.getEvents();
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

  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 1,
      laststep: 3,
    });
  }
  onNext() {
    this.submitted = true;
    if (this.img.length) {
      this.img.forEach((item: any) => {
        delete item._id;
      });
      this.sectionB = {
        ...this.sectionB,
        doctor: { ...this.sectionB.doctor, identityProof: this.img },
      };
      this.localStorage.setItem("sectionB", this.sectionB);
      this.router.navigate(["/register/doctors/sec-b/2"]);
    }
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        if (res) {
          const payload = {
            isSaveAndExit: true,
            steps: 2,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.DOCTOR_IDENTITY_PROOF,
            records: {
              ...this.sectionB,
              doctor: { ...this.sectionB.doctor, identityProof: this.img },
            },
          };
          this.apiService.saveAndExit(payload);
        }
      },
    });
  }
  back() {
    this.router.navigate(["/register/doctors/process"]);
  }
  ngOnDestroy(): void {
    this.saveExit$?.unsubscribe();
  }
}
