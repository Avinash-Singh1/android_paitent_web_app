import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { InputValidationService } from "src/app/services/input-validation.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-give-feedback",
  templateUrl: "./give-feedback.component.html",
  styleUrls: ["./give-feedback.component.scss"],
})
export class GiveFeedbackComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public cValidator: InputValidationService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService
  ) {}
  docName: string;
  ngOnInit(): void {
    this.docName = this.localStorage.getItem("drName") || "";
    this.validateForm();
    this.route.queryParams.subscribe((params) => {
      if (params["id"]) {
        this.doctorId = params["id"];
        this.appointmentId = params["appointmentId"];
        this.establishmentId = params["estId"];
        this.getService();
      }
    });
  }
  establishmentId: any;
  appointmentId: any;
  available: any;
  recommend: any;
  feedbcakForm: FormGroup;
  submitted: boolean = false;
  feedbackGiven: boolean = false;

  validateForm() {
    this.feedbcakForm = this.fb.group({
      service: [""],
      waitTime: ["", [Validators.required]],
      // happyAbout: ["", [Validators.required]],
      happyAbout: this.fb.array([]),
      experience: ["", [Validators.required]],
      comment: ["", [Validators.required]],
      checkbox: [""],
      // keepAnonymous: ["", [Validators.required]],
    });
  }
  onCheckboxChange(e) {
    const checkArray: FormArray = this.feedbcakForm.get(
      "happyAbout"
    ) as FormArray;
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      checkArray.controls.forEach((item: FormControl) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }
  serviceArray: any = [];
  get f() {
    return this.feedbcakForm.controls;
  }
  doctorId: any;
  getService() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.doctorService}/${this.doctorId}`, {})
      .subscribe((res: any) => {
        this.serviceArray = res?.result;
      });
  }

  submit() {
    this.submitted = true;
    if (this.feedbcakForm.valid && this.recommend && this.available) {
      let obj = {
        appointmentId: this.appointmentId,
        doctorId: this.doctorId,
        establishmentId: this.establishmentId,
        experience: [
          {
            questionNo: 1,
            option: [this.available],
          },
          {
            questionNo: 3,
            option: [this.feedbcakForm.value.waitTime],
          },
          {
            questionNo: 4,
            option: [this.recommend],
          },
          {
            questionNo: 5,
            option: this.feedbcakForm.value.happyAbout,
          },
          {
            questionNo: 6,
            option: [this.feedbcakForm.value.experience],
          },
        ],
        feedback: this.feedbcakForm.value.comment,
        treatment: this.feedbcakForm.value.service,
        anonymous: this.feedbcakForm.value.checkbox || false,
      };

      this.apiService
        .post(`${API_ENDPOINTS.patient.addFeedback}`, obj)
        .subscribe((res: any) => {
          this.feedbackGiven = true;
        });
    }
  }
}
