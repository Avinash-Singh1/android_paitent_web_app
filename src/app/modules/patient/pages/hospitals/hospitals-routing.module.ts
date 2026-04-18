import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalDetailsComponent } from "./hospital-details/hospital-details.component";
import { DoctorDetailsComponent } from "./doctor-details/doctor-details.component";

const routes: Routes = [
  {
    path: "details",
    component: HospitalDetailsComponent,
  },
  {
    path: "doctor-details",
    component: DoctorDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalsRoutingModule {}
