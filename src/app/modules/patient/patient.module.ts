import { BlogsComponent } from "./components/blogs/blogs.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PatientRoutingModule } from "./patient-routing.module";
import { HomeWrapperComponent } from "./components/home-wrapper/home-wrapper.component";
import { HeaderComponent } from "./themes/header/header.component";
import { FooterComponent } from "./themes/footer/footer.component";
import { ClientTestimonialsComponent } from "./components/client-testimonials/client-testimonials.component";
import { CriticalIssuesComponent } from "./components/critical-issues/critical-issues.component";
import { TopRatedComponent } from "./components/top-rated/top-rated.component";
import { SearchDoctorsComponent } from "./components/search-doctors/search-doctors.component";
import { FaqComponent } from "./components/faq/faq.component";
import { FindDoctorsListComponent } from "./components/find-doctors-list/find-doctors-list.component";
import { AngularMaterialModule } from "src/app/material.module";
import { CarouselModule } from "ngx-owl-carousel-o";
import { SharedModule } from "src/app/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
// import { SwiperModule } from "swiper/angular";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { ThemesComponent } from "./themes/themes.component";
import { DoctorSearchResultModule } from "./doctor-search-result/doctor-search-result.module";
import { BookAppointmnetComponent } from "./components/book-appointmnet/book-appointmnet.component";
import { ConfirmAppointmentComponent } from "./components/confirm-appointment/confirm-appointment.component";
import { CancelAppointmentComponent } from "./components/cancel-appointment/cancel-appointment.component";
import { PatientLoginComponent } from "./components/patient-login/patient-login.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RescheduleAppointmentComponent } from "./components/reschedule-appointment/reschedule-appointment.component";
import { AppointmentCompletedComponent } from "./components/appointment-completed/appointment-completed.component";
import { NgxPaginationModule } from "ngx-pagination";
import { Error404Component } from "./themes/error404/error404.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient, HttpClientModule, provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CitiesSwiperComponent } from "./components/cities-swiper/cities-swiper.component";

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    CitiesSwiperComponent,
    HomeWrapperComponent,
    CriticalIssuesComponent,
    BlogsComponent,
    SearchDoctorsComponent,
    TopRatedComponent,
    FindDoctorsListComponent,
    ThemesComponent,
    BookAppointmnetComponent,
    ConfirmAppointmentComponent,
    CancelAppointmentComponent,
    PatientLoginComponent,
    RescheduleAppointmentComponent,
    AppointmentCompletedComponent,
    Error404Component,
  ],
  imports: [
    CommonModule,
    PatientRoutingModule,
    AngularMaterialModule,
    CarouselModule,
    SharedModule,
    TranslateModule,
    // SwiperModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ReactiveFormsModule,
    FormsModule,
    DoctorSearchResultModule,
    NgxPaginationModule,
    FaqComponent,
    ClientTestimonialsComponent,
  ],
  exports: [
    FaqComponent,
    ClientTestimonialsComponent,
    HeaderComponent,
    FooterComponent,
    Error404Component,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class PatientModule { }
