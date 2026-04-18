import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { DoctorHospitalSharedModule } from '../../doctor-hospital-shared/doctor-hospital-shared.module';
import { DoctorDashboardRoutingModule } from '../doctor-dashboard/doctor-dashboard-routing.module';
import { DoctorMedicalVerificationRoutingModule } from './doctor-medical-verifications-routing.module';
import { DoctorMedicalVerificationComponent } from './doctor-medical-verification/doctor-medical-verification.component';



@NgModule({
  declarations: [DoctorMedicalVerificationComponent],
  imports: [
    CommonModule,
    DoctorMedicalVerificationRoutingModule,
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

  ]
})
export class DoctorMedicalVerificationsModule { }
