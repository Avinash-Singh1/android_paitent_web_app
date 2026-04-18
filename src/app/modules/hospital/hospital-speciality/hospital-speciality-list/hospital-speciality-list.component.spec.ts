import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalSpecialityListComponent } from './hospital-speciality-list.component';

describe('HospitalSpecialityListComponent', () => {
  let component: HospitalSpecialityListComponent;
  let fixture: ComponentFixture<HospitalSpecialityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalSpecialityListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalSpecialityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
