import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModule } from 'src/app/material.module';
import { HospitalTypeListRoutingModule } from './hospital-type-list-routing.module';
import { HospitalTypeListComponent } from './hospital-type-list.component';

@NgModule({
  declarations: [HospitalTypeListComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    AngularMaterialModule,
    HospitalTypeListRoutingModule,
  ],
})
export class HospitalTypeListModule {}
