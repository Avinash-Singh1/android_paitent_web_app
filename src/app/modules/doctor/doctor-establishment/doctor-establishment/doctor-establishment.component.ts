import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { debounceTime, filter, map, Subject } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";
import { CreateFormService } from "src/app/services/create-form.service";
import { EventService } from "src/app/services/event.service";
import { FormValidationService } from "src/app/services/form-validation.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { getAddressKeys, prepareDayTiming } from "src/app/utils/helper";
import { environment } from "src/environments/environment";

declare const google: any; // Declare google globally if not already available

@Component({
  standalone: false,
  selector: "nectar-doctor-establishment",
  templateUrl: "./doctor-establishment.component.html",
  styleUrls: ["./doctor-establishment.component.scss"],

})
export class DoctorEstablishmentComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  //custom js start
  editEstablishmentId: any
  editHospitalId: any

  sampleCityName:any=''
  profileData: any
  establishmentData: any
  hospitalTypeList: any;
  stateList: any;
  zoom: number = 10;
  consultationType: string = '';
  editConsultationType: any = '';

deleteEstablishmentData:any
  hospitalList: any[];

  submitted: boolean = false;
  establishmentForm: FormGroup;
  editEstablishmentForm: FormGroup;

  data: any = 0
  errorMessage: any
  updated: boolean = false;
  searchSubject: Subject<any> = new Subject();
  predicationList: any = [];
  predicationCityList: any = [];
  location: any = [77.216721, 28.6448];

  markerDragable: boolean = true;
  subject = new Subject();

  mapClickable: boolean = true;
  changePhoto: boolean = true;
  flag: boolean = false

  additionalOptions = [
    { value: 'all', label: 'All Days' },
    { value: 'mon-fri', label: 'Monday to Friday' },
    { value: 'sat-sun', label: 'Saturday and Sunday' },
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' }
  ];

  ownEstablishment: any = [];
  visitEstablishment: any = [];
  apiCalled: boolean = false;
  ownEstablishmentExist:any
  secoundHospital: any;

  getEsablishmentList() {
    this.getProfile()

    this.ownEstablishment = [];
    this.visitEstablishment = [];
    this.apiService.get(API_ENDPOINTS.doctor.establishmentList, {}).subscribe({
      next: (res: any) => {
        this.apiCalled = true;
        const { count, data } = res.result;
        if (!data.every((item: any) => item.isDeleted)) {
          data.forEach((element) => {
            switch (element.isOwner) {
              case true:
                this.ownEstablishment.push(element);
                break;
              case false:
                this.visitEstablishment.push(element);
                break;
            }
          }


          );

          this.ownEstablishmentExist = this.ownEstablishment.some(item => item.isOwner === true && item.isDeleted === false)

          this.secoundHospital = this.ownEstablishment.some(item => item.isOwner === true && item.isDeleted === true)

        } else {

          this.ownEstablishment = [];
          this.visitEstablishment = [];

          if(this.profileData?.doctor?.consultationType ){

            this.router.navigate(['/doctor/establishment/add']);
          }else{
            this.toastr.error("Please Complete Medical Verification Step.")
            this.router.navigate(['/doctor/medical-verification']);

          }

        }

      },
      error: (error: any) => {
        this.apiCalled = true;
      },
    });
  }

  constructor(private renderer: Renderer2, private el: ElementRef,
    private fb: FormBuilder,
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    public gService: GoogleMapsService,
    public toastr: ToastrService,
    public datepipe: DatePipe,
    private googleMapService: GoogleMapsService,
    private createForm: CreateFormService,
    private formValidation: FormValidationService,
    private router: Router

  ) {

    this.validateForm();

  }

  ngOnInit(): void {
    this.getHospital()
    this.getEsablishmentList()
    this.initializeEditForm()

    if (this.consultationType == "" || this.consultationType == null || this.consultationType == undefined) {
      this.errorMessage = "Please Select One to Countine"
      this.disableControl(
        ["name", "hospitalTypeId", "address", "establishmentMobile", "establishmentEmail", "profilePic",], false);
    }
    this.establishmentForm.get('Consultation_type')?.valueChanges.subscribe(value => {
      this.consultationType = value;

      if (this.consultationType == 'visit') {
        this.errorMessage = ''
        this.establishmentForm.patchValue({
          name: '',
          address: {
            landmark: '',
            locality: '',
            city: '',
            state: null,
            pincode: '',
          },
          hospitalTypeId: null,
          establishmentPic: '',
          establishmentMobile: '',
          establishmentEmail: '',
        });
        // Re-enable the controls
        this.enableControl(["name", "address", "hospitalTypeId", "establishmentMobile", "establishmentEmail",]);
        this.control["hospitalId"].reset();
        this.changePhoto = true;
        this.mapClickable = true;
        this.markerDragable = true;
        this.errorMessage = ''
      }
      if (this.consultationType == 'own') {
        this.errorMessage = ''
        this.hospitalList = []
        this.establishmentForm.patchValue({
          name: '',
          address: {
            landmark: '',
            locality: '',
            city: '',
            state: null,
            pincode: '',
          },
          hospitalTypeId: null,
          establishmentPic: '',
          establishmentMobile: '',
          establishmentEmail: '',
        });
        // Re-enable the controls
        this.enableControl(["name", "address", "hospitalTypeId", "establishmentMobile", "establishmentEmail",]);
        this.control["hospitalId"].reset();
        this.changePhoto = true;
        this.mapClickable = true;
        this.markerDragable = true;
      }
    });
    this.editEstablishmentForm.get('isOwner')?.valueChanges.subscribe(value => {
      this.editConsultationType = value;
    });
    this.location = this.localStorage.getItem("location");
    if (!this.location) {
      this.location = [77.216721, 28.6448];
    } else {
      this.location = JSON.parse(this.location);
    }
    // this.getEstablishment()
    // this.getListing();
    this.getState()
    this.onSearchHospital();
    this.onFormValueChanges();
    this.onNameValueChanges();
    this.getPrediction();
    // this.openModal('add_address_modal')
    // this.isSlide1Visible = false;
  }



  getProfile() {

    this.apiService.get(API_ENDPOINTS.doctor.updateDoctorProfile, {}).subscribe((res: any) => {
      this.profileData = res?.result[0]

      const city =this.profileData.doctor.city
      this.establishmentForm.get('address.sampleCityName')?.setValue(this.profileData.doctor.city);

        if(this.profileData?.doctor?.consultationType === 'In-clinic' &&
          this.profileData?.doctor?.consultationDetails?.isInClinic){
            this.establishmentForm.get('showInClinic')?.setValue(true);

            this.inClinicFeeFlag=false

          }




          if(this.profileData?.doctor?.consultationType === 'video'){
            this.establishmentForm.get('showVideo')?.setValue(true);


            if(!this.shouldShowInClinicField()){
              this.showSlide2()

              const testing =this.getStateId(city)

this.establishmentForm.get('address.state')?.setValue(testing

);


            }

            this.consultationType='visit'
            this.errorMessage = ''

            // Re-enable the controls
            this.enableControl(["name", "address", "hospitalTypeId", "establishmentMobile", "establishmentEmail",]);

            this.control["hospitalId"].reset();
            this.changePhoto = true;
            this.mapClickable = true;
            this.markerDragable = true;
            this.errorMessage = ''


            this.videoFeeFlag=false
          }

          if(this.profileData?.doctor?.consultationType === 'In-clinic' &&
            this.profileData?.doctor?.consultationDetails?.isVideo){
              this.establishmentForm.get('showVideo')?.setValue(true);
              this.videoFeeFlag=false
            }

            if(!this.establishmentForm.get('showInClinic').value   )
            {
              this.consultationType='visit'


            }


    });

  }

  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
  }

  enableControl(args: string[]) {
    args.forEach((formControlName: string) => {
      this.control[formControlName].enable();
    });
  }


  getPrediction() {
    this.searchSubject.pipe(debounceTime(300)).subscribe((res: any) => {
      this.googleMapService
        .getPredication(res.search)
        .then((response: any) => {
          this[res.listName] = response;
        })
        .catch((error: any) => {
          this[res.listName] = [];
        });
    });
  }

  onSearchHospital() {
    this.subject
      .pipe(
        debounceTime(200),
        filter((text) => text != ""),
        map((searchtext: string) => searchtext)
      )
      .subscribe((res: any) => {
        this.apiService
          .get(API_ENDPOINTS.COMMON.hospitalList, { search: res })
          .subscribe({
            next: (res: any) => {
              this.hospitalList = res.result.data;
            },
            error: (error: any) => {
            },
          });
      });
  }

  onEditSubmit(): void {
    const editedValue = this.editEstablishmentForm.value;
    // Perform API call to save the changes

    if (this.editEstablishmentForm.valid) {

    }
    const formValue = this.editEstablishmentForm.value;
    let newObj = {
      ...formValue,
      daysControls: undefined
    };

    if(this.videoFeeFlagEdit){
      newObj.videoConsultationFees=-1
    }
    if(this.inClinicFeeFlagEdit){
      newObj.consultationFees=-1
    }

    if(this.shouldShowInClinicField() &&  this.shouldShowVideoField())
    {

      if(newObj.consultationFees==0 && this.videoFeeFlagEdit) {
        this.toastr.error("Please enter Fee")
        return
      }
      if(newObj.videoConsultationFees==0 && this.inClinicFeeFlagEdit) {
        this.toastr.error("Please enter Fee")
        return
      }

      if(this.videoFeeFlagEdit && this.inClinicFeeFlagEdit){
        this.toastr.error("Please enter atlease one fee option")
        return
      }
      if(newObj.consultationFees==0 && !this.videoFeeFlagEdit && !this.inClinicFeeFlagEdit){
        this.toastr.error("Please enter fee")
        return
      }
      if(newObj.videoConsultationFees==0 && !this.videoFeeFlagEdit && !this.inClinicFeeFlagEdit){
        this.toastr.error("Please enter fee")
        return
      }

    }

    if(this.shouldShowInClinicField() &&  !this.shouldShowVideoField()){
      if(newObj.consultationFees==0 ) {
        this.toastr.error("Please enter Fee")
        return
      }

    }
    if(!this.shouldShowInClinicField() &&  this.shouldShowVideoField()){
      if(newObj.videoConsultationFees==0 ) {
        this.toastr.error("Please enter Fee")
        return
      }

    }

    formValue.daysControls.forEach((dayControl) => {
      const individualDays = this.getIndividualDays(dayControl.day);
      individualDays.forEach((day) => {
          dayControl.timeSlots.forEach((slot) => {
              const slotFromTime = slot.from;
              const slotToTime = slot.to;

              // Morning slot (12:00 AM - 11:45 AM)
              if (this.isTimeInRange(slotFromTime, slotToTime, "12:00 AM", "12:00 PM")) {
                  const overlapFrom = this.formatTime(Math.max(this.parseTime(slotFromTime), this.parseTime("12:00 AM")));
                  const overlapTo = this.formatTime(Math.min(this.parseTime(slotToTime), this.parseTime("12:00 PM")));
                  if (overlapFrom !== overlapTo) {  // Check for valid range
                      newObj[day] = newObj[day] || [];
                      newObj[day].push({ slot: "morning", from: overlapFrom, to: overlapTo });
                  }
              }

              // Afternoon slot (12:00 PM - 3:45 PM)
              if (this.isTimeInRange(slotFromTime, slotToTime, "12:00 PM", "4:00 PM")) {
                  const overlapFrom = this.formatTime(Math.max(this.parseTime(slotFromTime), this.parseTime("12:00 PM")));
                  const overlapTo = this.formatTime(Math.min(this.parseTime(slotToTime), this.parseTime("4:00 PM")));
                  if (overlapFrom !== overlapTo) {  // Check for valid range
                      newObj[day] = newObj[day] || [];
                      newObj[day].push({ slot: "afternoon", from: overlapFrom, to: overlapTo });
                  }
              }

              // Evening slot (4:00 PM - 11:45 PM)
              if (this.isTimeInRange(slotFromTime, slotToTime, "4:00 PM", "11:45 PM")) {
                  const overlapFrom = this.formatTime(Math.max(this.parseTime(slotFromTime), this.parseTime("4:00 PM")));
                  const overlapTo = this.formatTime(Math.min(this.parseTime(slotToTime), this.parseTime("11:45 PM")));
                  if (overlapFrom !== overlapTo) {  // Check for valid range
                      newObj[day] = newObj[day] || [];
                      newObj[day].push({ slot: "evening", from: overlapFrom, to: overlapTo });
                  }
              }
          });
      });
  });


    if(newObj.name==""){
      newObj.name='Video Consultation Only'
      newObj.address.city = this.profileData?.doctor?.city

    }





    this.submitted = true;
    this.editEstablishmentForm.markAllAsTouched();


      if(this.videoFeeFlagEdit){
        newObj.videoConsultationFees=-1

      }
      if(this.inClinicFeeFlagEdit){
        newObj.consultationFees=-1
      }

      if(newObj.videoConsultationFees==0){
        newObj.videoConsultationFees=-1
      }
      if(newObj.consultationFees==0){
        newObj.consultationFees=-1
      }

      this.apiService
        .putParams(
          API_ENDPOINTS.doctor.editEstablishmentDetail,
          {
            ...newObj,
            // address: this.addressControl.getRawValue(),
          },
          {
            establishmentId: this.editEstablishmentId,
            hospitalId: this.editHospitalId
          }

        )
        .subscribe({
          next: (res: any) => {
            this.updated = true;
            // this.matdiaRef.close();
            this.getEsablishmentList()

            this.toastr.success("Establishment detail updated successfully");
            this.closeEditModal('edit_address_modal')
            // window.location.reload();

          },
          error: (error: any) => {
          },
        });


  }

  dayLabel: any;

  getDayLabel(item: any) {
      const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
      const weekendDays = ['sat', 'sun'];

      // Helper function to compare slots of different days
      const areSlotsEqual = (slotsA: any[], slotsB: any[]) => {
          if (slotsA.length !== slotsB.length) {
              return false;
          }
          for (let i = 0; i < slotsA.length; i++) {
              if (slotsA[i].from !== slotsB[i].from || slotsA[i].to !== slotsB[i].to) {
                  return false;
              }
          }
          return true;
      };

      // Check if all days (Mon-Sun) are present
      const allDaysPresent = weekdays.concat(weekendDays).every(day => item[day] && item[day].length > 0);

      if (allDaysPresent) {
          const monSlots = item.mon;
          // If any day has different slots from Monday, return `null`
          const anyDayDifferent = weekdays.concat(weekendDays).some(day => !areSlotsEqual(item[day], monSlots));

          if (anyDayDifferent) {
              this.dayLabel = null;
              return this.dayLabel;
          }

          this.dayLabel = 'All Days'; // If all days have the same slots
          return this.dayLabel;
      }

      // Check for Mon-Fri slots being equal and Sat-Sun either absent or empty
      const monSlots = item.mon || [];
      const weekdaysSame = weekdays.every(day => areSlotsEqual(item[day], monSlots));
      const weekendEmpty = weekendDays.every(day => !item[day] || item[day].length === 0);

      if (weekdaysSame && monSlots.length > 0 && weekendEmpty) {
          this.dayLabel = 'Mon-Fri';
          return this.dayLabel;
      }

      // Check for Sat-Sun slots being equal and Mon-Fri either absent or empty
      const satSlots = item.sat || [];
      const weekendSame = weekendDays.every(day => areSlotsEqual(item[day], satSlots));
      const weekdaysEmpty = weekdays.every(day => !item[day] || item[day].length === 0);

      if (weekendSame && satSlots.length > 0 && weekdaysEmpty) {
          this.dayLabel = 'Sat-Sun';
          return this.dayLabel;
      }

      // If none of the above match, return `null` to show individual day slots
      this.dayLabel = null;
      return this.dayLabel;
  }


  onChangeEstablishment(establishment: any, event: Event): void {
    // Prevent double-click issues
    event.stopPropagation();

    // Toggle the isActive status and make the API call
    const newStatus = !establishment.isActive;

    this.apiService
      .putParams(
        API_ENDPOINTS.doctor.editEstablishmentDetail,
        { isActive: newStatus },
        {
          establishmentId: establishment?.establishmentId,
          hospitalId: establishment?.hospitalData?.hospitalId,
        }
      )
      .subscribe({
        next: (res: any) => {
          this.updated = true;
          this.toastr.success("Establishment updated successfully");
        },
        error: (error: any) => {
        },
      });
  }

   isTimeInRange(slotFrom: string, slotTo: string, rangeFrom: string, rangeTo: string): boolean {
    const fromTime = this.parseTime(slotFrom);
    const toTime = this.parseTime(slotTo);
    const rangeStart = this.parseTime(rangeFrom);
    const rangeEnd = this.parseTime(rangeTo);

    // Check for overlap
    return (fromTime <= rangeEnd && toTime >= rangeStart);
  }

  // Helper to parse time strings into comparable numbers
   parseTime(time: string): number {
    const [hour, modifier] = time.split(' ');
    const [hourPart, minutePart] = hour.split(':');
    let hours = parseInt(hourPart, 10);
    const minutes = parseInt(minutePart, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  formatTime(time: number): string {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const hourPart = hours % 12 === 0 ? 12 : hours % 12;
    return `${hourPart}:${minutes.toString().padStart(2, '0')} ${period}`;
}

  onSubmit() {

    if (this.establishmentForm.valid) {

    }
    const formValue = this.establishmentForm.value;
    let newObj = {

      ...formValue,
      daysControls: undefined
    }

    ;

    formValue.daysControls.forEach((dayControl) => {
      const individualDays = this.getIndividualDays(dayControl.day);
      individualDays.forEach((day) => {
          dayControl.timeSlots.forEach((slot) => {
              const slotFromTime = slot.from;
              const slotToTime = slot.to;

              // Morning slot (12:00 AM - 11:45 AM)
              if (this.isTimeInRange(slotFromTime, slotToTime, "12:00 AM", "12:00 PM")) {
                  const overlapFrom = this.formatTime(Math.max(this.parseTime(slotFromTime), this.parseTime("12:00 AM")));
                  const overlapTo = this.formatTime(Math.min(this.parseTime(slotToTime), this.parseTime("12:00 PM")));
                  if (overlapFrom !== overlapTo) {  // Check for valid range
                      newObj[day] = newObj[day] || [];
                      newObj[day].push({ slot: "morning", from: overlapFrom, to: overlapTo });
                  }
              }

              // Afternoon slot (12:00 PM - 3:45 PM)
              if (this.isTimeInRange(slotFromTime, slotToTime, "12:00 PM", "4:00 PM")) {
                  const overlapFrom = this.formatTime(Math.max(this.parseTime(slotFromTime), this.parseTime("12:00 PM")));
                  const overlapTo = this.formatTime(Math.min(this.parseTime(slotToTime), this.parseTime("4:00 PM")));
                  if (overlapFrom !== overlapTo) {  // Check for valid range
                      newObj[day] = newObj[day] || [];
                      newObj[day].push({ slot: "afternoon", from: overlapFrom, to: overlapTo });
                  }
              }

              // Evening slot (4:00 PM - 11:45 PM)
              if (this.isTimeInRange(slotFromTime, slotToTime, "4:00 PM", "11:45 PM")) {
                  const overlapFrom = this.formatTime(Math.max(this.parseTime(slotFromTime), this.parseTime("4:00 PM")));
                  const overlapTo = this.formatTime(Math.min(this.parseTime(slotToTime), this.parseTime("11:45 PM")));
                  if (overlapFrom !== overlapTo) {  // Check for valid range
                      newObj[day] = newObj[day] || [];
                      newObj[day].push({ slot: "evening", from: overlapFrom, to: overlapTo });
                  }
              }
          });
      });
  });



  this.submitted = true;
  this.establishmentForm.markAllAsTouched();
  if (this.establishmentForm.valid) {

    if (this.data.edit) {

      this.apiService
        .putParams(
          API_ENDPOINTS.doctor.editEstablishmentDetail,
          {
            ...this.establishmentForm.value,
            address: this.addressControl.getRawValue(),
          },
          {
            establishmentId: this.data.establishmentDetail.establishmentId,
            hospitalId: this.data.establishmentDetail.hospitalData.hospitalId,
          }
        )
        .subscribe({
          next: (res: any) => {
            this.updated = true;
            // this.matdiaRef.close();
            this.getEsablishmentList()
            this.toastr.success("Establishment detail updated successfully");
            this.closeModal('add_address_modal')
            this.closeModal('edit_address_modal')

            // Reset the form fields
  this.establishmentForm.reset({
    isOwner: '',
    profilePic: '',
    Consultation_type: '',
    name: '',
    hospitalTypeId: null,
    hospitalId: null,
    address: {
      landmark: '',
      locality: '',
      city: '',
      state: null,
      pincode: '',
      country: { value: "India", disabled: true },  // Keep country as India
    },
    establishmentMobile: '',
    establishmentEmail: '',
    consultationFees: 0,
    videoConsultationFees:0,
    daysControls: this.fb.array([]),
  });

  this.isSlide1Visible = true;

          },
          error: (error: any) => {
          },
        });

        return;
      }

      if(this.videoFeeFlag){
        newObj.videoConsultationFees=-1
      }
      if(this.inClinicFeeFlag){
        newObj.consultationFees=-1
      }


      if(this.shouldShowInClinicField() &&  this.shouldShowVideoField())
      {

        if(newObj.consultationFees==0 && this.videoFeeFlag) {
          this.toastr.error("Please enter Fee")
          return
        }
        if(newObj.videoConsultationFees==0 && this.inClinicFeeFlag) {
          this.toastr.error("Please enter Fee")
          return
        }

        if(this.videoFeeFlag && this.inClinicFeeFlag){
          this.toastr.error("Please enter atlease one fee option")
          return
        }
        if(newObj.consultationFees==0 && !this.videoFeeFlag && !this.inClinicFeeFlag){
          this.toastr.error("Please enter fee")
          return
        }
        if(newObj.videoConsultationFees==0 && !this.videoFeeFlag && !this.inClinicFeeFlag){
          this.toastr.error("Please enter fee")
          return
        }

      }

      if(this.shouldShowInClinicField() &&  !this.shouldShowVideoField()){
        if(newObj.consultationFees==0 ) {
          this.toastr.error("Please enter Fee")
          return
        }

      }
      if(!this.shouldShowInClinicField() &&  this.shouldShowVideoField()){
        if(newObj.videoConsultationFees==0 ) {
          this.toastr.error("Please enter Fee")
          return
        }

      }
      if(this.shouldShowInClinicField() &&  !this.shouldShowVideoField()){
        if(newObj.consultationFees!=0  ) {
          newObj.videoConsultationFees=-1
        }

      }
      if(!this.shouldShowInClinicField() &&  this.shouldShowVideoField()){
        if(newObj.videoConsultationFees!=0 ) {
newObj.consultationFees=-1
        this.consultationType=='visit'
        }

      }
      if(this.shouldShowInClinicField() &&  !this.shouldShowVideoField()){

        newObj.videoConsultationFees=-1

      }


      const ownEstablishmentExist=this.ownEstablishmentExist

      if(newObj.name=="" || newObj.name==undefined || newObj.name==null  ){
        newObj.name="Video Consultation Only"
        newObj.address = newObj.address || {};
        newObj.address.city = this.profileData?.doctor?.city

      }




      if (!newObj.address || newObj.address.state == undefined || newObj.address.state == null) {
        newObj.address = newObj.address || {}; // Ensure address is defined
        if (!newObj.address.state) {
          newObj.address.state = this.getStateId(this.profileData?.doctor?.city);
          newObj.address.city = this.profileData?.doctor?.city
        }
      }





if(newObj.location.coordinates[0]==null && newObj.location.coordinates[1]==null ){
  newObj.location.coordinates[0]=this.location[0]
  newObj.location.coordinates[1]=this.location[1]
}

      const secoundOwnEstablishemnt=this.secoundHospital
    this.apiService
      .post(API_ENDPOINTS.doctor.addEstablishment, {
        ...newObj,
        isOwner: this.consultationType=='own' ? 1:0,
        ownEstablishmentExist,        // isOwner: this.data.establishmentDetail.isOwner,
        secoundOwnEstablishemnt
      })
      .subscribe({
        next: (res: any) => {
          this.updated = true;
          // this.matdiaRef.close(true);
          this.getEsablishmentList()

          this.toastr.success("Establishment added successfully");
          this.closeModal('add_address_modal')
          this.closeModal('edit_address_modal')

          // Reset the form fields
this.establishmentForm.reset({
  isOwner: '',
  profilePic: '',
  Consultation_type: '',
  name: '',
  hospitalTypeId: null,
  hospitalId: null,
  address: {
    landmark: '',
    locality: '',
    sampleCityName:this.profileData.doctor.city,
    city: '',
    pincode: '',
    country: { value: "India", disabled: true },  // Keep country as India
  },
  establishmentMobile: '',
  establishmentEmail: '',
  consultationFees: 0,
  videoConsultationFees:0,
  daysControls: this.fb.array([]),
});

if(this.profileData?.doctor?.consultationType === 'In-clinic' &&
  this.profileData?.doctor?.consultationDetails?.isInClinic){
    this.establishmentForm.get('showInClinic')?.setValue(true);
    this.inClinicFeeFlag=false

  }


  if(this.profileData?.doctor?.consultationType === 'video'){
    this.establishmentForm.get('showVideo')?.setValue(true);
    this.videoFeeFlag=false

    if(!this.shouldShowInClinicField()){
      this.showSlide2()

    }

  }
  else{
    this.isSlide1Visible = true;

  }


  if(this.profileData?.doctor?.consultationType === 'In-clinic' &&
    this.profileData?.doctor?.consultationDetails?.isVideo){
      this.establishmentForm.get('showVideo')?.setValue(true);
      this.videoFeeFlag=false

    }



        },
        error: (error: any) => {
        },
      });
  }
}

  initializeEditForm(): void {
    this.editEstablishmentForm = this.fb.group({
      isOwner: [""],
      showInClinic:[false],
      showVideo:[false],
      profilePic: [""],
      Consultation_type: [""],
      name: ["", [Validators.maxLength(100)]],
      hospitalTypeId: [null],
      hospitalId: [null],
      address: this.fb.group({
        landmark: ["" ],
        locality: ["" ],
        city: [""],
        state: [null],
        pincode: [""],
        country: [{ value: "India", disabled: true }, [Validators.required]],
      }),
      establishmentMobile: [""],
      establishmentEmail: [""],
      consultationFees: [0, Validators.required],
      videoConsultationFees: [0, Validators.required],
      daysControls: this.fb.array([]),
    });
  }

  patchEditFormValues(establishment: any): void {




let consultationFee = establishment.consultationFees== -1 ? 0 : establishment.consultationFees
let videoConsultationFee = establishment.videoConsultationFees== -1 ? 0 : establishment.videoConsultationFees

if(establishment.videoConsultationFees==-1){
  this.videoFeeFlagEdit=true
}
else{
  this.videoFeeFlagEdit=false

}
if(establishment.consultationFees==-1){
  this.inClinicFeeFlagEdit=true
}
else{
  this.inClinicFeeFlagEdit=false

}

    this.editEstablishmentForm = this.fb.group({
      profilePic: [establishment.profilePic || ""],
      isOwner: [establishment.isOwner.toString() || ""],
      Consultation_type: [establishment.Consultation_type || ""],
      name: [establishment.hospitalData.name],
      hospitalTypeId: [establishment.hospitalTypeId ],
      hospitalId: [establishment.hospitalId ],
      address: this.fb.group({
        landmark: [establishment.hospitalData.address.landmark|| "" ],
        locality: [establishment.hospitalData.address.locality || ""],
        city: [establishment.hospitalData.address.city || ""],
        state: [establishment.hospitalData.address.state || null, ],
        pincode: [establishment.hospitalData.address.pincode ],
        country: [{ value: "India", disabled: true }, [Validators.required]],
      }),
      establishmentMobile: [establishment.hospitalData.establishmentMobile || ""],
      establishmentEmail: [establishment.hospitalData.establishmentEmail || ""],
      consultationFees: [consultationFee || 0, Validators.required],
      videoConsultationFees: [videoConsultationFee || 0, Validators.required],
      daysControls: this.fb.array([]),
      showInClinic:[establishment.consultationFees != -1 ? true :false],
      showVideo:[establishment.videoConsultationFees != -1 ? true :false]
    });



    if(this.profileData?.doctor?.consultationType === 'video'){

      if(!this.shouldShowInClinicField()){
        this.showEditSlide2()
      }
    }



    this.editEstablishmentId = establishment?.establishmentId
    this.editHospitalId = establishment?.hospitalData?.hospitalId
    // Populate days and time slots
    this.populateDaysControls(establishment);

  }



  openGoogleMaps(item: any): void {
    if(item?.hospitalData?.location?.coordinates?.[1]== 28.6448 && item?.hospitalData?.location?.coordinates?.[0]== 77.216721)
    {
      const address = `${item?.hospitalData?.address?.landmark} ${item?.hospitalData?.address?.locality}, ${item?.hospitalData?.address?.city}, ${this.getStateName(item?.hospitalData?.address?.state)} ${item?.hospitalData?.address?.pincode}`;

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

      if (this.isBrowser) {
        window.open(googleMapsUrl, '_blank');
      }
    }
    else{
      this.gService.redirectToGoogleMaps(
        item?.location?.coordinates?.[1] ,
        item?.location?.coordinates?.[0]
      )
    }
  }



 populateDaysControls(establishment: any): void {
    const daysArray = this.editEstablishmentForm.get('daysControls') as FormArray;

    // Clear existing controls
    daysArray.clear();

    // Array of all days
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    days.forEach(day => {
        const timeSlots = establishment[day];

        // Skip if the day is not present in establishment or is an empty array
        if (!timeSlots || timeSlots.length === 0) {
            return;
        }

        const dayControl = this.createEditDayControl(day, timeSlots.length); // Pass the number of time slots
        const timeSlotsArray = dayControl.get('timeSlots') as FormArray;

        // Populate time slots for this day
        timeSlots.forEach(slot => {
            timeSlotsArray.push(this.fb.group({
                from: [slot.from],
                to: [slot.to]
            }));
        });

        // Add day control to the form array
        daysArray.push(dayControl);
    });

}



  // Modify the createDayControl method to accept day groups (like "mon-fri")
  createEditDayControl(dayValue: string = '', slotsCount: number = 0): FormGroup {
    const timeSlots = this.fb.array([] as FormGroup[]); // Explicitly declare the type as FormGroup[]

    // Only create a default time slot if no slots exist for the day
    if (slotsCount === 0) {
      // timeSlots.push(this.createTimeSlot());
    }

    return this.fb.group({
      day: [dayValue],
      timeSlots: timeSlots // Assign the typed FormArray
    });
  }


  openEditModal(item: any): void {
    this.patchEditFormValues(item); // Patch form with existing data
    this.openModal('edit_address_modal'); // Open the edit modal
  }

  search(evt) {
    // if (this.consultationType) {
    // if (0 == 0) {
    if (this.consultationType == 'visit') {
      const searchText = evt.target.value;
      this.subject.next(searchText);
    }
  }

onSelectPlace(place: any) {
  const placeService = new google.maps.places.PlacesService(document.createElement('div'));

  placeService.getDetails({ placeId: place.place_id }, (placeDetails, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {

      const addressComponents = placeDetails.address_components;

      // Make sure stateList is available and has values
      if (!this.stateList || this.stateList.length === 0) {
        console.error('State list is not available or empty');
        return;
      }

      // Define initial address structure
      const address: any = {
        landmark: "",
        locality: "",
        city: "",
        state: "",
        pincode: "",
        country: ""
      };

      const streetArray = [
        "sublocality_level_3",
        "premise",
        "plus_code",
        "route",
        "neighborhood",
        "street_number",
        "subpremise"
      ];

      const landMarkArray = [
        "landmark",
        "sublocality",
        "sublocality_level_1",
        "sublocality_level_2"
      ];

      // Loop through the address components to extract relevant data
      for (const component of addressComponents) {
        if (streetArray.some((i) => component.types.includes(i))) {
          address.landmark += component.long_name + ", ";
          continue;
        }
        if (landMarkArray.some((i) => component.types.includes(i))) {
          address.locality += component.long_name + ", ";
          continue;
        }

        const componentType = component.types[0];

        switch (componentType) {
          case "locality":
          case "administrative_area_level_3":
            if (!address.city) {
              address.city = component.long_name;
            }
            break;

          case "postal_code":
            address.pincode = component.long_name;
            break;

          case "administrative_area_level_1":
            address.state = this.stateList.find(
              (state) => state.name.toLowerCase() === component.long_name.toLowerCase()
            )?._id ?? null;
            break;

          case "country":
            address.country = component.long_name;
            break;
        }
      }

      // Final adjustments to clean up trailing commas
      address.landmark = address.landmark.replace(/,(?=[^,]*$)/, "").trim();
      address.locality = address.locality.replace(/,(?=[^,]*$)/, "").trim();

      // Patch form fields with the extracted data
      this.establishmentForm.get('address').patchValue({
        landmark: address.landmark || placeDetails.formatted_address || '',
        city: address.city || '',
        state: address.state || null, // State from stateList or null if not found
        locality: address.locality || '', // This might not always be available
        pincode: address.pincode || '', // Postal code might also be unavailable
        country: address.country || 'India', // Default to India if not available
      });

      // Clear the prediction list after selection
      this.predicationList = [];
    }
  });
}

oneEditSelectPlace(place: any) {

  const placeService = new google.maps.places.PlacesService(document.createElement('div'));

  placeService.getDetails({ placeId: place.place_id }, (placeDetails, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {

      const addressComponents = placeDetails.address_components;

      // Make sure stateList is available and has values
      if (!this.stateList || this.stateList.length === 0) {
        console.error('State list is not available or empty');
        return;
      }

      // Define initial address structure
      const address: any = {
        landmark: "",
        locality: "",
        city: "",
        state: "",
        pincode: "",
        country: ""
      };

      const streetArray = [
        "sublocality_level_3",
        "premise",
        "plus_code",
        "route",
        "neighborhood",
        "street_number",
        "subpremise"
      ];

      const landMarkArray = [
        "landmark",
        "sublocality",
        "sublocality_level_1",
        "sublocality_level_2"
      ];

      // Loop through the address components to extract relevant data
      for (const component of addressComponents) {
        if (streetArray.some((i) => component.types.includes(i))) {
          address.landmark += component.long_name + ", ";
          continue;
        }
        if (landMarkArray.some((i) => component.types.includes(i))) {
          address.locality += component.long_name + ", ";
          continue;
        }

        const componentType = component.types[0];

        switch (componentType) {
          case "locality":
          case "administrative_area_level_3":
            if (!address.city) {
              address.city = component.long_name;
            }
            break;

          case "postal_code":
            address.pincode = component.long_name;
            break;

          case "administrative_area_level_1":
            address.state = this.stateList.find(
              (state) => state.name.toLowerCase() === component.long_name.toLowerCase()
            )?._id ?? null;
            break;

          case "country":
            address.country = component.long_name;
            break;
        }
      }

      // Final adjustments to clean up trailing commas
      address.landmark = address.landmark.replace(/,(?=[^,]*$)/, "").trim();
      address.locality = address.locality.replace(/,(?=[^,]*$)/, "").trim();

      // Patch form fields with the extracted data
      this.editEstablishmentForm.get('address').patchValue({
        landmark: address.landmark || placeDetails.formatted_address || '',
        city: address.city || '',
        state: address.state || null, // State from stateList or null if not found
        locality: address.locality || '', // This might not always be available
        pincode: address.pincode || '', // Postal code might also be unavailable
        country: address.country || 'India', // Default to India if not available
      });

      // Clear the prediction list after selection
      this.predicationList = [];
    }
  });
}

getAddressKeys(addressComponents: any) {
  const address = {
    locality: '',
    postalCode: '',
    state: '',
    city: '',
  };

  for (let component of addressComponents) {
    const types = component.types;
    if (types.includes('locality')) {
      address.locality = component.long_name;
    }
    if (types.includes('postal_code')) {
      address.postalCode = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      address.state = component.long_name;
    }
    if (types.includes('administrative_area_level_2')) {
      address.city = component.long_name;
    }
  }

  return address;
}

patchDisable(response: any) {
  this.establishmentForm.patchValue({
    locality: response.locality,
    postalCode: response.postalCode,
    state: response.state,
    city: response.city,
  });
}

onMapClicked(event: any) {
  if (this.mapClickable) {
    this.onSelectPlace(event);
  }
}
onMarkerDrag(event: any) {
  this.onSelectPlace(event);
}
onNameValueChanges() {
  if (0 == 0) {
  // if (this.data.establishmentDetail.isOwner == 0) {
    this.control["name"].valueChanges.subscribe({
      next: (res: any) => {
        this.handleNameValueChange();
      },
    });
  }
}
private handleNameValueChange() {
  if (this.control["hospitalId"].value && this.hospitalList.length) {
    const i = this.hospitalList.findIndex((hospital) => {
      return this.control["name"].value == hospital.hospitalName;
    });
    if (i == -1) {
      this.changePhoto = true;
      this.control["hospitalId"].setValue(null);
      this.enableFields(
        true,
        "hospitalTypeId",
        "establishmentMobile",
        "establishmentEmail",
        "establishmentPic"
      );
      this.control["address"].enable();
      this.clearAddressControls();
    }
  }
}

  private clearAddressControls() {
    for (let control in this.addressControl.controls) {
      if (control != "country") {
        this.addressControl.controls[control].setValue(null);
      }
    }
  }

  enableFields(setNull: boolean, ...args) {
    args.forEach((field: string) => {
      this.control[field].enable();
      if (setNull) {
        this.control[field].setValue(null);
      }
    });
  }

  onFormValueChanges() {
    this.establishmentForm.valueChanges.subscribe(() => {
      this.submitted = false;
    });
  }

deleteEstablishment(establishment:any){
this.deleteEstablishmentData=establishment
this.openModal('delete_establishment_confirm')

}

deleteEstablishmentConfirm(){
  this.apiService.post(API_ENDPOINTS.doctor.deleteEstablishment, { establishmentId:`${this.deleteEstablishmentData._id}`}).subscribe({
    next: (res) => {
      this.getEsablishmentList()
      this.toastr.success("Establishment Deleted")
      this.closeModal('delete_establishment_confirm')
    },
    error: (error: any) => {
      this.toastr.error("Failed to delete establishemnt")
      this.closeModal('delete_establishment_confirm')

    },
  });

}

  getHospital() {
    this.apiService.get(API_ENDPOINTS.MASTER.hospitalType, {}).subscribe({
      next: (res) => {
        this.hospitalTypeList = res.result.data;
      },
      error: (error: any) => {
        this.hospitalTypeList = [];
      },
    });

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

  get control() {
    return this.establishmentForm.controls;
  }

  getStateName(stateId: string): string {
    if (this.stateList && this.stateList?.length > 0) {
      const state = this.stateList.find((s) => s._id === stateId);
      return state ? state.name : 'Unknown State'; // Fallback if state not found
    }
    return 'Unknown State';
  }

  getStateId(stateName: string): string {
    const state = this.stateList.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase()
    );
    return state ? state._id : this.getStateId("Delhi");
  }


// Generate time slots for the entire day (00:00 AM to 11:45 PM)
timingArray = this.generatTimiListing(
  new Date().setHours(0, 0, 0, 0),
  new Date().setHours(23, 45, 0, 0),
  environment.DOCTOR_SLOT_TIME
);

generatTimiListing(startTime: number, endTime: number, interval: number) {
  let timeList = [];
  for (let i = startTime; i <= endTime; i += interval) {
    const formattedTime = this.datepipe.transform(new Date(i), "h:mm a");
    if (formattedTime) {
      timeList.push({
        name: formattedTime,
        _id: formattedTime,
      });
    }
  }
  return timeList;
}

  validateForm() {
    this.establishmentForm = this.fb.group({
      showInClinic:[false],
      showVideo:[false],
      profilePic: [""],
      Consultation_type: [''],
      name: [""],
      hospitalTypeId: [null],
      hospitalId: [null],
      address: this.fb.group({
        landmark: [""],
        locality: [""],
        city: [""],
        state: [null],
        sampleCityName:[''],
        pincode: [""],
        country: [{ value: "India", disabled: true }, [Validators.required]],
      }),
      // establishmentMobile: ["", [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      // establishmentEmail: ["", [Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]],
      establishmentMobile: [""],
      establishmentEmail: [""],
      location: this.fb.group({
        coordinates: this.fb.array([this.location[0], this.location[1]]),
      }),
      consultationFees: [0, Validators.required],
      videoConsultationFees: [0, Validators.required],

      daysControls: this.fb.array([this.createDayControl()])

    });

  }

  createDayControl(dayValue: string = ''): FormGroup {
    return this.fb.group({
      day: [dayValue],
      timeSlots: this.fb.array([this.createTimeSlot()])
    });
  }

  createTimeSlot(): FormGroup {
    return this.fb.group({
      from: [''],
      to: ['']
    });
  }

  removeDay(index: number): void {
    if (this.daysControls.length > 1) {
      this.daysControls.removeAt(index);
    }
  }
  editremoveDay(index: number): void {
    if (this.editDaysControls.length > 1) {
      this.editDaysControls.removeAt(index);
    }
  }

  get daysControls(): FormArray {
    return this.establishmentForm.get('daysControls') as FormArray;
  }

  get editDaysControls(): FormArray {
    return this.editEstablishmentForm.get('daysControls') as FormArray;
  }

  get dayControl(): FormGroup {
    return this.daysControls.at(0) as FormGroup;
  }
  get editdayControl(): FormGroup {
    return this.editDaysControls.at(0) as FormGroup;
  }

  getTimeSlots(index: number): FormArray {
    return this.daysControls.at(index).get('timeSlots') as FormArray;
  }

  editgetTimeSlots(index: number): FormArray {
    return this.editDaysControls.at(index).get('timeSlots') as FormArray;
  }

  addDay(dayValue?: string): void {
    if (this.canAddMoreDays()) {
      const dayControl = this.createDayControl(dayValue);
      this.daysControls.push(dayControl);
    }
  }
  editaddDay(dayValue?: string): void {
    if (this.editcanAddMoreDays()) {
      const dayControl = this.createDayControl(dayValue);
      this.editDaysControls.push(dayControl);
    }
  }

  canAddMoreDays(): boolean {
    return !this.daysControls.value.some(dayControl => dayControl.day === 'all');
  }

  editcanAddMoreDays(): boolean {
    return !this.editDaysControls.value.some(dayControl => dayControl.day === 'all');
  }

  areAllDaysSame(item: any): boolean {
    // Extract time slots for each day
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const slotsArray = days.map(day => item[day] || []); // Default to empty array if no slots

    // Filter out empty arrays
    const filledSlots = slotsArray.filter(slots => slots.length > 0);

    // If there are no filled slots, return true (consider all days the same)
    if (filledSlots.length === 0) {
      return true;
    }

    // Check if all filled arrays are identical
    const firstDaySlots = filledSlots[0];

    return filledSlots.every(slots => {
      // Compare each slot in the current day with the first day's slots
      if (slots.length !== firstDaySlots.length) {
        return false; // Different number of slots means they are not the same
      }

      // Check if every slot in the current day matches with the first day's slots
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].from !== firstDaySlots[i].from || slots[i].to !== firstDaySlots[i].to) {
          return false; // Found a mismatch
        }
      }

      return true; // All slots match for this day
    });
  }



  addTimeSlot(dayIndex: number): void {
    const timeSlots = this.getTimeSlots(dayIndex);
    timeSlots.push(this.createTimeSlot());
  }
  addEditTimeSlot(dayIndex: number): void {
    const timeSlots = this.editgetTimeSlots(dayIndex);
    timeSlots.push(this.createTimeSlot());
  }

  getDayControl(index: number): FormGroup {
    return this.daysControls.at(index) as FormGroup;
  }

  editgetDayControl(index: number): FormGroup {
    return this.editDaysControls.at(index) as FormGroup;
  }

  removeTimeSlot(dayIndex: number, slotIndex: number): void {
    const timeSlots = this.getTimeSlots(dayIndex);
    if (timeSlots.length > 1) {
      timeSlots.removeAt(slotIndex);
    }
  }

  editremoveTimeSlot(dayIndex: number, slotIndex: number): void {
    const timeSlots = this.editgetTimeSlots(dayIndex);
    if (timeSlots.length > 1) {
      timeSlots.removeAt(slotIndex);
    }
  }

  editonDayChange(index: number): void {
    const selectedDay = this.editgetDayControl(index).get('day').value;

    if (selectedDay === 'all') {
      this.daysControls.controls.forEach((control, idx) => {
        if (idx !== index) {
          this.removeDay(idx);
        }
      });
    } else {
      const allDaysSelectedIndex = this.daysControls.controls.findIndex(control => control.get('day').value === 'all');

      if (allDaysSelectedIndex !== -1) {
        this.removeDay(allDaysSelectedIndex);
      }
    }

  }
  onDayChange(index: number): void {
    const selectedDay = this.getDayControl(index).get('day').value;

    if (selectedDay === 'all') {
      this.daysControls.controls.forEach((control, idx) => {
        if (idx !== index) {
          this.removeDay(idx);
        }
      });
    } else {
      const allDaysSelectedIndex = this.daysControls.controls.findIndex(control => control.get('day').value === 'all');

      if (allDaysSelectedIndex !== -1) {
        this.removeDay(allDaysSelectedIndex);
      }
    }

  }

  isOptionDisabled(optionValue: string, dayIndex: number): boolean {
    const selectedOptions = this.daysControls.controls.map(control => control.get('day').value);

    if (selectedOptions.includes(optionValue)) {
      return true;
    }
    if (optionValue === 'all') {
      return selectedOptions.some(option => option !== '');
    }

    if (optionValue === 'mon-fri') {
      return selectedOptions.includes('all') ||
        selectedOptions.some(day => ['mon', 'tue', 'wed', 'thu', 'fri'].includes(day));
    }

    if (optionValue === 'sat-sun') {
      return selectedOptions.includes('all') ||
        selectedOptions.some(day => ['sat', 'sun'].includes(day));
    }

    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(optionValue)) {
      return selectedOptions.includes('all') ||
        selectedOptions.includes('mon-fri') ||
        selectedOptions.includes(optionValue);
    }

    if (['sat', 'sun'].includes(optionValue)) {
      return selectedOptions.includes('all') ||
        selectedOptions.includes('sat-sun') ||
        selectedOptions.includes(optionValue);
    }

    return false;
  }

  editisOptionDisabled(optionValue: string, dayIndex: number): boolean {
    const selectedOptions = this.editDaysControls.controls.map(control => control.get('day').value);

    if (selectedOptions.includes(optionValue)) {
      return true;
    }
    if (optionValue === 'all') {
      return selectedOptions.some(option => option !== '');
    }

    if (optionValue === 'mon-fri') {
      return selectedOptions.includes('all') ||
        selectedOptions.some(day => ['mon', 'tue', 'wed', 'thu', 'fri'].includes(day));
    }

    if (optionValue === 'sat-sun') {
      return selectedOptions.includes('all') ||
        selectedOptions.some(day => ['sat', 'sun'].includes(day));
    }

    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(optionValue)) {
      return selectedOptions.includes('all') ||
        selectedOptions.includes('mon-fri') ||
        selectedOptions.includes(optionValue);
    }

    if (['sat', 'sun'].includes(optionValue)) {
      return selectedOptions.includes('all') ||
        selectedOptions.includes('sat-sun') ||
        selectedOptions.includes(optionValue);
    }

    return false;
  }

  isDaySelected(dayValue: string): boolean {
    return dayValue !== '';
  }

  getSlotName(fromTime: string): string {


    // Split time and AM/PM
    const [time, modifier] = fromTime.split(' ');


    let [hourString, minutes] = time.split(':');


    // Convert hours to a number
    let hours: number = parseInt(hourString, 10);


    // Adjust hours based on AM/PM
    if (modifier === 'PM' && hours < 12) {
        hours += 12;

    } else if (modifier === 'AM' && hours === 12) {
        hours = 0;

    } else {

    }

    // Determine the time slot
    if (hours < 12) {

        return 'morning';
    } else if (hours < 17) {

        return 'afternoon';
    } else {

        return 'evening';
    }
}

  getIndividualDays(dayGroup: string): string[] {
    const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    switch (dayGroup) {
      case 'all':
        return allDays;
      case 'mon-fri':
        return allDays.slice(0, 5); // Monday to Friday
      case 'sat-sun':
        return allDays.slice(5, 7); // Saturday and Sunday
      default:
        return [dayGroup]; // For individual days
    }
  }

  private toastrShown = false; // Add a flag to track if toastr has been shown

  isSlide1Valid(): boolean {
    if (this.consultationType == 'visit') {
      return true;
    }

    if (this.shouldShowInClinicField() && this.shouldShowVideoField()) {
      if (
        this.establishmentForm.get('showInClinic')?.value ||
        this.establishmentForm.get('showVideo')?.value
      ) {
        this.toastrShown = false; // Reset the flag if a consultation type is selected
        return true;
      } else {
        if (!this.toastrShown) { // Only show toastr if it hasn't been shown
          this.toastr.error("Please Select At Least one consultation Type");
          this.toastrShown = true; // Set the flag to true to prevent multiple toastr messages
        }
        return false;
      }
    }

    const consultationTypeValid = this.establishmentForm.get('Consultation_type').valid;
    const nameValid = this.shouldShowInClinicField() === false ? true : this.establishmentForm.get('name').valid;
    const hospitalTypeIdValid = this.shouldShowInClinicField() === false ? true : this.establishmentForm.get('hospitalTypeId').valid;
    const landmarkValid = this.establishmentForm.get('address.landmark').valid;
    const cityValid = this.establishmentForm.get('address.city').valid;
    const stateValid = this.establishmentForm.get('address.state').valid;
    const pincodeValid = this.establishmentForm.get('address.pincode').valid;

    return (
      consultationTypeValid &&
      nameValid &&
      hospitalTypeIdValid &&
      landmarkValid &&
      cityValid &&
      stateValid &&
      pincodeValid
    );
  }


  onSelectHospital(hospital:any) {

      // this.isSlide1Valid()

    const patchData = {
      address: {
        landmark: hospital?.address?.landmark,
        locality: hospital?.address?.locality,
        city: hospital?.address?.cityName,
        state: hospital.address?.stateId,
        pincode: hospital.address?.pincode,
      },
      hospitalTypeId: hospital?.hospitalTypeiD,
      establishmentPic: hospital.profilePic,
      establishmentMobile: hospital.phone,
      establishmentEmail: hospital.email,
    };
    this.establishmentForm.patchValue(patchData);
    this.disableControl([
      "address",
      "hospitalTypeId",
      "establishmentMobile",
      "establishmentEmail",
    ]);
    this.control["hospitalId"].setValue(hospital.hospitalId);
    this.changePhoto = false;
    this.mapClickable = false;
    this.markerDragable = false;

  }

  get addressControl() {
    return this.control["address"] as FormGroup;
  }

  disableControl(args: string[], valid: boolean = true) {
    args.forEach((formControlName: string) => {
      if (valid) {
        if (this.control[formControlName].valid) {
          this.control[formControlName].disable();
        }
      } else {
        this.control[formControlName].disable();
      }
    });
  }

// patchDisable(patchData: any) {
//   Object.keys(patchData).forEach((key: any) => {
//     if (patchData[key]) {
//       this.addressControl.get(key).setValue(patchData[key]);
//       this.addressControl.get(key).disable();
//     } else {
//       this.addressControl.get(key).enable();
//       this.addressControl.get(key).setValue(null);
//     }
//   });
// }

  patchData() {
    const patchData = {
      consultationFees: this.data.establishmentDetail.consultationFees,
      profilePic: this.data.establishmentDetail.hospitalData.profilePic,
      name: this.data.establishmentDetail.hospitalData.name,
      establishmentEmail:
        this.data.establishmentDetail?.hospitalData?.establishmentEmail,
      establishmentMobile:
        this.data.establishmentDetail?.hospitalData?.establishmentMobile,
      hospitalTypeId: this.data.establishmentDetail.hospitalTypeId,
      location: this.data.establishmentDetail.hospitalData.location,
      address: { ...this.data.establishmentDetail.hospitalData.address },
      ...prepareDayTiming(this.data.establishmentDetail),
    };

    this.establishmentForm.patchValue(patchData);

    if (this.data.establishmentDetail.isOwner == 0) {
      this.changePhoto = false;
      this.disableControl(
        [
          "name",
          "hospitalTypeId",
          "address",
          "establishmentMobile",
          "establishmentEmail",
          "profilePic",
        ],
        true
      );
    } else {
      this.disableControl(["establishmentMobile", "establishmentEmail"]);
    }
  }

onUploadFile(event: any) {
  if (event.target?.files?.length) {
    this.apiService.fileUpload(event.target.files[0]).subscribe({
      next: (res: any) => {
        const data = {
          url: res.result.uri.uri,
          fileType: res.result.uri.mimeType.includes("image")
            ? "image"
            : "pdf",
        };
        this.control["profilePic"].setValue(data.url);
      },
      error: (error: any) => {
      },
    });
  }
}

onSearch(event: any, listName: string) {
  if (typeof google === 'undefined') {
    console.error('Google Maps API not loaded');
    return;
  }

  const search = event.target.value;
  if (search) {
    const service = new google.maps.places.AutocompleteService();

    // Add the country restriction here
    const options = {
      input: search,
      componentRestrictions: { country: 'IN' } // 'IN' is the country code for India
    };

    service.getPlacePredictions(options, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        this[listName] = predictions.map((prediction) => ({
          description: prediction.description,
          place_id: prediction.place_id,
        }));
      }
    });
  } else {
    this[listName] = [];
  }
}

onMenuClick() {
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
  const innerArea = document.getElementById("clickToCloseArea");
  const sideMenu = document.getElementById("sideMenu");
if (innerArea.classList.contains("openedSideBar")) {
  this.renderer.removeClass(innerArea, "openedSideBar");
  this.renderer.removeClass(sideMenu, "mobileMenu");

}

}

  onCloseMenuClick() {
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }

  // toggle modal
  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");

    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");
      this.isSlide1Visible = true;

    }
  }
  closeEditModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");
      this.isEditSlide1Visible = true;

    }
  }

  // This variable controls which slide is visible
  isSlide1Visible: boolean = true;
  isEditSlide1Visible: boolean = true;

  // This method hides slide 1 and shows slide 2
  showSlide2(): void {


    if (this.shouldShowInClinicField()) {
      if (
        this.establishmentForm.get('showInClinic')?.value==false &&
        this.establishmentForm.get('showVideo')?.value==false
      ) {
        this.toastr.error("Please Select At Least one consultation Type");

      } else{
        this.isSlide1Visible = false;

      }

    }else{
      this.isSlide1Visible = false;

    }



  }
  showEditSlide2(): void {
    // this.isEditSlide1Visible = false;
    if (this.shouldShowInClinicField()) {
      if (
        this.editEstablishmentForm.get('showInClinic')?.value==false &&
        this.editEstablishmentForm.get('showVideo')?.value==false
      ) {
        this.toastr.error("Please Select At Least one consultation Type");

      } else{
        this.isEditSlide1Visible = false;

      }

    }else{
      this.isEditSlide1Visible = false;

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

  showInClinic: boolean = true;
  showVideo: boolean = true;

  showInClinicEdit: boolean
  showVideoEdit: boolean

videoFeeFlag:any
inClinicFeeFlag:any

videoFeeFlagEdit:any
inClinicFeeFlagEdit:any

// Update In-Clinic Field based on checkbox
onInClinicCheckboxChangeEdit() {

  // this.showInClinicEdit=!this.showInClinicEdit
  // if (!this.showInClinicEdit) {
  //   this.inClinicFeeFlagEdit=true  }
  //   else{
  //     this.inClinicFeeFlagEdit=false
  //   }

    const currentValue = this.editEstablishmentForm.get('showInClinic')?.value;

  // Update the `inClinicFeeFlag` based on the new value
  if (!currentValue) {
    this.inClinicFeeFlagEdit = true;
  } else {
    this.inClinicFeeFlagEdit = false;
  }

}

// Update Video Field based on checkbox
onVideoCheckboxChangeEdit() {
//   this.showVideoEdit=!this.showVideoEdit
//   if (!this.showVideoEdit) {
// this.videoFeeFlagEdit=true  }
// else{
//   this.videoFeeFlagEdit=false
// }

const currentValue = this.editEstablishmentForm.get('showVideo')?.value;

// Update the `inClinicFeeFlag` based on the new value
if (!currentValue) {
  this.videoFeeFlagEdit = true;
} else {
  this.videoFeeFlagEdit = false;
}
}

// Update In-Clinic Field based on checkbox
onInClinicCheckboxChange() {
  const currentValue = this.establishmentForm.get('showInClinic')?.value;

  // Update the `inClinicFeeFlag` based on the new value
  if (!currentValue) {
    this.consultationType='visit'

//     this.establishmentForm.get('address.state')?.setValue(this.profileData.doctor.city)
//     this.establishmentForm.get('address.state')?.markAsDirty();
// this.establishmentForm.get('address.state')?.updateValueAndValidity();

this.establishmentForm.get('address')?.patchValue({
  state: this.profileData.doctor.city
});


    this.errorMessage = ''
        this.establishmentForm.patchValue({
          name: '',
          address: {
            landmark: '',
            locality: '',
            city: '',
            state: null,
            pincode: '',
          },
          hospitalTypeId: null,
          establishmentPic: '',
          establishmentMobile: '',
          establishmentEmail: '',
        });
        // Re-enable the controls
        this.enableControl(["name", "address", "hospitalTypeId", "establishmentMobile", "establishmentEmail",]);
        this.control["hospitalId"].reset();
        this.changePhoto = true;
        this.mapClickable = true;
        this.markerDragable = true;
        this.errorMessage = ''

    this.inClinicFeeFlag = true;

  } else {
    this.errorMessage = "Please Select One to Countine"
    this.disableControl(
      ["name", "hospitalTypeId", "address", "establishmentMobile", "establishmentEmail", "profilePic",], false);


    this.inClinicFeeFlag = false;
  }

}

// Update Video Field based on checkbox
onVideoCheckboxChange() {

 // Get the current value of the form control
 const currentValue = this.establishmentForm.get('showVideo')?.value;

 // Update the `videoFeeFlag` based on the new value
 if (!currentValue) {
   this.videoFeeFlag = true;
 } else {
   this.videoFeeFlag = false;
 }

}

  shouldShowInClinicField(): boolean {
      return this.profileData?.doctor?.consultationType === 'In-clinic' &&
        this.profileData?.doctor?.consultationDetails?.isInClinic;
    }



  shouldShowVideoField(): boolean {
    if (this.profileData?.doctor?.consultationType === 'video') {
      return true;
    }
    return this.profileData?.doctor?.consultationType === 'In-clinic' &&
      this.profileData?.doctor?.consultationDetails?.isVideo;
  }


}
