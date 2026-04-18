import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalPatientListComponent } from "./hospital-patient-list/hospital-patient-list.component";

const routes: Routes = [
  {
    path: "",
    component: HospitalPatientListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalPatientRoutingModule {}
