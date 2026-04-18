import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-add-medical",
  templateUrl: "./add-medical.component.html",
  styleUrls: ["./add-medical.component.scss"],
})
export class AddMedicalComponent implements OnInit {
  @ViewChild("upload")
  myInputVariable: ElementRef;
  constructor(
    private matdialogRef: MatDialogRef<AddMedicalComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
    private dialog: MatDialog,
    private localStorage: LocalStorageService,
    private fb: FormBuilder
  ) {}
  patientName: any;
  addMedicalForm!: FormGroup;
  submitted: boolean = false;
  ngOnInit(): void {
    let detail = JSON.parse(this.localStorage.getItem("userDetail"));
    this.patientName = detail?.fullName;
    this.addMedicalForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(2)]],
      date: ["", [Validators.required]],
      recordType: ["", [Validators.required]],
    });

    if (this.data?.title) {
      this.addMedicalForm.patchValue({ title: this?.data?.title });
      this.addMedicalForm.controls["title"].disable();
    }
  }
  img: { url?: any; fileType?: string } = {};
  selectFile(event: any) {
    if (event.target?.files && event.target?.files?.length) {
      this.apiService.fileUpload(event.target.files[0]).subscribe({
        next: (res: any) => {
          const data = {
            url: res.result.uri.uri,
            fileType: res.result.uri.mimeType.includes("image")
              ? "image"
              : "pdf",
          };
          this.img = data;
        },
        error: (error: any) => {
        },
      });
    }
  }

  get f() {
    return this.addMedicalForm.controls;
  }

  cancel() {
    this.dialog.closeAll();
  }
  removeFile() {
    this.img = {};
  }
  done() {
    this.submitted = true;
    if (this.addMedicalForm.valid && this.img?.url) {
      if (!this.data?.title && !this.data?.id) {
        let payload = {
          title: this.addMedicalForm.value.title,
          patientName: this.patientName,
          date: this.addMedicalForm.value.date,
          status: 1,
          type: this.addMedicalForm.value.recordType,
          url: {
            url: this.img.url,
            status: 0,
            fileType: this.img.fileType,
          },
        };
        this.apiService
          .post(API_ENDPOINTS.patient.MedicalRecord, payload)
          .subscribe((res: any) => {
            this.dialog.closeAll();
          });
      } else {
        let payload = {
          url: {
            url: this.img.url,
            status: 0,
            fileType: this.img.fileType,
          },
        };
        this.apiService
          .put(
            `${API_ENDPOINTS.patient.MedicalRecord}/${this.data?.id}`,
            payload
          )
          .subscribe((res: any) => {
            this.dialog.closeAll();
          });
      }
    }
  }
}
