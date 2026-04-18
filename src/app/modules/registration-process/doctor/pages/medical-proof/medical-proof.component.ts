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
  selector: "nectar-medical-proof",
  templateUrl: "./medical-proof.component.html",
  styleUrls: ["./medical-proof.component.scss"],
})
export class MedicalProofComponent implements OnInit {
  @ViewChild("upload") myInputVariable1!: ElementRef;
  constructor(
    private eventService: EventService,
    private apiService: ApiService,
    private toastr: ToastrService,
    private localStorage: LocalStorageService,
    private router: Router
  ) {}
  file: any;
  img: { url: any; fileType: string }[] = [];
  doctorname: string;
  submitted: boolean = false;
  sectionB: any = {
    doctor: null,
  };
  saveExit$: Subscription;
  ngOnInit(): void {
    this.broadcastEvent();
    this.sectionB = this.localStorage.getItem("sectionB") ?? this.sectionB;
    if (this.sectionB.doctor?.medicalProof) {
      this.img = this.sectionB.doctor?.medicalProof ?? [];
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
      currentstep: 2,
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
        doctor: { ...this.sectionB.doctor, medicalProof: this.img },
      };
      this.localStorage.setItem("sectionB", this.sectionB);
      this.router.navigate(["/register/doctors/sec-b/3"]);
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
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.DOCTOR_MEDICAL_PROOF,
            records: {
              ...this.sectionB,
              doctor: { ...this.sectionB.doctor, medicalProof: this.img },
            },
          };
          this.apiService.saveAndExit(payload);
        }
      },
    });
  }
  back() {
    this.router.navigate(["/register/doctors/sec-b/1"]);
  }
  ngOnDestroy(): void {
    if (this.saveExit$) {
      this.saveExit$.unsubscribe();
    }
  }
}
