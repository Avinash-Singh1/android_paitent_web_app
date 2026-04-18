import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SettingsContainerComponent } from "./settings-container/settings-container.component";
import { HospitalProfileComponent } from "./components/hospital-profile/hospital-profile.component";
import { ServicesListComponent } from "./components/services-list/services-list.component";
import { HospitalFaqsListComponent } from "./components/hospital-faqs-list/hospital-faqs-list.component";
import { HospitalVideoListComponent } from "./components/hospital-video-list/hospital-video-list.component";
import { HospitalTimingComponent } from "./components/hospital-timing/hospital-timing.component";
import { HospitalAddressComponent } from "./components/hospital-address/hospital-address.component";
import { HospitalImagesComponent } from "./components/hospital-images/hospital-images.component";
import { HospitalSocialListComponent } from "./components/hospital-social-list/hospital-social-list.component";
import { HospitalDeleteProfileComponent } from "./components/hospital-delete-profile/hospital-delete-profile.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsContainerComponent,
    children: [
      {
        path: "profile",
        component: HospitalProfileComponent,
      },
      {
        path: "services",
        component: ServicesListComponent,
      },
      {
        path: "faqs",
        component: HospitalFaqsListComponent,
      },
      {
        path: "videos",
        component: HospitalVideoListComponent,
      },
      {
        path: "timing",
        component: HospitalTimingComponent,
      },
      {
        path: "address",
        component: HospitalAddressComponent,
      },
      {
        path: "images",
        component: HospitalImagesComponent,
      },
      {
        path: "social",
        component: HospitalSocialListComponent,
      },
      {
        path: "delete-profile",
        component: HospitalDeleteProfileComponent,
      },
      {
        path: "",
        redirectTo: "profile",
        pathMatch: "full",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HosptialSettingsRoutingModule {}
