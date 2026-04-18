import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalSpecialityRoutingModule } from "./hospital-speciality-routing.module";
import { HospitalSpecialityListComponent } from "./hospital-speciality-list/hospital-speciality-list.component";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { AngularMaterialModule } from "src/app/material.module";
import { SharedModule } from "src/app/shared/shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [HospitalSpecialityListComponent],
  imports: [
    CommonModule,
    HospitalSpecialityRoutingModule,
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
  ],
})
export class HospitalSpecialityModule {}
