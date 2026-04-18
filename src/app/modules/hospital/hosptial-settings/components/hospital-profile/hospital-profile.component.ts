import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-hospital-profile",
  templateUrl: "./hospital-profile.component.html",
  styleUrls: ["./hospital-profile.component.scss"],
})
export class HospitalProfileComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.getEstablishmentTypeList();
    this.validateForm();
    this.getProfileDetail();
    this.profileForm.valueChanges.subscribe(() => {
      this.hasChanged = Object.keys(this.initialValue).some(
        (key) => this.profileForm.value[key] != this.initialValue[key]
      );
    });
  }
  profileForm: FormGroup;
  establishmentTypeList = [];
  hosptialId: string;
  initialValue: any = {};
  hasChanged: boolean;
  validateForm() {
    this.profileForm = this.fb.group({
      profilePic: ["", []],
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(500),
        ],
      ],
      hospitalType: [null, [Validators.required]],
      totalBed: [null],
      ambulance: [null],
      about: ["", [Validators.required, Validators.minLength(10)]],
    });
  }
  get control() {
    return this.profileForm.controls;
  }
  onFileUpload(event: any) {
    if (event.target?.files?.length) {
      const file = event.target.files[0];
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          const { uri } = res.result.uri;
          this.control["profilePic"].setValue(uri);
        },
      });
    }
  }
  getProfileDetail() {
    this.apiService.get(API_ENDPOINTS.hospital.profileDetail, {}).subscribe({
      next: (res: any) => {
        this.hosptialId = res.result?.hospitalId;

        this.profileForm.patchValue(res.result);
        this.initialValue = { ...this.profileForm.value };
      },
      error: () => {},
    });
  }
  getEstablishmentTypeList() {
    this.apiService.get(API_ENDPOINTS.MASTER.hospitalType, {}).subscribe({
      next: (res: any) => {
        const { data } = res.result;
        this.establishmentTypeList = data;
      },
      error: (error: any) => {
        this.establishmentTypeList = [];
      },
    });
  }
  onSubmit() {
    if (this.profileForm.valid && this.hasChanged) {
      const payload = { ...this.profileForm.value };
      this.initialValue = { ...this.profileForm.value };
      for (let key in payload) {
        if (!payload[key]) {
          delete payload[key];
        }
      }
      this.apiService
        .putParams(API_ENDPOINTS.hospital.updateHospitalProfile, payload, {
          hospitalId: this.hosptialId,
        })
        .subscribe({
          next: (res: any) => {
            if (this.profileForm.value.profilePic) {
              this.eventService.broadcastEvent(
                "profilePicChanged",
                this.profileForm.value.profilePic
              );
            }
            this.hasChanged = false;
            this.toastr.success("Profile updated successfull.");
          },
        });
    }
  }
}
