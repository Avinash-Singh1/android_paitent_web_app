import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProfileContainerComponent } from "./profile-container/profile-container.component";
import { MyAppointmentComponent } from "./pages/my-appointment/my-appointment.component";
import { MyMedicalReportComponent } from "./pages/my-medical-report/my-medical-report.component";
import { MyFeedbackComponent } from "./pages/my-feedback/my-feedback.component";
import { PersonalInformationComponent } from "./pages/personal-information/personal-information.component";
import { SettingsComponent } from "./pages/settings/settings.component";
import { GiveFeedbackComponent } from "./pages/give-feedback/give-feedback.component";
import { ViewMedicalComponent } from "./pages/view-medical/view-medical.component";
import { LoginComponent } from "../../auth/login/login.component";
import { AuthContainerComponent } from "../../auth/auth-container/auth-container.component";

const routes: Routes = [
  {
    path: "",
    component: ProfileContainerComponent,
    children: [
      {
        path: "",
        component: MyAppointmentComponent,
      },
      {
        path: "medical-reports",
        component: MyMedicalReportComponent,
      },
      {
        path: "medical-reports/view-medical-reports",
        component: ViewMedicalComponent,
      },
      {
        path: "feedbacks",
        component: MyFeedbackComponent,
      },
      {
        path: "personal-info",
        component: PersonalInformationComponent,
      },
      {
        path: "settings",
        component: SettingsComponent,
      },
    ],
  },
  {
    path: "share-feedback",
    component: GiveFeedbackComponent,
  },
  {
    path: "personal-info/change-number",
    component: AuthContainerComponent,
    data: { verified: true },
    children: [
      {
        path: "",
        component: LoginComponent,
        data: { userType: 1, verified: true },
      },
    ],
  },
  {
    path: "personal-info/change-email",
    component: AuthContainerComponent,
    data: { verified: true },
    children: [
      {
        path: "",
        component: LoginComponent,
        data: { userType: 1, verifiedEmail: true },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileDoctorRoutingModule {}
