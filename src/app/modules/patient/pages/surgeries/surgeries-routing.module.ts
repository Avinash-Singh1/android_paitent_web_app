// import { NgModule } from "@angular/core";
// import { RouterModule, Routes } from "@angular/router";
// import { PopularSurgeryComponent } from "./components/popular-surgery/popular-surgery.component";
// import { SurgeryDetailComponent } from "./components/surgery-detail/surgery-detail.component";
// import { DepartSurgeryComponent } from "./components/depart-surgery/depart-surgery.component";

// const routes: Routes = [
//   { path: "", component: PopularSurgeryComponent },
//   { path: "department/:id", component: DepartSurgeryComponent },
//   { path: ":slug", component: SurgeryDetailComponent },
// ];


// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class SurgeriesRoutingModule { }
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PopularSurgeryComponent } from "./components/popular-surgery/popular-surgery.component";
import { TreatmentPageComponent } from "../treatment/components/treatment-page/treatment-page.component";
import { TreatmentSubtopicComponent } from "../treatment/components/treatment-subtopic/treatment-subtopic.component";
import { TreatmentDepartmentComponent } from "../treatment/components/treatment-department/treatment-department.component";

const routes: Routes = [
  { path: "", component: PopularSurgeryComponent },
  { path: ":department/:slug/:subtopic", component: TreatmentSubtopicComponent },
  { path: ":department/:slug", component: TreatmentPageComponent },
  { path: ":department", component: TreatmentDepartmentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurgeriesRoutingModule {}