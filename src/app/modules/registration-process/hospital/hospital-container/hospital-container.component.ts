import { Component, OnDestroy, OnInit } from "@angular/core";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-hospital-container",
  templateUrl: "./hospital-container.component.html",
  styleUrls: ["./hospital-container.component.scss"],
})
export class HospitalContainerComponent implements OnDestroy, OnInit {
  constructor(private seoService: SeoService) {}
  ngOnInit(): void {
    this.seoService.noIndexRobot();
  }
  ngOnDestroy(): void {
    this.seoService.indexAndFollowRobot();
  }
}
