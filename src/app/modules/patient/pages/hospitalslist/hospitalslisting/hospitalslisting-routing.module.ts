import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalslistingComponent } from "./hospitalslisting.component"; 

const routes: Routes = [
  {
    path: "",
    component: HospitalslistingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalslistingRoutingModule {}
