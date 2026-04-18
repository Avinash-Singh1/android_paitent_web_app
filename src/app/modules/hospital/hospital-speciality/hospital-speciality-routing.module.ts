import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalSpecialityListComponent } from "./hospital-speciality-list/hospital-speciality-list.component";

const routes: Routes = [
  {
    path: "",
    component: HospitalSpecialityListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalSpecialityRoutingModule {}
