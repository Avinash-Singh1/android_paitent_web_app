import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSurgerdetailsComponent } from './doctor-surgerdetails.component';

describe('DoctorSurgerdetailsComponent', () => {
  let component: DoctorSurgerdetailsComponent;
  let fixture: ComponentFixture<DoctorSurgerdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorSurgerdetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSurgerdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
