import { Component, OnInit, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { EditPatientModalComponent } from "../../components/edit-patient-modal/edit-patient-modal.component";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { map } from "rxjs";
import { AbstractControlOptions, FormBuilder, FormGroup } from "@angular/forms";
import { FormValidationService } from "src/app/services/form-validation.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";

@Component({
  standalone: false,
  selector: "nectar-main-patients",
  templateUrl: "./main-patients.component.html",
  styleUrls: ["./main-patients.component.scss"],
})
export class MainPatientsComponent implements OnInit {
  hideView: boolean;
  appointmentList: any;
  patientDetails: any;
  x: number;
  y: number;
  filteredPatientDetails: any[] = []; // To store filtered patient list
  searchQuery: string = ''; // This will hold the search input
  currentName: any;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private eventService: EventService,
    private matdialog: MatDialog,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private formvalidation: FormValidationService,
    private localStorage: LocalStorageService,
    private renderer: Renderer2) { }

  patientList:any

    genderList = {
    1: "Male",
    2: "Female",
    3: "Other",
  };

  bloodGroupList = {
    1: "A+",
    2: "A-",
    3: "B+",
    4: "B-",
    5: "O+",
    6: "O-",
    7: "AB+",
    8: "AB-",
  };
  // Filter the patient details list
  filterPatients() {
    if (this.searchQuery.trim() === '') {
      // If the search query is empty, show all patients
      this.filteredPatientDetails = this.patientDetails;
    } else {
      // Filter the patient list based on the search query
      this.filteredPatientDetails = this.patientDetails.filter((patient) => {
        return patient.patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               patient.phone.includes(this.searchQuery);
      });
    }
  }
  getStatus(status: number): string {
    if (status === 0) {
      return 'BOOKED';
    } else if (status === -1) {
      return 'CANCEL';
    } else if (status === 1) {
      return 'COMPLETE';
    } else if (status === 2) {
      return 'PENDING';
    } else if (status === -2) {
      return 'RESCHEDULE';
    } else {
      return 'UNKNOWN'; // For any undefined or unrecognized status
    }
  }



  async ngOnInit(): Promise<void> {
        const approvalStatus = this.localStorage.getItem("approvalStatus");

    if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.APPROVE) {
      this.hideView = false
      await this.getPatitentList();
    }
    if (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.PENDING ||
      approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DEACTIVATE
      || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.DELETE
      || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.REJECT) {
      this.hideView = true
    }
  }

  async getPatitentList(): Promise<void> {
    try {
      // Get patient list from the API
      const res: any = await this.apiService.get(API_ENDPOINTS.doctor.patientList + '?type=2', '').toPromise();
      this.patientList = res.result.data;

      // Iterate over each patient and get the details
      for (let element of this.patientList) {
        for (let document of element.documents) {
          try {
            // Fetch patient profile for each document
            const profileRes: any = await this.apiService.get(API_ENDPOINTS.doctor.patientProfile + '?patientId=' + document._id, '').toPromise();
            // Append patient details to the list
            if (!this.patientDetails) {
              this.patientDetails = [];
            }
            this.patientDetails.push(profileRes.result);
          } catch (error) {
            console.error('Error fetching patient profile:', error);
          }
        }
      }
      this.filterPatients()

    } catch (error) {
      console.error('Error fetching patient list:', error);
      this.patientList = [];
    }
  }

  getDetails(item: any) {
    const id = item._id;
    this.currentName = item.patientName;
    this.apiService
      .get(API_ENDPOINTS.doctor.patientAppointmentList + '?patientId=' + id, '')
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          // If date is a string and needs conversion, ensure it's in a Date object format
          this.appointmentList = count ? data.map((appointment: any) => ({
            ...appointment,
            date: new Date(appointment.date)  // Convert string to Date object
          })) : [];
          this.openModal('details');
        },
        error: (error: any) => {
          this.appointmentList = [];
        },
      });
  }


  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault();
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }


  getPatientDetail(patientId) {

    this.apiService
      .get(API_ENDPOINTS.doctor.patientProfile, { patientId })
      .subscribe({
        next: (res: any) => {
          this.patientDetails = res.result;
        },
        error: (error: any) => {
          this.patientDetails = {};
        },
      });
    this.getPatientAppointment({ patientId });
  }

  getPatientAppointment(payload) {
    this.apiService
      .get(API_ENDPOINTS.doctor.patientAppointmentList, payload)
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          this.appointmentList = count ? data : [];
        },
        error: (error: any) => {
          this.appointmentList = [];
        },
      });
  }

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

  onCloseMenuClick() {
    if (!this.isBrowser) return;
    const sideMenu = document.getElementById("sideMenu");
    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }
  // toggle side menu sub menu
  toggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent the default action of the anchor tag
    const target = event.currentTarget as HTMLElement;
    const submenu = target.nextElementSibling as HTMLElement;
    if (submenu) {
      // Toggle the visibility of the submenu
      submenu.style.display = submenu.style.display === "block" ? "none" : "block";
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
}
