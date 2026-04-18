import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EventService } from "src/app/services/event.service";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { HospitalDeleteModalComponent } from "../../components/hospital-delete-modal/hospital-delete-modal.component";
import { CommonAddModalComponent } from "../../components/common-add-modal/common-add-modal.component";

@Component({
  standalone: false,
  selector: "nectar-hospital-speciality-list",
  templateUrl: "./hospital-speciality-list.component.html",
  styleUrls: ["./hospital-speciality-list.component.scss"],
})
export class HospitalSpecialityListComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private matdialog: MatDialog,
    private apiService: ApiService
  ) {}
  payload: any = {
    reverse: true,
  };
  apiCalled: boolean = false;
  sort: string;
  totalItems: number = 0;
  specialityList: any = [];
  ngOnInit(): void {
    this.getspecialityList();
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  onSorting(columnName: string, order: string) {
    this.payload.reverse = false;
    this.payload.sort = columnName;
    this.payload.sortOrder = order;
    if (!this.sort || this.sort != order) {
      this.sort = order;
      this.getspecialityList();
    }
  }
  onDelete(recordId: string) {
    const deleteDialog = this.matdialog.open(HospitalDeleteModalComponent, {
      data: {
        heading: "Delete from Hospital profile?",
        message:
          "The speciality will be removed permanently. Do  you want to delete?",
      },
    });
    deleteDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.apiService
          .delteParams(API_ENDPOINTS.hospital.specialityList, {
            recordId,
          })
          .subscribe({
            next: (res: any) => {
              this.getspecialityList();
            },
            error: (error: any) => {
            },
          });
      }
    });
  }
  onAdd() {
    const addDialog = this.matdialog.open(CommonAddModalComponent, {
      width: "720px",
      autoFocus: false,
      data: {
        masterKey: "specialization",
        addKey: "specialityList",
      },
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.payload = {};
        this.getspecialityList();
      }
    });
  }
  getspecialityList() {
    const payload = JSON.parse(JSON.stringify(this.payload));
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.apiService
      .get(API_ENDPOINTS.hospital.specialityList, payload)
      .subscribe({
        next: (res: any) => {
          this.apiCalled = true;

          const { count, list } = res.result;
          if (count) {
            this.specialityList = list;
            this.totalItems = count;
            return;
          }
          this.specialityList = [];
          this.totalItems = 0;
        },
        error: (error: any) => {
          this.apiCalled = true;
        },
      });
  }
}
