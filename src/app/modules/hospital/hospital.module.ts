import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalRoutingModule } from "./hospital-routing.module";
import { HospitalThemeComponent } from "./hospital-theme/hospital-theme.component";
import { HospitalHeaderComponent } from "./hospital-header/hospital-header.component";
import { HospitalSidebarComponent } from "./hospital-sidebar/hospital-sidebar.component";
import { AngularMaterialModule } from "src/app/material.module";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { TranslateModule } from "@ngx-translate/core";
import { HospitalDeleteModalComponent } from "./components/hospital-delete-modal/hospital-delete-modal.component";
import { SharedModule } from "src/app/shared/shared.module";
import { CommonAddModalComponent } from "./components/common-add-modal/common-add-modal.component";
import { ReactiveFormsModule } from "@angular/forms";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    HospitalThemeComponent,
    HospitalHeaderComponent,
    HospitalSidebarComponent,
    HospitalDeleteModalComponent,
    CommonAddModalComponent,
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
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
  ],
})
export class HospitalModule {}
