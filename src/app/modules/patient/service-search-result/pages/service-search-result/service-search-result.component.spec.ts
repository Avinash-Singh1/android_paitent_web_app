import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSearchResultComponent } from './service-search-result.component';

describe('ServiceSearchResultComponent', () => {
  let component: ServiceSearchResultComponent;
  let fixture: ComponentFixture<ServiceSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceSearchResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
