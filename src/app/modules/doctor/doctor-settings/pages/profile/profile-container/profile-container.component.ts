import { Component } from "@angular/core";

@Component({
  standalone: false,
  selector: "nectar-profile-container",
  templateUrl: "./profile-container.component.html",
  styleUrls: ["./profile-container.component.scss"],
})
export class ProfileContainerComponent {
  activeRoute: string = "Profile";
  profileMenu: any = [
    {
      label: "Profile",
      routerLink: "main",
    },
    {
      label: "Education",
      routerLink: "education",
    },
    {
      label: "Awards and Recognitions",
      routerLink: "awards-recognition",
    },
    {
      label: "Medical Registrations",
      routerLink: "medical-registrations",
    },
    {
      label: "Membership",
      routerLink: "memberships",
    },
    {
      label: "Procedures",
      routerLink: "procedure",
    },

    {
      label: "Services",
      routerLink: "services",
    },
    {
      label: "FAQs",
      routerLink: "faqs",
    },
    {
      label: "Videos",
      routerLink: "videos",
    },
    {
      label: "Social",
      routerLink: "social",
    },
    {
      label: "Delete Profile",
      routerLink: "delete-profile",
      red: true,
    },
  ];
}
