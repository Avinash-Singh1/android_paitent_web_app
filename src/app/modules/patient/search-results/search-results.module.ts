import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { SearchResultsRoutingModule } from './search-results-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SearchResultsComponent],
  imports: [
    CommonModule,
    SearchResultsRoutingModule,
    SharedModule,
    MatIconModule,
  ],
})
export class SearchResultsModule {}
