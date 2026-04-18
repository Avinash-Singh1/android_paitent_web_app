import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MainCalendarViewComponent } from "./main-calendar-view/main-calendar-view.component";
import { DoctorCalendarRoutingModule } from "./doctor-calendar-routing.module";
import { AngularMaterialModule } from "src/app/material.module";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { MonthViewComponent } from "./components/month-view/month-view.component";
import { WeekViewComponent } from "./components/week-view/week-view.component";
import { DayViewComponent } from "./components/day-view/day-view.component";
import { SharedModule } from "src/app/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";

@NgModule({
  declarations: [
    MainCalendarViewComponent,
    MonthViewComponent,
    WeekViewComponent,
    DayViewComponent,
  ],
  imports: [
    CommonModule,
    DoctorCalendarRoutingModule,
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
  providers: [],
})
export class DoctorCalendarModule {}