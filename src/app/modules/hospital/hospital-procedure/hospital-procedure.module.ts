import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalProcedureRoutingModule } from "./hospital-procedure-routing.module";
import { HospitalProcedureListComponent } from "./hospital-procedure-list/hospital-procedure-list.component";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { AngularMaterialModule } from "src/app/material.module";
import { SharedModule } from "src/app/shared/shared.module";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [HospitalProcedureListComponent],
  imports: [
    CommonModule,
    HospitalProcedureRoutingModule,
    AngularMaterialModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxPaginationModule,
    TranslateModule,
    SharedModule,
    DoctorHospitalSharedModule,
  ],
})
export class HospitalProcedureModule {}
