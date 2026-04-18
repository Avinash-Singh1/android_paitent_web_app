import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalCalendarRoutingModule } from "./hospital-calendar-routing.module";
import { HospitalCalendarContainerComponent } from "./hospital-calendar-container/hospital-calendar-container.component";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { AngularMaterialModule } from "src/app/material.module";
import { SharedModule } from "src/app/shared/shared.module";
import { MonthViewComponent } from "./components/month-view/month-view.component";
import { WeekViewComponent } from "./components/week-view/week-view.component";
import { DayViewComponent } from "./components/day-view/day-view.component";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    HospitalCalendarContainerComponent,
    MonthViewComponent,
    WeekViewComponent,
    DayViewComponent,
  ],
  imports: [
    CommonModule,
    HospitalCalendarRoutingModule,
    AngularMaterialModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SharedModule,
    TranslateModule,
    DoctorHospitalSharedModule,
  ],
})
export class HospitalCalendarModule {}
