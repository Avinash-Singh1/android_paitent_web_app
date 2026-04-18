import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorSearchResultComponent } from './pages/doctor-search-result/doctor-search-result.component';

const routes: Routes = [
  {
    path:'',
    component:DoctorSearchResultComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorSearchResultRoutingModule { }
