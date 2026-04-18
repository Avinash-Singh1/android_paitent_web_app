import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { APP_CONSTANTS } from "./config/app.constant";
import { UserGuard } from "./guards/user.guard";
import { AuthGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "doctor",
    loadChildren: () =>
      import("./modules/doctor/doctor.module").then((m) => m.DoctorModule),
    data: {
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
    },
    canActivate: [AuthGuard],
  },
  {
    path: "hospital",
    loadChildren: () =>
      import("./modules/hospital/hospital.module").then(
        (m) => m.HospitalModule
      ),
    data: {
      userType: APP_CONSTANTS.USER_TYPES.HOSPITAL,
    },
    canActivate: [AuthGuard],
  },
  {
    path: "",
    loadChildren: () =>
      import("./modules/patient/patient.module").then((m) => m.PatientModule),
    data: {
      userType: APP_CONSTANTS.USER_TYPES.PATIENT,
    },
    canActivate: [UserGuard],
  },
];