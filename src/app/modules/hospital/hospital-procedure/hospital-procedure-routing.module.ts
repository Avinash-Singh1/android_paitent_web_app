import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalProcedureListComponent } from "./hospital-procedure-list/hospital-procedure-list.component";

const routes: Routes = [
  {
    path: "",
    component: HospitalProcedureListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalProcedureRoutingModule {}
