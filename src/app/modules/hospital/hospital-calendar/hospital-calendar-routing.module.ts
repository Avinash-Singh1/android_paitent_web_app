import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HospitalCalendarContainerComponent } from "./hospital-calendar-container/hospital-calendar-container.component";

const routes: Routes = [
  {
    path: "",
    component: HospitalCalendarContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HospitalCalendarRoutingModule {}
