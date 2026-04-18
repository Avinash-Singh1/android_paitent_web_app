import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";

import { ClinicsListRoutingModule } from "./clinics-list-routing.module";
import { ListContainerComponent } from "./list-container/list-container.component";
import { DoctorSearchResultModule } from "../../../doctor-search-result/doctor-search-result.module"; 
import { DocCardComponent } from "./doc-card/doc-card.component";
import { SharedModule } from "src/app/shared/shared.module";
import { StarRatingModule } from "angular-star-rating";
import { CarouselModule } from "ngx-owl-carousel-o";
import { NgxPaginationModule } from "ngx-pagination";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { FirstCharCapitalPipe } from "src/app/pipe/first-char-capital.pipe";
import { HospitalCardSkeletonComponent } from "src/app/shared/components/hospital-card-skeleton/hospital-card-skeleton.component";

@NgModule({
  declarations: [ListContainerComponent, DocCardComponent,FirstCharCapitalPipe],
  imports: [
    CommonModule,
    ClinicsListRoutingModule,
    HospitalCardSkeletonComponent,
    DoctorSearchResultModule,
    SharedModule,
    StarRatingModule.forRoot(),
    CarouselModule,
    NgxPaginationModule,
    InfiniteScrollModule,
    NgOptimizedImage,
  ],
})
export class ClinicsListModule {}
