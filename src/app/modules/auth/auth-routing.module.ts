import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { VerifyOtpComponent } from "./verify-otp/verify-otp.component";
import { ROUTE_CONSTANT } from "src/app/config/route.constant";
import { AuthContainerComponent } from "./auth-container/auth-container.component";
import { NewLoginComponent } from "./new-login/new-login.component";
import { NewSignupComponent } from "./new-signup/new-signup.component";


const routes: Routes = [
  // {
  //   path: ROUTE_CONSTANT.AUTH.newdoctorLogin,
  //   component: NewLoginComponent,

  // },
  // {
  //   path: ROUTE_CONSTANT.AUTH.newdoctorRegister,
  //   component: NewSignupComponent,

  // },
  {
    path: "",
    component: AuthContainerComponent,
    children: [
      {
        path: ROUTE_CONSTANT.AUTH.patientLogin,
        component: LoginComponent,
        data: {
          userType: 1,
        },
      },
      {
        path: ROUTE_CONSTANT.AUTH.patientRegister,
        component: SignUpComponent,
        data: {
          userType: 1,
        },
      },
      {
        path: ROUTE_CONSTANT.AUTH.hospitalLogin,
        component: LoginComponent,
        data: {
          userType: 3,
        },
      },
      {
        path: ROUTE_CONSTANT.AUTH.hospitalRegister,
        component: SignUpComponent,
        data: {
          userType: 3,
        },
      },
      {
        path: ROUTE_CONSTANT.AUTH.patientverifyOtp,
        component: VerifyOtpComponent,
        data: {
          userType: 1,
        },
      },
      
      
    ],
  },
 


  




];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
