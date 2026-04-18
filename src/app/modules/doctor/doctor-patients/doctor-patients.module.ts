import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PatientsRoutingModule } from "./doctor-patients-routing.module";
import { MainPatientsComponent } from "./pages/main-patients/main-patients.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { EditPatientModalComponent } from "./components/edit-patient-modal/edit-patient-modal.component";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularMaterialModule } from "src/app/material.module";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [MainPatientsComponent, EditPatientModalComponent],
  imports: [
    CommonModule,
    PatientsRoutingModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SharedModule,
    AngularMaterialModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    DoctorHospitalSharedModule,
  ],
})
export class PatientsModule {}
