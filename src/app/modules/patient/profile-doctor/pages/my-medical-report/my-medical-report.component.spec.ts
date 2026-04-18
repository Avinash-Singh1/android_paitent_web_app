import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMedicalReportComponent } from './my-medical-report.component';

describe('MyMedicalReportComponent', () => {
  let component: MyMedicalReportComponent;
  let fixture: ComponentFixture<MyMedicalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyMedicalReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMedicalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
