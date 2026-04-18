import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainCalendarViewComponent } from "./main-calendar-view/main-calendar-view.component";

const routes: Routes = [
  {
    path: "",
    component: MainCalendarViewComponent,
    data: { subheader: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorCalendarRoutingModule {}
