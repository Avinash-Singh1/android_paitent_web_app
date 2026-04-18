import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProfileRoutingModule } from "./profile-routing.module";
import { ProfileContainerComponent } from "./profile-container/profile-container.component";
import { DoctorProfileComponent } from "./pages/doctor-profile/doctor-profile.component";
import { AddMoreEditModalComponent } from "./components/add-more-edit-modal/add-more-edit-modal.component";
import { AngularMaterialModule } from "src/app/material.module";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { DoctorEducationComponent } from "./pages/doctor-education/doctor-education.component";
import { DeleteProfileComponent } from "./pages/delete-profile/delete-profile.component";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/app/shared/shared.module";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    ProfileContainerComponent,
    DoctorProfileComponent,
    AddMoreEditModalComponent,
    DoctorEducationComponent,
    DeleteProfileComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    AngularMaterialModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
  ],
})
export class ProfileModule {}
