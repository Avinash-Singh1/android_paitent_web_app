import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-add-doctor-second",
  templateUrl: "./add-doctor-second.component.html",
  styleUrls: ["./add-doctor-second.component.scss"],
})
export class AddDoctorSecondComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    public matdialogRef: MatDialogRef<AddDoctorSecondComponent>,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.getListing();
    this.validateForm();
  }
  doctorDetailForm: FormGroup;
  specializationList = [];
  validateForm() {
    this.doctorDetailForm = this.fb.group({
      fullName: [{ value: "", disabled: true }, [Validators.required]],
      email: [{ value: "", disabled: true }],
      phone: [{ value: "", disabled: true }],
      specility: [null, [Validators.required]],
      consultationFees: ["", [Validators.required]],
    });
    this.doctorDetailForm.patchValue(this.data);
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.specialization, {}).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          this.specializationList = data;
          return;
        }
        this.specializationList = [];
      },
    });
  }
  get control() {
    return this.doctorDetailForm.controls;
  }
  onSubmit() {
    this.doctorDetailForm.markAllAsTouched();
    if (this.doctorDetailForm.valid) {
      const payload = {
        ...this.doctorDetailForm.value,
        phone: this.data.phone,
      };
      this.apiService
        .post(API_ENDPOINTS.hospital.addDoctor, payload)
        .subscribe({
          next: (res: any) => {
            this.toastr.success(res?.message);
            this.matdialogRef.close(true);
          },
        });
    }
  }
}
