import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HealthcareFinderComponentComponent } from "./healthcare-finder-component.component";

const routes: Routes = [
  {
    path: "",
    component: HealthcareFinderComponentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalFinderRoutingModule {}
