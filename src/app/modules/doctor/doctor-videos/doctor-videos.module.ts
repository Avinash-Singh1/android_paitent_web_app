import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorVideosRoutingModule } from './doctor-videos-routing.module';
import { DoctorVideosComponent } from './doctor-videos/doctor-videos.component';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularMaterialModule } from 'src/app/material.module';
import { svgLoaderFactory } from 'src/app/shared/loader/svg-common.loader';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [DoctorVideosComponent],
  imports: [
    CommonModule,
    DoctorVideosRoutingModule,
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
export class DoctorVideosModule { }
