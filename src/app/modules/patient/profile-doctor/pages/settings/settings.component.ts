import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { DeleteModalComponent } from "src/app/shared/components/delete-modal/delete-modal.component";

@Component({
  standalone: false,
  selector: "nectar-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent {
  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private ApiService: ApiService,
    private toastr: ToastrService,
    private eventService: EventService,
    private dialog: MatDialog
  ) {}

  logout() {
    this.ApiService.logout();
  }

  deleteAccount() {
    this.ApiService.put(API_ENDPOINTS.patient.getUserDetail, {
      isDeleted: true,
    }).subscribe((res: any) => {
      this.eventService.broadcastEvent("login", false);
      this.localStorage.removeAllItem();
      this.toastr.success("Account deleted successfully !");
      this.router.navigate(["/"]);
    });
  }
  deleteAccountPopup() {
    const dialogref = this.dialog.open(DeleteModalComponent, {
      data: {
        heading: "Delete Report",
        message: "Are you sure you want to delete your profile?",
        type: "patient",
      },
    });
    dialogref.afterClosed().subscribe((data: any) => {
      if (data) {
        this.deleteAccount();
      }
    });
  }
}
