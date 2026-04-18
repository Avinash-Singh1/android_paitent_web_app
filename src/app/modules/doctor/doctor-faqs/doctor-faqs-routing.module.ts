import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorFaqsComponent } from './doctor-faqs/doctor-faqs.component';

const routes: Routes = [
  {
    path: "",
    component: DoctorFaqsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorFaqsRoutingModule { }
