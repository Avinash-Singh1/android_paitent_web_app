import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProfileDoctorRoutingModule } from "./profile-doctor-routing.module";
import { ProfileContainerComponent } from "./profile-container/profile-container.component";
import { MyAppointmentComponent } from "./pages/my-appointment/my-appointment.component";
import { MyMedicalReportComponent } from "./pages/my-medical-report/my-medical-report.component";
import { MyFeedbackComponent } from "./pages/my-feedback/my-feedback.component";
import { PersonalInformationComponent } from "./pages/personal-information/personal-information.component";
import { SettingsComponent } from "./pages/settings/settings.component";
import { GiveFeedbackComponent } from "./pages/give-feedback/give-feedback.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { AngularMaterialModule } from "src/app/material.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { AddMedicalComponent } from "./pages/add-medical/add-medical.component";
import { ViewMedicalComponent } from "./pages/view-medical/view-medical.component";
import { StarRatingModule } from "angular-star-rating";
import { SharedModule } from "src/app/shared/shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    ProfileContainerComponent,
    MyAppointmentComponent,
    MyMedicalReportComponent,
    MyFeedbackComponent,
    PersonalInformationComponent,
    SettingsComponent,
    GiveFeedbackComponent,
    AddMedicalComponent,
    ViewMedicalComponent,
  ],
  imports: [
    CommonModule,
    ProfileDoctorRoutingModule,
    NgSelectModule,
    TranslateModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxPaginationModule,
    StarRatingModule,
    SharedModule,
  ],
})
export class ProfileDoctorModule {}
