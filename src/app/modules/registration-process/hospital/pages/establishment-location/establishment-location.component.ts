import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, Subscription, debounceTime } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { getAddressKeys } from "src/app/utils/helper";

@Component({
  standalone: false,
  selector: "nectar-establishment-location",
  templateUrl: "./establishment-location.component.html",
  styleUrls: ["./establishment-location.component.scss"],
})
export class EstablishmentLocationComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private eventService: EventService,
    private router: Router,
    private googleMapService: GoogleMapsService
  ) {}
  disabled: boolean = true;
  address: FormGroup;
  name: string = "";
  sectionC: any = {
    address: null,
    location: null,
  };
  routes = {
    establishmentTiming: ROUTE_CONSTANT.HOSPITAL.registerSectionC2,
    process: ROUTE_CONSTANT.HOSPITAL.registerProcess,
  };
  saveExit$: Subscription;
  searchSubject: Subject<any> = new Subject();
  predicationList: any = [];
  predicationCityList: any = [];
  location: any = [];
  zoom: number = 10;
  stateList = [];
  countryList = [{ name: "India", _id: "India" }];
  submitted: boolean = false;
  ngOnInit(): void {
    this.googleMapService
      .getLocation({
        address:
          "DR. DARSH GOYAL, BEST ORTHOPEDIC SURGEON,GOLD MEDALIST IN WEST DELHI, FJRS - USA, UK, GERMANY, Block A1, Janakpuri, New Delhi, Delhi, India",
      })
      .then((value: any) => {});
    this.location = this.localStorage.getItem("location");
    if (this.location) {
      this.location = JSON.parse(this.location);
    } else {
      this.location = [77.216721, 28.6448];
    }
    this.validateForm();
    this.sectionC =
      this.localStorage.getItem("sectionCHospital") ?? this.sectionC;
    this.getListing();
    this.broadcastEvent();
    const sectionA = this.localStorage.getItem("sectionAHospital");
    if (sectionA) {
      const { fullName } = sectionA;
      this.name = fullName;
    }
    if (this.sectionC.address) {
      this.address.patchValue(this.sectionC.address);
    }
    if (this.sectionC.location) {
      this.address.patchValue({ location: this.sectionC.location });
    }
    this.getEvents();
    this.getPrediction();
  }

  validateForm() {
    this.address = this.fb.group({
      landmark: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      locality: ["", [Validators.minLength(3), Validators.maxLength(100)]],
      city: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      state: [null, Validators.required],
      pincode: [
        "",
        [Validators.required, Validators.maxLength(6), Validators.minLength(6)],
      ],
      country: [{ value: "India", disabled: true }, [Validators.required]],
      location: this.fb.group({
        coordinates: this.fb.array([this.location[0], this.location[1]]),
      }),
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
  onClearAddress() {
    this.predicationCityList = [];
    this.predicationList = [];
    this.validateForm();
    this.zoom = 10;
  }
  onSelectPlace(place, i: number = 1) {
    this.googleMapService
      .getAddressComponents(place.place_id)
      .then((place: any) => {
        this.address.patchValue({
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
        for (let item in response) {
          if (!response[item]) {
            delete response[item];
          }
        }

        this.patchDisable(response);
        this.zoom = 12;
      })
      .catch((error: any) => {});
  }
  onSelectState() {
    const state = this.stateList.find((state: any) => {
      return state._id == this.control["state"].value;
    })?.name;
    if (state) {
      this.googleMapService
        .getLocation({ address: state })
        .then((res: any) => {
          const { geometry } = res[0];
          this.address.patchValue({
            location: {
              coordinates: [geometry.location.lng(), geometry.location.lat()],
            },
          });
        })
        .catch((error: any) => {
        });
    }
  }
  onMapClicked(event: any) {
    this.onSelectPlace(event);
  }
  onMarkerDrag(event: any) {
    this.onSelectPlace(event);
  }
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
      next: (res: any) => {
        this.stateList = res.result.data;
      },
    });
  }
  broadcastEvent() {
    this.eventService.broadcastEvent("step", {
      showstep: true,
      currentstep: 1,
      laststep: 2,
    });
  }
  onSubmit() {
    this.address.enable();
    Object.keys(this.address.controls).forEach((control: any) => {
      this.address.get(control).enable();
    });
    this.submitted = true;
    if (this.address.valid) {
      this.sectionC = {
        ...this.sectionC,
        address: this.address.value,
        location: this.address.value.location,
      };
      this.localStorage.setItem("sectionCHospital", this.sectionC);
      this.router.navigate([this.routes.establishmentTiming]);
    }
  }
  back() {
    this.router.navigate([this.routes.process]);
  }
  get control() {
    return this.address.controls;
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        if (res) {
          const payload = {
            isSaveAndExit: true,
            steps: 3,
            isEdit: isEdit ? true : false,
            profileScreen:
              APP_CONSTANTS.HOSPITAL_SCREENS.ESTABLISHMENT_LOCATION,
            records: {
              ...this.sectionC,
              address: this.address.valid ? this.address.getRawValue() : null,
              location: this.address.value.location,
            },
          };
          this.apiService.saveAndExitHospital(payload);
        }
      },
    });
  }
  patchDisable(patchData: any) {
    Object.keys(patchData).forEach((key: any) => {
      if (patchData[key]) {
        this.control[key].setValue(patchData[key]);
        this.control[key].disable();
        return;
      }
      this.control[key].enable();
      this.control[key].setValue(null);
    });
  }
  ngOnDestroy(): void {
    if (this.saveExit$) {
      this.saveExit$.unsubscribe();
    }
  }
}
