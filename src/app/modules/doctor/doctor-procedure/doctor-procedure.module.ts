import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorProcedureRoutingModule } from './doctor-procedure-routing.module';
import { DoctorProcedureComponent } from './doctor-procedure/doctor-procedure.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';


@NgModule({
  declarations: [DoctorProcedureComponent],
  imports: [
    CommonModule,
    FormsModule,
    DoctorProcedureRoutingModule,
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
export class DoctorProcedureModule { }
