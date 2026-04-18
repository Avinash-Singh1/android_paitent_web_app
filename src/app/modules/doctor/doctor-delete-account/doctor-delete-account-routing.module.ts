import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDeleteAccountComponent } from './doctor-delete-account/doctor-delete-account.component';

const routes: Routes = [
  {
    path: "",
    component: DoctorDeleteAccountComponent,
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorDeleteAccountRoutingModule { }
