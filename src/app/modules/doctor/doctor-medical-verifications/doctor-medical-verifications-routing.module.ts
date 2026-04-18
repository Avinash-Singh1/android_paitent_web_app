import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DoctorMedicalVerificationComponent } from "./doctor-medical-verification/doctor-medical-verification.component";


const routes: Routes = [
  {
    path: "",
    component: DoctorMedicalVerificationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorMedicalVerificationRoutingModule { }
