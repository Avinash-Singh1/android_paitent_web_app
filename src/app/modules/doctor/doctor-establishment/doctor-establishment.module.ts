import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { DoctorHospitalSharedModule } from '../../doctor-hospital-shared/doctor-hospital-shared.module';
import { DoctorEstablishmentRoutingModule } from './doctor-establishment-routing.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { AddEstablishmentComponent } from './add-establishment/add-establishment.component';
import { DoctorEstablishmentComponent } from './doctor-establishment/doctor-establishment.component';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [DoctorEstablishmentComponent, AddEstablishmentComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    DoctorEstablishmentRoutingModule,
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
export class DoctorEstablishmentModule { }
