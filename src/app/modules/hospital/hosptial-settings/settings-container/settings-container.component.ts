import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-settings-container.",
  templateUrl: "./settings-container.component.html",
  styleUrls: ["./settings-container.component.scss"],
})
export class SettingsContainerComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.activatedRoute.data.subscribe((res: any) => {});
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  settingsMenu: any = [
    {
      label: "Profile",
      routerLink: "profile",
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
      label: "Timing",
      routerLink: "timing",
    },
    {
      label: "Address",
      routerLink: "address",
    },
    {
      label: "Images",
      routerLink: "images",
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
