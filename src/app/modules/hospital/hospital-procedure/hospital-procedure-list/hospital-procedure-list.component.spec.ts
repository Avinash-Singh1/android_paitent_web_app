import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalProcedureListComponent } from './hospital-procedure-list.component';

describe('HospitalProcedureListComponent', () => {
  let component: HospitalProcedureListComponent;
  let fixture: ComponentFixture<HospitalProcedureListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalProcedureListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalProcedureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
