import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { Subscription, filter } from "rxjs";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-hospital-theme",
  templateUrl: "./hospital-theme.component.html",
  styleUrls: ["./hospital-theme.component.scss"],
})
export class HospitalThemeComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private router: Router,
    private seoService: SeoService
  ) {}
  @ViewChild("matdrawer") public matdrawer;
  showHeader: boolean = false;
  matDrawer$: Subscription;
  ngOnInit(): void {
    this.seoService.noIndexRobot();
    this.getEvents();
    this.showHeader = this.router.url != "/hospital/calendar";
  }
  onClose() {
    this.matdrawer.toggle();
  }
  ngOnDestroy(): void {
    this.matDrawer$?.unsubscribe();
    this.seoService.indexAndFollowRobot();
  }
  getEvents() {
    this.matDrawer$ = this.eventService
      .getEvent("sidenav")
      .subscribe((res: boolean) => {
        if (res) {
          this.matdrawer.toggle();
        }
      });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        const { url } = event;
        this.showHeader = url != "/hospital/calendar";
      });
  }
}
