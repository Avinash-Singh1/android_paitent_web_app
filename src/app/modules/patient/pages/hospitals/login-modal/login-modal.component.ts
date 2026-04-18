import { Component, Inject, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { VerifyModalComponent } from "../verify-modal/verify-modal.component";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { environment } from "src/environments/environment";

import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { ToastrService } from "ngx-toastr";
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { Router } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { TermsConditionsComponent } from "../../terms-conditions/terms-conditions.component";
import { NameInitialPipe } from "src/app/shared/pipes/name-initial.pipe";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NameInitialPipe],
  selector: "nectar-login-modal",
  templateUrl: "./login-modal.component.html",
  styleUrls: ["./login-modal.component.scss"],
})
export class LoginModalComponent implements OnInit {
  signForm!: FormGroup;
  submitted: boolean = false;
  userData: any;
  specializationList: string = '';
  specializationData: any;
  stateList: any;
  mailtoLink: string = '';
  userTime: any;
  userType: any;
  otp: any;
  phone: any;
  massage: string = '';
  formattedDate: string = '';
  formattedTime: string = '';
  name: string = ''
  signupUserFlag: boolean = false
  private isBrowser: boolean;
  constructor(private dialog: MatDialog, private fb: FormBuilder, private matdialogRef: MatDialogRef<LoginModalComponent>, private apiService: ApiService, private toastr: ToastrService, private localStorage: LocalStorageService, private router: Router, @Inject(MAT_DIALOG_DATA) public data: any,
    private apiSerive: ApiService, private eventService: EventService, public gService: GoogleMapsService,

    public dialogRef: MatDialogRef<TermsConditionsComponent>) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    const storedData = this.localStorage.getItem("loginUserDetails");
    const storedData2 = this.localStorage.getItem("doctor-detail");

    const TESTING = this.localStorage.getItem("doctorInformation");

    // console.log("TESTING", TESTING);
    // console.log("storedData ", storedData);
    // console.log("this.data ", this.data);

    this.userData = storedData ? JSON.parse(storedData) : null;
    // console.log("this.userData", this.userData);

    this.specializationData = storedData2 ? JSON.parse(storedData2) : null;

    if (this.specializationData?.specialization) {
      this.specializationList = this.specializationData.specialization.map((spec: any) => spec.name).join(', ');
    }
    const time = this.localStorage.getItem("appoint-time");
    const type = this.localStorage.getItem("appoint-type");
    this.userTime = storedData ? JSON.parse(time) : null;
    this.userType = storedData ? JSON.parse(type) : null;
    if (this.userTime) this.formattedDate = this.formatDate(this.userTime?.date);
    if (this.userTime?.time) this.formattedTime = this.formatTime(this.userTime?.time?.time);
  }

  formatDate(dateString: string): string {
    const dateObj = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: '2-digit' } as const;
    return dateObj.toLocaleDateString('en-US', options);
  }

  // Function to format time as "h:mm A"
  formatTime(timeString: string): string {
    const [time, modifier] = timeString.split(' '); // Split time and AM/PM
    let [hours, minutes] = time.split(':');
    hours = (parseInt(hours) % 12 || 12).toString(); // Convert to 12-hour format
    return `${hours}:${minutes} ${modifier}`;
  }
  openModal(modalId: string): void {
    if (this.isBrowser) {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        modalElement.classList.add("show", "d-block");
        modalElement.setAttribute("aria-modal", "true");
        modalElement.setAttribute("role", "dialog");
        modalElement.removeAttribute("aria-hidden");

        // Add the backdrop manually
        // const backdrop = document.createElement("div");
        // backdrop.classList.add("modal-backdrop", "fade", "show");
        // backdrop.id = `${modalId}-backdrop`; // Use a unique ID for the backdrop
        // document.body.appendChild(backdrop);
      }
    }
  }

  closeModal(modalId: string): void {
    if (this.isBrowser) {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        modalElement.classList.remove("show", "d-block");
        modalElement.removeAttribute("aria-modal");
        modalElement.removeAttribute("role");
        modalElement.setAttribute("aria-hidden", "true");
      }
    }
  }

  ngOnInit(): void {
    this.mail()
    this.openModal('enter_otp_modal')
    this.getState()

    this.signForm = this.fb.group({
      phone: ["", [Validators.required, Validators.minLength(10)]],
      name: [""],

    });
    if (this.data?.phone) {
      this.signForm.patchValue({ phone: this.data?.phone });
    }
  }
  get control() {
    return this.signForm.controls;
  }

  getState() {
    this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
      next: (res) => {
        this.stateList = res.result.data;
      },
      error: (error: any) => {
        this.stateList = [];
      },
    });
  }

  getStateName(stateId: string): string {
    const state = this.stateList.find((s) => s._id === stateId);
    return state ? state.name : 'Unknown State'; // Fallback if state not found
  }

  openGoogleMaps(item: any): void {

    if (item?.location?.coordinates?.[1] == 28.6448 && item?.location?.coordinates?.[0] == 77.216721) {
      const address = `${item?.address?.landmark} ${item?.address?.locality}, ${item?.address?.city}, ${this.getStateName(item?.address?.state)} ${item?.address?.pincode}`;

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

      if (this.isBrowser) {
        window.open(googleMapsUrl, '_blank');
      }
    }
    else {
      this.gService.redirectToGoogleMaps(
        item?.location?.coordinates?.[1],
        item?.location?.coordinates?.[0]
      )
    }
  }

  openVerify() {
    const userType = this.data?.type === 'hospital'
      ? APP_CONSTANTS.USER_TYPES.HOSPITAL
      : this.data?.type === 'doctor'
        ? APP_CONSTANTS.USER_TYPES.DOCTOR
        : APP_CONSTANTS.USER_TYPES.PATIENT;
    this.submitted = true;
    if (this.signForm.valid) {
      const payload: any = {
        fullName: this.data?.name,
        phone: `${this.signForm.value.phone}`,
        userType: userType,
        mode: 999
      };
      this.apiService.post(API_ENDPOINTS.auth.login, payload).subscribe({
        next: (res: any) => {
          this.toastr.success("Otp sent successfully");
          this.matdialogRef.close();
          this.dialog.open(VerifyModalComponent, {
            width: "484px",
            disableClose: true,
            data: {
              phone: this.signForm.value.phone,
              name: this.data?.name,
              autoFocus: false,
              claimProfile: true,
              type: this?.data?.type,
            },
          });
        },
        error: (error: any) => {
          if (userType == 1) {
            this.phone = this.signForm.get('phone').value
          }
        },
      });
    }
  }
  closeDialog() {
    this.matdialogRef.close();
  }
  changePhoneOrEmail() {
    this.closeModal('otp_verification_modal'); // Close the OTP modal
    this.openModal('signupModal');
  }

  signup() {
    if (this.name != '' && this.name.length > 5) {
      const payload: any = {
        fullName: this.name,
        phone: this.phone,
        userType: 1,
        countryCode: "+91",
      };
      this.apiSerive.post(API_ENDPOINTS.auth.register, payload).subscribe({
        next: (res) => {
          payload.permission = this.signForm.value.permission;
          payload.phone = this.signForm.value.phone;
          this.localStorage.setItem("signupForm", JSON.stringify(payload));
          this.localStorage.setItem("phone", this.signForm.value.phone);
          this.closeModal('signupModal')
          this.openModal("otp_verification_modal")
        },
        error: (err) => {
        },
      });
    }
    else {
      if (this.name.length < 5) {
        this.toastr.error("Full Name length should be greater than 5")
      }
      if (this.name == '') {
        this.toastr.error("Please Enter Name to Signup")
      }
    }

  }

  verifyOTP() {
    let payload: any = {
      otp: this.otp,
      deviceId: "123456",
      deviceToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjY5NjQxNTU3LCJpYXQiOjE2Njk1NTUxNTcsImp0aSI6IjRiY2IzMTVmM2M2MzQwYjY5MzM4NDdmYjIwNDk0NTUyIiwidXNlcl9pZCI6IjIxMDA1YmYxLTUzMDEtNDkyMS1iMDM1LWYxMTlhNTJjNzVmMSJ9.louVELbAMWzpUoNxhbF3-bilBFWUUJg4lsTXAIBie6I",
      deviceType: "desktop",
      browser: "chrome",
      os: "windows",
    };

    payload.phone = this.phone;
    payload.userType = 1;

    this.apiSerive.post(API_ENDPOINTS.auth.verifyOtp, payload).subscribe({
      next: (res: any) => {
        this.closeModal('otp_verification_modal')
        this.closeDialog()
        this.localStorage.removeItem("phone");
        this.localStorage.removeItem("signupForm");
        this.localStorage.setItem("isLogged", true);
        const { userType, findUser, token, approvalStatus } = res.result;
        this.localStorage.setItem("userType", userType);
        this.localStorage.setItem("approvalStatus", approvalStatus);
        this.localStorage.setItem("token", token);
        this.localStorage.setItem("userDetail", JSON.stringify(findUser));

        // subscribing current route in case of templates

        // if (this.paramsData?.isEmail && this.paramsData?.user) {
        //   this.eventService.broadcastEvent("login", true);
        //   this.router.navigate([`/${this.paramsData.route}`], {
        //     queryParams: { id: this.paramsData.id },
        //   });
        //   return;
        // }

        // redirecting to  book appointment

        // if (this.localStorage.getItem("appointmentBooking")) {
        //   this.eventService.broadcastEvent("login", true);
        //   this.router.navigate(["/appointment-booking"]);
        //   return;
        // }

        // sthis.router.navigate(["/"]);
        this.eventService.broadcastEvent("login", true);
      },
      error: (error: any) => {
      },
    });
  }

  copyText(value: string) {
    if (this.isBrowser) {
      navigator.clipboard.writeText(value).then(
        () => {
          /* Resolved - text copied to clipboard successfully */
        },
        () => {
          /* Rejected - text failed to copy to the clipboard */
        }
      );
      navigator.permissions
        .query({ name: "write-on-clipboard" as PermissionName })
        .then((result) => {
          if (result.state == "granted" || result.state == "prompt") {
            alert("Write access granted!");
          }
        });
    }
  }

  openDialog(value: boolean) {
    this.dialog.open(TermsConditionsComponent, {
      width: '1000px',
      panelClass: 'custom-dialog-container', // Add a custom class for additional styling
      data: { isAccepted: value },          // Pass data if needed
    });
  }

  mail() {
    if (this.isBrowser) {
      const currentUrl = window.location.href; // Full URL of the current page
      const subject = encodeURIComponent('Subject: I want Claim my Profile');
      const body = encodeURIComponent(
        `Hi,\n\nI am referring to this Url page: ${currentUrl}\n`
      );
      this.mailtoLink = `mailto:info@nectarplus.health?subject=${subject}&body=${body}`;
    }
  }

  phoneNumber = environment.mobile;

  get whatsappLink(): string {
    return `https://api.whatsapp.com/send?phone=${this.phoneNumber
      }&text=${encodeURIComponent(this.massage)}`;
  }
}

