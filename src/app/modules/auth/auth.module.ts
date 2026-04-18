import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { VerifyOtpComponent } from "./verify-otp/verify-otp.component";
import { SharedModule } from "src/app/shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthContainerComponent } from "./auth-container/auth-container.component";
import { AngularMaterialModule } from "src/app/material.module";
import { TermsConditionComponent } from "./terms-condition/terms-condition.component";
import { TranslateModule } from "@ngx-translate/core";
import { NgDialogAnimationService } from "ng-dialog-animation";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";

import { HttpClient } from "@angular/common/http";
import { NewSignupComponent } from "./new-signup/new-signup.component";
import { NewLoginComponent } from "./new-login/new-login.component";

@NgModule({
  declarations: [
    LoginComponent,
    SignUpComponent,
    VerifyOtpComponent,
    AuthContainerComponent,
    TermsConditionComponent,
    NewSignupComponent,
    NewLoginComponent
  ],
  imports: [
    
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    TranslateModule,
    FormsModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [NgDialogAnimationService],
  exports: [TermsConditionComponent],
})
export class AuthModule {}
