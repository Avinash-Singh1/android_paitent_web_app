import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DoctorSettingsRoutingModule } from "./doctor-settings-routing.module";
import { SettingsContainerComponent } from "./settings-container/settings-container.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { AngularMaterialModule } from "src/app/material.module";
import { SharedModule } from "src/app/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [SettingsContainerComponent],
  imports: [
    CommonModule,
    DoctorSettingsRoutingModule,
    AngularMaterialModule,
    SharedModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TranslateModule,
    DoctorHospitalSharedModule,
  ],
})
export class DoctorSettingsModule {}
