import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalThemeComponent } from "./hospital-theme/hospital-theme.component";

const routes: Routes = [
  {
    path: "",
    component: HospitalThemeComponent,
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("./hospital-dashboard/hospital-dashboard.module").then(
            (m) => m.HospitalDashboardModule
          ),
      },
      {
        path: "calendar",
        loadChildren: () =>
          import("./hospital-calendar/hospital-calendar.module").then(
            (m) => m.HospitalCalendarModule
          ),
      },
      {
        path: "patients",
        loadChildren: () =>
          import("./hospital-patient/hospital-patient.module").then(
            (m) => m.HospitalPatientModule
          ),
      },
      {
        path: "doctors",
        loadChildren: () =>
          import("./hospital-doctor/hospital-doctor.module").then(
            (m) => m.HospitalDoctorModule
          ),
      },
      {
        path: "speciality",
        loadChildren: () =>
          import("./hospital-speciality/hospital-speciality.module").then(
            (m) => m.HospitalSpecialityModule
          ),
      },
      {
        path: "procedure",
        loadChildren: () =>
          import("./hospital-procedure/hospital-procedure.module").then(
            (m) => m.HospitalProcedureModule
          ),
      },
      {
        path: "settings",
        loadChildren: () =>
          import("./hosptial-settings/hosptial-settings.module").then(
            (m) => m.HosptialSettingsModule
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
export class HospitalRoutingModule {}
