import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorProcedureSectionComponent } from './doctor-procedure-section.component';

describe('DoctorProcedureSectionComponent', () => {
  let component: DoctorProcedureSectionComponent;
  let fixture: ComponentFixture<DoctorProcedureSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorProcedureSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorProcedureSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
