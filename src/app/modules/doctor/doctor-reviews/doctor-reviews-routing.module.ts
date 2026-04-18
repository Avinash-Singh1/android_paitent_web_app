import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorReviewsComponent } from './doctor-reviews/doctor-reviews.component';

const routes: Routes = [{
  path: "",
  component: DoctorReviewsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorReviewsRoutingModule { }
