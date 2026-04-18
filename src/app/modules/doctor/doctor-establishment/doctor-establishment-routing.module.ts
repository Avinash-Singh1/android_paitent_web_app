import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddEstablishmentComponent } from "./add-establishment/add-establishment.component";
import { DoctorEstablishmentComponent } from "./doctor-establishment/doctor-establishment.component";

const routes: Routes = [
  {
    path: "",
    component: DoctorEstablishmentComponent,
  },
  {
    path: ':mode',
    component: AddEstablishmentComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorEstablishmentRoutingModule { }
