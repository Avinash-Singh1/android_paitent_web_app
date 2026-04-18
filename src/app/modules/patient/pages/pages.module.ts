import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { AngularMaterialModule } from "src/app/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {  MatRadioModule } from "@angular/material/radio";
import { MatDialogModule } from "@angular/material/dialog";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { DoctorSearchResultModule } from "../doctor-search-result/doctor-search-result.module";
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [ContactUsComponent, PrivacyPolicyComponent, TermsConditionsComponent],
  imports: [
    CommonModule,
    AngularMaterialModule,
    FormsModule,
    MatRadioModule,
    MatDialogModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ReactiveFormsModule,
    DoctorSearchResultModule,
  ],
})
export class PagesModule {}
