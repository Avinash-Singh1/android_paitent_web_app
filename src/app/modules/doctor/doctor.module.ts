import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DoctorRoutingModule } from "./doctor-routing.module";
import { ThemesComponent } from "./themes/themes.component";
import { HeaderComponent } from "./themes/header/header.component";
import { SidebarComponent } from "./themes/sidebar/sidebar.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularMaterialModule } from "src/app/material.module";
import { TranslateModule } from "@ngx-translate/core";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";

import { HttpClient } from "@angular/common/http";

@NgModule({
  declarations: [ThemesComponent, HeaderComponent, SidebarComponent],
  imports: [
    CommonModule,
    DoctorRoutingModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SharedModule,
    AngularMaterialModule,
    TranslateModule,
    InfiniteScrollModule,
  ],
  exports: [],
})
export class DoctorModule { }
