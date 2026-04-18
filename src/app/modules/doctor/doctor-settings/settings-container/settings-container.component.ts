import { Component, OnInit } from "@angular/core";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-settings-container",
  templateUrl: "./settings-container.component.html",
  styleUrls: ["./settings-container.component.scss"],
})
export class SettingsContainerComponent implements OnInit {
  heading = "Settings";
  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.broadcastEvent("subheading", this.heading);
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
}
