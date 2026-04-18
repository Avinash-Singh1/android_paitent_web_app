import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainHospitalDashboardComponent } from './main-hospital-dashboard.component';

describe('MainHospitalDashboardComponent', () => {
  let component: MainHospitalDashboardComponent;
  let fixture: ComponentFixture<MainHospitalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainHospitalDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainHospitalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
