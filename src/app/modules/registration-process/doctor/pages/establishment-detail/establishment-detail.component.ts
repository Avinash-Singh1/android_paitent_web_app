import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  filter,
  map,
} from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-establishment-detail",
  templateUrl: "./establishment-detail.component.html",
  styleUrls: ["./establishment-detail.component.scss"],
})
export class EstablishmentDetailComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private eventService: EventService
  ) {}
  results$: Observable<any[]>;
  subject = new Subject();
  establishmentBasicDetails: FormGroup;
  establishmentType: any = {
    owner: true,
    visitor: false,
  };
  doctorSignupData: any = {};
  cityList: any = [];
  sectionA: any = {
    establishmentDetails: null,
  };
  streets: any = [];
  hospitalType: { name: string; _id: string }[];
  filteredHopitals: any[] = [];
  routes = {
    back: ROUTE_CONSTANT.DOCTOR.registerSectionA4,
    next: ROUTE_CONSTANT.DOCTOR.registerProcess,
  };
  saveExit$: Subscription;
  search$: Subscription;
  ngOnInit(): void {
    this.getEvents();
    this.broadcastEvent();
    this.getListing();
    this.validateForm();
    this.sectionA = this.localStorage.getItem("sectionA") ?? this.sectionA;
    if (this.sectionA.establishmentDetails)
      this.patchValue(this.sectionA.establishmentDetails);

    this.getHospitalList();
    this.onValueChanges();
  }

  back() {
    this.router.navigate([this.routes.back]);
  }

  validateForm() {
    this.establishmentBasicDetails = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      hospitalTypeId: [null, Validators.required],
      hospitalId: [null],
      isOwner: [],
    });
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.hospitalType, {}).subscribe({
      next: (res: any) => {
        this.hospitalType = res.result.data;
      },
      error: (error: any) => {
        this.hospitalType = [];
      },
    });
  }
  get control() {
    return this.establishmentBasicDetails.controls;
  }
  patchValue(details) {
    this.establishmentBasicDetails.patchValue(details);
  }
  onSubmit() {
    this.establishmentBasicDetails.markAllAsTouched();
    if (this.establishmentBasicDetails.valid) {
      this.enableFields(false, "hospitalTypeId");
      const isEdit = this.localStorage.getItem("isEdit");
      this.sectionA = {
        ...this.sectionA,
        establishmentDetails: this.establishmentBasicDetails.value,
      };
      const payload = {
        steps: 1,
        isEdit: isEdit && isEdit >= 1 ? true : false,
        isSaveAndExit: false,
        records: {
          ...this.sectionA,
        },
      };
      this.localStorage.setItem("sectionA", this.sectionA);
      this.apiService
        .put(API_ENDPOINTS.doctor.updateProfile, payload)
        .subscribe({
          next: (res: any) => {
            let steps = this.localStorage.getItem("steps") ?? 2;
            if (steps < 2) {
              steps = 2;
            }
            this.localStorage.setItem("steps", steps);
            this.router.navigate([this.routes.next]);
          },
          error: (error: any) => {
          },
        });
    }
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 5,
      laststep: 5,
    });
  }
  search(evt) {
    const searchText = evt.target.value;
    if (!this.control["isOwner"].value) this.subject.next(searchText);
  }
  getHospitalList() {
    this.search$ = this.subject
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
              this.filteredHopitals = res.result.data;
            },
            error: (error: any) => {
            },
          });
      });
  }
  onSelectHospital(hospital) {
    const patchData = {
      hospitalTypeId: hospital?.hospitalTypeiD,
    };
    this.patchDisableFields(patchData, "hospitalTypeId");
    this.control["hospitalId"].setValue(hospital.hospitalId);
  }
  patchDisableFields(patchData: any, ...args) {
    args.forEach((field: string) => {
      if (patchData[field]) {
        this.control[field].setValue(patchData[field]);
        this.control[field].disable();
      }
    });
  }
  enableFields(setNull: boolean, ...args) {
    args.forEach((field: string) => {
      this.control[field].enable();
      if (setNull) this.control[field].setValue(null);
    });
  }
  onValueChanges() {
    this.control["name"].valueChanges.subscribe({
      next: (res: any) => {
        if (this.control["hospitalId"].value && this.filteredHopitals.length) {
          const i = this.filteredHopitals.findIndex((hospital) => {
            return this.control["name"].value == hospital.hospitalName;
          });
          if (i == -1) {
            this.control["hospitalId"].setValue(null);
            this.enableFields(true, "hospitalTypeId");
          }
        }
      },
    });
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        if (res) {
          const payload = {
            isSaveAndExit: true,
            steps: 1,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.ESTABLISHMENT_DETAILS,
            records: {
              ...this.sectionA,
              establishmentDetails: this.establishmentBasicDetails.valid
                ? this.establishmentBasicDetails.value
                : null,
            },
          };
          this.apiService.saveAndExit(payload);
        }
      },
    });
  }
  ngOnDestroy(): void {
    if (this.saveExit$) {
      this.saveExit$.unsubscribe();
    }
    if (this.search$) {
      this.search$.unsubscribe();
    }
  }
}
