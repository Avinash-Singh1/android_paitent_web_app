import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DoctorContainerComponent } from "./doctor-container/doctor-container.component";
import { BasicDetailsComponent } from "./pages/basic-details/basic-details.component";
import { ConsultantFeesComponent } from "./pages/consultant-fees/consultant-fees.component";
import { EducationQualificationComponent } from "./pages/education-qualification/education-qualification.component";
import { EstablishmentDetailComponent } from "./pages/establishment-detail/establishment-detail.component";
import { EstablishmentProofComponent } from "./pages/establishment-proof/establishment-proof.component";
import { IdentityProofComponent } from "./pages/identity-proof/identity-proof.component";
import { MapLocationComponent } from "./pages/map-location/map-location.component";
import { MedicalProofComponent } from "./pages/medical-proof/medical-proof.component";
import { MedicalRegistrationComponent } from "./pages/medical-registration/medical-registration.component";
import { PracticeConnectComponent } from "./pages/practice-connect/practice-connect.component";
import { ProcessComponent } from "./pages/process/process.component";
import { EstabTimingComponent } from "./pages/estab-timing/estab-timing.component";

const routes: Routes = [
  {
    path: "",
    component: DoctorContainerComponent,
    children: [
      {
        path: "sec-a/1",
        component: BasicDetailsComponent,
      },
      {
        path: "sec-a/2",
        component: MedicalRegistrationComponent,
      },
      {
        path: "sec-a/3",
        component: EducationQualificationComponent,
      },
      {
        path: "sec-a/4",
        component: PracticeConnectComponent,
      },
      {
        path: "sec-a/5",
        component: EstablishmentDetailComponent,
      },
      {
        path: "process",
        component: ProcessComponent,
      },
      {
        path: "sec-b/1",
        component: IdentityProofComponent,
      },
      {
        path: "sec-b/2",
        component: MedicalProofComponent,
      },
      {
        path: "sec-b/3",
        component: EstablishmentProofComponent,
      },
      {
        path: "sec-c/1",
        component: MapLocationComponent,
      },
      // {
      //   path: "sec-c/2",
      //   component: EstablishmentTimingComponent,
      // },
      {
        path: "sec-c/2",
        component: EstabTimingComponent,
      },
      {
        path: "sec-c/3",
        component: ConsultantFeesComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule {}
