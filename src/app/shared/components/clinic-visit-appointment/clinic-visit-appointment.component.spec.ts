import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicVisitAppointmentComponent } from './clinic-visit-appointment.component';

describe('ClinicVisitAppointmentComponent', () => {
  let component: ClinicVisitAppointmentComponent;
  let fixture: ComponentFixture<ClinicVisitAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicVisitAppointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicVisitAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
