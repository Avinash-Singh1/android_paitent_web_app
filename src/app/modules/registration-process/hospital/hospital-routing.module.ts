import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalContainerComponent } from "./hospital-container/hospital-container.component";
import { EstablishmentBasicDetailsComponent } from "./pages/establishment-basic-details/establishment-basic-details.component";
import { EstablishmentProofComponent } from "./pages/establishment-proof/establishment-proof.component";
import { EstablishmentLocationComponent } from "./pages/establishment-location/establishment-location.component";
import { HospitalProcessComponent } from "./pages/hospital-process/hospital-process.component";
import { HospitalTimingComponent } from "./pages/hospital-timing/hospital-timing.component";

const routes: Routes = [
  {
    path: "",
    component: HospitalContainerComponent,
    children: [
      {
        path: "sec-a",
        component: EstablishmentBasicDetailsComponent,
      },
      {
        path: "sec-b",
        component: EstablishmentProofComponent,
      },
      {
        path: "sec-c/1",
        component: EstablishmentLocationComponent,
      },
      // {
      //   path: "sec-c/2",
      //   component: EstablishmentTimingComponent,
      // },
      {
        path: "sec-c/2",
        component: HospitalTimingComponent,
      },
      {
        path: "process",
        component: HospitalProcessComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalRoutingModule {}
