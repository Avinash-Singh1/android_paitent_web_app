import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-treatment-wrapper",
  template: `
    <ng-container *ngIf="loaded">
      <app-treatment-page *ngIf="isPublished"></app-treatment-page>
      <nectar-surgery-detail *ngIf="!isPublished"></nectar-surgery-detail>
    </ng-container>
  ` })
export class TreatmentWrapperComponent implements OnInit {
  loaded = false;
  isPublished = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get("slug");
      if (slug) {
        this.checkPublished(slug);
      }
    });
  }

  private checkPublished(slug: string): void {
this.apiService.get(API_ENDPOINTS.patient.viewSurgery, { slug })
      .subscribe((res: any) => {
        this.isPublished = !!res?.result?.isPublished;
        this.loaded = true;
      });
  }
}
