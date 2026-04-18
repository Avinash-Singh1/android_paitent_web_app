import { NgModule } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";

import { DoctorRoutingModule } from "./doctor-routing.module";
import { DoctorContainerComponent } from "./doctor-container/doctor-container.component";
import { EducationQualificationComponent } from "./pages/education-qualification/education-qualification.component";
import { BasicDetailsComponent } from "./pages/basic-details/basic-details.component";
import { PracticeConnectComponent } from "./pages/practice-connect/practice-connect.component";
import { EstablishmentDetailComponent } from "./pages/establishment-detail/establishment-detail.component";
import { ConsultantFeesComponent } from "./pages/consultant-fees/consultant-fees.component";
import { EstablishmentProofComponent } from "./pages/establishment-proof/establishment-proof.component";
import { IdentityProofComponent } from "./pages/identity-proof/identity-proof.component";
import { MapLocationComponent } from "./pages/map-location/map-location.component";
import { MedicalProofComponent } from "./pages/medical-proof/medical-proof.component";
import { MedicalRegistrationComponent } from "./pages/medical-registration/medical-registration.component";
import { ProcessComponent } from "./pages/process/process.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { AngularMaterialModule } from "src/app/material.module";
import { SharedModule } from "src/app/shared/shared.module";
import { EstabTimingComponent } from "./pages/estab-timing/estab-timing.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    DoctorContainerComponent,
    BasicDetailsComponent,
    EducationQualificationComponent,
    PracticeConnectComponent,
    EstablishmentDetailComponent,
    ProcessComponent,
    IdentityProofComponent,
    MedicalProofComponent,
    EstablishmentProofComponent,
    MapLocationComponent,
    MedicalRegistrationComponent,
    ConsultantFeesComponent,
    EstabTimingComponent,
  ],
  imports: [
    CommonModule,
    DoctorRoutingModule,
    AngularMaterialModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ReactiveFormsModule,
    SharedModule,
    AsyncPipe,
  ],
})
export class DoctorModule {}
