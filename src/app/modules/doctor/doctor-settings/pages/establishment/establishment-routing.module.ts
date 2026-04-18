import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EstablishmentListComponent } from "./establishment-list/establishment-list.component";
import { EstablishmentRequestComponent } from "./establishment-request/establishment-request.component";

const routes: Routes = [
  {
    path: "list",
    component: EstablishmentListComponent,
  },
  {
    path: "request-list",
    component: EstablishmentRequestComponent,
  },
  {
    path: "",
    redirectTo: "list",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstablishmentRoutingModule {}
