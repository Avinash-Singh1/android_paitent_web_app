import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SurgeriesRoutingModule } from "./surgeries-routing.module";
import { PopularSurgeryComponent } from "./components/popular-surgery/popular-surgery.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "src/app/material.module";
import { NgDialogAnimationService } from "ng-dialog-animation";
import { BenefitsComponent } from "./components/benefits/benefits.component";
import { ClientTestimonialsComponent } from "../../components/client-testimonials/client-testimonials.component";
import { DepartSurgeryComponent } from "./components/depart-surgery/depart-surgery.component";
import { EnquiryComponent } from "./components/enquiry/enquiry.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { ConfirmCosultationComponent } from "./components/confirm-cosultation/confirm-cosultation.component";
import { SurgeryDetailComponent } from "./components/surgery-detail/surgery-detail.component";
import { CarouselModule } from "ngx-owl-carousel-o";
import { MobileDepartSugeryComponent } from "./components/mobile-depart-sugery/mobile-depart-sugery.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";
import { SurgeryFaqComponent } from './components/surgery-faq/surgery-faq.component';
import { DoctorSurgerdetailsComponent } from './components/doctor-surgerdetails/doctor-surgerdetails.component';
// import { SwiperModule } from 'ngx-swiper-wrapper';
import { SharedModule } from "src/app/shared/shared.module";
import { DoctorsurgreycardComponent } from "src/app/shared/components/doctorsurgreycard/doctorsurgreycard.component";
import { TreatmentPageComponent } from "../treatment/components/treatment-page/treatment-page.component";
import { TreatmentSubtopicComponent } from "../treatment/components/treatment-subtopic/treatment-subtopic.component";
import { TreatmentHeroComponent } from "../treatment/components/treatment-hero/treatment-hero.component";
import { TreatmentTocComponent } from "../treatment/components/treatment-toc/treatment-toc.component";
import { TreatmentOverviewComponent } from "../treatment/components/treatment-overview/treatment-overview.component";
import { TreatmentSymptomsComponent } from "../treatment/components/treatment-symptoms/treatment-symptoms.component";
import { TreatmentTypesComponent } from "../treatment/components/treatment-types/treatment-types.component";
import { TreatmentProcedureComponent } from "../treatment/components/treatment-procedure/treatment-procedure.component";
import { TreatmentBenefitsSectionComponent } from "../treatment/components/treatment-benefits-section/treatment-benefits-section.component";
import { TreatmentRecoveryComponent } from "../treatment/components/treatment-recovery/treatment-recovery.component";
import { TreatmentCostComponent } from "../treatment/components/treatment-cost/treatment-cost.component";
import { TreatmentDoctorsSectionComponent } from "../treatment/components/treatment-doctors-section/treatment-doctors-section.component";
import { TreatmentHospitalsSectionComponent } from "../treatment/components/treatment-hospitals-section/treatment-hospitals-section.component";
import { TreatmentFaqSectionComponent } from "../treatment/components/treatment-faq-section/treatment-faq-section.component";
import { TreatmentPatientBenefitsComponent } from "../treatment/components/treatment-patient-benefits/treatment-patient-benefits.component";
import { TreatmentRelatedComponent } from "../treatment/components/treatment-related/treatment-related.component";
import { TreatmentEeatComponent } from "../treatment/components/treatment-eeat/treatment-eeat.component";
import { TreatmentReviewsComponent } from "../treatment/components/treatment-reviews/treatment-reviews.component";
import { TreatmentDepartmentComponent } from "../treatment/components/treatment-department/treatment-department.component";

@NgModule({
  declarations: [
    PopularSurgeryComponent,
    BenefitsComponent,
    DepartSurgeryComponent,
    EnquiryComponent,
    ConfirmCosultationComponent,
    SurgeryDetailComponent,
    MobileDepartSugeryComponent,
    SurgeryFaqComponent,
    DoctorSurgerdetailsComponent,
    DoctorsurgreycardComponent,
    TreatmentPageComponent,
    TreatmentSubtopicComponent,
    TreatmentHeroComponent,
    TreatmentTocComponent,
    TreatmentOverviewComponent,
    TreatmentSymptomsComponent,
    TreatmentTypesComponent,
    TreatmentProcedureComponent,
    TreatmentBenefitsSectionComponent,
    TreatmentRecoveryComponent,
    TreatmentCostComponent,
    TreatmentDoctorsSectionComponent,
    TreatmentHospitalsSectionComponent,
    TreatmentFaqSectionComponent,
    TreatmentPatientBenefitsComponent,
    TreatmentRelatedComponent,
    TreatmentEeatComponent,
    TreatmentReviewsComponent,
    TreatmentDepartmentComponent
  ],
  imports: [
    CommonModule,
    SurgeriesRoutingModule,
    NgSelectModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    ClientTestimonialsComponent,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    CarouselModule,
  ],
  providers: [NgDialogAnimationService],
})
export class SurgeriesModule { }
