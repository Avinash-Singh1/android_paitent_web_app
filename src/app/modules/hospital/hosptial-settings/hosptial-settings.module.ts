import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HosptialSettingsRoutingModule } from "./hosptial-settings-routing.module";
import { SettingsContainerComponent } from "./settings-container/settings-container.component";
import { HospitalProfileComponent } from "./components/hospital-profile/hospital-profile.component";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { AngularMaterialModule } from "src/app/material.module";
import { SharedModule } from "src/app/shared/shared.module";
import { ServicesListComponent } from "./components/services-list/services-list.component";
import { SettingsAddModalComponent } from "./components/settings-add-modal/settings-add-modal.component";
import { HospitalFaqsListComponent } from "./components/hospital-faqs-list/hospital-faqs-list.component";
import { HospitalVideoListComponent } from "./components/hospital-video-list/hospital-video-list.component";
import { HospitalTimingComponent } from "./components/hospital-timing/hospital-timing.component";
import { HospitalAddTimingModalComponent } from "./components/hospital-add-timing-modal/hospital-add-timing-modal.component";
import { HospitalAddressComponent } from "./components/hospital-address/hospital-address.component";
import { HospitalAddressModalComponent } from "./components/hospital-address-modal/hospital-address-modal.component";
import { HospitalImagesComponent } from "./components/hospital-images/hospital-images.component";
import { UploadImageModalComponent } from "./components/upload-image-modal/upload-image-modal.component";
import { HospitalSocialListComponent } from "./components/hospital-social-list/hospital-social-list.component";
import { HospitalAddSocialmediaComponent } from "./components/hospital-add-socialmedia/hospital-add-socialmedia.component";
import { HospitalDeleteProfileComponent } from "./components/hospital-delete-profile/hospital-delete-profile.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


@NgModule({
  declarations: [
    SettingsContainerComponent,
    HospitalProfileComponent,
    ServicesListComponent,
    SettingsAddModalComponent,
    HospitalFaqsListComponent,
    HospitalVideoListComponent,
    HospitalTimingComponent,
    HospitalAddTimingModalComponent,
    HospitalAddressComponent,
    HospitalAddressModalComponent,
    HospitalImagesComponent,
    UploadImageModalComponent,
    HospitalSocialListComponent,
    HospitalAddSocialmediaComponent,
    HospitalDeleteProfileComponent,
  ],
  imports: [
    CommonModule,
    HosptialSettingsRoutingModule,
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
  ],
})
export class HosptialSettingsModule {}
