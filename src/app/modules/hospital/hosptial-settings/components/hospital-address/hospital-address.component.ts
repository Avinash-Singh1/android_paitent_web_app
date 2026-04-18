import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { HospitalAddressModalComponent } from "../hospital-address-modal/hospital-address-modal.component";
import { GoogleMapsService } from "src/app/services/google-maps.service";

@Component({
  standalone: false,
  selector: "nectar-hospital-address",
  templateUrl: "./hospital-address.component.html",
  styleUrls: ["./hospital-address.component.scss"],
})
export class HospitalAddressComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private localStorage: LocalStorageService,
    public googleMapService: GoogleMapsService
  ) {}

  ngOnInit(): void {
    this.getAddress();
    this.hospitalName = this.localStorage.getItem("establishmentName");
  }
  address: any = {};
  location: any = {};
  hospitalName: string;
  apiCalled: boolean = false;
  getAddress() {
    this.apiService.get(API_ENDPOINTS.hospital.getAddress, {}).subscribe({
      next: (res: any) => {
        this.apiCalled = true;
        this.address = res.result.address;
        this.location = res.result.location;
      },
      error: () => {},
    });
  }
  onAddAddress() {}
  onEditAddresss() {
    const editDialog = this.matdialog.open(HospitalAddressModalComponent, {
      width: "70vw",
      data: {
        address: this.address,
        location: this.location,
      },
      autoFocus: false,
    });
    editDialog.afterClosed().subscribe((res: any) => {
      if (res) {
        this.address = res.address;
        this.location = res.location;
      }
    });
  }
}
