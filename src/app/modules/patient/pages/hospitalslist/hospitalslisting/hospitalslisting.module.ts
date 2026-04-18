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
import { HospitalslistingComponent } from "./hospitalslisting.component"; 
import { HospitalslistingRoutingModule } from "./hospitalslisting-routing.module";

@NgModule({
  declarations: [
   HospitalslistingComponent, 
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    SharedModule,
    StarRatingModule.forRoot(),
    AngularSvgIconModule,
    CarouselModule,
    // SwiperModule,
    HospitalslistingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
  ],
})
export class HospitalslistingModule {}
