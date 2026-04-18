import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProfileContainerComponent } from "./profile-container/profile-container.component";
import { DoctorProfileComponent } from "./pages/doctor-profile/doctor-profile.component";
import { DoctorEducationComponent } from "./pages/doctor-education/doctor-education.component";
import { DeleteProfileComponent } from "./pages/delete-profile/delete-profile.component";

const routes: Routes = [
  {
    path: "",
    component: ProfileContainerComponent,
    children: [
      {
        path: "main",
        component: DoctorProfileComponent,
      },
      {
        path: "education",
        component: DoctorEducationComponent,
        data: {
          heading: 1,
        },
      },
      {
        path: "awards-recognition",
        component: DoctorEducationComponent,
        data: {
          heading: 2,
        },
      },
      {
        path: "medical-registrations",
        component: DoctorEducationComponent,
        data: {
          heading: 3,
        },
      },
      {
        path: "memberships",
        component: DoctorEducationComponent,
        data: {
          heading: 4,
        },
      },
      {
        path: "services",
        component: DoctorEducationComponent,
        data: {
          heading: 5,
        },
      },
      {
        path: "procedure",
        component: DoctorEducationComponent,
        data: {
          heading: 9,
        },
      },
      {
        path: "faqs",
        component: DoctorEducationComponent,
        data: {
          heading: 6,
        },
      },
      {
        path: "videos",
        component: DoctorEducationComponent,
        data: {
          heading: 7,
        },
      },
      {
        path: "social",
        component: DoctorEducationComponent,
        data: {
          heading: 8,
        },
      },

      {
        path: "delete-profile",
        component: DeleteProfileComponent,
      },
      {
        path: "",
        redirectTo: "main",
        pathMatch: "full",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
