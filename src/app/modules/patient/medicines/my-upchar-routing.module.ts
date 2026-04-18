import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllMedicinesComponent } from './pages/list/all-medicines/all-medicines.component';
import { ViewComponent } from './pages/details/view/view.component';
import { LayoutComponent } from './layout.component';
import { PopularProductComponent } from './pages/list/popular-product/popular-product.component';

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    data: { breadcrumb: 'Medicines' },
    children: [
      {
        path: '',
        component: AllMedicinesComponent,
        data: { breadcrumb: null }
      },
      {
        path: 'details/:id/:name',
        component: ViewComponent,
        data: { breadcrumb: 'dynamic' }
      },
      {
        path: 'all-medicines',
        component: PopularProductComponent,
        data: { breadcrumb: 'All Medicines' }
      },
      {
        path: 'all-medicines/:categoryName',
        component: PopularProductComponent,
        data: { breadcrumb: 'dynamic' }
      },
      {
        path: 'all-medicines/:id/:categoryName',
        component: PopularProductComponent,
        data: { breadcrumb: 'dynamic' }
      },
      {
        path: 'all-medicines/:categoryName/:categoryName/:categoryName',
        component: PopularProductComponent,
        data: { breadcrumb: 'dynamic' }
      },
      {
        path: 'all-medicines/:categoryName/:categoryName/:categoryName/:categoryName',
        component: PopularProductComponent,
        data: { breadcrumb: 'dynamic' }
      },
    ]
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyUpcharRoutingModule { }
