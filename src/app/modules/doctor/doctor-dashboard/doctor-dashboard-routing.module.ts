import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainDashboardContainerComponent } from "./pages/main-dashboard-container/main-dashboard-container.component";

const routes: Routes = [
  {
    path: "",
    component: MainDashboardContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorDashboardRoutingModule {}
