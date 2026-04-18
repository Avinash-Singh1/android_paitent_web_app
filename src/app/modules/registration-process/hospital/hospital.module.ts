import { NgModule } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";

import { HospitalRoutingModule } from "./hospital-routing.module";
import { HospitalContainerComponent } from "./hospital-container/hospital-container.component";
import { EstablishmentBasicDetailsComponent } from "./pages/establishment-basic-details/establishment-basic-details.component";
import { EstablishmentProofComponent } from "./pages/establishment-proof/establishment-proof.component";
import { EstablishmentLocationComponent } from "./pages/establishment-location/establishment-location.component";
import { HospitalProcessComponent } from "./pages/hospital-process/hospital-process.component";
import { AngularMaterialModule } from "src/app/material.module";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { HospitalTimingComponent } from "./pages/hospital-timing/hospital-timing.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    HospitalContainerComponent,
    EstablishmentBasicDetailsComponent,
    EstablishmentProofComponent,
    EstablishmentLocationComponent,
    HospitalProcessComponent,
    HospitalTimingComponent,
  ],
  imports: [
    CommonModule,
    HospitalRoutingModule,
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
export class HospitalModule {}
