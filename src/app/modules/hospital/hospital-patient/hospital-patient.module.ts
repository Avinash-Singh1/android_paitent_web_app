import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalPatientRoutingModule } from "./hospital-patient-routing.module";
import { HospitalPatientListComponent } from "./hospital-patient-list/hospital-patient-list.component";
import { AngularMaterialModule } from "src/app/material.module";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { TranslateModule } from "@ngx-translate/core";
import { HistoryViewComponent } from "./components/history-view/history-view.component";
import { SharedModule } from "src/app/shared/shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [HospitalPatientListComponent, HistoryViewComponent],
  imports: [
    CommonModule,
    HospitalPatientRoutingModule,
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
export class HospitalPatientModule {}
