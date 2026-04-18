import { Component, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { DoctorHospitalSharedModule } from "../../../doctor-hospital-shared/doctor-hospital-shared.module";

import { OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
// import { SettingsAddModalComponent } from "../../../../settings-add-modal/settings-add-modal.component";
import { EventService } from "src/app/services/event.service";
import { Subscription } from "rxjs";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { LocalStorageService } from "src/app/services/storage.service";

declare var $: any; // Declare jQuery

@Component({
  standalone: false,
  selector: "nectar-doctor-faqs",
  templateUrl: "./doctor-faqs.component.html",
  styleUrls: ["./doctor-faqs.component.scss"],
})
export class DoctorFaqsComponent implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  //custom js start

  questionAdd: string = '';
  answerAdd: string = '';

  questionEdit: string = '';
  answerEdit: string = '';

  constructor(private renderer: Renderer2,
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.getFaqsList();
    // this.getEvents();

  }
  faqsList = [];
  deleteSubscription$: Subscription;
  selectedId: string;

  getFaqsList() {
    let id = this.localStorage.getItem("faqId");
    let faq = {
      id: id,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
    };
    this.apiService
      .get(API_ENDPOINTS.doctor.faqList, faq)
      .subscribe((res: any) => {
        this.faqsList = res?.result?.data;
      });
  }

  onAddFaqs(): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById("addFaqModal") as HTMLElement;
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }
  }

  onEditFaqs(faq: any): void {
    if (!this.isBrowser) return;
    this.selectedId = faq._id;
    (document.getElementById("editQuestion") as HTMLInputElement).value = faq.question;
    (document.getElementById("editAnswer") as HTMLInputElement).value = faq.answer;
    const modalElement = document.getElementById("editFaqModal") as HTMLElement;
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }
  }
  onDeleteFaqs(): void {

    this.apiService.delete(API_ENDPOINTS.doctor.addfaqList, this.selectedId).subscribe({
      next: () => {
        this.getFaqsList();
        this.closeModal('editFaqModal');
      },
      error: () => console.error("Failed to edit FAQ")
    });

  }

  handleAddFaq(): void {
    if (!this.isBrowser) return;
    const questionInput = document.getElementById("addQuestion") as HTMLInputElement;
    const answerInput = document.getElementById("addAnswer") as HTMLInputElement;
    const userId = this.localStorage.getItem("findUserId");

    const formData = {
      question: questionInput.value,
      answer: answerInput.value,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
      userId
    };

    this.apiService.post(API_ENDPOINTS.doctor.addfaqList, formData).subscribe({
      next: () => {
        this.getFaqsList();
        this.closeModal('addFaqModal');

        // Clear the input fields
        questionInput.value = '';
        answerInput.value = '';
      },
      error: (err) => console.error("Failed to add FAQ:", err)
    });
  }

  handleEditFaq(): void {
    if (!this.isBrowser) return;
    const question = (document.getElementById("editQuestion") as HTMLInputElement).value;
    const answer = (document.getElementById("editAnswer") as HTMLInputElement).value;
    const userId = this.localStorage.getItem("findUserId");

    const formData = {
      question,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
      answer,
      userId
    };

    this.apiService.put(API_ENDPOINTS.doctor.addfaqList + '/' + this.selectedId, formData).subscribe({
      next: () => {
        this.getFaqsList();
        this.closeModal('editFaqModal');
      },
      error: () => console.error("Failed to edit FAQ")
    });
  }

  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }

  // yasir bahi work

  onMenuClick() {
    if (!this.isBrowser) return;
    const sideMenu = document.getElementById("sideMenu");
    const innerArea = document.getElementById("clickToCloseArea");
    if (sideMenu) {
      if (sideMenu.classList.contains("mobileMenu") && innerArea.classList.contains("openedSideBar")  ) {
        this.renderer.removeClass(sideMenu, "mobileMenu");
        this.renderer.removeClass(innerArea, "openedSideBar");

      } else {
        this.renderer.addClass(sideMenu, "mobileMenu");
        this.renderer.addClass(innerArea, "openedSideBar");
      }
    }
  }

  closeSideBar(){
    if (!this.isBrowser) return;
    const innerArea = document.getElementById("clickToCloseArea");
    const sideMenu = document.getElementById("sideMenu");
  if (innerArea.classList.contains("openedSideBar")) {
    this.renderer.removeClass(innerArea, "openedSideBar");
    this.renderer.removeClass(sideMenu, "mobileMenu");

  }

  }
  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
  }

  onCloseMenuClick() {
    if (!this.isBrowser) return;
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }

  openModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }
  }

  closeModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");

    }
  }
  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    if (!this.isBrowser) return;
    event.preventDefault(); // Prevent the default action of the anchor tag

    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;

    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display =
        submenu.style.display === "block" ? "none" : "block";

      // Optionally hide other submenus if needed
      const allSubmenus = document.querySelectorAll(".submenu");
      allSubmenus.forEach((sm) => {
        if (sm !== submenu) {
          (sm as HTMLElement).style.display = "none";
        }
      });
    }
  }
  //custom js end
}