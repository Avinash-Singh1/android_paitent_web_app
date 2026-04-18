
import { Component, Inject, OnDestroy, OnInit, DOCUMENT } from "@angular/core";
import { ActivatedRoute, Router, RoutesRecognized } from "@angular/router";
import { filter } from "rxjs";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-auth-container",
  templateUrl: "./auth-container.component.html",
  styleUrls: ["./auth-container.component.scss"],
})
export class AuthContainerComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private seoService: SeoService
  ) {}
  verifyNumber: boolean = false;
  userType: number;
  ngOnInit(): void {
    this.verifyNumber = this.activatedRoute.snapshot.data["verified"];
    this.eventService.getEvent("user-type").subscribe((res: any) => {
      this.userType = res;
    });
    this.getUserType();
    this.seoService.noIndexRobot();
  }

  getUserType() {
    const url = this.router.url;
    switch (true) {
      case url.includes("/auth/doctors"):

          if(url=="/auth/doctors/login" || url=="/auth/doctors/register"){
            this.userType = 8;

          }
          else{

            this.userType = 2;
          }
        break;
      case url.includes("/auth/hospitals/"):
        this.userType = 3;
        break;
      
      default:
        this.userType = 1;
    }
    this.router.events
      .pipe(filter((event) => event instanceof RoutesRecognized))
      .subscribe((event: RoutesRecognized) => {
        const url = event.state.url;
        switch (true) {
          case url.includes("/auth/doctors"):
            if(url=="/auth/doctors/login" || url=="/auth/doctors/register"){
              this.userType = 8;
  
            }
            else{
  
              this.userType = 2;
            }
            break;
          case url.includes("/auth/hospitals/"):
            this.userType = 3;
            break;
          default:
            this.userType = 1;
        }
      });
  }

  ngOnDestroy(): void {
    this.seoService.indexAndFollowRobot();
  }
}