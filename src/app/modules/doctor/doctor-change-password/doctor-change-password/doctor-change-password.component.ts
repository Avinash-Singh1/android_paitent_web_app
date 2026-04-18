import { Component, OnInit, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "src/app/services/api.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";

@Component({
  standalone: false,
  selector: "nectar-doctor-change-password",
  templateUrl: "./doctor-change-password.component.html",
  styleUrls: ["./doctor-change-password.component.scss"],
})
export class DoctorChangePasswordComponent implements OnInit {

  passwordForm: FormGroup;

  constructor(private renderer: Renderer2,
    private fb: FormBuilder,
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private toastr: ToastrService

  ) { 
    this.passwordForm = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6)]], // Minimum 6 characters
      newPassword: ["", [Validators.required, Validators.minLength(6)]], // Minimum 6 characters
      confirmPassword: ["", [Validators.required, Validators.minLength(6)]], // Minimum 6 characters
    }, {
      validators: this.passwordsMatchValidator, // Custom validator to check if new and confirm passwords match
    });
  }



 
  isPasswordVisibleconfirm1 = false;


  togglePasswordVisibilityconfirm1() {
    this.isPasswordVisibleconfirm1 = !this.isPasswordVisibleconfirm1;
  }
  isPasswordVisibleconfirm2 = false;


  togglePasswordVisibilityconfirm2() {
    this.isPasswordVisibleconfirm2 = !this.isPasswordVisibleconfirm2;
  }
  isPasswordVisibleconfirm3 = false;


  togglePasswordVisibilityconfirm3() {
    this.isPasswordVisibleconfirm3 = !this.isPasswordVisibleconfirm3;
  }

  

  ngOnInit(): void { }

  // Custom validator to ensure newPassword and confirmPassword match
  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  restPassword(): void {
    if (this.passwordForm.valid) {
      const userId = this.localStorage.getItem("findUserId");

      const formData = {
        userId,
        Password: this.passwordForm.value.password,
        newPassword: this.passwordForm.value.newPassword,
        confirmPassword: this.passwordForm.value.confirmPassword,
      };

      this.apiService.post(API_ENDPOINTS.auth.resetPassword, formData).subscribe({
        next: () => {
          this.toastr.success("Password changed successfully.");
          this.passwordForm.reset();  // Clear the form after success
        },
        error: (err) => {
          this.toastr.error("Failed to change password.");
          console.error("Failed: ", err);
        },
      });
    } else {
      if (this.passwordForm.hasError('passwordsMismatch')) {
        this.toastr.error("New password and confirm password must match.");
      } else {
        this.toastr.error("Please fill in all required fields with valid data.");
      }
    }
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
