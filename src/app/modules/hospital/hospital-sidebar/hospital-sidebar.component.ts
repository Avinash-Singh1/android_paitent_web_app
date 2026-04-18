import { Component } from "@angular/core";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-hospital-sidebar",
  templateUrl: "./hospital-sidebar.component.html",
  styleUrls: ["./hospital-sidebar.component.scss"],
})
export class HospitalSidebarComponent {
  constructor(private eventService: EventService) {}
  menuList = [
    {
      label: "Calendar",
      icon: "assets/images/svg/calendar.svg",
      routerLink: "calendar",
    },
    {
      label: "Dashboard",
      icon: "assets/images/svg/dashboard.svg",
      routerLink: "dashboard",
    },
    {
      label: "Patient",
      icon: "assets/images/svg/patients.svg",
      routerLink: "patients",
    },
    {
      label: "Our Doctors",
      icon: "assets/images/svg/patients.svg",
      routerLink: "doctors",
    },
    {
      label: "Speciality",
      icon: "assets/images/svg/patients.svg",
      routerLink: "speciality",
    },
    {
      label: "Procedure",
      icon: "assets/images/svg/patients.svg",
      routerLink: "procedure",
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
}
