import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorServicesComponent } from './doctor-services/doctor-services.component';

const routes: Routes = [
  {
    path: "",
    component: DoctorServicesComponent,
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorServicesRoutingModule { }
