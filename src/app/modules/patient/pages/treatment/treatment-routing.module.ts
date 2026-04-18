import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TreatmentPageComponent } from "./components/treatment-page/treatment-page.component";
import { TreatmentSubtopicComponent } from "./components/treatment-subtopic/treatment-subtopic.component";

const routes: Routes = [
  { path: ":slug", component: TreatmentPageComponent },
  { path: ":slug/:subtopic", component: TreatmentSubtopicComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreatmentRoutingModule {}
