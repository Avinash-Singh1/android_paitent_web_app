import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DoctorSearchResultComponent } from "./pages/doctor-search-result/doctor-search-result.component";
import { FiltersComponent } from "./components/filters/filters.component";
import { CalendarViewComponent } from "./components/calendar-view/calendar-view.component";
import { DoctorSearchResultRoutingModule } from "./doctor-search-result-routing.module";
import { StarRatingModule } from "angular-star-rating";
import { SharedModule } from "src/app/shared/shared.module";
import { MatMenuModule } from "@angular/material/menu";
import { NgxPaginationModule } from "ngx-pagination";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DoctorCardSkeletonComponent } from "src/app/shared/components/doctor-card-skeleton/doctor-card-skeleton.component";

@NgModule({
  declarations: [
    DoctorSearchResultComponent,
    FiltersComponent,
    CalendarViewComponent,
  ],
  imports: [
    CommonModule,
    DoctorSearchResultRoutingModule,
    StarRatingModule.forRoot(),
    SharedModule,
    MatMenuModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    DoctorCardSkeletonComponent,
  ],
  exports: [FiltersComponent, CalendarViewComponent],
})
export class DoctorSearchResultModule {}
