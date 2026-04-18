import { Component, Input, OnInit, Optional, Renderer2, SimpleChanges, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { NgDialogAnimationService } from "ng-dialog-animation";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { TermsConditionComponent } from "src/app/modules/auth/terms-condition/terms-condition.component";
import { ApiService } from "src/app/services/api.service";
import { InputValidationService } from "src/app/services/input-validation.service";
import { ConfirmCosultationComponent } from "../confirm-cosultation/confirm-cosultation.component";
import { ToastrService } from "ngx-toastr";
import { Country } from "country-state-city";
import { LocalStorageService } from "src/app/services/storage.service";
import { EventService } from "src/app/services/event.service";
import { Router } from "@angular/router";
import { SeoService } from "src/app/services/seo.service";
import { CommonService } from "src/app/services/common.service";

@Component({
  standalone: false,
  selector: "nectar-enquiry",
  templateUrl: "./enquiry.component.html",
  styleUrls: ["./enquiry.component.scss"],
})
export class EnquiryComponent implements OnInit {
  @Input() city: string = ""; // Add city input
  @Input() surgeryTitle: string;  // Receive surgery title from the parent component
  @Input() popular_sergury_Data: any;  // Receive surgery title from the parent component
  constructor(
    private ngdialog: NgDialogAnimationService,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private fb: FormBuilder,
    public cValidator: InputValidationService,
    private toaster: ToastrService,
    private eventService: EventService,
    private router: Router,
    private seoService: SeoService,
    private renderer: Renderer2,
    private commonService: CommonService,
    @Optional() private bottomSheetRef: MatBottomSheetRef<EnquiryComponent>) { }

  closeSheet(): void {
    if (this.bottomSheetRef) {
      this.bottomSheetRef.dismiss();
    }
  }
  consultForm!: FormGroup;
  otpForm!: FormGroup;
  submitted: boolean = false;
  selectedCountryCode: any;
  otpSend: boolean = false;
  countryCodes: any;
  bottomSheet: boolean = false;
  deviceWidth: any;

  ngOnInit(): void {

    this.deviceWidth = this.commonService.gettingWinowWidth();
    // this.getCityListing();
    this.countryCodes = Country.getAllCountries();
    let item = this.countryCodes.find(
      (item) => item.name == this.localStorage.getItem("country")
    );
    if (item) {
      this.selectedCountryCode = item?.phonecode;

    } else {
      this.selectedCountryCode = "91";
    }
    this.validateForm();
    this.eventService.getEvent("remove-margin").subscribe((res: any) => {
      this.bottomSheet = true;
    });
    if (this.city) {
      const formattedCity = this.formatCityName(this.city);
      this.consultForm.patchValue({ city: formattedCity });
    }

    if (this.surgeryTitle) {
      this.consultForm.patchValue({ treatmentType: this.surgeryTitle });
    }
    // this.loadTreatments();
    this.handleInputChanges();

  }

  ngOnChanges(changes: SimpleChanges): void {
    // ngOnChanges will be triggered whenever any input property changes
    if (changes['popular_sergury_Data']) {
      // console.log('Popular surgery data has changed:', this.popular_sergury_Data);
      // Handle the updated value of popular_sergury_Data
      this.handleInputChanges();
    }
  }

  handleInputChanges() {
    // Perform actions based on the updated value of popular_sergury_Data
    // console.log('Handling input changes:', this.popular_sergury_Data);
  }

  validateForm() {
    this.consultForm = this.fb.group({
      phone: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
        ],
      ],
      name: ["", [Validators.required]],
      permission: [false],
      city: [this.city || "", [Validators.required]],  // Pre-fill city
      treatmentType: [null, [Validators.required]],  // Initialize treatmentType with null
      countryCode: "+" + this.selectedCountryCode,
    });
    this.otpForm = this.fb.group({
      otp: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  data: any;
  treatments: any = [];
  get control() {
    if (this.otpSend) {
      return this.otpForm.controls;
    } else {
      return this.consultForm.controls;
    }
  }

  onCountryChange(e: any) {
    this.selectedCountryCode = e.target.value;
  }

  setCheckboxValue() {
    let value = this.consultForm.get("permission")?.value;

    this.consultForm.patchValue({ permission: !value });
  }

  openDialog(value: boolean) {
    if (this.deviceWidth < 767) {
      this.router.navigate(["/terms-conditions"]);
      return;
    }
    if (this.consultForm.value.permission || value) {
      const dialogRef = this.ngdialog.open(TermsConditionComponent, {
        width: "80vw",
        animation: {
          to: "top",
          incomingOptions: {
            keyframeAnimationOptions: { duration: 400 },
          },
          outgoingOptions: {
            keyframeAnimationOptions: { duration: 400 },
          },
        },
      });
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (res) {
          this.consultForm.patchValue({ permission: true });
        } else {
          this.consultForm.patchValue({ permission: false });
        }
      });
    }
  }
  getCityListing() {
    this.apiService
      .get(API_ENDPOINTS.patient.getSurgeryList, { page: 1 })
      .subscribe((res: any) => {
        this.surgeryCount = res?.result?.count;
        this.treatments = res?.result?.data;
      });
  }
  surgeryCount: number;
  equiryId: any;
  enquire() {
    this.submitted = true;
    this.consultForm.value.countryCode = "+" + this.selectedCountryCode;
    if (this.consultForm.valid) {
      let obj = JSON.parse(JSON.stringify(this.consultForm.value));
      delete obj.permission;
      this.apiService
        .post(API_ENDPOINTS.patient.surgeryEnquiry, obj)
        .subscribe((res: any) => {
          this.submitted = false;
          this.seoService.appendScript(
            ` gtag('event', 'conversion', {'send_to': 'AW-11399196295/Psg_CN_K-PMYEIfdx7sq',});`,
            this.renderer
          );
          // this.equiryId = res?.result?.data?._id;
          // this.timer(59);
          const dialogRef = this.ngdialog.open(ConfirmCosultationComponent, {});
          dialogRef.afterClosed().subscribe((res: boolean) => {
            this.otpSend = false;
            this.submitted = false;
            this.consultForm.reset();
            this.resendOtpVlaue = false;
          });
        });
    }
  }

  onEdit() {
    this.otpSend = false;
  }

  resendOTP() {
    this.otpForm.get("otp").setValue("");
    const payload = {
      phone: this.consultForm.value.phone,
      id: this.equiryId,
    };
    this.apiService
      .post(API_ENDPOINTS.patient.resendEnquiry, payload)
      .subscribe((res: any) => {
        this.timer(59);
        this.toaster.success(res?.message);
      });
  }

  resendTime: any;
  resendOtpVlaue: boolean = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  timer(time: any) {
    if (!this.isBrowser) return;
    let min: any = Math.floor(time / 60);
    let sec: any = time % 60;

    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
    this.resendTime = min + ":" + sec;
    time -= 1;

    if (time >= 0) {
      this.resendOtpVlaue = true;
      setTimeout((x: any) => {
        this.timer(time);
      }, 1000);
      return;
    }
    this.resendTime = "";
    this.resendOtpVlaue = false;
  }
  submit() {
    this.submitted = true;
    if (this.otpForm.valid) {
      let obj = {
        otp: this.otpForm.value.otp,
        id: this.equiryId,
        phone: this.consultForm.value.phone,
      };
      this.apiService
        .put(API_ENDPOINTS.patient.verifyEnquiry, obj)
        .subscribe((res: any) => {
          const dialogRef = this.ngdialog.open(ConfirmCosultationComponent, {});
          dialogRef.afterClosed().subscribe((res: boolean) => {
            this.otpSend = false;
            this.submitted = false;
            this.consultForm.reset();
            this.otpForm.reset();
            this.resendOtpVlaue = false;
          });
        });
    }

  }
  loadTreatments() {
    this.apiService.get(API_ENDPOINTS.patient.getSurgeryList, { page: 1 })
      .subscribe((res: any) => {
        this.treatments = res?.result?.data;
        this.setPreSelectedValues();  // Set the treatment after loading
      });
  }

  setPreSelectedValues() {
    if (this.surgeryTitle) {
      const selectedTreatment = this.treatments.find(t =>
        t.title.trim().toLowerCase() === this.surgeryTitle.trim().toLowerCase()
      );
      if (selectedTreatment) {
        this.consultForm.get('treatmentType')?.setValue(selectedTreatment._id); // Set the treatment ID in the form control
      }
    }
  }
  // Method to format the city name
  formatCityName(city: string): string {
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  }
}
