import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HospitalTypeListComponent } from './hospital-type-list.component';

const routes: Routes = [{ path: '', component: HospitalTypeListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalTypeListRoutingModule {}
