import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subject, debounceTime } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { getAddressKeys } from "src/app/utils/helper";

@Component({
  standalone: false,
  selector: "nectar-hospital-address-modal",
  templateUrl: "./hospital-address-modal.component.html",
  styleUrls: ["./hospital-address-modal.component.scss"],
})
export class HospitalAddressModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public matdialogRef: MatDialogRef<HospitalAddressModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private googleMapService: GoogleMapsService
  ) {}
  geocoder: google.maps.Geocoder;
  addressForm: FormGroup;
  stateList: any = [];
  countryList: any = [{ name: "India", _id: "India" }];
  placePredictions: any[] = [];
  cityPredications: any[] = [];
  searchSubject: Subject<any> = new Subject();
  placeService: any;
  zoom: number = 12;
  ngOnInit(): void {
    this.getListing();
    this.validateForm();
    this.getPrediction();
  }
  get control() {
    return this.addressForm.controls;
  }
  get addressControl() {
    return this.addressForm.controls["address"] as FormGroup;
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
          this.addressForm.patchValue({
            location: {
              coordinates: [geometry.location.lng(), geometry.location.lat()],
            },
          });
        })
        .catch((error: any) => {
        });
    }
  }
  onSearch(event: any, listName: string) {
    const search = event.target.value;
    if (search) {
      this.searchSubject.next({ search, listName });
      return;
    }
    this[listName] = [];
  }

  validateForm() {
    this.addressForm = this.fb.group({
      address: this.fb.group({
        landmark: [
          "",
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(100),
          ],
        ],
        locality: [
          "",
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(100),
          ],
        ],
        pincode: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6),
          ],
        ],
        city: [
          "",
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(100),
          ],
        ],
        state: [null, [Validators.required]],

        country: [{ value: "India", disabled: true }, [Validators.required]],
      }),
      location: this.fb.group({
        coordinates: this.fb.array(["", ""]),
      }),
    });

    this.addressForm.patchValue({ ...this.data });
  }
  onSubmit() {
    this.addressForm.markAllAsTouched();
    Object.keys(this.addressControl.controls).forEach((control: any) => {
      this.addressControl.get(control).enable();
    });
    if (this.addressForm.valid) {
      this.apiService
        .put(API_ENDPOINTS.hospital.editAddress, this.addressForm.value)
        .subscribe({
          next: (res: any) => {
            const payload = {
              ...this.addressForm.value,
              address: {
                ...this.addressForm.value.address,
                stateName: this.stateList.find((item) => {
                  return item._id == this.addressForm.value.address.state;
                })?.name,
              },
            };
            this.matdialogRef.close(payload);
          },
        });
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
  getListing() {
    this.apiService.get(API_ENDPOINTS.MASTER.state, {}).subscribe({
      next: (res: any) => {
        const { data } = res.result;
        this.stateList = data;
      },
    });
  }
  onSearchInput(value: string) {
    if (value?.length) {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "in" },
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            this.placePredictions = predictions;
          } else {
            this.placePredictions = [];
          }
        }
      );
    } else {
      this.placePredictions = [];
    }
  }
  onPinLocation(payload: any) {
    this.onSelectPlace(payload);
  }
  onMarkerDrag(paylaod: any) {
    this.onSelectPlace(paylaod);
  }
  onSelectPlace(placeId: any, index: number = 1) {
    this.googleMapService
      .getAddressComponents(placeId.place_id)
      .then((place: any) => {
        this.data.location.coordinates[0] = place.geometry.location.lng();
        this.data.location.coordinates[1] = place.geometry.location.lat();
        this.addressForm.patchValue({
          location: {
            coordinates: [
              this.data.location.coordinates[0],
              this.data.location.coordinates[1],
            ],
          },
        });
        const response = getAddressKeys(
          place.address_components,
          this.stateList,
          index
        );

        this.patchDisable(response);
      })
      .catch((error: any) => {
        console.error("Error retrieving address components:", error);
      });
  }
  patchDisable(patchData: any) {
    Object.keys(patchData).forEach((key: any) => {
      if (patchData[key]) {
        this.addressControl.get(key).setValue(patchData[key]);
        this.addressControl.get(key).disable();
        return;
      }
      this.addressControl.get(key).enable();
      this.addressControl.get(key).setValue(null);
    });
  }
}
