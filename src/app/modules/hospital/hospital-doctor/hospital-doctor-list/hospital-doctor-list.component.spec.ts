import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalDoctorListComponent } from './hospital-doctor-list.component';

describe('HospitalDoctorListComponent', () => {
  let component: HospitalDoctorListComponent;
  let fixture: ComponentFixture<HospitalDoctorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalDoctorListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalDoctorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
