import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalDoctorListComponent } from "./hospital-doctor-list/hospital-doctor-list.component";

const routes: Routes = [
  {
    path: "",
    component: HospitalDoctorListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalDoctorRoutingModule {}
