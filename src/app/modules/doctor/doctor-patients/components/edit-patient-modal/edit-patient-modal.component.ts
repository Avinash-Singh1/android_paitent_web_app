import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-edit-patient-modal",
  templateUrl: "./edit-patient-modal.component.html",
  styleUrls: ["./edit-patient-modal.component.scss"],
})
export class EditPatientModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public matdialogRef: MatDialogRef<EditPatientModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private toastr: ToastrService,
    private datepipe: DatePipe
  ) {}
  editPatientForm: FormGroup;
  preferredLanguge: number = 1;
  today = new Date();
  ngOnInit(): void {
    this.validateForm();
    this.getListing();
    this.control["patientName"].disable();
    this.control["phone"].disable();
    this.data.patientDetails = {
      ...this.data.patientDetails,
      dob: this.data.patientDetails.dob
        ? this.datepipe.transform(
            new Date(this.data.patientDetails.dob),
            "yyyy-MM-dd"
          )
        : null,
      address: {
        ...this.data.patientDetails.address,
        street: this.data.patientDetails.address.landmark,
      },
    };
    this.editPatientForm.patchValue(this.data.patientDetails);
  }
  submitted: boolean = false;
  languagePreferencelist = [
    { label: "English", value: APP_CONSTANTS.LANGUAGES_SUPPORTED.ENGLISH },
  ];
  bloodGroupList = [
    { label: "A-", value: APP_CONSTANTS.BLOOD_GROUP.A_MINUS },
    { label: "A+", value: APP_CONSTANTS.BLOOD_GROUP.A_PLUS },
    { label: "B-", value: APP_CONSTANTS.BLOOD_GROUP.B_MINUS },
    { label: "B+", value: APP_CONSTANTS.BLOOD_GROUP.B_PLUS },
    { label: "AB-", value: APP_CONSTANTS.BLOOD_GROUP.AB_MINUS },
    { label: "AB+", value: APP_CONSTANTS.BLOOD_GROUP.AB_PLUS },
    { label: "O-", value: APP_CONSTANTS.BLOOD_GROUP.O_MINUS },
    { label: "O+", value: APP_CONSTANTS.BLOOD_GROUP.O_PLUS },
  ];
  stateList = [];
  validateForm() {
    this.editPatientForm = this.fb.group({
      patientName: ["", [Validators.required]],
      phone: ["", [Validators.required]],
      email: [""],
      gender: [1, [Validators.required]],
      dob: [null, [Validators.required]],
      bloodGroup: [null, [Validators.required]],
      languagePreference: [1, []],
      address: this.fb.group({
        street: ["", [Validators.required]],
        pincode: [
          "",
          [Validators.required, Validators.minLength, Validators.maxLength],
        ],
        city: ["", [Validators.required]],
        state: [null, [Validators.required]],
      }),
      profilePic: [null],
    });
  }
  get control() {
    return this.editPatientForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.editPatientForm.valid) {
      this.apiService
        .putParams(
          API_ENDPOINTS.doctor.patientProfile,
          this.editPatientForm.value,
          { patientId: this.data.patientDetails._id }
        )
        .subscribe({
          next: (res: any) => {
            this.toastr.success("Profile updated successfully");
            this.matdialogRef.close(true);
          },
          error: (error: any) => {
          },
        });
    }
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
      next: (res: any) => {
        this.stateList = res.result.data;
      },
      error: (error: any) => {
      },
    });
  }
  onUpdatePic(event: any) {
    if (event.target?.files?.length) {
      this.apiService.fileUpload(event.target.files[0]).subscribe({
        next: (res: any) => {
          this.editPatientForm.get("profilePic").setValue(res.result.uri.uri);
        },
        error: (error: any) => {
        },
      });
    }
  }
}
