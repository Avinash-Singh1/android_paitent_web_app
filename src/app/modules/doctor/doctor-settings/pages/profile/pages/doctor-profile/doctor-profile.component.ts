import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ToastrService } from "ngx-toastr";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-doctor-profile",
  templateUrl: "./doctor-profile.component.html",
  styleUrls: ["./doctor-profile.component.scss"],
})
export class DoctorProfileComponent implements OnInit {
  data: any;
  getimgUrl: any;
  specializationList: any;
  videoSubmitted: boolean = false;
  constructor(
    private fb: FormBuilder,
    private apiSerive: ApiService,
    public toastr: ToastrService,
    private eventService: EventService
  ) {}

  profileForm: FormGroup;
  getFormValues: any;
  ngOnInit(): void {
    this.generateList();
    this.validateForm();
    this.specialization();
    this.editForm();
  }
  get control() {
    return this.profileForm.controls;
  }
  experinenceYear = [];
  generateList() {
    for (let i = 0; i <= 70; i++) {
      this.experinenceYear.push({ label: String(i), value: String(i) });
    }
  }
  validateForm() {
    this.profileForm = this.fb.group({
      profilePic: [""],
      fullName: ["", [Validators.required]],
      specialization: [null, [Validators.required]],
      experience: [null, [Validators.required]],
      about: ["", [Validators.required]],
    });
  }
  isProfilePic: boolean = false;
  onFileUpload(event) {
    if (event.target?.files?.length) {
      this.apiSerive.fileUpload(event.target.files[0]).subscribe({
        next: (res: any) => {
          this.isProfilePic = true;
          this.control["profilePic"].setValue(res.result?.uri?.uri);
        },
        error: (error: any) => {
        },
      });
    }
  }

  submitForm() {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.valid) {
      Object.keys(this.profileForm.value).forEach((key) => {
        if (this.profileForm.value[key] === null) {
          delete this.profileForm.value[key];
        }
      });
      this.apiSerive
        .put(API_ENDPOINTS.doctor.updateDoctorProfile, this.profileForm.value)
        .subscribe((res: any) => {
          if (res?.success) {
            this.eventService.broadcastEvent(
              "profileDetailsChanged",
              this.profileForm.value
            );
            this.toastr.success("Profile has been updated");
          }
        });
    }
  }

  editForm() {
    this.apiSerive
      .get(API_ENDPOINTS.doctor.updateDoctorProfile, {})
      .subscribe((res: any) => {
        
        this.getFormValues = res?.result[0];

        
        

        if (this.getFormValues?.doctor?.profilePic) {
          this.isProfilePic = true;
        }
        this.profileForm.patchValue({
          profilePic: this.getFormValues?.doctor?.profilePic,
          fullName: this.getFormValues?.fullName,
          experience: this.getFormValues?.doctor?.experience,
          specialization: this.getFormValues?.doctor?.specialization,
          about: this.getFormValues?.doctor?.about,
        });
      });
  }
  specialization() {
    this.apiSerive
      .get(API_ENDPOINTS.MASTER.specialization, "")
      .subscribe((res: any) => {
        this.specializationList = res?.result?.data;
      });
  }
}
