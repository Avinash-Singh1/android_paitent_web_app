import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-hospital-delete-profile",
  templateUrl: "./hospital-delete-profile.component.html",
  styleUrls: ["./hospital-delete-profile.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalDeleteProfileComponent {
  constructor(
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private route: Router
  ) {}

  submitForm() {
    this.apiService
      .deleteAccount(API_ENDPOINTS.hospital.deleteAccount)
      .subscribe((res: any) => {
        if (res?.success) {
          this.route.navigate(["/"]);
          this.localStorage.removeAllItem();
        }
      });
  }
}
