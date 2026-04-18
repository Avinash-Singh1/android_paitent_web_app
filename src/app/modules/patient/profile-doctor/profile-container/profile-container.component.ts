import { Component, OnInit } from "@angular/core";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-profile-container",
  templateUrl: "./profile-container.component.html",
  styleUrls: ["./profile-container.component.scss"],
})
export class ProfileContainerComponent implements OnInit {
  constructor(private eventService: EventService) {}
  ngOnInit(): void {
    this.eventService.broadcastEvent("reset-header", true);
  }
}
