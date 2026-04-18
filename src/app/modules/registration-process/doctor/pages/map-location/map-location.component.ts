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
  selector: "nectar-map-location",
  templateUrl: "./map-location.component.html",
  styleUrls: ["./map-location.component.scss"],
})
export class MapLocationComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private eventService: EventService,
    private router: Router,
    private googleMapService: GoogleMapsService
  ) {}
  address: FormGroup;
  name: string = "";
  zoom: number = 10;
  sectionC: any = {
    address: null,
    location: null,
  };
  routes = {
    next: ROUTE_CONSTANT.DOCTOR.registerSectionc2,
    back: ROUTE_CONSTANT.DOCTOR.registerProcess,
  };
  saveExit$: Subscription;
  hospitalId: string;
  predicationList: any = [];
  predicationCityList: any = [];
  stateList = [];
  countryList = [{ name: "India", _id: "India" }];
  submitted: boolean = false;
  searchSubject: Subject<any> = new Subject();
  markerDragable: boolean = true;
  mapClickable: boolean = true;
  location: any;
  editAddress: boolean = false;
  ngOnInit(): void {
    this.getListing();
    this.validateForm();

    this.getEvents();
    this.getPrediction();
    this.broadcastEvent();
    this.location = this.localStorage.getItem("location");
    if (this.location) {
      this.location = JSON.parse(this.location);
    } else {
      this.location = [77.216721, 28.6448];
    }

    this.sectionC = this.localStorage.getItem("sectionC") ?? this.sectionC;
    const { editAddress, location, address } = this.sectionC;
    this.editAddress = editAddress;
    this.address.patchValue({ ...address, location }, { emitEvent: false });
    if (!editAddress) {
      this.markerDragable = false;
      this.mapClickable = false;
      Object.keys(this.address.value).forEach((control: any) => {
        if (control != "location") {
          if (this.address.value[control]) this.control[control].disable();
        }
      });
    }
    const sectionA = this.localStorage.getItem("sectionA");
    if (sectionA) {
      const { name } = sectionA.establishmentDetails;
      this.name = name;
    }
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
  onMapClicked(event: any) {
    if (this.mapClickable) {
      this.address.reset();
      this.onSelectPlace(event);
    }
  }
  onMarkerDrag(event: any) {
    this.onSelectPlace(event);
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
      country: [{ value: "India", disabled: true }],
      location: this.fb.group({
        coordinates: this.fb.array([this.location?.[0], this.location?.[1]]),
      }),
    });
  }
  onSearch(event: any, listName: string) {
    const search = event.target.value;
    if (search) this.searchSubject.next({ search, listName });
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
  onClearAddress() {
    this.predicationCityList = [];
    this.predicationList = [];
    this.address.enable();
    this.validateForm();
    this.zoom = 10;
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
      laststep: 3,
    });
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
  onSubmit() {
    this.submitted = true;
    if (this.address.valid) {
      this.sectionC = {
        ...this.sectionC,
        address: this.address.getRawValue(),
        location: this.address.value.location,
      };
      this.localStorage.setItem("sectionC", this.sectionC);
      this.router.navigate([this.routes.next]);
    }
  }
  back() {
    this.router.navigate([this.routes.back]);
  }
  get control() {
    return this.address.controls;
  }
  getEvents() {
    this.saveExit$ = this.eventService.getEvent("saveExit").subscribe({
      next: (res: boolean) => {
        const isEdit = this.localStorage.getItem("isEdit") ?? 0;
        if (res) {
          this.sectionC = {
            ...this.sectionC,
            address: this.address.valid ? this.address.value : null,
          };
          let flag = false;
          Object.keys(this.sectionC).forEach((key: any) => {
            if (this.sectionC[key] != null) flag = true;
          });
          if (!flag) {
            this.localStorage.removeItems([
              "sectionA",
              "sectionB",
              "sectionC",
              "steps",
              "isEdit",
              "token",
              "isLogged",
              "userType",
            ]);
            this.router.navigate(["/"]);
            this.eventService.broadcastEvent("showheader", "normalheader");
            this.eventService.broadcastEvent("footer", "normal");
            return;
          }
          const payload = {
            isSaveAndExit: true,
            steps: 3,
            isEdit: isEdit ? true : false,
            profileScreen: APP_CONSTANTS.DOCTOR_SCREENS.ESTABLISHMENT_LOCATION,
            records: {
              ...this.sectionC,
              address: this.address.valid ? this.address.getRawValue() : null,
              location: this.address.value.location,
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
  }
}
