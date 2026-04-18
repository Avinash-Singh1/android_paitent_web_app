import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalDoctorRoutingModule } from "./hospital-doctor-routing.module";
import { HospitalDoctorListComponent } from "./hospital-doctor-list/hospital-doctor-list.component";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { AngularMaterialModule } from "src/app/material.module";
import { DoctorProfileComponent } from "./components/doctor-profile/doctor-profile.component";
import { SharedModule } from "src/app/shared/shared.module";
import { EditDoctorComponent } from "./components/edit-doctor/edit-doctor.component";
import { ReactiveFormsModule } from "@angular/forms";
import { DoctorRequestListComponent } from "./components/doctor-request-list/doctor-request-list.component";
import { AddDoctorFirstComponent } from "./components/add-doctor-first/add-doctor-first.component";
import { AddDoctorSecondComponent } from "./components/add-doctor-second/add-doctor-second.component";
import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    HospitalDoctorListComponent,
    DoctorProfileComponent,
    EditDoctorComponent,
    DoctorRequestListComponent,
    AddDoctorFirstComponent,
    AddDoctorSecondComponent,
  ],
  imports: [
    CommonModule,
    HospitalDoctorRoutingModule,
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
    ReactiveFormsModule,
    DoctorHospitalSharedModule,
  ],
})
export class HospitalDoctorModule {}
