import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyUpcharRoutingModule } from './my-upchar-routing.module';
import { AllMedicinesComponent } from './pages/list/all-medicines/all-medicines.component';
import { PopularProductComponent } from './pages/list/popular-product/popular-product.component';
import { SearchbarComponent } from './pages/list/searchbar/searchbar.component';
import { ViewComponent } from './pages/details/view/view.component';
import { LayoutComponent } from './layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { StarRatingModule } from 'angular-star-rating';
import { MedicineFilterSidebarComponent } from './components/medicine-filter-sidebar/medicine-filter-sidebar.component';
import { MedicineFilterChipsComponent } from './components/medicine-filter-chips/medicine-filter-chips.component';

@NgModule({
  declarations: [
    AllMedicinesComponent,
    PopularProductComponent,
    SearchbarComponent,
    ViewComponent,
    LayoutComponent,
    MedicineFilterSidebarComponent,
    MedicineFilterChipsComponent
  ],
  imports: [
    CommonModule,
    MyUpcharRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    HttpClientModule,
    SharedModule,
    StarRatingModule
  ]
})
export class MyUpcharModule { }
