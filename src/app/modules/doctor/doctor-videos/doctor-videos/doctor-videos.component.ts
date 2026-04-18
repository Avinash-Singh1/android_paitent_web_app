import { Component, OnDestroy, OnInit, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: "nectar-doctor-videos",
  templateUrl: "./doctor-videos.component.html",
  styleUrls: ["./doctor-videos.component.scss"],
})
export class DoctorVideosComponent implements OnInit, OnDestroy {
  videoUrl: SafeResourceUrl;

  faqsList = [];
  deleteSubscription$: Subscription;
  selectedId: string;

  ngOnInit(): void {
    this.getFaqsList();
    // this.getEvents();

  }

  getFaqsList() {
    let id = this.localStorage.getItem("faqId");
    let faq = {
      id: id,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
    };
    this.apiService
      .get(API_ENDPOINTS.patient.doctorVideos, faq)
      .subscribe((res: any) => {
        this.faqsList = res?.result?.data;
        this.faqsList.forEach((element: any) => {
          element.url = element?.url.replace("watch?v=", "embed/");

        });

      });
  }

  onDeleteFaqs(): void {

    this.apiService.deleteSetting(API_ENDPOINTS.doctor.addVideos, {
      id: this.selectedId
    }).subscribe({
      next: () => {
        this.getFaqsList();
        this.closeModal('editFaqModal');
      },
      error: () => console.error("Failed to edit FAQ")
    });

  }

  formatDate(date: any) {
    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return formattedDate
  }

  questionAdd: string = '';
  answerAdd: string = '';

  questionEdit: string = '';
  answerEdit: string = '';

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
    (document.getElementById("editTitle") as HTMLInputElement).value = faq.title;
    (document.getElementById("editUrl") as HTMLInputElement).value = faq.url;
    const modalElement = document.getElementById("editFaqModal") as HTMLElement;
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }
  }

  handleAddFaq(): void {
    if (!this.isBrowser) return;
    const questionInput = document.getElementById("addTitle") as HTMLInputElement;
    const answerInput = document.getElementById("addUrl") as HTMLInputElement;
    const userId = this.localStorage.getItem("findUserId");

    const formData = {
      title: questionInput.value,
      url: answerInput.value,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
      userId
    };

    this.apiService.post(API_ENDPOINTS.doctor.addVideos, formData).subscribe({
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
    const title = (document.getElementById("editTitle") as HTMLInputElement).value;
    const url = (document.getElementById("editUrl") as HTMLInputElement).value;
    const userId = this.localStorage.getItem("findUserId");

    const formData = {
      // faqId: this.selectedId,
      title,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
      url,
      userId
    };

    this.apiService.put(API_ENDPOINTS.doctor.addVideos + '?id=' + this.selectedId, formData).subscribe({
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

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  //custom js start
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private renderer: Renderer2,
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    private sanitizer: DomSanitizer) { }
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

      // Add the backdrop manually
      // const backdrop = document.createElement("div");
      // backdrop.classList.add("modal-backdrop", "fade", "show");
      // backdrop.id = `${modalId}-backdrop`; // Use a unique ID for the backdrop
      // document.body.appendChild(backdrop);
    }
  }

  closeModal(modalId: string): void {
    if (!this.isBrowser) return;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");

      // Remove the backdrop
      // const backdrop = document.getElementById(`${modalId}-backdrop`);
      // if (backdrop) {
      //   backdrop.remove();
      // }
    }
  }
  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent the default action of the anchor tag

    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;

    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display =
        submenu.style.display === "block" ? "none" : "block";

      // Optionally hide other submenus if needed
      if (this.isBrowser) {
        const allSubmenus = document.querySelectorAll(".submenu");
        allSubmenus.forEach((sm) => {
          if (sm !== submenu) {
            (sm as HTMLElement).style.display = "none";
          }
        });
      }
    }
  }
  //custom js end
}
