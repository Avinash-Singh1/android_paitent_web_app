import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalPatientListComponent } from './hospital-patient-list.component';

describe('HospitalPatientListComponent', () => {
  let component: HospitalPatientListComponent;
  let fixture: ComponentFixture<HospitalPatientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalPatientListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalPatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
