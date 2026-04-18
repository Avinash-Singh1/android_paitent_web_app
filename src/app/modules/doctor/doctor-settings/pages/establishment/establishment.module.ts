import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { EstablishmentRoutingModule } from "./establishment-routing.module";
import { EstablishmentListComponent } from "./establishment-list/establishment-list.component";
import { AddEstablishmentComponent } from "./add-establishment/add-establishment.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { SharedModule } from "src/app/shared/shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { AngularMaterialModule } from "src/app/material.module";
import { TranslateModule } from "@ngx-translate/core";
import { EstablishmentRequestComponent } from "./establishment-request/establishment-request.component";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { ConfirmEstablishmentComponent } from "./confirm-establishment/confirm-establishment.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    EstablishmentListComponent,
    AddEstablishmentComponent,
    EstablishmentRequestComponent,
    ConfirmEstablishmentComponent,
  ],
  imports: [
    CommonModule,
    EstablishmentRoutingModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SharedModule,
    NgSelectModule,
    AngularMaterialModule,
    TranslateModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  exports: [EstablishmentRequestComponent],
})
export class EstablishmentModule {}
