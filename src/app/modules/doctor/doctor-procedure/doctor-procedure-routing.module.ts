import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorProcedureComponent } from './doctor-procedure/doctor-procedure.component';

const routes: Routes = [
  {
    path: "",
    component: DoctorProcedureComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorProcedureRoutingModule { }
