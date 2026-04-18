import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorDeleteAccountRoutingModule } from './doctor-delete-account-routing.module';
import { DoctorDeleteAccountComponent } from './doctor-delete-account/doctor-delete-account.component';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { DoctorHospitalSharedModule } from '../../doctor-hospital-shared/doctor-hospital-shared.module';


@NgModule({
  declarations: [DoctorDeleteAccountComponent],
  imports: [
    CommonModule,
    DoctorDeleteAccountRoutingModule,
    AngularMaterialModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    GoogleMapsModule,
    TranslateModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    SharedModule,
    DoctorHospitalSharedModule,
    FormsModule
  ]
})
export class DoctorDeleteAccountModule { }
