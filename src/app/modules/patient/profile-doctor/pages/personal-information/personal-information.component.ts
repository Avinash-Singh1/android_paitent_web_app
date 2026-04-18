import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { InputValidationService } from "src/app/services/input-validation.service";

@Component({
  standalone: false,
  selector: "nectar-personal-information",
  templateUrl: "./personal-information.component.html",
  styleUrls: ["./personal-information.component.scss"],
})
export class PersonalInformationComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public cValidators: InputValidationService,
    private toastr: ToastrService,
    private eventService: EventService
  ) {}
  today = new Date();

  ngOnInit(): void {
    this.validateForm();
    this.getStates();
    this.getUserDetail();
    this.infoForm.valueChanges.subscribe(() => {
      this.hasChanged = Object.keys(this.initialValue).some(
        (key) => this.infoForm.value[key] != this.initialValue[key]
      );
    });
  }

  gender = [
    { name: "Male", id: 1 },
    { name: "Female", id: 2 },
    { name: "Others", id: 3 },
  ];
  bloodGroups = [
    { name: "A+", id: 1 },
    { name: "A-", id: 2 },
    { name: "B+", id: 3 },
    { name: "B-", id: 4 },
    { name: "O+", id: 5 },
    { name: "O-", id: 6 },
    { name: "AB+", id: 7 },
    { name: "AB-", id: 8 },
  ];
  infoForm: FormGroup;
  initialValue: any = {};
  hasChanged: boolean = false;
  validateForm() {
    this.infoForm = this.fb.group({
      fullName: ["", [Validators.minLength(6)]],
      gender: [],
      dob: [""],
      bloodGroup: [],
      landmark: ["", [Validators.minLength(6)]],
      locality: ["", [Validators.minLength(6)]],
      city: ["", [Validators.minLength(6)]],
      state: [],
      pincode: ["", [Validators.minLength(6)]],
      profilePic: [""],
    });
  }
  states: any;
  userDetail: any;
  getStates() {
    this.apiService
      .get(`${API_ENDPOINTS.MASTER.state}`, {})
      .subscribe((res: any) => {
        this.states = res?.result?.data;
      });
  }

  getUserDetail() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.getUserDetail}`, {})
      .subscribe((res: any) => {
        this.userDetail = res?.result;
        this.img.url = this.userDetail?.patient?.profilePic;
        this.infoForm.patchValue({
          fullName: this.userDetail.fullName || "",
          bloodGroup: this.userDetail?.patient?.bloodGroup,
          dob: this.userDetail?.patient?.dob,
          gender: this.userDetail?.patient?.gender,
          landmark: this.userDetail?.patient?.address?.landmark || "",
          locality: this.userDetail?.patient?.address?.locality || "",
          city: this.userDetail?.patient?.address?.city || "",
          state: this.userDetail?.patient?.address?.state,
          pincode: this.userDetail?.patient?.address?.pincode?.toString() || "",
          profilePic: this.userDetail?.patient?.profilePic,
        });
        this.initialValue = { ...this.infoForm.value };
      });
  }

  img: { url?: any; fileType?: string } = {};
  selectFile(event: any) {
    if (
      event.target.files &&
      event.target.files.length &&
      event.target.files[0].type.includes("image")
    ) {
      this.apiService.fileUpload(event.target.files[0]).subscribe({
        next: (res: any) => {
          const data = {
            url: res.result.uri.uri,
            fileType: "image",
          };
          this.img = data;

          this.infoForm.patchValue({ profilePic: this.img.url });
        },
        error: (error: any) => {
        },
      });
    } else {
      this.toastr.error("Wrong File Type");
    }
  }

  saveInformation() {
    if (this.hasChanged) {
      this.initialValue = { ...this.infoForm.value };
      let payload: any = {
        bloodGroup: this.infoForm.value?.bloodGroup,
        gender: this.infoForm.value?.gender,
        dob: this.infoForm.value?.dob,
        address: {
          landmark: this.infoForm.value?.landmark,
          locality: this.infoForm.value?.locality,
          city: this.infoForm.value?.city,
          state: this.infoForm.value?.state,
          pincode: this.infoForm.value?.pincode,
        },
        fullName: this.infoForm.value?.fullName,
        profilePic: this.infoForm.value?.profilePic,
      };
      for (let item in payload) {
        if (!payload[item]) {
          delete payload[item];
        }
      }
      for (let i in payload.address) {
        if (!payload.address[i]) {
          delete payload.address[i];
        }
      }
      this.apiService
        .put(`${API_ENDPOINTS.patient.getUserDetail}`, payload)
        .subscribe((res: any) => {
          this.hasChanged = false;
          this.getUserDetail();
          this.eventService.broadcastEvent("profile-update", true);
          this.toastr.success("Profile updated successfully.");
        });
    }
  }
}
