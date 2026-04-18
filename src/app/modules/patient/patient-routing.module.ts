// fetch hospital clinics based on city
import { NgModule } from "@angular/core";
import {
  RouterModule,
  Routes,
  UrlSegment,
  Route,
  UrlSegmentGroup,
  UrlMatchResult,
} from "@angular/router";
import { isHospitalTypeMatch } from "./guards/hospital-type-match.guard";
import { canonicalCityRedirectGuard } from "./guards/canonical-city-redirect.guard";

import { HomeWrapperComponent } from "./components/home-wrapper/home-wrapper.component";
import { ThemesComponent } from "./themes/themes.component";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";
import { DoctorDetailsComponent } from "./pages/hospitals/doctor-details/doctor-details.component";
import { BookAppointmnetComponent } from "./components/book-appointmnet/book-appointmnet.component";
import { ConfirmAppointmentComponent } from "./components/confirm-appointment/confirm-appointment.component";
import { CancelAppointmentComponent } from "./components/cancel-appointment/cancel-appointment.component";
import { PatientLoginComponent } from "./components/patient-login/patient-login.component";
import { RescheduleAppointmentComponent } from "./components/reschedule-appointment/reschedule-appointment.component";
import { HospitalDetailsComponent } from "./pages/hospitals/hospital-details/hospital-details.component";
import { AppointmentCompletedComponent } from "./components/appointment-completed/appointment-completed.component";
import { PrivacyPolicyComponent } from "./pages/privacy-policy/privacy-policy.component";
import { TermsConditionsComponent } from "./pages/terms-conditions/terms-conditions.component";
import { AuthGuard } from "src/app/guards/auth.guard";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { VALID_CITIES, RESERVED_PATHS } from "src/app/config/valid-cities.constant";
import { Error404Component } from "./themes/error404/error404.component";
import { ReverseAuthguardGuard } from "src/app/guards/reverse-authguard.guard";
import { DoctorSearchSeoResolver } from "./components/doctor-search-seo-resolver/doctor-search-seo-resolver.component";

// ✅ Updated matcher to exclude reserved paths
export function cityMatcher(
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route
): UrlMatchResult | null {
  const path = segments[0]?.path?.toLowerCase();

  if (
    segments.length === 1 &&
    path &&
    VALID_CITIES.has(path) &&
    !RESERVED_PATHS.has(path)
  ) {
    return {
      consumed: segments,
      posParams: {
        city: segments[0],
      },
    };
  }

  return null;
}

// ✅ Matcher for /:city/doctors-for-:service URLs
export function doctorsForServiceMatcher(
  segments: UrlSegment[]
): UrlMatchResult | null {
  if (segments.length !== 2) return null;
  const secondPath = segments[1]?.path;
  if (!secondPath || !secondPath.startsWith('doctors-for-')) return null;
  const serviceName = secondPath.substring('doctors-for-'.length);
  if (!serviceName) return null;
  return {
    consumed: segments,
    posParams: {
      city: segments[0],
      speciality: new UrlSegment(serviceName, {}),
    },
  };
}

const routes: Routes = [
  {
    path: "",
    component: ThemesComponent,
    children: [
      { path: "", component: HomeWrapperComponent },
      { path: "home", component: HomeWrapperComponent },
      { path: "contact-us", component: ContactUsComponent },
      {
        path: "appointment-booking",
        component: BookAppointmnetComponent,
        canActivate: [AuthGuard],
        data: { userType: APP_CONSTANTS.USER_TYPES.PATIENT },
      },
      {
        path: "cancel-booking",
        component: CancelAppointmentComponent,
        canActivate: [AuthGuard],
        data: { userType: APP_CONSTANTS.USER_TYPES.PATIENT },
      },
      {
        path: "confirm-booking",
        component: ConfirmAppointmentComponent,
        canActivate: [AuthGuard],
        data: { userType: APP_CONSTANTS.USER_TYPES.PATIENT },
      },
      {
        path: "reschedule-booking",
        component: RescheduleAppointmentComponent,
        canActivate: [AuthGuard],
        data: { userType: APP_CONSTANTS.USER_TYPES.PATIENT },
      },
      {
        path: "appointment-completed",
        component: AppointmentCompletedComponent,
        canActivate: [AuthGuard],
        data: { userType: APP_CONSTANTS.USER_TYPES.PATIENT },
      },
      { path: "patient-login", component: PatientLoginComponent },
      { path: "privacy-policy", component: PrivacyPolicyComponent },
      { path: "terms-conditions", component: TermsConditionsComponent },
      {
        path: "profile",
        loadChildren: () =>
          import("./profile-doctor/profile-doctor.module").then(
            (m) => m.ProfileDoctorModule
          ),
        canActivate: [AuthGuard],
        data: { userType: APP_CONSTANTS.USER_TYPES.PATIENT },
      },
      {
        path: "auth",
        loadChildren: () =>
          import("../auth/auth.module").then((m) => m.AuthModule),
        canActivate: [ReverseAuthguardGuard],
      },
      {
        path: "register",
        loadChildren: () =>
          import("../registration-process/registration-process.module").then(
            (m) => m.RegistrationProcessModule
          ),
      },
      {
        path: "patient",
        loadChildren: () =>
          import("./pages/pages.module").then((m) => m.PagesModule),
      },
      {
        path: "about-us",
        loadChildren: () =>
          import("./about-us/about-us.module").then((m) => m.AboutUsModule),
      },
      {
        path: "search",
        loadChildren: () =>
          import("./search-results/search-results.module").then(
            (m) => m.SearchResultsModule
          ),
      },
      {
        path: "hospital-list",
        loadChildren: () =>
          import("./hospital-list/hospital-list.module").then(
            (m) => m.HospitalListModule
          ),
      },
      {
        path: "hospitals",
        loadChildren: () =>
          import("./pages/hospitals/hospitals.module").then(
            (m) => m.HospitalsModule
          ),
      },
      {
        path: "medicines",
        loadChildren: () =>
          import("./medicines/my-upchar.module").then((m) => m.MyUpcharModule),
        data: { breadcrumb: null },
      },
      {
        path: "surgeries",
        redirectTo: "delhi/treatment",
        pathMatch: "full",
      },
      {
        path: "treatment",
        redirectTo: "delhi/treatment",
        pathMatch: "prefix",
      },

      // Dynamic Routes
      // fetch hospital and clinics based on city
      {
        path: ":city/hospitals",
        canActivate: [canonicalCityRedirectGuard],
        loadChildren: () =>
          import(
            "./pages/hospitalslist/hospital-list/hospital-list.module"
          ).then((m) => m.HospitalListModule2),
      },
      {
        path: ":city/clinics",
        canActivate: [canonicalCityRedirectGuard],
        loadChildren: () =>
          import("./pages/hospitalslist/clinics-list/clinics-list.module").then(
            (m) => m.ClinicsListModule
          ),
      },

      // fetch hospital clinics based on city and locality
      {
        path: ":city/hospitals/:locality",
        canActivate: [canonicalCityRedirectGuard],
        loadChildren: () =>
          import(
            "./pages/hospitalslist/hospital-list-city-locality/hospital-list.module"
          ).then((m) => m.HospitalListCityLocalityModule),
      },
      // fetch clinics based on city and locality
      {
        path: ":city/clinics/:locality",
        canActivate: [canonicalCityRedirectGuard],
        loadChildren: () =>
          import(
            "./pages/hospitalslist/clinic-list-city-locality/hospital-list.module"
          ).then((m) => m.ClinicListCityLocalityModule),
      },

      { path: ":city/doctor/:slug", canActivate: [canonicalCityRedirectGuard], component: DoctorDetailsComponent },
      // ✅ Dynamic hospital type detail: /:city/clinic/:slug, /:city/hospital/:slug, etc.
      {
        path: ":city/:hospitalType/:slug",
        canMatch: [isHospitalTypeMatch],
        canActivate: [canonicalCityRedirectGuard],
        component: HospitalDetailsComponent,
      },
      {
        path: ":city/treatment",
        canActivate: [canonicalCityRedirectGuard],
        loadChildren: () =>
          import("./pages/surgeries/surgeries.module").then(
            (m) => m.SurgeriesModule
          ),
      },
      // ✅ Service search: /:city/doctors-for-:service (e.g., /delhi/doctors-for-hip-replacement)
      {
        matcher: doctorsForServiceMatcher,
        canActivate: [canonicalCityRedirectGuard],
        resolve: { seo: DoctorSearchSeoResolver },
        loadChildren: () =>
          import("./service-search-result/doctor-search-result.module").then(
            (m) => m.ServiceSearchResultModule
          ),
      },
      {
        path: ":city/:speciality",
        canActivate: [canonicalCityRedirectGuard],
        resolve: { seo: DoctorSearchSeoResolver },
        loadChildren: () =>
          import("./doctor-search-result/doctor-search-result.module").then(
            (m) => m.DoctorSearchResultModule
          ),
      },
      {
        path: ":city/:speciality/:locality",
        canActivate: [canonicalCityRedirectGuard],
        loadChildren: () =>
          import("./doctor-search-result/doctor-search-result.module").then(
            (m) => m.DoctorSearchResultModule
          ),
      },

      // ✅ Catch-only city route with matcher
      {
        matcher: cityMatcher,
        loadChildren: () =>
          import(
            "./pages/hospitalslist/healthcare-finder-component/healthcare-finder.module"
          ).then((m) => m.HospitalFinderModule),
      },

      // ✅ Error routes
      { path: "page-not-found", component: Error404Component },
      { path: "**", redirectTo: "page-not-found" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientRoutingModule {}
