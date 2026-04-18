import { NgModule } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { RegistrationProcessRoutingModule } from "./registration-process-routing.module";
import { AngularMaterialModule } from "src/app/material.module";
import { SupportModalComponent } from "./support-modal/support-modal.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [SupportModalComponent],
  imports: [
    CommonModule,
    RegistrationProcessRoutingModule,
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
export class RegistrationProcessModule {}
