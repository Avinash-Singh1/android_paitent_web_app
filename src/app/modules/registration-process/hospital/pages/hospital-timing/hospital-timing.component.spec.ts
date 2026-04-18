import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalTimingComponent } from './hospital-timing.component';

describe('HospitalTimingComponent', () => {
  let component: HospitalTimingComponent;
  let fixture: ComponentFixture<HospitalTimingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalTimingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalTimingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
