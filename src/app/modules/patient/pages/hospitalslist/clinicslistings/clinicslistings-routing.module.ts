import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClinicslistingsComponent } from "./clinicslistings.component"; 

const routes: Routes = [
  {
    path: "",
    component: ClinicslistingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClinicslistingsRoutingModule {}
