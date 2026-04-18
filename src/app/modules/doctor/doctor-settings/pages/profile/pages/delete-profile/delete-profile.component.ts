import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-delete-profile",
  templateUrl: "./delete-profile.component.html",
  styleUrls: ["./delete-profile.component.scss"],
})
export class DeleteProfileComponent {
  constructor(
    private apiService: ApiService,
    private localstorage: LocalStorageService,
    private route: Router
  ) {}

  submitForm() {
    let id = this.localstorage.getItem("findUserId");
    let param = {
      id: id,
    };

    this.apiService
      .putSetting(API_ENDPOINTS.doctor.deleteDoctor, "", param)
      .subscribe((res: any) => {
        if (res?.success) {
          this.route.navigate(["/"]);
          this.localstorage.removeAllItem();
        }
      });
  }
}
