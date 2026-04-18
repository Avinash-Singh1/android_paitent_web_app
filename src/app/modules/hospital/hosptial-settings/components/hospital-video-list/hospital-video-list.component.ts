import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { SettingsAddModalComponent } from "../settings-add-modal/settings-add-modal.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";

@Component({
  standalone: false,
  selector: "nectar-hospital-video-list",
  templateUrl: "./hospital-video-list.component.html",
  styleUrls: ["./hospital-video-list.component.scss"],
})
export class HospitalVideoListComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.getvideoList();
    this.getEvents();
  }
  videoList = [];
  deleteSubscription$: Subscription;
  selectedId: string;
  getvideoList() {
    this.apiService
      .get(API_ENDPOINTS.hospital.videoList, {
        userType: APP_CONSTANTS.USER_TYPES.HOSPITAL,
      })
      .subscribe({
        next: (res: any) => {
          this.videoList = res.result;
        },
        error: () => {
          this.videoList = [];
        },
      });
  }
  onAddVideo() {
    const addDialog = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 3,
        heading: "Add New Video",
        apiEndpoints: API_ENDPOINTS.hospital.addVideo,
        edit: false,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getvideoList();
      }
    });
  }
  onEditVideos(video) {
    this.selectedId = video._id;
    const editModal = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 3,
        edit: true,
        patchValue: video,
        heading: "Edit Video",
        apiEndpoints: API_ENDPOINTS.hospital.editVideo,
        editKey: "videoId",
      },
    });
    editModal.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getvideoList();
      }
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .delteParams(API_ENDPOINTS.hospital.deleteVideo, {
              videoId: this.selectedId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getvideoList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}
