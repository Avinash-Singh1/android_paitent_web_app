import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "doctors",
    loadChildren: () =>
      import("./doctor/doctor.module").then((m) => m.DoctorModule),
  },
  {
    path: "hospitals",
    loadChildren: () =>
      import("./hospital/hospital.module").then((m) => m.HospitalModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationProcessRoutingModule {}
