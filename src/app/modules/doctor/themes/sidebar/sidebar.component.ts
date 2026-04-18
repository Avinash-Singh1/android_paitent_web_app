import { Component } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  constructor(
    private eventService: EventService,
    private apiService: ApiService
  ) { }

  menuList = [
    {
      label: "Dashboard",
      icon: "assets/images/svg/dashboard.svg",
      routerLink: "dashboard",
    },
    {
      label: "Calendar",
      icon: "assets/images/svg/calendar.svg",
      routerLink: "calendar",
    },
    {
      label: "My Patient",
      icon: "assets/images/svg/patients.svg",
      routerLink: "my-patient",
    },
    {
      label: "Medical Verification",
      icon: "assets/images/svg/medical-verification.svg",
      routerLink: "medical-verification",
    },
    {
      label: "Establishment",
      icon: "assets/images/svg/establishment.svg",
      routerLink: "establishment",
    },
    {
      label: "Services",
      icon: "assets/images/svg/services.svg",
      routerLink: "services",
    },
    {
      label: "Procedure",
      icon: "assets/images/svg/procedure.svg",
      routerLink: "procedure",
    },
    {
      label: "Videos",
      icon: "assets/images/svg/videos.svg",
      routerLink: "videos",
    },
    {
      label: "FAQs",
      icon: "assets/images/svg/faqs.svg",
      routerLink: "faqs",
    },
    {
      label: "Profile",
      icon: "assets/images/svg/profile.svg",
      routerLink: "profile",
    },
    {
      label: "Reviews",
      icon: "assets/images/svg/reviews.svg",
      routerLink: "reviews",
    },
    {
      label: "Settings",
      icon: "assets/images/svg/settings.svg",
      routerLink: "settings",
    },
  ];
  onToggle() {
    this.eventService.broadcastEvent("sidenav", true);
    this.eventService.broadcastEvent("showsubheader", true);
  }
  onLogout() {
    this.apiService.logout();
  }
}
