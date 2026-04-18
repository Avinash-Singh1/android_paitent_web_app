import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TreatmentRoutingModule } from "./treatment-routing.module";
import { TreatmentPageComponent } from "./components/treatment-page/treatment-page.component";
import { TreatmentSubtopicComponent } from "./components/treatment-subtopic/treatment-subtopic.component";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularMaterialModule } from "src/app/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";
import { CarouselModule } from "ngx-owl-carousel-o";
import { SurgeriesModule } from "../surgeries/surgeries.module";

@NgModule({
  declarations: [
    TreatmentPageComponent,
    TreatmentSubtopicComponent,
  ],
  imports: [
    CommonModule,
    TreatmentRoutingModule,
    SharedModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    CarouselModule,
  ],
})
export class TreatmentModule {}
