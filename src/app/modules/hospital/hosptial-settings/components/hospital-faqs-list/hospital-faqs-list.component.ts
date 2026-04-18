import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { SettingsAddModalComponent } from "../settings-add-modal/settings-add-modal.component";
import { EventService } from "src/app/services/event.service";
import { Subscription } from "rxjs";
import { APP_CONSTANTS } from "src/app/config/app.constant";

@Component({
  standalone: false,
  selector: "nectar-hospital-faqs-list",
  templateUrl: "./hospital-faqs-list.component.html",
  styleUrls: ["./hospital-faqs-list.component.scss"],
})
export class HospitalFaqsListComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.getFaqsList();
    this.getEvents();
  }
  faqsList = [];
  deleteSubscription$: Subscription;
  selectedId: string;
  getFaqsList() {
    this.apiService
      .get(API_ENDPOINTS.hospital.faqList, {
        userType: APP_CONSTANTS.USER_TYPES.HOSPITAL,
      })
      .subscribe({
        next: (res: any) => {
          this.faqsList = res.result;
        },
        error: () => {
          this.faqsList = [];
        },
      });
  }
  onAddFaqs() {
    const addDialog = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 2,
        heading: "Add FAQs",
        apiEndpoints: API_ENDPOINTS.hospital.addFaqs,
        edit: false,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getFaqsList();
      }
    });
  }
  onEditFaqs(faq) {
    this.selectedId = faq._id;
    const editModal = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 2,
        edit: true,
        patchValue: faq,
        heading: "Edit FAQs",
        apiEndpoints: API_ENDPOINTS.hospital.editFaq,
        editKey: "faqId",
      },
    });
    editModal.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getFaqsList();
      }
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .delteParams(API_ENDPOINTS.hospital.deleteFaq, {
              faqId: this.selectedId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getFaqsList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}
