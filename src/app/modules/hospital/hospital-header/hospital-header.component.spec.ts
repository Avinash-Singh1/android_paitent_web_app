import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalHeaderComponent } from './hospital-header.component';

describe('HospitalHeaderComponent', () => {
  let component: HospitalHeaderComponent;
  let fixture: ComponentFixture<HospitalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
