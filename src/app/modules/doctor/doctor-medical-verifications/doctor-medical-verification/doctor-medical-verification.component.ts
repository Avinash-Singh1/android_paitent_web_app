import {
  Component,
  OnInit,
  Renderer2, Inject,
  DOCUMENT
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { catchError, of, switchMap } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { Router } from '@angular/router'; // Import Router

import { MENU_ITEMS } from "../../themes/sidemenu";


@Component({
  standalone: false,
  selector: "nectar-doctor-medical-verification",
  templateUrl: "./doctor-medical-verification.component.html",
  styleUrls: ["./doctor-medical-verification.component.scss"],
})
export class DoctorMedicalVerificationComponent implements OnInit {
  consultationForm: FormGroup;
  profileForm: FormGroup;
  getFormValues: any;
  menuItems = MENU_ITEMS;

  constructor(
    private renderer: Renderer2,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {

  }






  identityProofOptions = ['Aadhar Card', 'Driving Licence', 'Voter Card', 'Any Other Govt. ID'];
  medicalProofOptions = ['Medical Council Reg. Certificate', 'Professional Licence', 'Experience Certificate'];
  // establishmentProofOptions = ['Clinic Registration Proof', 'Tax Recipt', 'Other'];

  onDropdownChange() {
    this.consultationForm.updateValueAndValidity();
  }

  identityProofUrl: any
  medicalProofUrl: any
  establishmentProofUrl: any

  ngOnInit(): void {
    this.consultationForm = this.fb.group({
      consultationType: ['In-clinic'],
      consultationDetails: this.fb.group({
        isVideo: [true],
        isInClinic: [{ value: true, disabled: true }],
      }),
      regNum: ['', Validators.required],
      regCouncil: ['', Validators.required],
      regYear: ['', Validators.required],
      identityProof: ['', Validators.required],
      medicalProof: ['', Validators.required],
      identityFile: [null],
      medicalFile: [null],
      establishmentFile: [null],
    });
    // this.onConsultationTypeChange();
    this.validateForm();
    this.addFacebookPixelEventScript();

  }

  validateForm() {
    this.profileForm = this.fb.group({
      profilePic: [""],
      fullName: ["", [Validators.required]],
      specialization: [null, [Validators.required]],
      experience: [null, [Validators.required]],
      about: ["", [Validators.required]],
    });
    // Fetch data and patch values
    this.apiService.get(API_ENDPOINTS.doctor.updateDoctorProfile, {}).subscribe((res: any) => {
      if (res?.success && res?.result?.length) {


        this.getFormValues = res.result[0];

        // Patch profile form values
        this.profileForm.patchValue({
          profilePic: this.getFormValues?.doctor?.profilePic || '',
          fullName: this.getFormValues?.fullName || '',
          experience: this.getFormValues?.doctor?.experience || '',
          specialization: this.getFormValues?.doctor?.specialization || [],
          about: this.getFormValues?.doctor?.about || '',
        });

        // Patch consultation form values
        this.consultationForm.patchValue({
          consultationType: this.getFormValues?.doctor?.consultationType || 'In-clinic',
          consultationDetails: {
            isVideo: this.getFormValues?.doctor?.consultationDetails?.isVideo || false,
            isInClinic: this.getFormValues?.doctor?.consultationDetails?.isInClinic || true,
          },
          regNum: this.getFormValues?.doctor?.medicalRegistration?.[0]?.registrationNumber || '',
          regCouncil: this.getFormValues?.doctor?.medicalRegistration?.[0]?.council || '',
          regYear: this.getFormValues?.doctor?.medicalRegistration?.[0]?.year || '',
          identityProof: this.getFormValues?.doctor?.identityProof?.[0]?.urlType || '',
          medicalProof: this.getFormValues?.doctor?.medicalProof?.[0]?.urlType || '',
          establishmentProof: this.getFormValues?.doctor?.establishmentProof?.[0]?.urlType || '',

        });
        this.identityProofUrl = this.getFormValues?.doctor?.identityProof?.[0]?.url || ''
        this.medicalProofUrl = this.getFormValues?.doctor?.medicalProof?.[0]?.url || ''
        this.establishmentProofUrl = this.getFormValues?.doctor?.establishmentProof?.[0]?.url || ''
      }
    });
  }

  // onConsultationDetailChange(detailType: string, event: Event): void {
  //   const inputElement = event.target as HTMLInputElement;
  //   const consultationDetails = this.consultationForm.get('consultationDetails');

  //   consultationDetails.patchValue({
  //     [detailType]: inputElement.checked
  //   });
  // }




  onFileSelected(event: Event, controlName: string): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (file) {
      // Allowed file types
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error("Please upload a valid file (PNG, JPG, JPEG, or PDF).");
        return; // Exit the function if the file type is not allowed
      }

      // Upload file logic
      this.uploadFile(file).subscribe((fileUrl) => {
        if (controlName === 'identityProof') {
          this.identityProofUrl = fileUrl;
        }
        if (controlName === 'medicalProof') {
          this.medicalProofUrl = fileUrl;
        }
        if (controlName === 'establishmentProof') {
          this.establishmentProofUrl = fileUrl;
        }

      });
    }
  }

  removeFile(controlName: string): void {
    if (controlName == 'identityProof') {
      this.identityProofUrl = null; // Clear the image URL
    }
    if (controlName == 'medicalProof') {
      this.medicalProofUrl = null; // Clear the image URL
    }
  }



  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post(API_ENDPOINTS.COMMON.fileupload, formData).pipe(
      switchMap((res: any) => {
        if (res.success && res.result?.uri?.uri) {
          return of(res.result.uri.uri); // Return the file URL
        } else {
          this.toastr.error("File upload failed");
          return of(null);
        }
      }),
      catchError((error) => {
        console.error('File upload error:', error);
        this.toastr.error("An error occurred while uploading the file");
        return of(null);
      })
    );
  }

  onSubmit(): void {
    this.consultationForm.markAllAsTouched();
    if (this.consultationForm.valid) {
      if (!this.identityProofUrl || !this.medicalProofUrl) {
        this.toastr.error('Profile field required. Please upload proof files.');
        return; // Stop further execution
      }
      const formValue = this.consultationForm.value;
      const payload = {
        steps: 2,
        isEdit:
          formValue.regNum !== '' &&
          formValue.regCouncil !== '' &&
          formValue.consultationType !== '',
        isSaveAndExit: false,
        records: {
          doctor: {
            medicalRegistration: {
              registrationNumber: formValue.regNum,
              council: formValue.regCouncil,
              year: formValue.regYear,
            },
            identityProof: [
              {
                url: this.identityProofUrl,
                fileType: 'image',
                urlType: formValue.identityProof,
              },
            ],
            medicalProof: [
              {
                url: this.medicalProofUrl,
                fileType: 'image',
                urlType: formValue.medicalProof,
              },
            ],
          },
          consultationType: formValue.consultationType || 'In-clinic',
          consultationDetails: {
            isVideo: true,
            isInClinic: true,
          },
        },
      };

      // Call API service to update the medical verification profile
      this.apiService
        .put(API_ENDPOINTS.doctor.updatemedicalverificationProfile, payload)
        .subscribe({
          next: (res: any) => {
            if (res?.success) {
              this.toastr.success('Profile has been updated successfully.');
              this.router.navigate(['doctor/establishment']); // Replace with your target route
            } else {
              this.toastr.error('Unexpected response. Please try again.');
            }
          },
          error: (err) => {
            this.toastr.error('Failed to update profile. Please try again.');
          },
        });
    } else {
      // Show error message if the form is invalid
      this.toastr.error('Please provide all required fields.');
    }
  }



  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
  }

  onMenuClick() {
    const sideMenu = document.getElementById("sideMenu");
    const innerArea = document.getElementById("clickToCloseArea");
    if (sideMenu) {
      if (sideMenu.classList.contains("mobileMenu") && innerArea.classList.contains("openedSideBar")) {
        this.renderer.removeClass(sideMenu, "mobileMenu");
        this.renderer.removeClass(innerArea, "openedSideBar");


      } else {
        this.renderer.addClass(sideMenu, "mobileMenu");
        this.renderer.addClass(innerArea, "openedSideBar");
      }
    }
  }

  closeSideBar() {
    const innerArea = document.getElementById("clickToCloseArea");
    const sideMenu = document.getElementById("sideMenu");
    if (innerArea.classList.contains("openedSideBar")) {
      this.renderer.removeClass(innerArea, "openedSideBar");
      this.renderer.removeClass(sideMenu, "mobileMenu");

    }

  }


  onCloseMenuClick(event: Event) {
    event.stopPropagation();

    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }



  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent the default action of the anchor tag

    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;

    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display =
        submenu.style.display === "block" ? "none" : "block";

      // Optionally hide other submenus if needed
      const allSubmenus = document.querySelectorAll(".submenu");
      allSubmenus.forEach((sm) => {
        if (sm !== submenu) {
          (sm as HTMLElement).style.display = "none";
        }
      });
    }
  }


  // add by gurmeet
  addFacebookPixelEventScript(): void {
    const fbqScript = this.renderer.createElement('script');
    fbqScript.type = 'text/javascript';
    fbqScript.text = `
      fbq('track', 'CompleteRegistration', {
        value: 1,
        currency: 'USD'
      });
    `;
    // Get the <head> tag
    const head = this.document.head;
    this.renderer.appendChild(head, fbqScript);
    head.appendChild(fbqScript); // This explicitly makes it the last child
  }


  onInput(event: any) {
    // Allow only numbers and prevent non-numeric characters
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }


  //custom js end
  isMenuHidden = false;
  toggleMenu() {
    this.isMenuHidden = !this.isMenuHidden;
  }
}
