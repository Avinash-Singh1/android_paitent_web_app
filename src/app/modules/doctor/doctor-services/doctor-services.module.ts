import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorServicesRoutingModule } from './doctor-services-routing.module';
import { DoctorServicesComponent } from './doctor-services/doctor-services.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [DoctorServicesComponent],
  imports: [
    CommonModule,
    FormsModule,
    DoctorServicesRoutingModule,
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
    SharedModule
  ]
})
export class DoctorServicesModule { }
