import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DoctorDashboardRoutingModule } from "./doctor-dashboard-routing.module";
import { MainDashboardContainerComponent } from "./pages/main-dashboard-container/main-dashboard-container.component";
import { AngularMaterialModule } from "src/app/material.module";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { TranslateModule } from "@ngx-translate/core";
import { NgxPaginationModule } from "ngx-pagination";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [MainDashboardContainerComponent],
  imports: [
    CommonModule,
    DoctorDashboardRoutingModule,
    AngularMaterialModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TranslateModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    SharedModule,
    DoctorHospitalSharedModule,
  ],
})
export class DoctorDashboardModule {}
