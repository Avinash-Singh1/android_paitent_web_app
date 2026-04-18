import { Component, OnInit, Renderer2 } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { FormBuilder, FormsModule } from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import { MatDialog } from "@angular/material/dialog";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { NgFor, NgIf } from "@angular/common";
import { forkJoin, firstValueFrom } from 'rxjs';

@Component({
  standalone: false,
  selector: "nectar-doctor-services",
  // standalone: false,
  // imports: [TranslateModule,NgFor,NgIf,FormsModule],
  templateUrl: "./doctor-services.component.html",
  styleUrls: ["./doctor-services.component.scss"],
})
export class DoctorServicesComponent implements OnInit{
  servicesList: any[] = [];
  selectedSerivceId:any
  profileSpecializations: any;
    newService:any
  allSpecializationList:any
allServicesList:any
  profileSpecializationsNames:any
  filteredServices: any[] = [];
  selectedService:any
  showDropdown = true;
  addfilteredServices: any;
  doctorSpecilization: any;
  specializationList: any;
  doctorSpecializationIds: any;
  doctorSpecializationNames: any;

  //custom js start
  constructor(private renderer: Renderer2,
    private fb: FormBuilder,

    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService,
    public toastr: ToastrService,
  ) {}




  selectService(service) {
    this.newService = service.name;
    this.showDropdown = false;
  }




 

async ngOnInit(): Promise<void> {
  await this.loadSpecializations(); // Step 1: Load all specializations first
  await this.getServicesList();     // Step 2: Then get the services list
  await this.getListing();          // Step 3: Fetch other listings as needed
}

// async getServicesList(): Promise<void> {
//   // Fetch the list of services
//   const res = await firstValueFrom(this.apiService.get(API_ENDPOINTS.COMMON.getAllServices, ""));
//   this.allServicesList = res.result;
  
//   // Filter services based on the doctor specialization names, ensuring the names are already loaded
//   if (this.doctorSpecializationNames) {
//     this.allServicesList = this.allServicesList.filter(service => 
//       this.doctorSpecializationNames.includes(service.specialization)
//     );

  
//   }

// }


async getServicesList(): Promise<void> {
  // Fetch the list of services
  const res = await firstValueFrom(this.apiService.get(API_ENDPOINTS.COMMON.getAllServices, ""));
  this.allServicesList = res.result;

  // Filter services based on the doctor specialization names, ensuring the names are already loaded
  if (this.doctorSpecializationNames) {
    this.allServicesList = this.allServicesList.filter(service => 
      this.doctorSpecializationNames.includes(service.specialization)
    );

    // Only after the filtering is done, merge items from this.serviceList into this.allServicesList
  
  }
}



async loadSpecializations(): Promise<void> {
  // Fetch all specializations
  const res = await firstValueFrom(this.apiService.get(API_ENDPOINTS.MASTER.specialization, ""));
  this.specializationList = res?.result?.data || [];
  
  // Load doctor specialization after fetching all specializations
  await this.loadDoctorSpecialization();
}

async loadDoctorSpecialization(): Promise<void> {
  // Fetch doctor specialization IDs
  const res = await firstValueFrom(this.apiService.get(API_ENDPOINTS.doctor.updateDoctorProfile, {}));
  this.doctorSpecializationIds = res?.result[0]?.doctor?.specialization || [];
  
  // Map the specialization IDs to their corresponding names
  this.mapSpecializationNames();
}

mapSpecializationNames(): void {
  if (!this.specializationList || !this.doctorSpecializationIds) {
    return;
  }


  
  // Filter the specialization list to include only the specializations with IDs present in doctorSpecializationIds
  this.doctorSpecializationNames = this.specializationList
    .filter((specialization: any) => 
      this.doctorSpecializationIds.includes(specialization._id)
    )
    .map((specialization: any) => specialization.name);

}


isSubmenuOpen = false;

settingtoggleSubmenu(event: Event): void {
  event.preventDefault(); // Prevent default anchor behavior
  this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
}
  
onServiceChange(event: any, service: any) {
  if (!event.target.checked) {
    // If the checkbox is now unchecked (means removing the service)

    const matchedService = this.servicesList.find((s: any) => s._id === service._id);
    this.apiService.put(API_ENDPOINTS.doctor.settingList+"/?recordId="+matchedService._id, {
      type: 5,
      isEdit: true,
      isDeleted: true,


    }).subscribe(() => {
      if(!service.specialization){

        this.allServicesList = this.allServicesList.filter(ser => ser.name !== service.name);
      }
      this.toastr.success("Service Deleted");
      this.getListing(); 
    });
  } else {
    // If the checkbox is now checked (means adding the service)
    this.apiService.put(API_ENDPOINTS.doctor.settingList, {
      type: 5,
      isEdit: false,
      isDeleted:true,
      records: { name: service.name },

    }).subscribe(() => {
      this.toastr.success("Service Added");

      this.getListing(); 
    });
  }
}






async saveList() : Promise<void>{
  this.apiService
    .put(API_ENDPOINTS.doctor.settingList, {
      type: 5,
      isEdit: false,
      records: { name: this.newService },
    })
    .subscribe(async (res: any) => {
      if (res?.success) {
        this.getListing()
        // this.getServicesList()
        this.newService = '';
        this.toastr.success("Service Added");
        this.closeModal('add_services_modal')

      }
    });
}






async getListing(): Promise<void> {
  const res = await firstValueFrom(this.apiService.get(API_ENDPOINTS.doctor.settingList + "?type=5", ""));
  this.servicesList = res?.result?.list;

  if (this.servicesList) {
    this.servicesList.forEach(service => {
      // Check if service.name does not exist in allServicesList
      const serviceExists = this.allServicesList.some(existingService => 
        existingService.name === service.name
      );

      // Add the service if it does not exist
      if (!serviceExists) {
        this.allServicesList.push(service);
      }
    });
  }


}

isServiceSelected(service: any): boolean {
  // Check if the service exists in the selected services list
  return this.servicesList.some((s: any) => s.name === service.name);
}


onMenuClick() {
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
  const innerArea = document.getElementById("clickToCloseArea");
  const sideMenu = document.getElementById("sideMenu");
if (innerArea.classList.contains("openedSideBar")) {
  this.renderer.removeClass(innerArea, "openedSideBar");
  this.renderer.removeClass(sideMenu, "mobileMenu");

} 

}

  onCloseMenuClick() {
    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu && sideMenu.classList.contains("mobileMenu")) {
      this.renderer.removeClass(sideMenu, "mobileMenu");
    }
  }

  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add("show", "d-block");
      modalElement.setAttribute("aria-modal", "true");
      modalElement.setAttribute("role", "dialog");
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove("show", "d-block");
      modalElement.removeAttribute("aria-modal");
      modalElement.removeAttribute("role");
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
