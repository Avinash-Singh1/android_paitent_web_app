import { Component, OnDestroy, OnInit } from "@angular/core";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-doctor-container",
  templateUrl: "./doctor-container.component.html",
  styleUrls: ["./doctor-container.component.scss"],
})
export class DoctorContainerComponent implements OnInit, OnDestroy {
  constructor(private seoService: SeoService) {}
  ngOnInit(): void {
    this.seoService.noIndexRobot();
  }
  ngOnDestroy(): void {
    this.seoService.indexAndFollowRobot();
  }
}
