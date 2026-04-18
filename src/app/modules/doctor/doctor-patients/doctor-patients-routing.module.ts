import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainPatientsComponent } from "./pages/main-patients/main-patients.component";

const routes: Routes = [
  {
    path: "",
    component: MainPatientsComponent,
    data: { header: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientsRoutingModule {}
