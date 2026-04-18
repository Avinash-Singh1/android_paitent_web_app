import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainHospitalDashboardComponent } from "./main-hospital-dashboard/main-hospital-dashboard.component";

const routes: Routes = [
  {
    path: "",
    component: MainHospitalDashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalDashboardRoutingModule {}
