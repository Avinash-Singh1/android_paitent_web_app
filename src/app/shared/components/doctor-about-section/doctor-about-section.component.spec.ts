import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAboutSectionComponent } from './doctor-about-section.component';

describe('DoctorAboutSectionComponent', () => {
  let component: DoctorAboutSectionComponent;
  let fixture: ComponentFixture<DoctorAboutSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorAboutSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorAboutSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
