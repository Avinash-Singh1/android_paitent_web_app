import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-subheader",
  templateUrl: "./subheader.component.html",
  styleUrls: ["./subheader.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubheaderComponent {
  constructor(private eventService: EventService) {}
  @Input() calendar: boolean = false;

  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
}
