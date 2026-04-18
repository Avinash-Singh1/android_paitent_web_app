import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceSearchResultComponent } from './pages/service-search-result/service-search-result.component';

const routes: Routes = [
  {
    path:'',
    component:ServiceSearchResultComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceSearchResultRoutingModule { }
