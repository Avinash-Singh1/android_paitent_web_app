import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSuggestionsMobileComponent } from './search-suggestions-mobile.component';

describe('SearchSuggestionsMobileComponent', () => {
  let component: SearchSuggestionsMobileComponent;
  let fixture: ComponentFixture<SearchSuggestionsMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchSuggestionsMobileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSuggestionsMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
