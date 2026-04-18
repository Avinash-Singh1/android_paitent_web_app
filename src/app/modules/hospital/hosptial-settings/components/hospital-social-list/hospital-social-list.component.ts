import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { HospitalAddSocialmediaComponent } from "../hospital-add-socialmedia/hospital-add-socialmedia.component";

@Component({
  standalone: false,
  selector: "nectar-hospital-social-list",
  templateUrl: "./hospital-social-list.component.html",
  styleUrls: ["./hospital-social-list.component.scss"],
})
export class HospitalSocialListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.getSocialList();
    this.getEvents();
  }
  socialList = [];
  deleteSubscription$: Subscription;
  selectedId: string;
  getSocialList() {
    this.apiService.get(API_ENDPOINTS.hospital.socilaList, {}).subscribe({
      next: (res: any) => {
        this.socialList = res.result.social;
      },
      error: () => {
        this.socialList = [];
      },
    });
  }
  onAddSocialMedia() {
    const addDialog = this.matdialog.open(HospitalAddSocialmediaComponent, {
      width: "720px",
      data: {
        heading: "Add Social",
        edit: false,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getSocialList();
      }
    });
  }
  onEditSocialMedia(social) {
    this.selectedId = social._id;
    const editModal = this.matdialog.open(HospitalAddSocialmediaComponent, {
      width: "720px",
      data: {
        edit: true,
        patchValue: { social },
        heading: "Edit Socail",
      },
    });
    editModal.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getSocialList();
      }
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .delteParams(API_ENDPOINTS.hospital.deleteSocialMedia, {
              socialId: this.selectedId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getSocialList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}
