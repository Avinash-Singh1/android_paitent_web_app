import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalsRoutingModule } from "./hospitals-routing.module";
import { HospitalDetailsComponent } from "./hospital-details/hospital-details.component";
import { DoctorDetailsComponent } from "./doctor-details/doctor-details.component";
import { SharedModule } from "src/app/shared/shared.module";
import { StarRatingModule } from "angular-star-rating";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CarouselModule } from "ngx-owl-carousel-o";
// import { SwiperModule } from "ngx-swiper-wrapper";
import { LoginModalComponent } from "./login-modal/login-modal.component";
import { VerifyModalComponent } from "./verify-modal/verify-modal.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { DoctorSearchResultModule } from "../../doctor-search-result/doctor-search-result.module";
import { SelectEstablishmentComponent } from "./select-establishment/select-establishment.component";
import { AngularMaterialModule } from "src/app/material.module";
import { FormatarrayPipe } from "src/app/shared/pipes/formatarray.pipe";
import { DoctorProfileSkeletonComponent } from "./doctor-details/doctor-profile-skeleton/doctor-profile-skeleton.component";

@NgModule({
  declarations: [
    VerifyModalComponent,
    SelectEstablishmentComponent,
  ],
  imports: [
    CommonModule,
    HospitalsRoutingModule,
    AngularMaterialModule,
    SharedModule,
    StarRatingModule.forRoot(),
    AngularSvgIconModule,
    CarouselModule,
    // SwiperModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    DoctorSearchResultModule,
    DoctorProfileSkeletonComponent,
    LoginModalComponent,
    HospitalDetailsComponent,
    DoctorDetailsComponent,
  ],
})
export class HospitalsModule {}
