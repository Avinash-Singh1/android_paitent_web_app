import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutComponent } from "./about/about.component";
import { AboutContainerComponent } from "./about-container/about-container.component";
import { ValuesComponent } from "./values/values.component";
import { LeadershipComponent } from "./leadership/leadership.component";

const routes: Routes = [
  {
    path: "",
    component: AboutContainerComponent,
    children: [
      {
        path: "about",
        component: AboutComponent,
      },
      {
        path: "values",
        component: ValuesComponent,
      },
      {
        path: "leadership",
        component: LeadershipComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutUsRoutingModule {}
