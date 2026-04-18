import { Component, Inject, OnInit, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
} from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-mobile-depart-sugery",
  templateUrl: "./mobile-depart-sugery.component.html",
  styleUrls: ["./mobile-depart-sugery.component.scss"],
})
export class MobileDepartSugeryComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  constructor(
    public bottomSheet: MatBottomSheet,
    private apiService: ApiService,
    private router: Router,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {}

  ngOnInit(): void {
    this.getSurgeryNames();
  }

  surgeryList: any = [];
  totalCount: number;
  getSurgeryNames() {
    this.apiService
      .get(API_ENDPOINTS.patient.getSurgeryUnderDepartment, {
        id: this.data?.id,
      })
      .subscribe((res: any) => {
        this.totalCount = res?.result?.count;
        this.surgeryList = res?.result?.list;
      });
  }

  viewSurgery(data: any) {
    this.bottomSheet.dismiss();
    const city = this.data?.city || 'delhi';
    const deptSlug = this.data?.deptSlug || 'general-surgery';
    this.router.navigate(['/', city, 'treatment', deptSlug, data?.slug]);
    if (this.isBrowser) {
      setTimeout(() => {
        window.scroll(0, 0);
      }, 700);
    }
  }
}
