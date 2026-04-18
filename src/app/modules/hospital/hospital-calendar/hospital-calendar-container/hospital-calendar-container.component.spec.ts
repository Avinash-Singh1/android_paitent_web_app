import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalCalendarContainerComponent } from './hospital-calendar-container.component';

describe('HospitalCalendarContainerComponent', () => {
  let component: HospitalCalendarContainerComponent;
  let fixture: ComponentFixture<HospitalCalendarContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalCalendarContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalCalendarContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
