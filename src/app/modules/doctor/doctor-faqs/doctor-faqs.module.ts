import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorFaqsRoutingModule } from './doctor-faqs-routing.module';
import { DoctorFaqsComponent } from './doctor-faqs/doctor-faqs.component';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { DoctorHospitalSharedModule } from '../../doctor-hospital-shared/doctor-hospital-shared.module';



@NgModule({
  declarations: [DoctorFaqsComponent],
  imports: [
    CommonModule,
    DoctorFaqsRoutingModule,
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
export class DoctorFaqsModule { }
