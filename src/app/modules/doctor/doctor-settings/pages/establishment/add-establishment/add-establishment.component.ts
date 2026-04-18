import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ToastrService } from "ngx-toastr";
import { Subject, debounceTime, filter, map } from "rxjs";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { CreateFormService } from "src/app/services/create-form.service";
import { FormValidationService } from "src/app/services/form-validation.service";
import { getAddressKeys, prepareDayTiming } from "src/app/utils/helper";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: "nectar-add-establishment",
  templateUrl: "./add-establishment.component.html",
  styleUrls: ["./add-establishment.component.scss"],
})
export class AddEstablishmentComponent implements OnInit {
  constructor(
    public matdiaRef: MatDialogRef<AddEstablishmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private apiService: ApiService,
    private el: ElementRef,
    private toastr: ToastrService,
    private eventService: EventService,
    private googleMapService: GoogleMapsService,
    private localStorage: LocalStorageService,
    private createForm: CreateFormService,
    private formValidation: FormValidationService
  ) {}
  hospitalList: any[];
  subject = new Subject();
  opened: boolean = false;
  heading = "Add Establishment";
  establishmentForm: FormGroup;
  submitted: boolean = false;
  changePhoto: boolean = true;
  zoom: number = 10;
  timingArray = {
    0: this.generatTimiListing(
      new Date().setHours(0, 0, 0, 0),
      new Date().setHours(11, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
    1: this.generatTimiListing(
      new Date().setHours(12, 0, 0, 0),
      new Date().setHours(16, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
    2: this.generatTimiListing(
      new Date().setHours(17, 0, 0, 0),
      new Date().setHours(23, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
  };
  openAndClosing = [
    {
      dayname: "Monday",
      opened: !this.data.edit,
      formControlName: "mon",
    },
    {
      dayname: "Tuesday",
      opened: false,
      formControlName: "tue",
    },
    {
      dayname: "Wednesday",
      opened: false,
      formControlName: "wed",
    },
    {
      dayname: "Thursday",
      opened: false,
      formControlName: "thu",
    },
    {
      dayname: "Friday",
      opened: false,
      formControlName: "fri",
    },
    {
      dayname: "Saturday",
      opened: false,
      formControlName: "sat",
    },
    {
      dayname: "Sunday",
      opened: false,
      formControlName: "sun",
    },
  ];
  hospitalTypeList = [];
  countryList = [{ name: "India", _id: "India" }];
  stateList = [];
  updated: boolean = false;
  searchSubject: Subject<any> = new Subject();
  predicationList: any = [];
  predicationCityList: any = [];
  location: any = [];
  markerDragable: boolean = true;
  mapClickable: boolean = true;
  ngOnInit(): void {
    this.location = this.localStorage.getItem("location");
    if (!this.location) {
      this.location = [77.216721, 28.6448];
    } else {
      this.location = JSON.parse(this.location);
    }
    this.getListing();
    this.validateForm();
    this.onSearchHospital();
    this.onFormValueChanges();
    this.onNameValueChanges();
    this.getPrediction();
    if (this.data.edit) {
      this.heading = "Edit Establishment";
      this.patchData();
    }
    this.openAndClosing.forEach((day) => {
      day.opened
        ? this.control[day.formControlName].enable()
        : this.control[day.formControlName].disable();
    });
    if (this.data.establishmentDetail.isOwner == 0 && this.data.edit) {
      this.mapClickable = false;
      this.markerDragable = false;
    }
    this.matdiaRef.afterClosed().subscribe((res: any) => {
      this.eventService.broadcastEvent("adddialogClosed", this.updated);
    });
  }
  onSearch(event: any, listName: string) {
    const search = event.target.value;
    if (search) {
      this.searchSubject.next({ search, listName });
      return;
    }
    this[listName] = [];
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
  onSelectPlace(place, i: number = 1) {
    this.googleMapService
      .getAddressComponents(place.place_id)
      .then((place: any) => {
        this.establishmentForm.patchValue({
          location: {
            coordinates: [
              place.geometry.location.lng(),
              place.geometry.location.lat(),
            ],
          },
        });
        const response = getAddressKeys(
          place.address_components,
          this.stateList,
          i
        );

        this.patchDisable(response);

        this.zoom = 12;
      })
      .catch((error: any) => {});
  }
  onMapClicked(event: any) {
    if (this.mapClickable) {
      this.onSelectPlace(event);
    }
  }
  onMarkerDrag(event: any) {
    this.onSelectPlace(event);
  }
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
    this.openAndClosing.forEach((el: any) => {
      el.opened = patchData[el.formControlName].length;
    });
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
        false
      );
    } else {
      this.disableControl(["establishmentMobile", "establishmentEmail"]);
    }
  }
  onNameValueChanges() {
    if (this.data.establishmentDetail.isOwner == 0) {
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
  onToggle(i: number) {
    this.openAndClosing[i].opened = !this.openAndClosing[i].opened;
    this.openAndClosing[i].opened
      ? this.control[this.openAndClosing[i].formControlName].enable()
      : this.control[this.openAndClosing[i].formControlName].disable();
  }
  get control() {
    return this.establishmentForm.controls;
  }
  validateForm() {
    this.establishmentForm = this.fb.group({
      profilePic: [""],
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(500),
        ],
      ],
      hospitalTypeId: [null, [Validators.required]],
      hospitalId: [null],
      address: this.fb.group({
        landmark: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(500),
          ],
        ],
        locality: ["", [Validators.minLength(3), Validators.maxLength(500)]],
        city: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(500),
          ],
        ],
        state: [null, [Validators.required]],
        pincode: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6),
          ],
        ],
        country: [{ value: "India", disabled: true }, [Validators.required]],
      }),
      establishmentMobile: [
        "",
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
      establishmentEmail: [
        "",
        [
          Validators.pattern(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
          ),
        ],
      ],
      location: this.fb.group({
        coordinates: this.fb.array([this.location[0], this.location[1]]),
      }),
      consultationFees: ["", Validators.required],
      mon: this.createForm.createDay(),
      tue: this.createForm.createDay(),
      wed: this.createForm.createDay(),
      thu: this.createForm.createDay(),
      fri: this.createForm.createDay(),
      sat: this.createForm.createDay(),
      sun: this.createForm.createDay(),
    });
    this.establishmentForm.setValidators(
      this.formValidation.atleastOneDay(
        "mon",
        "tue",
        "wed",
        "thu",
        "fri",
        "sat",
        "sun"
      )
    );
  }

  onSubmit() {
    this.submitted = true;
    this.establishmentForm.markAllAsTouched();
    if (this.establishmentForm.valid) {
      this.enableDisableControl();
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
              this.matdiaRef.close();
              this.toastr.success("Establishment detail updated successfully");
            },
            error: (error: any) => {
              this.enableDisableControl(true);
            },
          });

        return;
      }
      this.apiService
        .post(API_ENDPOINTS.doctor.addEstablishment, {
          ...this.establishmentForm.value,
          isOwner: this.data.establishmentDetail.isOwner,
        })
        .subscribe({
          next: (res: any) => {
            this.updated = true;
            this.matdiaRef.close(true);
            this.toastr.success("Establishment added successfully");
          },
          error: (error: any) => {
            this.enableDisableControl(true);
          },
        });
    }
  }
  dayControl(day: string) {
    return this.establishmentForm.get(day) as FormArray;
  }
  get addressControl() {
    return this.control["address"] as FormGroup;
  }
  onFormValueChanges() {
    this.establishmentForm.valueChanges.subscribe(() => {
      this.submitted = false;
    });
  }
  generatTimiListing(startTime: number, endTime: number, interval: number) {
    let timeList = [];
    for (let i = startTime; i <= endTime; i += interval) {
      timeList.push({
        name: this.datepipe.transform(new Date(i), "h:mm a"),
        _id: this.datepipe.transform(new Date(i), "h:mm a"),
      });
    }
    return timeList;
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
  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");
    setTimeout(() => {
      firstInvalidControl?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.hospitalType, {}).subscribe({
      next: (res) => {
        this.hospitalTypeList = res.result.data;
      },
      error: (error: any) => {
        this.hospitalTypeList = [];
      },
    });
    this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
      next: (res) => {
        this.stateList = res.result.data;
      },
      error: (error: any) => {
        this.stateList = [];
      },
    });
  }
  search(evt) {
    if (this.data.establishmentDetail.isOwner == 0) {
      const searchText = evt.target.value;
      this.subject.next(searchText);
    }
  }
  onSelectHospital(hospital) {
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
  patchDisable(patchData: any) {
    Object.keys(patchData).forEach((key: any) => {
      if (patchData[key]) {
        this.addressControl.get(key).setValue(patchData[key]);
        this.addressControl.get(key).disable();
      } else {
        this.addressControl.get(key).enable();
        this.addressControl.get(key).setValue(null);
      }
    });
  }
  enableDisableControl(enable: boolean = false) {
    this.openAndClosing.forEach((day: any) => {
      if (this.control[day.formControlName].status != "DISABLED") {
        this.dayControl(day.formControlName).controls.forEach(
          (slot: any, i: number) => {
            enable
              ? slot.enable()
              : Object.keys(slot.value).forEach((key: any) => {
                  if (slot.value?.[key] == null) {
                    slot.disable();
                  }
                });
          }
        );
      }
    });
  }
}
