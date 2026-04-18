import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { StarRatingModule } from "angular-star-rating";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CarouselModule } from "ngx-owl-carousel-o";
// import { SwiperModule } from "ngx-swiper-wrapper";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { AngularMaterialModule } from "src/app/material.module";
import { FormatarrayPipe } from "src/app/shared/pipes/formatarray.pipe";
import { HospitalFinderRoutingModule } from "./healthcare-finder-routing.module";
import { HealthcareFinderComponentComponent } from "./healthcare-finder-component.component";
import { GlobalSearchComponent } from "src/app/shared/components/global-search/global-search.component";
@NgModule({
  declarations: [
    HealthcareFinderComponentComponent, 
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    SharedModule,
    StarRatingModule,
    AngularSvgIconModule,
    CarouselModule,
    // SwiperModule,
    HospitalFinderRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
  ],
})
export class HospitalFinderModule {}
