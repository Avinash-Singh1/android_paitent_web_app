import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicappointmentComponent } from './clinicappointment.component';

describe('ClinicappointmentComponent', () => {
  let component: ClinicappointmentComponent;
  let fixture: ComponentFixture<ClinicappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicappointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
