import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSearchResultComponent } from './doctor-search-result.component';

describe('DoctorSearchResultComponent', () => {
  let component: DoctorSearchResultComponent;
  let fixture: ComponentFixture<DoctorSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorSearchResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
