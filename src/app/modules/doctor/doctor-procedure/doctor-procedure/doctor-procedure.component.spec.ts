import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorProcedureComponent } from './doctor-procedure.component';

describe('DoctorProcedureComponent', () => {
  let component: DoctorProcedureComponent;
  let fixture: ComponentFixture<DoctorProcedureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorProcedureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
