import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from "@ngx-translate/core";
import { ApiService } from "src/app/services/api.service";
import { MatDialog } from "@angular/material/dialog";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from "src/app/services/common.service";
import { forkJoin, EMPTY, Subject, Observable } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

declare var $: any; // Declare jQuery

@Component({
  standalone: false,
  selector: "nectar-doctor-profile",
  // standalone: false,
  // providers:[],
  // imports: [TranslateModule, DoctorHospitalSharedModule,FormsModule,ReactiveFormsModule,NgSelectModule,NgIf,NgFor],
  templateUrl: "./doctor-profile.component.html",
  styleUrls: ["./doctor-profile.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorProfileComponent implements AfterViewInit, OnDestroy{
  //custom js start
  private destroy$ = new Subject<void>();
  imageUrl: string | ArrayBuffer | null = null;
  profile: any;
  specializationList: any;
  profileForm: FormGroup;
  educationList: any;
  awardList: any;
  membershipList: any;
  socialList:any
  getFormValues: any;
  educationForm: FormGroup;
  awardForm: FormGroup;
  memberFrom: FormGroup;
  socialForm: FormGroup;
  socialTypes:any
  years: number[] = [];
  profileId:any

  newEducationList: any[] = [];

  fieldToEdit: string = ''; // To track if we're editing phone or email
  updatedValue: string = ''; // To store the updated phone/email value
  otp: string = ''; // To store OTP input
  newMemberList: any[] = [];
  deviceWidth: any;

   // Opens the modal to edit phone or email
   openEditModal(field: string) {
    this.fieldToEdit = field;
    this.updatedValue = this.profileForm.get(field)?.value;
    this.openModal('edit_phone_email_modal');
  }
//profilepic  change
  openEditModalprofile(field: string) {
    this.fieldToEdit = field;
    this.updatedValue = this.profileForm.get(field)?.value;
    this.openModal('chnageprfilepic');
  }


   // Sends OTP when Continue is pressed after updating phone/email
   sendOTP() {
    if(this.updatedValue.length<10){
      this.toastr.error('Phone Number Should be 10 letters.');

    }
    else if(this.updatedValue.length>10){
      this.toastr.error('Phone Number Should be 10 letters.');

    }
    else {
      const apiEndpoint = this.fieldToEdit === 'phone' ? API_ENDPOINTS.new.EditProfilePhoneOtp : API_ENDPOINTS.new.EditProfileEmailOtp;


      let payload: { phone?: string; userType: number; countryCode?: string; email?: string; }

      if(this.fieldToEdit === 'phone'){
        payload = {
          phone: this.updatedValue,
          userType: 2,
          countryCode: '+91'
        };
      }
      else{
        payload = {
          email: this.updatedValue,
          userType: 2,
        };

      }
      this.apiService.post(apiEndpoint, payload).subscribe(
        (res: any) => {
          if (res.success) {
            this.toastr.success('OTP Sent');

            this.closeModal('edit_phone_email_modal');
            this.openModal('otp_verification_modal');
          }
        },
        (err) => {
        }
      );
    }


  }

  changePhoneOrEmail() {
    this.closeModal('otp_verification_modal'); // Close the OTP modal
    this.openModal('edit_phone_email_modal'); // Reopen the edit modal
  }
    // Verifies the OTP
    verifyOTP() {

      const apiEndpoint = this.fieldToEdit === 'phone' ? API_ENDPOINTS.new.verifyProfilePhoneOtp : API_ENDPOINTS.new.verifyProfileEmailOtp;
      const payload = { [this.fieldToEdit]: this.updatedValue, otp: this.otp, userType:2, userId:this.profileId };

      this.apiService.post(apiEndpoint, payload).subscribe(
        (res: any) => {
          if (res.success) {
            this.toastr.success(`${this.fieldToEdit === 'phone' ? 'Phone' : 'Email'} updated successfully`);
            this.closeModal('otp_verification_modal');
            // Update form with new value
            this.profileForm.get(this.fieldToEdit)?.setValue(this.updatedValue);
          } else {
            this.toastr.error('OTP verification failed');
          }
        },
        (err) => {
          this.toastr.error('Failed to verify OTP');
        }
      );
    }

// Toggle edit mode for a specific item
toggleEdit(index: number) {
  this.educationList[index].isEdit = true;
}


  private isBrowser: boolean;

  constructor(private renderer: Renderer2, private el: ElementRef,
    private fb: FormBuilder,
    private commonService: CommonService,

    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private router: Router,

    public toastr: ToastrService) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.validateForm();
    this.generateExperienceYears();

    this.educationForm = this.fb.group({
      degree: ['', Validators.required],
      college: ['', Validators.required],
      year: ['', Validators.required],
      _id: ['']
    });


    this.awardForm = this.fb.group({
      name: ['', Validators.required],
      year: [''],
      _id: ['']
    });
    this.memberFrom = this.fb.group({
      name: ['', Validators.required],
      _id: ['']
    });
    this.socialForm = this.fb.group({
      socialMediaId: ['', Validators.required],
      url: ['', Validators.required],
      _id: ['']
    });

  }

  ngAfterViewInit() {
    // Initialize Bootstrap tooltips
    if (this.isBrowser) {
      $('[data-toggle="tooltip"]').tooltip();
    }


  }

// Save changes for an existing education record

// Mark the education item as edited
markEducationAsEdited(item: any) {
  item.isEdited = true; // Mark the item as edited when any field is changed
}

// Save function for both new and existing education records
saveEducation2() {
  // Validate the new education fields first
  const isValid = this.validateNewEducation();
  if (!isValid) {
    this.toastr.error('Please fill all required fields for new entries.');
    return; // Stop if validation fails
  }

  // Prepare API calls for the modified existing items
  const modifiedExistingItems = this.educationList
    .filter(item => item.isEdited) // Filter only the edited items
    .map(item => {
      const updatedRecord = {
        type: 1,
        isEdit: true,
        records: {
          degree: item.degree,
          college: item.college,
          year: item.year
        }
      };
      // Send PUT request for each modified item
      return this.apiService
        .put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, updatedRecord)
        .toPromise();
    });

  // Prepare API calls for the new items (if any)
  const newItems = this.newEducationList.map(newItem => {
    const newRecord = {
      type: 1,
      isEdit: false, // New record, so isEdit is false
      records: {
        degree: newItem.degree,
        college: newItem.college,
        year: newItem.year
      }
    };
    return this.apiService.put(API_ENDPOINTS.doctor.settingList, newRecord).toPromise();
  });

  // Combine API calls for both modified existing items and new items
  const apiCalls = [...modifiedExistingItems, ...newItems];

  // Execute all API calls
  Promise.all(apiCalls)
    .then((responses: any[]) => {
      const allSuccess = responses.every(res => res.success);

      if (allSuccess) {
        this.toastr.success('Education records saved successfully');
        this.getListing(); // Refresh the list after saving
        this.newEducationList = []; // Clear the new education list
        this.closeModal('add_editucaiton_modal'); // Close the modal
      } else {
        this.toastr.error('Some records failed to save.');
      }
    })
    .catch((err) => {
      this.toastr.error('Failed to save education records');
    });
}
saveEducation() {
  const isValid = this.validateNewEducation();
  if (!isValid) {
    this.toastr.error('Please fill all required fields for new entries.');
    return;
  }

  // Prepare modified items from editedEducationList
  const modifiedExistingItems = this.educationList
    .filter(item => item.isEdited)
    .map(item => {
      const updatedValues = this.editedEducationList[item._id];
      const updatedRecord = {
        type: 1,
        isEdit: true,
        records: {
          degree: updatedValues?.degree || '',
          college: updatedValues?.college || '',
          year: updatedValues?.year || ''
        }
      };
      return this.apiService
        .put(`${API_ENDPOINTS.doctor.settingList}?recordId=${item._id}`, updatedRecord)
        .toPromise();
    });

  const newItems = this.newEducationList.map(newItem => {
    const newRecord = {
      type: 1,
      isEdit: false,
      records: {
        degree: newItem.degree,
        college: newItem.college,
        year: newItem.year
      }
    };
    return this.apiService.put(API_ENDPOINTS.doctor.settingList, newRecord).toPromise();
  });

  const apiCalls = [...modifiedExistingItems, ...newItems];

  Promise.all(apiCalls)
    .then((responses: any[]) => {
      const allSuccess = responses.every(res => res.success);

      if (allSuccess) {
        this.toastr.success('Education records saved successfully');
        this.getListing();
        this.newEducationList = [];
        this.closeModal('add_editucaiton_modal');
      } else {
        this.toastr.error('Some records failed to save.');
      }
    })
    .catch(() => {
      this.toastr.error('Failed to save education records');
    });
}

editedEducationList: { [key: string]: any } = {};

// Edit Award
editAward(item: any) {
  this.awardForm.patchValue({
    name: item.name,
    year: item.year,
    _id: item._id
  });
  this.openModal('awards_recognitions_modal');
}

editMembership(item: any) {
  this.memberFrom.patchValue({
    name: item.name,
    _id: item._id
  });
  this.openModal('membership_modal');
}
editSocial(item: any) {
  this.socialForm.patchValue({
    socialMediaId: item.socialMediaId,
    url: item.url,
    _id: item._id
  });
  this.openModal('social_websites_modal');
}

markAwardAsEdited(item: any) {
  item.isEdited = true;
}

markMemberAsEdited(item: any) {
  item.isEdited = true;
}
markSocialAsEdited(item: any) {
  item.isEdited = true;
}

deleteAward(item: any) {
  const updatedRecord = {
    type: 2,
    isEdit: true,
    isDeleted: true,
  };

  this.apiService
    .put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, updatedRecord)
    .subscribe((res: any) => {
      if (res.success) {
        this.toastr.success('Award deleted successfully');
        this.getawardListing(); // Refresh the list
        this.closeModal('awards_recognitions_modal');
      }
    });
}

// Add More Award
// Add more awards (for new awards)
addMoreAward() {
  this.newAwardList.push({
    name: '',
    year: '',
    nameError: false,
    yearError: false,
  });
}
addMoreMember() {
  this.newMemberList.push({
    name: '',
    nameError: false,
  });
}

onFieldChange(field: string, newItem: any): void {
  if (field === 'degree' && newItem.degree) {
    newItem.degreeError = false;
  }
  if (field === 'awardName' && newItem.name) {
    newItem.nameError = false;
  }
  if (field === 'membershipName' && newItem.name) {
    newItem.nameError = false;
  }
  if (field === 'college' && newItem.college) {
    newItem.collegeError = false;
  }
  if (field === 'year' && newItem.year) {
    newItem.yearError = false;
  }
  if (field === 'socialLink' && newItem.url) {
    newItem.urlError = false;
  }
}
addMoreEducation() {
  this.newEducationList.push({
    degree: '',
    college: '',
    year: '',
    degreeError: false,
    collegeError: false,
    yearError: false,
  });
}
addMoreSocial() {
  this.newSocialList.push({
    url: '',
    socialMediaId: '',
    urlError: false,
    socialMediaIdError: false,
  });
}

deleteNewEducation(index: number) {
  this.newEducationList.splice(index, 1);
}
deleteNewMember(index: number) {
  this.newMemberList.splice(index, 1);
}
deleteNewSocial(index: number) {
  this.newSocialList.splice(index, 1);
}

validateSocial(): boolean {
  let isValid = true;

  // Validate new awards
  this.newSocialList.forEach((newItem, index) => {
    // Reset errors for each item
    newItem.urlError = !newItem.url || newItem.url.trim().length === 0;
    newItem.socialMediaIdError = !newItem.socialMediaId;



    // Short-circuit if any field is invalid
    if (newItem.urlError || newItem.socialMediaIdError) {
      isValid = false;
      console.warn(`New Social ${index + 1} is invalid.`);
    }
  });

  // Validate edited awards
  this.socialList.forEach((item, index) => {
    if (item.isEdited) {
      // Reset errors for each item
      item.urlError = !item.url || item.url.trim().length === 0;
      item.socialMediaIdError = !item.socialMediaId;

      // Log current state for debugging


      // Short-circuit if any field is invalid
      if (item.urlError || item.socialMediaIdError) {
        isValid = false;
        console.warn(`Edited Award ${index + 1} is invalid.`);
      }
    }
  });

  // Final validation result log
  return isValid;
}

validateAwards(): boolean {
  let isValid = true;

  // Validate new awards
  this.newAwardList.forEach((newItem, index) => {
    // Reset errors for each item
    newItem.nameError = !newItem.name || newItem.name.trim().length === 0;


    // Log current state for debugging

    // Short-circuit if any field is invalid
    if (newItem.nameError ) {
      isValid = false;
      console.warn(`New Award ${index + 1} is invalid.`);
    }
  });

  // Validate edited awards
  this.awardList.forEach((item, index) => {
    if (item.isEdited) {
      // Reset errors for each item
      item.nameError = !item.name || item.name.trim().length === 0;

      // Log current state for debugging

      // Short-circuit if any field is invalid
      if (item.nameError ) {
        isValid = false;
        console.warn(`Edited Award ${index + 1} is invalid.`);
      }
    }
  });

  // Final validation result log
  return isValid;
}

validateMember(): boolean {
  let isValid = true;

  // Validate new awards
  this.newMemberList.forEach((newItem, index) => {
    // Reset errors for each item
    newItem.nameError = !newItem.name || newItem.name.trim().length === 0;

    // Short-circuit if any field is invalid
    if (newItem.nameError ) {
      isValid = false;
      console.warn(`New Membership ${index + 1} is invalid.`);
    }
  });

  // Validate edited awards
  this.membershipList.forEach((item, index) => {
    if (item.isEdited) {
      // Reset errors for each item
      item.nameError = !item.name || item.name.trim().length === 0;


      if (item.nameError ) {
        isValid = false;
        console.warn(`Edited Membership ${index + 1} is invalid.`);
      }
    }
  });

  // Final validation result log
  return isValid;
}

saveAllSocial(): void {
  if (!this.validateSocial()) {
    this.toastr.error('Please fill all required fields.');
    return;
  }

  const apiCalls$: Observable<any>[] = [];

  // Add API calls for new social links
  this.newSocialList.forEach((newItem) => {
    if (!newItem.urlError && !newItem.socialMediaIdError) {
      const newRecord = {
        type: 8,
        isEdit: false,
        records: {
          socialMediaId: newItem.socialMediaId,
          url: newItem.url
        }
      };
      apiCalls$.push(this.apiService.put(API_ENDPOINTS.doctor.settingList, newRecord).pipe(catchError(() => EMPTY)));
    }
  });

  // Add API calls for edited social links
  this.socialList.forEach((item) => {
    if (item.isEdited && !item.urlError && !item.socialMediaIdError) {
      const updatedRecord = {
        type: 8,
        isEdit: true,
        records: {
          socialMediaId: item.socialMediaId,
          url: item.url
        }
      };
      apiCalls$.push(this.apiService.put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, updatedRecord).pipe(catchError(() => EMPTY)));
    }
  });

  if (!apiCalls$.length) return;

  forkJoin(apiCalls$).subscribe({
    next: (responses: any[]) => {
      const allSuccess = responses.every(res => res.success);
      if (allSuccess) {
        this.toastr.success('Social saved successfully');
        this.newSocialList = [];
        this.getsocialList();
        this.closeModal('social_websites_modal');
      } else {
        this.toastr.error('Some Social failed to save.');
      }
    },
    error: () => this.toastr.error('Failed to save social'),
  });
}

saveAllAwards(): void {
  if (!this.validateAwards()) {
    this.toastr.error('Please fill all required fields.');
    return;
  }

  const apiCalls$: Observable<any>[] = [];

  // Add API calls for new awards
  this.newAwardList.forEach((newItem) => {
    if (!newItem.nameError && !newItem.yearError) {
      const newRecord = {
        type: 2,
        isEdit: false,
        records: {
          name: newItem.name,
          year: newItem.year
        }
      };
      apiCalls$.push(this.apiService.put(API_ENDPOINTS.doctor.settingList, newRecord).pipe(catchError(() => EMPTY)));
    }
  });

  // Add API calls for edited awards
  this.awardList.forEach((item) => {
    if (item.isEdited && !item.nameError && !item.yearError) {
      const updatedRecord = {
        type: 2,
        isEdit: true,
        records: {
          name: item.name,
          year: item.year
        }
      };
      apiCalls$.push(this.apiService.put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, updatedRecord).pipe(catchError(() => EMPTY)));
    }
  });

  if (!apiCalls$.length) return;

  forkJoin(apiCalls$).subscribe({
    next: (responses: any[]) => {
      const allSuccess = responses.every(res => res.success);
      if (allSuccess) {
        this.toastr.success('Awards saved successfully');
        this.newAwardList = [];
        this.getawardListing();
        this.closeModal('awards_recognitions_modal');
      } else {
        this.toastr.error('Some awards failed to save.');
      }
    },
    error: () => this.toastr.error('Failed to save awards'),
  });
}

saveAllMember(): void {
  if (!this.validateMember()) {
    this.toastr.error('Please fill all required fields.');
    return;
  }

  const apiCalls$: Observable<any>[] = [];

  // Add API calls for new members
  this.newMemberList.forEach((newItem) => {
    if (!newItem.nameError ) {
      const newRecord = {
        type: 4,
        isEdit: false,
        records: {
          name: newItem.name,
        }
      };
      apiCalls$.push(this.apiService.put(API_ENDPOINTS.doctor.settingList, newRecord).pipe(catchError(() => EMPTY)));
    }
  });

  // Add API calls for edited members
  this.membershipList.forEach((item) => {
    if (item.isEdited && !item.nameError) {
      const updatedRecord = {
        type: 2,
        isEdit: true,
        records: {
          name: item.name,
        }
      };
      apiCalls$.push(this.apiService.put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, updatedRecord).pipe(catchError(() => EMPTY)));
    }
  });

  if (!apiCalls$.length) return;

  forkJoin(apiCalls$).subscribe({
    next: (responses: any[]) => {
      const allSuccess = responses.every(res => res.success);
      if (allSuccess) {
        this.toastr.success('Membership saved successfully');
        this.newAwardList = [];
        this.getmembership();
        this.closeModal('membership_modal');
      } else {
        this.toastr.error('Some Memberships failed to save.');
      }
    },
    error: () => this.toastr.error('Failed to save memberships'),
  });
}

validateNewEducation() {
  let isValid = true;
  this.newEducationList.forEach((item, idx) => {
    item.degreeError = !item.degree;
    item.collegeError = !item.college;
    item.yearError = !item.year;

    if (!item.degree || !item.college || !item.year) {
      isValid = false;
    }
  });

  return isValid;
}

  generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 60; // 40 years back

    this.years = [];
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year);
    }
  }

  generateExperienceYears() {
    for (let i = 1; i <= 70; i++) {
      this.experinenceYear.push({ label: `${i} Years of Experience`, value: i });
    }
  }
  onMenuClick() {
    if (!this.isBrowser) return;
    const sideMenu = document.getElementById("sideMenu");
    const innerArea = document.getElementById("clickToCloseArea");
    if (sideMenu) {
      if (sideMenu.classList.contains("mobileMenu") && innerArea.classList.contains("openedSideBar")  ) {
        this.renderer.removeClass(sideMenu, "mobileMenu");
        this.renderer.removeClass(innerArea, "openedSideBar");

      } else {
        this.renderer.addClass(sideMenu, "mobileMenu");
        this.renderer.addClass(innerArea, "openedSideBar");
      }
    }
  }

  closeSideBar(){
    if (!this.isBrowser) return;
    const innerArea = document.getElementById("clickToCloseArea");
    const sideMenu = document.getElementById("sideMenu");
  if (innerArea.classList.contains("openedSideBar")) {
    this.renderer.removeClass(innerArea, "openedSideBar");
    this.renderer.removeClass(sideMenu, "mobileMenu");

  }

  }

  get control() {
    return this.profileForm.controls;
  }
  validateForm() {
    this.profileForm = this.fb.group({
      profilePic: [""],
      fullName: ["", [Validators.required]],
      specialization: [null, [Validators.required]],
      experience: [null, [Validators.required]],
      about: ["", [Validators.required]],
      email: ["", [Validators.required]],
      phone: ["", [Validators.required]],
      gender: ["", [Validators.required]],
    });
  }
  isProfilePic: boolean = false;

  // getListing() {
  //   this.apiService
  //     .get(API_ENDPOINTS.doctor.settingList+"?type=1","" )
  //     .subscribe((res: any) => {
  //       this.educationList = res?.result?.list;
  //     });
  // }

  getListing() {
    this.apiService
      .get(API_ENDPOINTS.doctor.settingList + "?type=1", "")
      .subscribe((res: any) => {
        this.educationList = res?.result?.list;

        // Create a copy for editing
        this.educationList.forEach(item => {
          this.editedEducationList[item._id] = { ...item }; // Copy each item
        });
      });
  }

  toLowerCase(item:any){
    return item.toLowerCase()
  }

  getsocialList() {
    this.apiService
      .get(API_ENDPOINTS.doctor.settingList+"?type=8","")
      .subscribe((res: any) => {
        this.socialList =res?.result?.list;
      });

    }



    getSocialMediaName(socialMediaId: string): string | undefined {
      const selectedType = this.socialTypes.find(type => type._id === socialMediaId);
      return selectedType ? selectedType.name : undefined;
    }

    selectSocialMedia(item: any, type: any) {
      item.socialMediaId = type._id;
      this.markSocialAsEdited(item); // Keep the functionality you mentioned intact
    }


  getSocialtypes() {
    this.apiService
      .get(API_ENDPOINTS.doctor.social, {})
      .subscribe((res: any) => {
        this.socialTypes =res?.result?.data;
      });
  }

selectNewSocialMedia(newItem:any,type: any) {
  newItem.socialMediaId = type._id;
  newItem.socialMediaIdError=false

}

  getawardListing() {
    this.apiService
      .get(API_ENDPOINTS.doctor.settingList+"?type=2","" )
      .subscribe((res: any) => {
        this.awardList = res?.result?.list;
      });
  }
  getmembership() {
    this.apiService
      .get(API_ENDPOINTS.doctor.settingList+"?type=4","" )
      .subscribe((res: any) => {
        this.membershipList = res?.result?.list;
      });
  }

  triggerFileInput() {
    if (!this.isBrowser) return;
    const fileInput = document.getElementById('profile-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

onFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input?.files?.length) {
    this.apiService.fileUpload(input.files[0]).subscribe({
      next: (res: any) => {
        this.isProfilePic = true;
        this.control["profilePic"].setValue(res.result?.uri?.uri);
      },
      error: (error: any) => {
      },
    });
  }
}

openFileInput() {
  if (!this.isBrowser) return;
  const fileInput = document.getElementById('profile-upload') as HTMLInputElement;
  fileInput.click();
}

  experinenceYear = [];

  generateList() {
    for (let i = 0; i <= 70; i++) {
      this.experinenceYear.push({ label: String(i), value: String(i) });
    }
  }

  submitForm() {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.valid) {
      // Remove null values from the form
      Object.keys(this.profileForm.value).forEach((key) => {
        if (this.profileForm.value[key] === null) {
          delete this.profileForm.value[key];
        }
      });

      // Convert the gender field back to an integer
      if (this.profileForm.value.gender) {
        this.profileForm.value.gender = parseInt(this.profileForm.value.gender, 10);
      }

      // Check if profilePic is empty and handle the default image
      if (this.isProfilePic==false) {
        // Read the sample image file from the assets folder
        this.setDefaultProfilePic();
      } else {
        this.uploadProfileData();
      }
    }
  }

  // Function to handle setting default profile picture from assets
  setDefaultProfilePic() {
    const sampleImageUrl = 'assets/images/svg/nectarLogo.png';

    fetch(sampleImageUrl).then(res => res.blob()).then(blob => {
      const file = new File([blob], "defaultProfilePic.png", { type: 'image/png' });

      // Simulate the upload process for the default image
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {

          this.control['profilePic'].setValue(res.result?.uri?.uri);
          this.uploadProfileData();  // Proceed to upload the form data after setting the image
        },
        error: (error: any) => {
        }
      });
    });
  }

  // Function to submit profile data
  uploadProfileData() {
    this.apiService
      .put(API_ENDPOINTS.doctor.updateDoctorProfile, this.profileForm.value)
      .subscribe((res: any) => {
        if (res?.success) {
          // Broadcast profile change event
          this.eventService.broadcastEvent(
            'profileDetailsChanged',
            this.profileForm.value
          );

          // Toggle edit mode or close form
          this.editForm();

          // Show success message
          this.toastr.success('Profile has been updated');
          this.closeModal('edit_profile_modal');
        }
      });
  }


  onCloseMenuClick() {
    if (!this.isBrowser) return;
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
      if (this.isBrowser) {
        const allSubmenus = document.querySelectorAll(".submenu");
        allSubmenus.forEach((sm) => {
          if (sm !== submenu) {
            (sm as HTMLElement).style.display = "none";
          }
        });
      }
    }
  }

  editItem(item: any) {
    this.educationForm.patchValue({
      degree: item.degree,
      college: item.college,
      year: item.year,
      _id: item._id
    });
    this.openModal('add_editucaiton_modal');
  }



  openEditEducationModal(education: any) {
    this.educationForm.patchValue({
      degree: education.degree,
      college: education.college,
      year: education.year,
      _id: education._id
    });
    this.openModal('add_editucaiton_modal');
  }
// Save New Awards

// Validate awards
validateNewAward() {
  let isValid = true;
  this.newAwardList.forEach((item) => {
    item.nameError = !item.name;
    item.yearError = !item.year;

    if (!item.name || !item.year) {
      isValid = false;
    }
  });

  return isValid;
}

saveNewAward() {
  const isValid = this.validateNewAward();

  if (!isValid) {
    this.toastr.error('Please fill all required fields.');
    return;
  }

  const apiCalls = this.newAwardList.map((newItem) => {
    const newRecord = {
      type: 2,
      isEdit: false,
      records: {
        name: newItem.name,
        year: newItem.year,
      }
    };
    return this.apiService.put(API_ENDPOINTS.doctor.settingList, newRecord).toPromise();
  });

  Promise.all(apiCalls)
    .then((responses: any[]) => {
      const allSuccess = responses.every(res => res.success);

      if (allSuccess) {
        this.toastr.success('Awards saved successfully');
        this.getListing(); // Refresh list
        this.newAwardList = []; // Clear new award list
        this.closeModal('awards_recognitions_modal'); // Close modal
      } else {
        this.toastr.error('Some awards failed to save.');
      }
    })
    .catch(() => {
      this.toastr.error('Failed to save awards');
    });
}



  saveMembership() {
    const membershipData = this.memberFrom.value;

    if (membershipData._id) {
      // Edit existing record
      const newRecord = {
        type: 4,
        isEdit: true,
        records: {
          name: membershipData.name,
        }
      };
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList + `?recordId=${membershipData._id}`, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Membership record updated successfully');
            this.getmembership(); // Refresh the list
            this.closeModal('membership_modal');
          }
        });
    } else {
      // Add new record
      const newRecord = {
        type: 4,
        isEdit: false,
        records: {
          name: membershipData.name,
        }
      };
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Membership record added successfully');
            this.getmembership(); // Refresh the list
            this.closeModal('membership_modal');
          }
        });
    }
  }

// Delete new award entry
deleteNewAward(index: number) {
  this.newAwardList.splice(index, 1);
}
// Validate new awards
validateNewAwards() {
  let isValid = true;
  this.newAwardList.forEach(item => {
    item.nameError = !item.name;
    item.yearError = !item.year;

    if (!item.name || !item.year) {
      isValid = false;
    }
  });

  return isValid;
}

  saveAward() {
    const awardData = this.awardForm.value;

    if (awardData._id) {
      // Edit existing record
      const newRecord = {
        type: 2,
        isEdit: true,
        records: {
          name: awardData.name,
          year: awardData.year
        }
      };
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList + `?recordId=${awardData._id}`, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Award record updated successfully');
            this.getawardListing(); // Refresh the list
            this.closeModal('awards_recognitions_modal');
          }
        });
    } else {
      // Add new record
      const newRecord = {
        type: 2,
        isEdit: false,
        records: {
          name: awardData.name,
          year: awardData.year
        }
      };
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Award record added successfully');
            this.getawardListing(); // Refresh the list
            this.closeModal('awards_recognitions_modal');
          }
        });
    }
  }

  saveSocial() {
    const socialData = this.socialForm.value;

    if (socialData._id) {
      // Edit existing record
      const newRecord = {
        type: 8,
        isEdit: true,
        records: {
          socialMediaId: socialData.socialMediaId,
          url: socialData.url
        }
      };
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList + `?recordId=${socialData._id}`, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Social record updated successfully');
            this.getawardListing(); // Refresh the list
            this.closeModal('social_websites_modal');
          }
        });
    } else {
      // Add new record
      const newRecord = {
        type: 8,
        isEdit: false,
        records: {
          socialMediaId: socialData.socialMediaId,
          url: socialData.url
        }
      };
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Social record added successfully');
            this.getsocialList(); // Refresh the list
            this.closeModal('social_websites_modal');
          }
        });
    }
  }

  deleteEducation(item:any) {

      // Edit existing record
      const newRecord =
      {
        type: 1,
        isEdit: true,
        isDeleted: true
    }
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Education record deleted successfully');
            this.getListing(); // Refresh the list
            this.closeModal('add_editucaiton_modal');
          }
        });


  }

  deleteMembership(item:any) {

      // Edit existing record
      const newRecord =
      {
        type: 4,
        isEdit: true,
        isDeleted: true
    }
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Membership record deleted successfully');
            this.getmembership(); // Refresh the list
            this.closeModal('membership_modal');
          }
        });


  }
  deleteSocail(item:any) {

      // Edit existing record
      const newRecord =
      {
        type: 8,
        isEdit: true,
        isDeleted: true
    }
      this.apiService
        .put(API_ENDPOINTS.doctor.settingList + `?recordId=${item._id}`, newRecord)
        .subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Social record deleted successfully');
            this.getsocialList(); // Refresh the list
            this.closeModal('social_websites_modal');
          }
        });


  }

  newAwardList: any[] = [];
  newSocialList: any[] = [];



  openAddEducationModal() {
    this.educationForm.reset();
    this.openModal('add_editucaiton_modal');
  }
  openAwardModal() {
    this.awardForm.reset();
    this.openModal('awards_recognitions_modal');
  }
  openMembershipModal() {
    this.memberFrom.reset();
    this.openModal('membership_modal');
  }
  openSocialModal() {
    this.socialForm.reset();
    this.openModal('social_websites_modal');
  }

  // toggle modal
  openModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }

  }

  closeModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");
    }
  }



  getSpecializationNames(specializationIds: string[]): string {
    if (!this.specializationList || !specializationIds) {
      return '';
    }

    const specializationNames = specializationIds.map(id => {
      const specialization = this.specializationList.find(spec => spec._id === id);
      return specialization ? specialization.name : '';
    });

    return specializationNames.filter(name => name).join(' - ');
  }

  specialization() {
    this.apiService
      .get(API_ENDPOINTS.MASTER.specialization, "")
      .subscribe((res: any) => {
        this.specializationList = res?.result?.data;
      });
  }

  editForm() {
    this.apiService
      .get(API_ENDPOINTS.doctor.updateDoctorProfile, {})
      .subscribe((res: any) => {

        this.getFormValues = res?.result[0];
        this.profileId=res?.result[0]._id
        if (this.getFormValues?.doctor?.profilePic) {
          this.isProfilePic = true;
        }
        this.profileForm.patchValue({
          profilePic: this.getFormValues?.doctor?.profilePic,
          fullName: this.getFormValues?.fullName,
          experience: this.getFormValues?.doctor?.experience,
          specialization: this.getFormValues?.doctor?.specialization,
          about: this.getFormValues?.doctor?.about,
          phone: this.getFormValues?.phone,
          email: this.getFormValues?.doctor?.email,
          gender: this.getFormValues?.doctor?.gender.toString()

        });

      });
  }


  ngOnInit() {


    this.deviceWidth = this.commonService.gettingWinowWidth();

    this.generateYearOptions()
    this.generateList();
    this.getawardListing()
    this.getSocialtypes()
    this.validateForm();
    this.getmembership()
    this.specialization();

    this.editForm();

    this.getListing()

    this.getsocialList();


    const profilePic = this.el.nativeElement.querySelector("img.profile-pic");
    const fileInput = this.el.nativeElement.querySelector(
      "input.profile_input"
    );

    if (profilePic && fileInput) {
      this.renderer.listen(profilePic, "click", () => {
        fileInput.click();
      });

      this.renderer.listen(fileInput, "change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.imageUrl = reader.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }
  //custom js end

  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
  }

  finish(){

    // this.apiService
    // .put(API_ENDPOINTS.new.updateUserSteps, {userId:this.profileId, isAdmin:false})
    // .subscribe((res: any) => {

    //   if(res.success==false){
    //     this.toastr.error(res.message)
    //   }
    //   else{
        this.toastr.success("Profile Completed.")
        this.router.navigate(['/doctor/reviews']);

      // }
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}