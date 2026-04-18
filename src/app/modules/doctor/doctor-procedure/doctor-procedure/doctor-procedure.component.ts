import { Component, OnInit, Renderer2 } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { ToastrService } from "ngx-toastr";

@Component({
  standalone: false,
  selector: "nectar-doctor-procedure",
  templateUrl: "./doctor-procedure.component.html",
  styleUrls: ["./doctor-procedure.component.scss"],
})
export class DoctorProcedureComponent implements OnInit {
  procedureList: any;
  allProcedures: any;
  selectedProcedureId: string | null = '';
  filteredProcedures: any[] = [];

  //custom js start
  constructor(private renderer: Renderer2, private apiService: ApiService,
    public toastr: ToastrService,

  ) {


  }

profileSpecilizationIds:any

  getProfile() {
    this.apiService
      .get(API_ENDPOINTS.doctor.updateDoctorProfile, {})
      .subscribe((res: any) => {

        this.profileSpecilizationIds=res.result?.[0]?.doctor?.specialization || []

        this.masterProcedureList()

      });
  }
  


  ngOnInit(): void {
    this.getProfile()



  }

  filterProcedures() {
    // Extract the _id values from procedureList into an array
   
    const procedureIds = this.procedureList.map((procedure: { procedureId: any; }) => procedure.procedureId);

    // Filter allProcedures based on whether their _id is present in procedureIds
    this.filteredProcedures = this.allProcedures?.filter((procedure: { _id: any; }) =>
      procedureIds.includes(procedure._id)
    );

  }


  isProcedureChecked(procedureId: string): boolean {
    return this.procedureList.includes(procedureId);
  }

  onProcedureChange(event: any, procedure: any) {

    if (event.target.checked) {
      this.apiService.post(API_ENDPOINTS.doctor.procedures, {
        type: 9,
        isEdit: false,
        records: { recordId: procedure._id },
      }).subscribe(() => {
        this.getProcedureList(); // Refresh the list
      });
    } else {
      this.apiService.delete(API_ENDPOINTS.doctor.procedures, procedure._id).subscribe(() => {
        this.toastr.success("Procedure Deleted");

        this.getProcedureList(); // Refresh the list
      });
    }


  }


  isSubmenuOpen = false;

  settingtoggleSubmenu(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.isSubmenuOpen = !this.isSubmenuOpen; // Toggle the submenu visibility
  }


  
  addProcedure() {
    if (this.selectedProcedureId !='') {
      this.apiService.post(API_ENDPOINTS.doctor.procedures, {
        type: 9,
        isEdit: false,
        records: { recordId: this.selectedProcedureId },
      }).subscribe(() => {
        this.getProcedureList();
        this.toastr.success("Procedure Added");

        this.closeModal('add_procedures_modal');
        this.selectedProcedureId = '';
      });
    }
    else{
      this.toastr.error("Please Select a procedure");

    }
  }

  isProcedureSelected(procedureId: string): boolean {
    return this.procedureList.some(selected => selected._id === procedureId);
  }


  masterProcedureList() {
    this.apiService
      .get(API_ENDPOINTS.MASTER.procedure, {})
      .subscribe((res: any) => {
        this.allProcedures =
          res?.result?.data;


          if (this.allProcedures && this.profileSpecilizationIds) {
            // Filter procedures based on matching specialization IDs
            this.allProcedures = this.allProcedures.filter((procedure: any) =>
              this.profileSpecilizationIds.includes(procedure.specializationId)
            );
        
            this.getProcedureList()

          }




      });
  }


  getProcedureList() {
    this.apiService
      .get(API_ENDPOINTS.doctor.procedures, {})
      .subscribe((res: any) => {
        this.procedureList = res?.result?.list;
        this.filterProcedures();


      });
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

      // Add the backdrop manually
      // const backdrop = document.createElement("div");
      // backdrop.classList.add("modal-backdrop", "fade", "show");
      // backdrop.id = `${modalId}-backdrop`; // Use a unique ID for the backdrop
      // document.body.appendChild(backdrop);
    }
  }

  closeModal(modalId: string): void {
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