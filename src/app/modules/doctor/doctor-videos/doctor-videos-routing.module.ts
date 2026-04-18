import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorVideosComponent } from './doctor-videos/doctor-videos.component';

const routes: Routes = [
  {
    path: "",
    component: DoctorVideosComponent,
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorVideosRoutingModule { }
