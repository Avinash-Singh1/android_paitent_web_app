import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ThemesComponent } from "./themes/themes.component";

const routes: Routes = [
  {
    path: "",
    component: ThemesComponent,
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("./doctor-dashboard/doctor-dashboard.module").then(
            (m) => m.DoctorDashboardModule
          ),
      },
      {
        path: "calendar",
        loadChildren: () =>
          import("./doctor-calendar/doctor-calendar.module").then(
            (m) => m.DoctorCalendarModule
          ),
      },
      {
        path: "my-patient",
        loadChildren: () =>
          import("./doctor-patients/doctor-patients.module").then(
            (m) => m.PatientsModule
          ),
      },
      {
        path: "medical-verification",
        loadChildren: () =>
          import("./doctor-medical-verifications/doctor-medical-verifications.module").then(
            (m) => m.DoctorMedicalVerificationsModule
          ),
      },
      {
        path: "change-password",
        loadChildren: () =>
          import("./doctor-change-password/doctor-change-password.module").then(
            (m) => m.DoctorChangePasswordModule
          ),
      },
      {
        path: "delete-account",
        loadChildren: () =>
          import("./doctor-delete-account/doctor-delete-account.module").then(
            (m) => m.DoctorDeleteAccountModule
          ),
      },
      {
        path: "establishment",
        loadChildren: () =>
          import("./doctor-establishment/doctor-establishment.module").then(
            (m) => m.DoctorEstablishmentModule
          ),
      },
      {
        path: "services",
        loadChildren: () =>
          import("./doctor-services/doctor-services.module").then(
            (m) => m.DoctorServicesModule
          ),
      },
      {
        path: "procedure",
        loadChildren: () =>
          import("./doctor-procedure/doctor-procedure.module").then(
            (m) => m.DoctorProcedureModule
          ),
      },
      {
        path: "videos",
        loadChildren: () =>
          import("./doctor-videos/doctor-videos.module").then(
            (m) => m.DoctorVideosModule
          ),
      },
      {
        path: "faqs",
        loadChildren: () =>
          import("./doctor-faqs/doctor-faqs.module").then(
            (m) => m.DoctorFaqsModule
          ),
      },
      {
        path: "profile",
        loadChildren: () =>
          import("./doctor-profile/doctor-profile.module").then(
            (m) => m.DoctorProfileModule
          ),
      },
      {
        path: "reviews",
        loadChildren: () =>
          import("./doctor-reviews/doctor-reviews.module").then(
            (m) => m.DoctorReviewsModule
          ),
      },
      {
        path: "settings",
        loadChildren: () =>
          import("./doctor-settings/doctor-settings.module").then(
            (m) => m.DoctorSettingsModule
          ),
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule { }
