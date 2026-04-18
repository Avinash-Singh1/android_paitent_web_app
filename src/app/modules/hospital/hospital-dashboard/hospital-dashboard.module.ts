import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalDashboardRoutingModule } from "./hospital-dashboard-routing.module";
import { MainHospitalDashboardComponent } from "./main-hospital-dashboard/main-hospital-dashboard.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { TranslateModule } from "@ngx-translate/core";
import { NgxPaginationModule } from "ngx-pagination";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularMaterialModule } from "src/app/material.module";
import { ReactiveFormsModule } from "@angular/forms";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [MainHospitalDashboardComponent],
  imports: [
    CommonModule,
    HospitalDashboardRoutingModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TranslateModule,
    NgxPaginationModule,
    SharedModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    DoctorHospitalSharedModule,
  ],
})
export class HospitalDashboardModule {}
