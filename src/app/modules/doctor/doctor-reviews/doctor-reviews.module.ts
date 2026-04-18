import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorReviewsRoutingModule } from './doctor-reviews-routing.module';
import { DoctorReviewsComponent } from './doctor-reviews/doctor-reviews.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { DoctorHospitalSharedModule } from '../../doctor-hospital-shared/doctor-hospital-shared.module';


@NgModule({
  declarations: [DoctorReviewsComponent],
  imports: [
    CommonModule,
    FormsModule,
    DoctorReviewsRoutingModule,
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
    DoctorHospitalSharedModule
  ]
})
export class DoctorReviewsModule { }
