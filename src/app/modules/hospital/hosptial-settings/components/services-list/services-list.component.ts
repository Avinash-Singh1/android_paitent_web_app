import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { SettingsAddModalComponent } from "../settings-add-modal/settings-add-modal.component";
import { HospitalDeleteModalComponent } from "../../../components/hospital-delete-modal/hospital-delete-modal.component";
import { Subscription } from "rxjs";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-services-list",
  templateUrl: "./services-list.component.html",
  styleUrls: ["./services-list.component.scss"],
})
export class ServicesListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService
  ) {}
  serviceList = [];
  deleteSubscription$: Subscription;
  selectedId: string;
  ngOnInit(): void {
    this.getServicesList();
    this.getEvents();
  }
  getServicesList() {
    this.apiService.get(API_ENDPOINTS.hospital.serviceList, {}).subscribe({
      next: (res: any) => {
        this.serviceList = res.result;
      },
      error: (error: any) => {
        this.serviceList = [];
      },
    });
  }
  onAddService() {
    const addDialog = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 1,
        heading: "Add Services",
        edit: false,
        apiEndpoints: API_ENDPOINTS.hospital.addService,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getServicesList();
      }
    });
  }
  onDeleteService(serviceId: string) {
    this.selectedId = serviceId;
    this.matdialog.open(HospitalDeleteModalComponent, {
      data: {
        heading: "Delete from Hospital profile?",
        message: "The FAQ will be removed permanently. Do you want to delete?",
      },
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .delteParams(API_ENDPOINTS.hospital.deleteService, {
              serviceId: this.selectedId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getServicesList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}
